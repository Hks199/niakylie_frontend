# 🚀 AI PROMPT: Master Frontend Dynamic UI Integration for Admin Categories & Sub-Categories

> **Role**: Senior React & TypeScript Frontend Architect  
> **Task**: Integrate all NestJS Category Backend APIs into the React Admin Dashboard (`AdminCategoriesPanel.tsx`, `CreateCategoryModal.tsx`, `useCategories.ts`, and Storefront Navigation) with zero errors, dynamic page-refresh fetching, live keyword search, 2-level hierarchy display, active status toggling, soft deletion, and multipart file upload handling.

---

## 🎯 Architectural Goals & Implementation Guidelines

1. **Zero-Error Data Fetching & Array Extraction**:
   - The backend wraps paginated list responses in `{ success: true, statusCode: 200, message: "Success", data: { data: [...], meta: { total, page, limit } } }`.
   - Implement defensive extraction logic to automatically extract category arrays regardless of response nesting.

2. **Automatic Refresh & Real-Time Sync**:
   - Enable `refetchOnMount: 'always'`, `staleTime: 0`, and `refetchOnWindowFocus: 'always'` in TanStack React Query.
   - Perform reactive global cache invalidations using `queryClient.invalidateQueries({ queryKey: ['admin-categories'], exact: false })` whenever categories are created, edited, toggled, or deleted.

3. **2-Level Hierarchy Categorization**:
   - **Main Category (Level 1)**: `parentId` is `null`, `""`, or `"null"`.
   - **Sub-Category (Level 2)**: `parentId` contains a valid parent category Mongo `_id` string or populated object `{ _id, name, slug }`.

4. **Robust Visibility Filtering**:
   - Exclude soft-deleted items (`!c.isDeleted`) across both Admin Panel and Storefront navigation components (`Megamenu`, `FilterSidebar`).

5. **Multipart File Upload Handling**:
   - Send `POST` and `PUT` requests as `FormData` when creating or updating categories to support image (`thumbnail`) and header `banner` file uploads.

---

## 🔌 Complete Backend API Contracts

| Action | HTTP Method | Endpoint | Data Format | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Fetch Catalog** | `GET` | `/api/v1/categories?limit=500` | Query Params | Returns complete list of categories (up to 500) |
| **Fetch Hierarchy Tree** | `GET` | `/api/v1/categories/tree` | JSON | Returns root categories with nested `subCategories` |
| **Create Category** | `POST` | `/api/v1/categories` | `multipart/form-data` | Creates Level 1 or Level 2 category with image & banner |
| **Update Category** | `PUT` | `/api/v1/categories/:id` | `multipart/form-data` | Updates category metadata, parentId, and files |
| **Toggle Status** | `PATCH` | `/api/v1/categories/:id/toggle-active` | Path Param | Toggles `status` boolean (Active ↔ Inactive) |
| **Soft Delete** | `DELETE` | `/api/v1/categories/:id` | Path Param | Cascading soft-delete (`isDeleted: true`) |

---

## 🛠️ Step 1: TypeScript Data Models (`src/types/category.ts`)

```ts
export interface CategoryAncestor {
  _id: string;
  name: string;
  slug: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  parentId?: string | { _id: string; name: string; slug: string } | null;
  ancestors?: CategoryAncestor[];
  description?: string;
  image?: string;
  banner?: string;
  displayOrder?: number;
  status: boolean;
  isDeleted: boolean;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[] | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryListResponse {
  data: Category[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
```

---

## 📡 Step 2: API Client Service (`src/api/categories.ts`)

