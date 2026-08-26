# NiaKylie – Category API Integration Reference

> **Purpose**: Master integration specification for all **Category Management APIs** (Public & Admin). Any AI or developer can use this guide to connect Category tree dropdowns, store navigation headers, and Admin Category Management Panels with 100% contract compliance.  
> **Base URL**: `http://localhost:3000/api/v1` (Dev) | `https://api.niakylie.com/api/v1` (Prod)  
> **Auth Requirements**:
> - `GET /categories` & `GET /categories/:idOrSlug`: Public (No token required)
> - `POST /categories`, `PUT /categories/:id`, `DELETE /categories/:id`: Requires JWT Bearer Token (`Authorization: Bearer <accessToken>`) with `roles: ["ADMIN"]` or `"admin"`.

---

## 1. Quick Reference: Category Routes Table

| Method | Endpoint | Description | Content-Type | Auth Required |
|---|---|---|---|---|
| `GET` | `/categories` | List categories (supports tree structure, search, parent filter & pagination) | — | Public |
| `GET` | `/categories/:idOrSlug` | Fetch single category details by Mongo ID or URL Slug | — | Public |
| `POST` | `/categories` | Create new category with optional image & banner uploads | `multipart/form-data` | ✅ JWT + ADMIN |
| `PUT` | `/categories/:id` | Update category details and/or replace image & banner files | `multipart/form-data` | ✅ JWT + ADMIN |
| `DELETE` | `/categories/:id` | Soft-delete category and its nested descendants | — | ✅ JWT + ADMIN |

---

## 2. TypeScript Interfaces (`src/types/category.ts`)

```ts
// ── Category Ancestor Item (Breadcrumb & Hierarchy) ───────
export interface CategoryAncestor {
  _id: string;
  name: string;
  slug: string;
}

// ── Master Category Interface ──────────────────────────────
export interface Category {
  _id: string;
  name: string;
  slug: string;
  parentId: string | null;
  ancestors: CategoryAncestor[];
  description?: string;
  image?: string;      // URL path, e.g. "/uploads/categories/image-123.jpg"
  banner?: string;     // URL path, e.g. "/uploads/categories/banner-123.jpg"
  status: boolean;     // true = active, false = disabled
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords: string[];
  isDeleted: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── Query Parameters for GET /categories ──────────────────
export interface QueryCategoryParams {
  page?: number;       // Default: 1
  limit?: number;      // Default: 10
  search?: string;     // Text search by name/description
  parentId?: string | 'null'; // Filter by parent category ('null' for root categories)
  status?: boolean;    // Filter active/inactive status
  sort?: string;       // Sort field (e.g. "name", "-createdAt")
}

// ── Paginated Response Wrapper ──────────────────────────────
export interface PaginatedCategoriesResponse {
  data: Category[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// ── Create Category DTO Payload ───────────────────────────
export interface CreateCategoryInput {
  name: string;
  parentId?: string | null;
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[]; // Sent as separate fields or JSON stringified array in FormData
  image?: File;
  banner?: File;
}

// ── Update Category DTO Payload ───────────────────────────
export interface UpdateCategoryInput extends Partial<CreateCategoryInput> {
  status?: boolean;
}
```

---

## 3. Detailed Endpoint Contracts

### 3.1 Fetch Categories List (`GET /categories`)
- **Description**: Retrieves store categories with optional pagination, keyword search, parent filtering, and active status filters.
- **Auth Required**: Public
- **Query Parameters**:
  - `page` (number, optional, default: `1`)
  - `limit` (number, optional, default: `10` or `100` for tree building)
  - `search` (string, optional): Search by name or description.
  - `parentId` (string, optional): `"null"` returns top-level root categories; Mongo ID returns subcategories.
  - `status` (boolean, optional): `true` returns active categories only.

