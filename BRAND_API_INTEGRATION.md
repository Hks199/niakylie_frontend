# NiaKylie – Brand API Integration Reference

> **Purpose**: Master integration specification for all **Brand Management APIs** (Public & Admin). Any AI or frontend developer can use this guide to connect brand filter sidebars, store navigation, brand showcases, and Admin Brand Management Panels with 100% contract compliance.  
> **Base URL**: `http://localhost:3000/api/v1` (Dev) | `https://api.niakylie.com/api/v1` (Prod)  
> **Auth Requirements**:
> - `GET /brands` & `GET /brands/:idOrSlug`: Public (No token required)
> - `POST /brands`, `PUT /brands/:id`, `DELETE /brands/:id`: Requires JWT Bearer Token (`Authorization: Bearer <accessToken>`) with `roles: ["ADMIN"]` or `"admin"`.

---

## 1. Quick Reference: Brand Routes Table

| Method | Endpoint | Description | Content-Type | Auth Required |
|---|---|---|---|---|
| `GET` | `/brands` | List active brands (supports regex search on name & slug, pagination & sorting) | — | Public |
| `GET` | `/brands/:idOrSlug` | Fetch single active brand details by Mongo ID or URL Slug | — | Public |
| `POST` | `/brands` | Create new brand with auto-generated slug & optional logo upload | `multipart/form-data` | ✅ JWT + ADMIN |
| `PUT` | `/brands/:id` | Update brand details, re-slugify if name changes & replace logo file | `multipart/form-data` | ✅ JWT + ADMIN |
| `DELETE` | `/brands/:id` | Soft-delete brand (sets `isDeleted: true` and `status: false`) | — | ✅ JWT + ADMIN |

---

## 2. TypeScript Interfaces (`src/types/brand.ts`)

```ts
// ── Master Brand Interface ──────────────────────────────
export interface Brand {
  _id: string;
  name: string;
  slug: string;
  logo?: string;        // Public URL or file path, e.g. "/uploads/brands/logo-123.png"
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords: string[];
  status: boolean;      // true = active, false = disabled
  isDeleted: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── Query Parameters for GET /brands ────────────────────
export interface QueryBrandParams {
  page?: number;        // Default: 1
  limit?: number;       // Default: 10 (max 100)
  search?: string;      // Regex search by name or slug
  sortBy?: string;      // Default: 'createdAt'
  sortOrder?: 'asc' | 'desc'; // Default: 'desc'
}

// ── Paginated Response Wrapper ────────────────────────────
export interface PaginatedBrandsResponse {
  data: Brand[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ── Create Brand Payload ─────────────────────────
export interface CreateBrandInput {
  name: string;
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[]; // Array of strings or comma-separated string in FormData
  logo?: File;
}

// ── Update Brand Payload ─────────────────────────
export interface UpdateBrandInput extends Partial<CreateBrandInput> {
  status?: boolean;
}
```

---

## 3. Detailed Endpoint Contracts

### 3.1 Fetch Brands List (`GET /brands`)
- **Description**: Retrieves active store brands (`isDeleted: false`) with optional pagination, regex keyword search (on `name` & `slug`), and sorting.
- **Auth Required**: Public
- **Query Parameters**:
  - `page` (number, optional, default: `1`)
  - `limit` (number, optional, default: `10`, max: `100`)
  - `search` (string, optional): Regex search matched against `name` and `slug`.
  - `sortBy` (string, optional, default: `'createdAt'`): Field name to sort by.
  - `sortOrder` (string, optional, default: `'desc'`): `'asc'` or `'desc'`.

#### Request Example
`GET http://localhost:3000/api/v1/brands?page=1&limit=10&search=nike&sortBy=name&sortOrder=asc`