```ts
import apiClient from './client';
import { Category, CategoryListResponse } from '../types/category';

export const categoriesApi = {
  // Fetch All Categories (Default limit=500 for admin panel)
  getCategories: async (params?: Record<string, any>): Promise<CategoryListResponse> => {
    const response = await apiClient.get('/categories', {
      params: { limit: 500, ...params, _t: Date.now() },
    });
    
    // Normalize nested envelope structures safely
    const resData = response.data;
    const rawArray = Array.isArray(resData)
      ? resData
      : Array.isArray(resData?.data)
      ? resData.data
      : Array.isArray(resData?.data?.data)
      ? resData.data.data
      : Array.isArray(resData?.categories)
      ? resData.categories
      : [];

    const total = resData?.meta?.total || resData?.data?.meta?.total || rawArray.length;

    return {
      data: rawArray,
      meta: {
        total,
        page: params?.page || 1,
        limit: params?.limit || 500,
        totalPages: Math.ceil(total / (params?.limit || 500)) || 1,
      },
    };
  },

  // Toggle Category Active Status
  toggleActive: async (id: string): Promise<Category> => {
    const response = await apiClient.patch(`/categories/${id}/toggle-active`);
    return response.data?.data || response.data;
  },

  // Soft Delete Category & Descendants
  deleteCategory: async (id: string): Promise<void> => {
    await apiClient.delete(`/categories/${id}`);
  },

  // Create Category with FormData
  createCategory: async (formData: FormData): Promise<Category> => {
    const response = await apiClient.post('/categories', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data?.data || response.data;
  },

  // Update Category with FormData
  updateCategory: async (id: string, formData: FormData): Promise<Category> => {
    const response = await apiClient.put(`/categories/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data?.data || response.data;
  },
};
```

---

## ⚛️ Step 3: Complete Dynamic Admin Category Panel (`src/components/admin/AdminCategoriesPanel.tsx`)

```tsx
import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  FolderTree,
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  Search,
  Layers,
  Check,
  AlertCircle,
} from 'lucide-react';
import { categoriesApi } from '../../api/categories';
import { Category } from '../../types/category';