#### Success Response (`HTTP 200 OK`)
```json
{
  "data": [
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c001",
      "name": "Women Ethnic Wear",
      "slug": "women-ethnic-wear",
      "parentId": null,
      "ancestors": [],
      "description": "Traditional sarees, lehengas, and kurtis collection.",
      "image": "/uploads/categories/image-ethnic.webp",
      "banner": "/uploads/categories/banner-ethnic.webp",
      "status": true,
      "seoTitle": "Buy Women Ethnic Wear Online - NiaKylie",
      "seoDescription": "Shop top designer sarees and lehengas.",
      "seoKeywords": ["sarees", "ethnic", "lehenga"],
      "isDeleted": false,
      "createdAt": "2026-08-01T10:00:00.000Z",
      "updatedAt": "2026-08-01T10:00:00.000Z"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

---

### 3.2 Fetch Category Details (`GET /categories/:idOrSlug`)
- **Description**: Fetch detailed information for a single category using either its Mongo `_id` or unique URL `slug`.
- **Auth Required**: Public

#### Success Response (`HTTP 200 OK`)
```json
{
  "_id": "64f1a2b3c4d5e6f7a8b9c001",
  "name": "Sarees",
  "slug": "sarees",
  "parentId": "64f1a2b3c4d5e6f7a8b9c000",
  "ancestors": [
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c000",
      "name": "Women Ethnic Wear",
      "slug": "women-ethnic-wear"
    }
  ],
  "description": "Silk and designer sarees.",
  "image": "/uploads/categories/saree-thumb.jpg",
  "banner": "/uploads/categories/saree-banner.jpg",
  "status": true,
  "seoTitle": "Designer Silk Sarees Collection",
  "seoDescription": "Handcrafted silk sarees for weddings and occasions.",
  "seoKeywords": ["silk sarees", "wedding sarees"],
  "isDeleted": false,
  "createdAt": "2026-08-01T10:00:00.000Z",
  "updatedAt": "2026-08-01T10:00:00.000Z"
}
```

#### Error Response (`HTTP 404 Not Found`)
```json
{
  "statusCode": 404,
  "message": "Category with ID or Slug 'invalid-slug' not found",
  "error": "Not Found"
}
```

---

### 3.3 Create Category (`POST /categories`)
- **Description**: Creates a new store category with optional image thumbnail and main banner image.
- **Auth Required**: ✅ JWT Bearer Token (`roles: ["ADMIN"]`)
- **Content-Type**: `multipart/form-data`

#### Multipart Form Data Fields
| Field Name | Type | Required | Description |
|---|---|---|---|
| `name` | Text | **Yes** | Name of the category (e.g., "Lehengas") |
| `parentId` | Text | No | Parent Mongo ID (leave empty or omit for root category) |
| `description` | Text | No | Description snippet |
| `seoTitle` | Text | No | Meta title for SEO |
| `seoDescription` | Text | No | Meta description |
| `seoKeywords` | Text | No | Comma-separated strings or repeated array keys |
| `image` | File | No | Image file (JPG, PNG, WEBP, max 5MB) |
| `banner` | File | No | Banner image file (JPG, PNG, WEBP, max 5MB) |

#### Example JavaScript `FormData` Helper:
```ts
const formData = new FormData();
formData.append('name', 'Designer Kurtis');
formData.append('parentId', '64f1a2b3c4d5e6f7a8b9c000');
formData.append('description', 'Cotton and silk kurtis for daily wear.');
if (imageFile) formData.append('image', imageFile);
if (bannerFile) formData.append('banner', bannerFile);
```

#### Success Response (`HTTP 201 Created`)
```json
{
  "_id": "64f1a2b3c4d5e6f7a8b9c002",
  "name": "Designer Kurtis",
  "slug": "designer-kurtis",
  "parentId": "64f1a2b3c4d5e6f7a8b9c000",
  "ancestors": [
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c000",
      "name": "Women Ethnic Wear",
      "slug": "women-ethnic-wear"
    }
  ],
  "description": "Cotton and silk kurtis for daily wear.",
  "image": "/uploads/categories/1787325000-image.webp",
  "banner": "/uploads/categories/1787325000-banner.webp",
  "status": true,
  "isDeleted": false,
  "createdAt": "2026-08-21T18:00:00.000Z",
  "updatedAt": "2026-08-21T18:00:00.000Z"
}
```

---

### 3.4 Update Category (`PUT /categories/:id`)
- **Description**: Updates category text metadata and/or replaces the thumbnail image or banner image.
- **Auth Required**: ✅ JWT Bearer Token (`roles: ["ADMIN"]`)
- **Content-Type**: `multipart/form-data`

#### Multipart Form Data Fields
Same fields as `POST /categories` + optional `status` (boolean `'true'` / `'false'`).

#### Success Response (`HTTP 200 OK`)
```json
{
  "_id": "64f1a2b3c4d5e6f7a8b9c002",
  "name": "Designer Kurtis & Tunics",
  "slug": "designer-kurtis-tunics",
  "status": true,
  "updatedAt": "2026-08-21T18:10:00.000Z"
}
```

---

### 3.5 Delete Category (`DELETE /categories/:id`)
- **Description**: Soft-deletes the target category and all subcategories belonging to it.
- **Auth Required**: ✅ JWT Bearer Token (`roles: ["ADMIN"]`)
- **Success Response**: `HTTP 204 No Content` (Empty response body)

---

## 4. Frontend Integration Implementation Code

### 4.1 Axios API Client (`src/api/categories.ts`)

```ts
import { apiClient } from './client';
import {
  Category,
  QueryCategoryParams,
  PaginatedCategoriesResponse,
} from '../types/category';

