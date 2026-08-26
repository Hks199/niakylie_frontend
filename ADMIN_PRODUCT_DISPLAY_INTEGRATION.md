# NiaKylie – Admin Product Display & Management APIs Integration Reference

> **Purpose**: Complete integration specification for all **Admin Product Display APIs**, including product listing tables, search/filter bars, stock & inventory alerts, single product view drawers, and variant management.  
> **Base URL**: `http://localhost:3000/api/v1` (Dev) | `https://api.niakylie.com/api/v1` (Prod)  
> **Auth Requirements**:
> - `GET /products` & `GET /products/:idOrSlug`: Public / Admin (No token required for basic list, but `Authorization: Bearer <accessToken>` enables complete metadata access)
> - `GET /admin/dashboard/inventory-alerts`: Requires JWT Bearer Token (`Authorization: Bearer <accessToken>`) with `roles: ["ADMIN"]` or `"admin"`.

---

## 1. Quick Reference: Admin Product Display Endpoints

| Method | Endpoint | Description | Query Parameters / Headers | Auth Required |
|---|---|---|---|---|
| `GET` | `/products` | List products with pagination, search, category filter, stock, and sorting | `page`, `limit`, `search`, `categoryId`, `brandId`, `status`, `sortBy`, `sortOrder` | Public / Admin |
| `GET` | `/products/:idOrSlug` | Get full product details including variants, images, SEO, and rating breakdown | `:idOrSlug` | Public / Admin |
| `GET` | `/admin/dashboard/inventory-alerts` | Get low stock (< 10 units) and out-of-stock items for inventory table | — | ✅ JWT + ADMIN |

---

## 2. TypeScript Interfaces (`src/types/adminProduct.ts`)

```ts
// ── Variant Item ──────────────────────────────────────────
export interface ProductVariant {
  _id: string;
  sku: string;
  barcode?: string;
  color: string;
  colorHex?: string;
  size: string;
  stock: number;
  mrp: number;          // Maximum Retail Price (₹)
  offerPrice: number;   // Selling Price (₹)
  images?: string[];
  isActive: boolean;
}

// ── Category Reference ───────────────────────────────────
export interface ProductCategoryRef {
  _id: string;
  name: string;
  slug: string;
}

// ── Brand Reference ──────────────────────────────────────
export interface ProductBrandRef {
  _id: string;
  name: string;
  slug: string;
  logo?: string;
}

// ── Master Product Entity ────────────────────────────────
export interface AdminProduct {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  categoryId: string | ProductCategoryRef;
  brandId?: string | ProductBrandRef;
  variants: ProductVariant[];
  images: string[];
  material?: string;
  pattern?: string;
  season?: string;
  productCollection?: string;
  tags: string[];
  tax: number;
  isFeatured: boolean;
  isTrending: boolean;
  isBestSeller: boolean;
  status: boolean;        // true = Active, false = Disabled
  reviewsCount: number;
  averageRating: number;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords: string[];
  isDeleted: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── Query Parameters Interface ────────────────────────────
export interface AdminProductQueryParams {
  page?: number;        // Default: 1
  limit?: number;       // Default: 10 or 20 for Admin tables
  search?: string;      // Search by name, description, SKU, tags
  categoryId?: string;  // Mongo ObjectId of category
  brandId?: string;     // Mongo ObjectId of brand
  status?: boolean;     // Filter active/disabled status
  isFeatured?: boolean;
  isTrending?: boolean;
  isBestSeller?: boolean;
  sortBy?: 'name' | 'price' | 'averageRating' | 'reviewsCount' | 'createdAt'; // Default: "createdAt"
  sortOrder?: 'asc' | 'desc'; // Default: "desc"
}

// ── Paginated Response Payload ─────────────────────────────
export interface PaginatedAdminProductsResponse {
  data: AdminProduct[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}
```

---

## 3. Detailed Endpoint Contracts

### 3.1 List Products for Admin Table (`GET /products`)
- **Description**: Returns paginated list of products formatted for Admin Product Display Tables, search filters, and catalog grids.
- **Auth Required**: Public / Admin
- **Query Parameters Example**: `?page=1&limit=10&search=kurti&sortBy=createdAt&sortOrder=desc`

