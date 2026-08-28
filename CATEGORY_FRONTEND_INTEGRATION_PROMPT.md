# AI PROMPT: Integrate NestJS Category & Sub-Category APIs into React Frontend UI

> **Role**: Senior Frontend React & TypeScript Architect  
> **Task**: Integrate the backend Category Management Module (`/api/v1/categories`) into the React e-commerce frontend UI (Megamenu Navigation, PLP Filter Sidebar, and Admin Category Management Dashboard).

---

## 🎯 Goal & Integration Requirements
You are tasked with connecting the backend Category REST API to three key frontend UI areas:
1. **Header Megamenu (`Megamenu.tsx`)**: Dynamically fetch and display Level 1 Categories (`parentId === null`) and hover dropdown columns for Level 2 Sub-Categories (`parentId === <CategoryId>`).
2. **Product Listing Page Filter Sidebar (`FilterSidebar.tsx`)**: Dynamically display expandable category filters and update PLP URL query parameters (`?category=slug`).
3. **Admin Category Panel (`AdminCategoriesPanel.tsx`)**: Complete administrative CRUD workflow (Create Category/Sub-Category with Image & Banner uploads, Edit Metadata, Toggle Active Status, and Soft-Delete with React Query cache invalidation).

---

## 🔌 API Contracts Quick Reference

Base URL: `http://localhost:3000/api/v1`

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| `GET` | `/categories?limit=500` | Public | Fetch all categories (Top-Level & Sub-Categories in one query) |
| `GET` | `/categories/tree` | Public | Fetch pre-built 2-level hierarchy tree array |
| `GET` | `/categories/:idOrSlug` | Public | Fetch single category details by Mongo ID or Slug |
| `POST` | `/categories` | Admin (JWT) | Create category (`multipart/form-data` with `image` & `banner` files) |
| `PUT` | `/categories/:id` | Admin (JWT) | Update category (`multipart/form-data`) |
| `DELETE` | `/categories/:id` | Admin (JWT) | Soft-delete category and cascading sub-categories |
| `PATCH` | `/categories/:id/toggle-active` | Admin (JWT) | Toggle `status` (active/inactive) |

---

## 🛠️ Step 1: TypeScript Interfaces (`src/types/category.ts`)

Create or update `src/types/category.ts` with these strict interfaces:

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
  parentId: string | null;
  ancestors: CategoryAncestor[];
  description?: string;
  image?: string;       // Thumbnail image URL path
  banner?: string;      // Header banner URL path
  displayOrder: number;
  status: boolean;      // Active status
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords: string[];
  isDeleted: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryWithSubCategories extends Category {
  subCategories: Category[];
}

export interface QueryCategoryParams {
  page?: number;
  limit?: number;        // Recommended: 500 for full UI tree rendering
  search?: string;
  parentId?: string | 'null';
  status?: boolean;
  sort?: string;
}

export interface PaginatedCategoriesResponse {
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

## 📡 Step 2: API Client Service Layer (`src/api/categories.ts`)

Implement robust API calls using Axios with response envelope extraction:

```ts
import apiClient from './client'; // Axios instance with Auth Interceptor
import {
  Category,
  QueryCategoryParams,
  PaginatedCategoriesResponse,
} from '../types/category';

// Helper to safely extract list from direct array or { success: true, data: { data: [...] } }
const extractCategoryList = (res: any): Category[] => {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.data?.data)) return res.data.data;
  return [];
};

export const categoriesApi = {
  // Fetch category list (Default limit: 500 to prevent truncation)
  getCategories: async (params?: QueryCategoryParams): Promise<PaginatedCategoriesResponse> => {
    const response = await apiClient.get<any>('/categories', { params: { limit: 500, ...params } });
    const list = extractCategoryList(response);
    const meta = response?.data?.meta || response?.meta || { total: list.length, page: 1, limit: 500, totalPages: 1 };
    return { data: list, meta };
  },

  // Fetch 2-level category hierarchy tree
  getCategoryTree: async (): Promise<Category[]> => {
    const response = await apiClient.get<any>('/categories/tree');
    return extractCategoryList(response);
  },

  // Get details by ID or Slug
  getCategoryByIdOrSlug: async (idOrSlug: string): Promise<Category> => {
    const response = await apiClient.get<any>(`/categories/${idOrSlug}`);
    return response?.data?.data || response?.data || response;
  },

  // Create Category (multipart/form-data)
  createCategory: async (formData: FormData): Promise<Category> => {
    const response = await apiClient.post<any>('/categories', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response?.data?.data || response?.data || response;
  },

  // Update Category (multipart/form-data)
  updateCategory: async (id: string, formData: FormData): Promise<Category> => {
    const response = await apiClient.put<any>(`/categories/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response?.data?.data || response?.data || response;
  },

  // Soft-Delete Category
  deleteCategory: async (id: string): Promise<void> => {
    await apiClient.delete(`/categories/${id}`);
  },

  // Toggle Active Status
  toggleActive: async (id: string): Promise<Category> => {
    const response = await apiClient.patch<any>(`/categories/${id}/toggle-active`);
    return response?.data?.data || response?.data || response;
  },
};
```

---

## 🎨 Step 3: Megamenu Header Integration (`Megamenu.tsx`)

Replace any static arrays with real dynamic categories fetched from `@tanstack/react-query`:

```tsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { categoriesApi } from '../../api/categories';
import { Category } from '../../types/category';