export const categoriesApi = {
  /**
   * Fetch categories list with optional filters.
   */
  getCategories: (params?: QueryCategoryParams): Promise<PaginatedCategoriesResponse> =>
    apiClient.get('/categories', { params }),

  /**
   * Get category details by ID or Slug.
   */
  getCategoryByIdOrSlug: (idOrSlug: string): Promise<Category> =>
    apiClient.get(`/categories/${idOrSlug}`),

  /**
   * Create new category (Uses FormData for file uploads).
   */
  createCategory: (formData: FormData): Promise<Category> =>
    apiClient.post('/categories', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  /**
   * Update category by ID (Uses FormData for file uploads).
   */
  updateCategory: (id: string, formData: FormData): Promise<Category> =>
    apiClient.put(`/categories/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  /**
   * Soft-delete category by ID.
   */
  deleteCategory: (id: string): Promise<void> =>
    apiClient.delete(`/categories/${id}`),
};
```

---

### 4.2 React Component Example (`CategoryAdminPanel.tsx`)

```tsx
import React, { useState, useEffect } from 'react';
import { categoriesApi } from '../api/categories';
import { Category } from '../types/category';

export function CategoryAdminPanel() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [parentId, setParentId] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await categoriesApi.getCategories({ limit: 100 });
      setCategories(res.data);
    } catch (err) {
      console.error('Failed to load categories', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', name);
    if (description) formData.append('description', description);
    if (parentId) formData.append('parentId', parentId);
    if (imageFile) formData.append('image', imageFile);
    if (bannerFile) formData.append('banner', bannerFile);

    try {
      await categoriesApi.createCategory(formData);
      alert('Category created successfully!');
      setName('');
      setDescription('');
      setParentId('');
      setImageFile(null);
      setBannerFile(null);
      fetchCategories();
    } catch (err: any) {
      alert(err?.message || 'Failed to create category');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      await categoriesApi.deleteCategory(id);
      fetchCategories();
    } catch (err: any) {
      alert(err?.message || 'Failed to delete category');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Category Management</h1>

      {/* CREATE CATEGORY FORM */}
      <form onSubmit={handleSubmit} className="bg-white p-4 border rounded-xl space-y-4">
        <h2 className="text-lg font-semibold">Add New Category</h2>
        <input
          type="text"
          placeholder="Category Name *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full border p-2 rounded-lg"
        />
        <select
          value={parentId}
          onChange={(e) => setParentId(e.target.value)}
          className="w-full border p-2 rounded-lg"
        >
          <option value="">None (Top-Level Category)</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border p-2 rounded-lg"
        />
        <div>
          <label className="block text-xs font-bold mb-1">Thumbnail Image</label>
          <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
        </div>
        <div>
          <label className="block text-xs font-bold mb-1">Banner Image</label>
          <input type="file" accept="image/*" onChange={(e) => setBannerFile(e.target.files?.[0] || null)} />
        </div>
        <button type="submit" className="bg-red-600 text-white px-4 py-2 rounded-lg">
          Create Category
        </button>
      </form>

      {/* CATEGORY LIST TABLE */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-3">Image</th>
              <th className="p-3">Name</th>
              <th className="p-3">Slug</th>
              <th className="p-3">Parent</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat._id} className="border-b">
                <td className="p-3">
                  {cat.image && <img src={`http://localhost:3000${cat.image}`} alt={cat.name} className="w-10 h-10 object-cover rounded" />}
                </td>
                <td className="p-3 font-semibold">{cat.name}</td>
                <td className="p-3 text-gray-500">{cat.slug}</td>
                <td className="p-3 text-gray-500">{cat.parentId ? 'Subcategory' : 'Root'}</td>
                <td className="p-3">
                  <button onClick={() => handleDelete(cat._id)} className="text-red-600 font-bold">
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