#### Success Response (`HTTP 200 OK`)
```json
{
  "data": [
    {
      "_id": "6a8b2509599bfd832fea03e3",
      "name": "Floral Embroidered Silk Kurti",
      "slug": "floral-embroidered-silk-kurti",
      "description": "Handcrafted traditional silk kurti with floral patterns.",
      "shortDescription": "Silk Kurti with floral embroidery",
      "categoryId": {
        "_id": "64f1a2b3c4d5e6f7a8b9c001",
        "name": "Women Ethnic Wear",
        "slug": "women-ethnic-wear"
      },
      "brandId": {
        "_id": "64f1a2b3c4d5e6f7a8b9c009",
        "name": "NiaKylie Signature",
        "slug": "niakylie-signature"
      },
      "variants": [
        {
          "_id": "v-001",
          "sku": "NIA-FLR-RED-M",
          "color": "Crimson Red",
          "colorHex": "#DC2626",
          "size": "M",
          "stock": 25,
          "mrp": 2999,
          "offerPrice": 1999,
          "isActive": true
        }
      ],
      "images": [
        "/uploads/products/1787325000-kurti-red.webp"
      ],
      "tax": 5,
      "isFeatured": true,
      "isTrending": false,
      "isBestSeller": true,
      "status": true,
      "reviewsCount": 14,
      "averageRating": 4.8,
      "isDeleted": false,
      "createdAt": "2026-08-23T16:51:21.213Z",
      "updatedAt": "2026-08-23T16:51:21.213Z"
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

### 3.2 Single Product Details View (`GET /products/:idOrSlug`)
- **Description**: Returns detailed product record including complete variants list, high-res gallery images, and SEO metadata.
- **Auth Required**: Public / Admin

#### Success Response (`HTTP 200 OK`)
```json
{
  "_id": "6a8b2509599bfd832fea03e3",
  "name": "Floral Embroidered Silk Kurti",
  "slug": "floral-embroidered-silk-kurti",
  "categoryId": "64f1a2b3c4d5e6f7a8b9c001",
  "variants": [
    {
      "_id": "v-001",
      "sku": "NIA-FLR-RED-M",
      "color": "Crimson Red",
      "size": "M",
      "stock": 25,
      "mrp": 2999,
      "offerPrice": 1999
    }
  ],
  "images": [
    "/uploads/products/1787325000-kurti-red.webp"
  ],
  "status": true,
  "createdAt": "2026-08-23T16:51:21.213Z"
}
```

---

### 3.3 Inventory Stock Alerts (`GET /admin/dashboard/inventory-alerts`)
- **Description**: Returns low-stock (< 10 units) and out-of-stock items for Admin inventory monitoring dashboard.
- **Auth Required**: ✅ JWT Bearer Token (`roles: ["ADMIN"]`)

#### Success Response (`HTTP 200 OK`)
```json
{
  "outOfStock": [
    {
      "_id": "6a8b2509599bfd832fea03e3",
      "name": "Silk Saree Blue",
      "sku": "NIA-SLK-BLU",
      "stock": 0
    }
  ],
  "lowStock": [
    {
      "_id": "6a8b2509599bfd832fea03e4",
      "name": "Anarkali Suit Gold",
      "sku": "NIA-ANR-GLD",
      "stock": 4
    }
  ]
}
```

---

## 4. Frontend Implementation Code

### 4.1 Axios API Client (`src/api/adminProducts.ts`)

```ts
import { apiClient } from './client';
import {
  AdminProduct,
  AdminProductQueryParams,
  PaginatedAdminProductsResponse,
} from '../types/adminProduct';

