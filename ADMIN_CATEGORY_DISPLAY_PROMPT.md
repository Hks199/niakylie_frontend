# AI PROMPT: Master Guide for Displaying Admin-Side Category & Sub-Category List

> **Role**: Senior React & TypeScript UI Architect  
> **Task**: Build and integrate a high-performance **Admin Category & Sub-Category Management Panel** that connects to the NestJS `GET /api/v1/categories?limit=500` and `GET /api/v1/categories/tree` backend APIs, displaying a 2-level hierarchy table with live search, level filtering, active status toggles, and soft-delete actions.

---

## 🎯 Integration Goals & Capabilities

1. **Full Catalog Retrieval (`limit=500`)**:
   - Always query `GET /api/v1/categories?limit=500` to prevent data truncation and ensure all categories and sub-categories are loaded.
2. **2-Level Hierarchical View**:
   - Clearly distinguishes **Main (Root) Categories** (`parentId === null`) from **Sub-Categories** (`parentId !== null`).
   - Displays Parent Name badges on Sub-Category rows for fast identification.
3. **Interactive Filter Controls**:
   - **Tab Filters**: All Categories, Main Categories Only, Sub-Categories Only.
   - **Search Input**: Live keyword search matching category name, slug, or parent name.
4. **Administrative Actions**:
   - **Status Toggle**: `PATCH /api/v1/categories/:id/toggle-active` (Instant status update).
   - **Cascading Soft Delete**: `DELETE /api/v1/categories/:id` (Deletes target category and nested sub-categories).
   - **Direct Add Sub-Category**: Button on parent rows that opens the create modal with pre-selected `parentId`.

---

## 🔌 API Endpoint Contract

### 1. Fetch Category List
```http
GET /api/v1/categories?page=1&limit=500&search=&parentId=&sort=-createdAt
Authorization: Bearer <ADMIN_JWT_TOKEN>
```

#### JSON Response Structure:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Success",
  "data": {
    "data": [
      {
        "_id": "60d5ecb8b392d40015f8a001",
        "name": "Women Ethnic Wear",
        "slug": "women-ethnic-wear",
        "parentId": null,
        "ancestors": [],
        "description": "Traditional sarees, kurtis and lehengas",
        "image": "/uploads/categories/image-123.jpg",
        "banner": "/uploads/categories/banner-123.jpg",
        "displayOrder": 0,
        "status": true,
        "isDeleted": false,
        "createdAt": "2026-08-28T04:00:00.000Z",
        "updatedAt": "2026-08-28T04:00:00.000Z"
      },
      {
        "_id": "60d5ecb8b392d40015f8a002",
        "name": "Silk Sarees",
        "slug": "silk-sarees",
        "parentId": {
          "_id": "60d5ecb8b392d40015f8a001",
          "name": "Women Ethnic Wear",
          "slug": "women-ethnic-wear"
        },
        "ancestors": [
          {
            "_id": "60d5ecb8b392d40015f8a001",
            "name": "Women Ethnic Wear",
            "slug": "women-ethnic-wear"
          }
        ],
        "description": "Kanjivaram and Banarasi silk sarees",
        "image": "/uploads/categories/image-456.jpg",
        "status": true,
        "isDeleted": false
      }
    ],
    "meta": {
      "total": 2,
      "page": 1,
      "limit": 500,
      "totalPages": 1
    }
  }
}
```

### 2. Toggle Category Active Status
```http
PATCH /api/v1/categories/:id/toggle-active
Authorization: Bearer <ADMIN_JWT_TOKEN>
```

### 3. Soft Delete Category (With Cascading Sub-Categories)
```http
DELETE /api/v1/categories/:id
Authorization: Bearer <ADMIN_JWT_TOKEN>
```

---

## 🛠️ Step 1: TypeScript Interfaces (`src/types/category.ts`)

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
  parentId: string | { _id: string; name: string; slug: string } | null;
  ancestors: CategoryAncestor[];
  description?: string;
  image?: string;
  banner?: string;
  displayOrder: number;
  status: boolean;
  isDeleted: boolean;
  createdAt?: string;
  updatedAt?: string;
}
```

---

## 📡 Step 2: API Client Service (`src/api/categories.ts`)