#### Success Response (`HTTP 200 OK`)
```json
{
  "data": [
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c010",
      "name": "Nike",
      "slug": "nike",
      "logo": "/uploads/brands/logo-1724650000.png",
      "description": "Leading global athletic footwear and apparel brand",
      "seoTitle": "Shop Nike Shoes & Apparel Online - NiaKylie",
      "seoDescription": "Explore exclusive Nike collection at best prices.",
      "seoKeywords": ["nike", "shoes", "sportswear", "apparel"],
      "status": true,
      "isDeleted": false,
      "deletedAt": null,
      "createdAt": "2026-08-26T10:00:00.000Z",
      "updatedAt": "2026-08-26T10:00:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

---

### 3.2 Fetch Brand Details (`GET /brands/:idOrSlug`)
- **Description**: Fetch active brand details by either 24-character Mongo `_id` or unique URL `slug`.
- **Auth Required**: Public

#### Request Example
`GET http://localhost:3000/api/v1/brands/nike`

#### Success Response (`HTTP 200 OK`)
```json
{
  "_id": "64f1a2b3c4d5e6f7a8b9c010",
  "name": "Nike",
  "slug": "nike",
  "logo": "/uploads/brands/logo-1724650000.png",
  "description": "Leading global athletic footwear and apparel brand",
  "seoTitle": "Shop Nike Shoes & Apparel Online - NiaKylie",
  "seoDescription": "Explore exclusive Nike collection at best prices.",
  "seoKeywords": ["nike", "shoes", "sportswear", "apparel"],
  "status": true,
  "isDeleted": false,
  "createdAt": "2026-08-26T10:00:00.000Z",
  "updatedAt": "2026-08-26T10:00:00.000Z"
}
```

#### Error Response (`HTTP 404 Not Found`)
```json
{
  "statusCode": 404,
  "message": "Brand not found",
  "error": "Not Found"
}
```

---

### 3.3 Create Brand (`POST /brands`)
- **Description**: Creates a new brand with auto-generated unique slug and optional logo file upload.
- **Auth Required**: ✅ JWT Bearer Token (`roles: ["ADMIN"]`)
- **Content-Type**: `multipart/form-data`

#### Multipart Form Data Fields
| Field Name | Type | Required | Description |
|---|---|---|---|
| `name` | Text | **Yes** | Brand name (e.g. "Nike") |
| `description` | Text | No | Description snippet |
| `seoTitle` | Text | No | Meta title for SEO |
| `seoDescription` | Text | No | Meta description |
| `seoKeywords` | Text / Array | No | Comma-separated list or array of keywords |
| `logo` | File | No | Image file (JPG, JPEG, PNG, WEBP, max 5MB) |

#### Success Response (`HTTP 201 Created`)
```json
{
  "_id": "64f1a2b3c4d5e6f7a8b9c010",
  "name": "Nike",
  "slug": "nike",
  "logo": "/uploads/brands/logo-1724650000.png",
  "description": "Leading global athletic footwear and apparel brand",
  "seoTitle": "Shop Nike Shoes & Apparel Online - NiaKylie",
  "seoDescription": "Explore exclusive Nike collection at best prices.",
  "seoKeywords": ["nike", "shoes"],
  "status": true,
  "isDeleted": false,
  "createdAt": "2026-08-26T10:00:00.000Z",
  "updatedAt": "2026-08-26T10:00:00.000Z"
}
```

---

### 3.4 Update Brand (`PUT /brands/:id`)
- **Description**: Updates brand metadata, updates active status, re-slugifies if `name` is changed, and optionally replaces the logo file.
- **Auth Required**: ✅ JWT Bearer Token (`roles: ["ADMIN"]`)
- **Content-Type**: `multipart/form-data`

#### Multipart Form Data Fields
Same fields as `POST /brands` + optional `status` (boolean `'true'` / `'false'`).

#### Success Response (`HTTP 200 OK`)
```json
{
  "_id": "64f1a2b3c4d5e6f7a8b9c010",
  "name": "Nike Sports",
  "slug": "nike-sports",
  "status": true,
  "updatedAt": "2026-08-26T10:15:00.000Z"
}
```

---

### 3.5 Delete Brand (`DELETE /brands/:id`)
- **Description**: Soft-deletes brand by setting `isDeleted: true` and `status: false`.
- **Auth Required**: ✅ JWT Bearer Token (`roles: ["ADMIN"]`)
- **Success Response**: `HTTP 204 No Content` (Empty response body)

---

## 4. Frontend Integration Implementation Code

### 4.1 Axios API Client (`src/api/brands.ts`)