export const AdminCategoriesPanel: React.FC = () => {
  const queryClient = useQueryClient();

  // Search & Tab Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'main' | 'sub'>('all');

  // Loading state tracking
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Dynamic Query Fetch with Auto Refetch on Mount & Stale Time 0
  const { data: responseData, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => categoriesApi.getCategories({ limit: 500 }),
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: 'always',
  });

  const rawList: Category[] = responseData?.data || [];

  // Exclude soft-deleted categories
  const categories = rawList.filter((c) => c && !c.isDeleted);

  // Identify root Main categories (Level 1)
  const mainCategories = categories.filter((c) => {
    const pId = typeof c.parentId === 'object' && c.parentId ? (c.parentId as any)._id : c.parentId;
    return !pId || pId === 'null' || pId === 'undefined';
  });

  // Filter Categories by Tab Selection & Keyword Search
  const filteredCategories = categories.filter((cat) => {
    const parentIdVal = typeof cat.parentId === 'object' && cat.parentId ? (cat.parentId as any)._id : cat.parentId;
    const isMain = !parentIdVal || parentIdVal === 'null' || parentIdVal === 'undefined';

    if (filterType === 'main' && !isMain) return false;
    if (filterType === 'sub' && isMain) return false;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const parentName = typeof cat.parentId === 'object' && cat.parentId ? (cat.parentId as any).name?.toLowerCase() : '';
      return (
        cat.name.toLowerCase().includes(term) ||
        cat.slug.toLowerCase().includes(term) ||
        (parentName && parentName.includes(term))
      );
    }

    return true;
  });

  // Global React Query Cache Invalidation
  const refreshAllCategoryCaches = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['admin-categories'], exact: false }),
      queryClient.invalidateQueries({ queryKey: ['categories-list'], exact: false }),
      queryClient.invalidateQueries({ queryKey: ['megamenu-categories'], exact: false }),
      queryClient.invalidateQueries({ queryKey: ['category-tree'], exact: false }),
    ]);
  };

  // Toggle Active Status
  const handleToggleActive = async (id: string) => {
    setTogglingId(id);
    try {
      await categoriesApi.toggleActive(id);
      await refreshAllCategoryCaches();
      setFeedback({ type: 'success', message: 'Category status updated successfully!' });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Failed to update category status' });
    } fontally {
      setTogglingId(null);
    }
  };

  // Soft Delete Category
  const handleDeleteCategory = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete category "${name}"? Child sub-categories will also be soft-deleted.`)) {
      return;
    }
    setDeletingId(id);
    try {
      await categoriesApi.deleteCategory(id);
      await refreshAllCategoryCaches();
      setFeedback({ type: 'success', message: `Category "${name}" deleted successfully!` });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Failed to delete category' });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen space-y-6 font-sans">
      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl flex items-center space-x-3 text-xs font-bold ${
            feedback.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}
        >
          {feedback.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Control Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <FolderTree className="w-6 h-6 text-brand-crimson" /> Admin Category Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage Main Categories and Sub-Categories dynamically from NestJS backend.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isRefetching}
          className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all flex items-center space-x-2 text-xs font-bold"
        >
          <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Tabs & Search Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
              filterType === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            All ({categories.length})
          </button>
          <button
            onClick={() => setFilterType('main')}
            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
              filterType === 'main' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Main Categories ({mainCategories.length})
          </button>
          <button
            onClick={() => setFilterType('sub')}
            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
              filterType === 'sub' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Sub-Categories ({categories.length - mainCategories.length})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by category or parent name..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-crimson outline-none"
          />
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400 animate-pulse">
            Loading Categories from backend API...
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 font-medium">
            No categories found matching your query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider font-extrabold text-[10px] border-b border-slate-100">
                  <th className="py-3.5 px-4">Category / Level</th>
                  <th className="py-3.5 px-4">Parent Category</th>
                  <th className="py-3.5 px-4">Slug</th>
                  <th className="py-3.5 px-4">Display Order</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredCategories.map((cat) => {
                  const parentObj = typeof cat.parentId === 'object' && cat.parentId ? cat.parentId : null;
                  const isMain = !cat.parentId || parentObj === null;
                  const imageUrl = cat.image
                    ? cat.image.startsWith('http')
                      ? cat.image
                      : `http://localhost:3000${cat.image}`
                    : null;

                  return (
                    <tr key={cat._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center">
                            {imageUrl ? (
                              <img src={imageUrl} alt={cat.name} className="w-full h-full object-cover" />
                            ) : (
                              <Layers className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-slate-900 text-xs">{cat.name}</span>
                              {isMain ? (
                                <span className="bg-red-50 text-red-600 border border-red-100 text-[9px] font-extrabold px-1.5 py-0.5 rounded">
                                  Level 1 Main
                                </span>
                              ) : (
                                <span className="bg-blue-50 text-blue-600 border border-blue-100 text-[9px] font-extrabold px-1.5 py-0.5 rounded">
                                  Level 2 Sub
                                </span>
                              )}
                            </div>
                            {cat.description && (
                              <p className="text-[11px] text-slate-400 line-clamp-1">{cat.description}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        {parentObj ? (
                          <span className="inline-flex items-center bg-slate-100 text-slate-700 font-bold px-2 py-1 rounded-lg text-[11px]">
                            📁 {parentObj.name}
                          </span>
                        ) : (
                          <span className="text-slate-300 font-mono text-[11px]">— Root —</span>
                        )}
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">{cat.slug}</td>

                      <td className="py-3 px-4 font-bold text-slate-800">{cat.displayOrder || 0}</td>

                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleActive(cat._id)}
                          disabled={togglingId === cat._id}
                          className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold transition-all ${
                            cat.status
                              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${cat.status ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                          <span>{cat.status ? 'Active' : 'Inactive'}</span>
                        </button>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDeleteCategory(cat._id, cat.name)}
                          disabled={deletingId === cat._id}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete Category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCategoriesPanel;
```

---

## ⚡ Integration Prompt Copy-Paste Snippet

```markdown
Role: Senior React Developer
Task: Integrate the Category APIs with the Admin Category Table and Storefront UI.

Instructions:
1. Always query `GET /api/v1/categories?limit=500` for admin management.
2. Filter out soft-deleted items (`!cat.isDeleted`).
3. Handle 2-level hierarchy: Level 1 Main (`parentId === null`) vs Level 2 Sub (`parentId !== null`).
4. Support live keyword search across category names, slugs, and parent names.
5. Provide status toggles (`PATCH /api/v1/categories/:id/toggle-active`) and soft deletion (`DELETE /api/v1/categories/:id`).
6. Perform global cache invalidation on all category keys (`['admin-categories']`, `['categories-list']`, `['megamenu-categories']`) after any CRUD mutation.
```