```ts
import apiClient from './client';
import { Category } from '../types/category';

export const categoriesApi = {
  // Fetch All Categories with limit=500
  getCategories: async (params?: any): Promise<{ data: Category[]; total: number }> => {
    const response = await apiClient.get<any>('/categories', {
      params: { limit: 500, ...params },
    });

    const rawData = response.data?.data || response.data || response;
    const data = Array.isArray(rawData) ? rawData : Array.isArray(rawData?.data) ? rawData.data : [];
    const total = response?.data?.meta?.total || data.length;

    return { data, total };
  },

  // Quick Status Toggle
  toggleActive: async (id: string): Promise<Category> => {
    const response = await apiClient.patch<any>(`/categories/${id}/toggle-active`);
    return response.data?.data || response.data;
  },

  // Cascading Soft Delete
  deleteCategory: async (id: string): Promise<void> => {
    await apiClient.delete(`/categories/${id}`);
  },
};
```

---

## ⚛️ Step 3: Complete Admin Categories Table Panel (`src/components/admin/AdminCategoriesPanel.tsx`)

```tsx
import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, Trash2, Edit2, Check, RefreshCw, FolderPlus, Layers, Eye } from 'lucide-react';
import { categoriesApi } from '../../api/categories';
import { Category } from '../../types/category';

export const AdminCategoriesPanel: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'main' | 'sub'>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch Categories with limit=500
  const { data: categoriesResponse, isLoading, refetch } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => categoriesApi.getCategories({ limit: 500 }),
  });

  const rawList: Category[] = categoriesResponse?.data || [];
  
  // Filter out soft-deleted categories
  const categories = rawList.filter((c) => !c.isDeleted);

  // Separate Main Categories and Sub-Categories
  const parentCategories = categories.filter((c) => {
    const pId = typeof c.parentId === 'object' && c.parentId ? (c.parentId as any)._id : c.parentId;
    return !pId || pId === 'null';
  });

  // Filter Categories by Tab and Search Term
  const filteredCategories = categories.filter((cat) => {
    const parentIdVal = typeof cat.parentId === 'object' && cat.parentId ? (cat.parentId as any)._id : cat.parentId;
    const isMain = !parentIdVal || parentIdVal === 'null';

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

  // Action: Toggle Active Status
  const handleToggleActive = async (id: string) => {
    try {
      await categoriesApi.toggleActive(id);
      await queryClient.invalidateQueries({ queryKey: ['admin-categories'], exact: false });
    } catch (err: any) {
      alert(err?.message || 'Failed to toggle status');
    }
  };

  // Action: Delete Category
  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete category "${name}"? Nested sub-categories will also be deleted.`)) {
      return;
    }
    setDeletingId(id);
    try {
      await categoriesApi.deleteCategory(id);
      await queryClient.invalidateQueries({ queryKey: ['admin-categories'], exact: false });
    } catch (err: any) {
      alert(err?.message || 'Failed to delete category');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen font-sans space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Layers className="w-6 h-6 text-red-600" /> Category & Sub-Category Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage 2-level hierarchy: Main Parent Categories and Sub-Categories.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => refetch()}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all"
            title="Refresh List"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Controls Bar: Search & Level Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        {/* Tab Filters */}
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
            Main Categories ({parentCategories.length})
          </button>
          <button
            onClick={() => setFilterType('sub')}
            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
              filterType === 'sub' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Sub-Categories ({categories.length - parentCategories.length})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search category name or slug..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400 animate-pulse">
            Loading Categories catalog...
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 font-medium">
            No categories found matching criteria.
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
                      {/* Name & Thumbnail & Level Badge */}
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

                      {/* Parent Category Badge */}
                      <td className="py-3 px-4">
                        {parentObj ? (
                          <span className="inline-flex items-center bg-slate-100 text-slate-700 font-bold px-2 py-1 rounded-lg text-[11px]">
                            📁 {parentObj.name}
                          </span>
                        ) : (
                          <span className="text-slate-300 font-mono text-[11px]">— Root —</span>
                        )}
                      </td>

                      {/* Slug */}
                      <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">{cat.slug}</td>

                      {/* Display Order */}
                      <td className="py-3 px-4 font-bold text-slate-800">{cat.displayOrder || 0}</td>

                      {/* Active Status Badge Toggle */}
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleActive(cat._id)}
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

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleDelete(cat._id, cat.name)}
                            disabled={deletingId === cat._id}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete Category"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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
```

---

## ⚡ Integration Prompt Copy-Paste Snippet

```markdown
Role: Senior React Developer
Task: Integrate the Category List API into the Admin Categories Management Table.

### Instructions:
1. Always request `GET /api/v1/categories?limit=500` to fetch the complete category list.
2. Filter out any category with `isDeleted === true`.
3. Separate items into Main Categories (`parentId === null`) vs Sub-Categories (`parentId !== null`).
4. Display a search bar and category filter tabs (All, Main Only, Sub Only).
5. Add a status toggle button using `PATCH /api/v1/categories/:id/toggle-active`.
6. Add soft-delete confirmation using `DELETE /api/v1/categories/:id`.
```