export const adminProductsApi = {
  /**
   * Fetch products for Admin Table with search & pagination filters
   */
  getAdminProducts: async (params?: AdminProductQueryParams): Promise<PaginatedAdminProductsResponse> => {
    const response = await apiClient.get<any>('/products', { params });
    
    // Normalize paginated wrapper
    if (response && Array.isArray(response.data)) {
      return {
        data: response.data,
        meta: response.meta || {
          total: response.data.length,
          page: params?.page || 1,
          limit: params?.limit || 10,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };
    }

    return {
      data: Array.isArray(response) ? response : [],
      meta: { total: 0, page: 1, limit: 10, totalPages: 0, hasNextPage: false, hasPrevPage: false },
    };
  },

  /**
   * Fetch single product details by Mongo ID or Slug
   */
  getProductDetails: (idOrSlug: string): Promise<AdminProduct> =>
    apiClient.get(`/products/${idOrSlug}`),

  /**
   * Fetch inventory alerts (low stock & out of stock)
   */
  getInventoryAlerts: (): Promise<{ outOfStock: any[]; lowStock: any[] }> =>
    apiClient.get('/admin/dashboard/inventory-alerts'),
};
```

---

### 4.2 React Admin Product Table Component (`AdminProductDisplayTable.tsx`)

```tsx
import React, { useState, useEffect } from 'react';
import { adminProductsApi } from '../api/adminProducts';
import { productsApi } from '../api/products';
import { AdminProduct } from '../types/adminProduct';
import { Search, Eye, Trash2, Tag, AlertCircle } from 'lucide-react';

export function AdminProductDisplayTable() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<AdminProduct | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await adminProductsApi.getAdminProducts({ page, limit: 10, search });
      setProducts(res.data);
      setTotalPages(res.meta.totalPages);
    } catch (err) {
      console.error('Failed to load admin products', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, search]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await productsApi.deleteProduct(id);
      fetchProducts();
    } catch (err: any) {
      alert(err?.message || 'Delete failed');
    }
  };

  return (
    <div className="p-6 space-y-6 bg-slate-950 text-white min-h-screen">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-extrabold text-white">Product Catalog Management</h1>
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search products by name, tag, SKU..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs outline-none focus:border-red-500"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Product Display Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-extrabold">
            <tr>
              <th className="p-4">Product</th>
              <th className="p-4">Category</th>
              <th className="p-4">Price (MRP / Offer)</th>
              <th className="p-4">Total Stock</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-300">
            {loading ? (
              <tr><td colSpan={6} className="p-8 text-center text-slate-500">Loading products...</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-slate-500">No products found.</td></tr>
            ) : (
              products.map((prod) => {
                const mainVariant = prod.variants?.[0];
                const totalStock = prod.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0;
                const categoryName = typeof prod.categoryId === 'object' ? prod.categoryId?.name : 'General';
                const imageSrc = prod.images?.[0] ? `http://localhost:3000${prod.images[0]}` : '/placeholder.jpg';

                return (
                  <tr key={prod._id} className="hover:bg-slate-850 transition-colors">
                    <td className="p-4 flex items-center space-x-3">
                      <img src={imageSrc} alt={prod.name} className="w-10 h-10 object-cover rounded-lg bg-slate-950" />
                      <div>
                        <p className="font-bold text-white text-sm">{prod.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono">ID: {prod._id}</p>
                      </div>
                    </td>
                    <td className="p-4"><span className="bg-slate-800 px-2.5 py-1 rounded-lg text-slate-300 font-semibold">{categoryName}</span></td>
                    <td className="p-4 font-semibold">
                      {mainVariant ? (
                        <div>
                          <span className="text-emerald-400 font-bold">₹{mainVariant.offerPrice}</span>
                          <span className="text-slate-500 line-through text-[10px] ml-1.5">₹{mainVariant.mrp}</span>
                        </div>
                      ) : (
                        <span className="text-slate-500">N/A</span>
                      )}
                    </td>
                    <td className="p-4 font-bold">
                      {totalStock === 0 ? (
                        <span className="text-rose-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Out of Stock</span>
                      ) : totalStock < 10 ? (
                        <span className="text-amber-400">{totalStock} units (Low)</span>
                      ) : (
                        <span className="text-slate-300">{totalStock} units</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${prod.status ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'}`}>
                        {prod.status ? 'ACTIVE' : 'DISABLED'}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button onClick={() => setSelectedProduct(prod)} className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(prod._id, prod.name)} className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Pagination Controls */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
          <span>Page {page} of {totalPages}</span>
          <div className="space-x-2">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg disabled:opacity-40">Previous</button>
            <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg disabled:opacity-40">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
```