```ts
import { apiClient } from './client';
import {
  Brand,
  QueryBrandParams,
  PaginatedBrandsResponse,
} from '../types/brand';

export const brandsApi = {
  /**
   * Fetch active brands list with search, sorting, and pagination.
   */
  getBrands: (params?: QueryBrandParams): Promise<PaginatedBrandsResponse> =>
    apiClient.get('/brands', { params }),

  /**
   * Get single brand details by Mongo ID or Slug.
   */
  getBrandByIdOrSlug: (idOrSlug: string): Promise<Brand> =>
    apiClient.get(`/brands/${idOrSlug}`),

  /**
   * Create new brand (Uses FormData for multipart file upload).
   */
  createBrand: (formData: FormData): Promise<Brand> =>
    apiClient.post('/brands', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  /**
   * Update brand by ID (Uses FormData for multipart file upload).
   */
  updateBrand: (id: string, formData: FormData): Promise<Brand> =>
    apiClient.put(`/brands/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  /**
   * Soft-delete brand by ID (Admin only).
   */
  deleteBrand: (id: string): Promise<void> =>
    apiClient.delete(`/brands/${id}`),
};
```

---

### 4.2 React Component Example (`AdminBrandsPanel.tsx`)

```tsx
import React, { useState, useEffect } from 'react';
import { brandsApi } from '../api/brands';
import { Brand } from '../types/brand';

export function AdminBrandsPanel() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const res = await brandsApi.getBrands({ search, limit: 50 });
      setBrands(res.data);
    } catch (err) {
      console.error('Failed to load brands', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, [search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', name);
    if (description) formData.append('description', description);
    if (seoTitle) formData.append('seoTitle', seoTitle);
    if (seoDescription) formData.append('seoDescription', seoDescription);
    if (seoKeywords) formData.append('seoKeywords', seoKeywords);
    if (logoFile) formData.append('logo', logoFile);

    try {
      await brandsApi.createBrand(formData);
      alert('Brand created successfully!');
      setName('');
      setDescription('');
      setSeoTitle('');
      setSeoDescription('');
      setSeoKeywords('');
      setLogoFile(null);
      fetchBrands();
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || 'Failed to create brand');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this brand?')) return;
    try {
      await brandsApi.deleteBrand(id);
      fetchBrands();
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || 'Failed to delete brand');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Brand Management</h1>

      {/* SEARCH BAR */}
      <input
        type="text"
        placeholder="Search brands by name or slug..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border p-2 rounded-lg"
      />

      {/* CREATE BRAND FORM */}
      <form onSubmit={handleSubmit} className="bg-white p-4 border rounded-xl space-y-4">
        <h2 className="text-lg font-semibold">Add New Brand</h2>
        <input
          type="text"
          placeholder="Brand Name *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full border p-2 rounded-lg"
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border p-2 rounded-lg"
        />
        <input
          type="text"
          placeholder="SEO Keywords (comma separated)"
          value={seoKeywords}
          onChange={(e) => setSeoKeywords(e.target.value)}
          className="w-full border p-2 rounded-lg"
        />
        <div>
          <label className="block text-xs font-bold mb-1">Brand Logo Image</label>
          <input
            type="file"
            accept="image/png, image/jpeg, image/jpg, image/webp"
            onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
          />
        </div>
        <button type="submit" className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold">
          Create Brand
        </button>
      </form>

      {/* BRANDS LIST TABLE */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-3">Logo</th>
              <th className="p-3">Name</th>
              <th className="p-3">Slug</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {brands.map((brand) => (
              <tr key={brand._id} className="border-b">
                <td className="p-3">
                  {brand.logo ? (
                    <img
                      src={`http://localhost:3000${brand.logo}`}
                      alt={brand.name}
                      className="w-10 h-10 object-contain rounded"
                    />
                  ) : (
                    <span className="text-xs text-gray-400">No Logo</span>
                  )}
                </td>
                <td className="p-3 font-semibold">{brand.name}</td>
                <td className="p-3 text-gray-500">{brand.slug}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 text-xs rounded ${brand.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {brand.status ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-3">
                  <button onClick={() => handleDelete(brand._id)} className="text-red-600 font-bold">
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