export function Megamenu() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const { data: categoriesResponse } = useQuery({
    queryKey: ['megamenu-categories'],
    queryFn: () => categoriesApi.getCategories({ limit: 500 }),
  });

  const allCategories: Category[] = categoriesResponse?.data || [];

  // Filter Level 1 Root Categories (parentId is null or undefined)
  const rootCategories = allCategories.filter((c) => {
    const pId = typeof c.parentId === 'object' && c.parentId ? ((c.parentId as any)._id || (c.parentId as any).id) : c.parentId;
    return !pId || pId === 'null';
  });

  return (
    <nav className="flex items-center space-x-6">
      {rootCategories.map((root) => {
        const rootId = root._id || (root as any).id;
        const subCategories = allCategories.filter((c) => {
          const pId = typeof c.parentId === 'object' && c.parentId ? ((c.parentId as any)._id || (c.parentId as any).id) : c.parentId;
          return String(pId) === String(rootId);
        });

        return (
          <div
            key={root._id}
            className="relative py-4"
            onMouseEnter={() => setActiveMenu(root._id)}
            onMouseLeave={() => setActiveMenu(null)}
          >
            <a
              href={`/category/${root.slug}`}
              className="font-bold text-sm uppercase text-slate-800 hover:text-red-600 transition-colors"
            >
              {root.name}
            </a>

            {/* Hover Sub-Category Dropdown */}
            {activeMenu === root._id && subCategories.length > 0 && (
              <div className="absolute top-full left-0 w-64 bg-white border border-gray-100 shadow-xl rounded-xl p-4 z-50 animate-in fade-in slide-in-from-top-1">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  {root.name} Sub-Categories
                </h4>
                <ul className="space-y-2">
                  {subCategories.map((sub) => (
                    <li key={sub._id}>
                      <a
                        href={`/category/${sub.slug}`}
                        className="text-sm text-slate-700 hover:text-red-600 hover:translate-x-1 transition-all inline-block"
                      >
                        {sub.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
```

---

## 🛠️ Step 4: Admin Panel CRUD & Cache Invalidation (`AdminCategoriesPanel.tsx`)

In `AdminCategoriesPanel.tsx`, handle Category & Sub-Category creation, updates, and soft-deletion with React Query cache purging:

```tsx
import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { categoriesApi } from '../../api/categories';
import { Category } from '../../types/category';

export function AdminCategoriesPanel() {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch all categories for table & parent selection dropdown
  const { data: categoriesResponse, isLoading, refetch } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => categoriesApi.getCategories({ limit: 500 }),
  });

  const categories: Category[] = categoriesResponse?.data || [];
  const parentCategories = categories.filter((c) => !c.parentId || (typeof c.parentId === 'object' && !(c.parentId as any)?._id));

  // Invalidate all Category React Query caches across the app
  const invalidateAllCaches = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] }),
      queryClient.invalidateQueries({ queryKey: ['megamenu-categories'] }),
      queryClient.invalidateQueries({ queryKey: ['filter-categories-list'] }),
      queryClient.invalidateQueries({ queryKey: ['category-tree'] }),
    ]);
    await refetch();
  };

  // Submit Handler (Create Category or Sub-Category)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    const formData = new FormData();
    formData.append('name', name);
    if (parentId) formData.append('parentId', parentId);
    if (description) formData.append('description', description);
    if (imageFile) formData.append('image', imageFile);
    if (bannerFile) formData.append('banner', bannerFile);

    try {
      await categoriesApi.createCategory(formData);
      setName('');
      setParentId('');
      setDescription('');
      setImageFile(null);
      setBannerFile(null);
      await invalidateAllCaches();
      alert('Category created successfully!');
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to create category';
      setErrorMsg(Array.isArray(msg) ? msg.join(' · ') : msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Handler with Cascading Warning
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? All nested sub-categories will also be deleted.')) return;
    try {
      await categoriesApi.deleteCategory(id);
      await invalidateAllCaches();
      alert('Category deleted successfully!');
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || 'Failed to delete category');
    }
  };

  // Toggle Active Status Handler
  const handleToggleActive = async (id: string) => {
    try {
      await categoriesApi.toggleActive(id);
      await invalidateAllCaches();
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || 'Failed to toggle status');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Category & Sub-Category Management</h1>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="bg-white p-6 border rounded-2xl shadow-sm space-y-4">
        <h2 className="text-lg font-semibold">Create New Category / Sub-Category</h2>
        {errorMsg && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{errorMsg}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Category Name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="border p-2.5 rounded-lg w-full"
          />
          <select
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
            className="border p-2.5 rounded-lg w-full"
          >
            <option value="">Top-Level Main Category (parentId = null)</option>
            {parentCategories.map((parent) => (
              <option key={parent._id} value={parent._id}>
                Sub-Category under: {parent.name}
              </option>
            ))}
          </select>
        </div>

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border p-2.5 rounded-lg w-full"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold mb-1">Thumbnail Image</label>
            <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1">Banner Image</label>
            <input type="file" accept="image/*" onChange={(e) => setBannerFile(e.target.files?.[0] || null)} />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2.5 rounded-lg transition-colors"
        >
          {isSubmitting ? 'Saving...' : 'Create Category'}
        </button>
      </form>

      {/* TABLE LIST */}
      <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-3">Thumbnail</th>
              <th className="p-3">Name</th>
              <th className="p-3">Type</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat._id} className="border-b">
                <td className="p-3">
                  {cat.image && (
                    <img
                      src={cat.image.startsWith('http') ? cat.image : `http://localhost:3000${cat.image}`}
                      alt={cat.name}
                      className="w-10 h-10 object-cover rounded-lg"
                    />
                  )}
                </td>
                <td className="p-3 font-semibold">{cat.name}</td>
                <td className="p-3 text-gray-500">
                  {cat.parentId ? <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs">Sub-Category</span> : <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded text-xs">Main Category</span>}
                </td>
                <td className="p-3">
                  <button
                    onClick={() => handleToggleActive(cat._id)}
                    className={`px-2.5 py-1 rounded text-xs font-bold ${cat.status ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}
                  >
                    {cat.status ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="p-3">
                  <button onClick={() => handleDelete(cat._id)} className="text-red-600 hover:underline font-bold">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

---

## ⚡ Execution Checklist & Validation Rules for AI
1. **Never Hardcode Mock Data**: Always fetch categories via `categoriesApi.getCategories({ limit: 500 })` or `categoriesApi.getCategoryTree()`.
2. **Form Data Serialization**: Use `FormData()` for `POST` and `PUT` calls to handle file uploads (`image` and `banner`).
3. **Array Envelope Unwrapping**: Safely unwrap response envelopes to handle both direct arrays `[...]` and wrapped objects `{ data: { data: [...] } }`.
4. **Cache Invalidation**: Always call `queryClient.invalidateQueries` for `['admin-categories']`, `['megamenu-categories']`, `['filter-categories-list']`, and `['category-tree']` after any mutation (`POST`, `PUT`, `DELETE`, `PATCH`).
