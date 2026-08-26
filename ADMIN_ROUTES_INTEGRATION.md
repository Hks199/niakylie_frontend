# NiaKylie – Admin Routes & API Integration Reference

> **Purpose**: Master integration specification for all **Admin-only APIs** required by the NiaKylie Admin Dashboard (`/admin`). Any AI or developer can use this guide to connect frontend components or build missing UI views with 100% contract compliance.  
> **Base URL**: `http://localhost:3000/api/v1` (Dev) | `https://api.niakylie.com/api/v1` (Prod)  
> **Auth Strategy**: JWT Bearer Token (`Authorization: Bearer <accessToken>`).  
> **Role Requirement**: The authenticated user must have `roles: ["ADMIN"]`. Non-admin tokens receive `403 Forbidden`.

---

## 1. Quick Reference: Admin Routes Table

| Method | Route | Description | Request Type | Auth Required |
|---|---|---|---|---|
| `POST` | `/auth/admin/register` | Register new administrator account (`Role.ADMIN`) | JSON | Public / Optional Secret |
| `POST` | `/auth/admin/login` | Admin portal login (enforces `Role.ADMIN` privileges) | JSON | Public |
| `POST` | `/auth/admin/logout` | Logout active admin session & revoke tokens | — | ✅ JWT + ADMIN |
| `GET` | `/admin/dashboard/summary` | KPI summary metrics (Revenue, Orders, AOV, Customers, Products, Stock Alerts) | Query | ✅ JWT + ADMIN |
| `GET` | `/admin/dashboard/revenue` | Revenue analytics timeline (`period`: daily, weekly, monthly, yearly) | Query | ✅ JWT + ADMIN |
| `GET` | `/admin/dashboard/orders-breakdown` | Order status distribution count & values | Query | ✅ JWT + ADMIN |
| `GET` | `/admin/dashboard/top-products` | Top selling products ranked by revenue & quantity | Query | ✅ JWT + ADMIN |
| `GET` | `/admin/dashboard/top-categories` | Top revenue generating categories | Query | ✅ JWT + ADMIN |
| `GET` | `/admin/dashboard/top-customers` | High value customers ranked by total spend | Query | ✅ JWT + ADMIN |
| `GET` | `/admin/dashboard/inventory-alerts` | Out-of-stock & low-stock items report | Query | ✅ JWT + ADMIN |
| `DELETE` | `/admin/dashboard/cache` | Flush dashboard Redis metrics cache | — | ✅ JWT + ADMIN |
| `POST` | `/categories` | Create new category (supports image & banner upload) | Multipart Form | ✅ JWT + ADMIN |
| `PUT` | `/categories/:id` | Update existing category | Multipart Form | ✅ JWT + ADMIN |
| `DELETE` | `/categories/:id` | Soft-delete category & descendants | — | ✅ JWT + ADMIN |
| `POST` | `/products` | Create product with variants, attributes & pricing | JSON | ✅ JWT + ADMIN |
| `PUT` | `/products/:id` | Update product details & metadata | JSON | ✅ JWT + ADMIN |
| `DELETE` | `/products/:id` | Soft-delete product | — | ✅ JWT + ADMIN |
| `POST` | `/banners/admin` | Create promotional banner (with image upload) | Multipart Form | ✅ JWT + ADMIN |
| `PUT` | `/banners/admin/:id` | Update banner details / replace image | Multipart Form | ✅ JWT + ADMIN |
| `DELETE` | `/banners/admin/:id` | Delete banner and remove image files | — | ✅ JWT + ADMIN |
| `GET` | `/orders/admin` | Fetch all customer orders (with status, search, pagination) | Query | ✅ JWT + ADMIN |
| `PATCH` | `/orders/admin/:orderId/status` | Update order lifecycle status | JSON | ✅ JWT + ADMIN |
| `PATCH` | `/reviews/admin/:id/moderate` | Moderate customer review (Approve/Reject + Response) | JSON | ✅ JWT + ADMIN |
| `DELETE` | `/reviews/:id` | Delete review (admin override) | — | ✅ JWT + ADMIN |

---

## 2. TypeScript Data Interfaces (`src/types/admin.ts`)

```ts
// ── Common API Response Wrapper ──────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
  path: string;
}

// ── Dashboard Query ──────────────────────────────────────
export type AggregationPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface DashboardQueryDto {
  startDate?: string; // ISO String: '2026-01-01T00:00:00Z'
  endDate?: string;   // ISO String: '2026-12-31T23:59:59Z'
  period?: AggregationPeriod;
  limit?: number;     // Default: 10
}

// ── Dashboard Data Models ────────────────────────────────
export interface DashboardSummary {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  totalCustomers: number;
  newCustomers: number;
  totalProducts: number;
  inventoryAlerts: {
    outOfStockCount: number;
    lowStockCount: number;
  };
}

export interface RevenueAnalyticsItem {
  period: string; // 'YYYY-MM-DD', 'YYYY-Www', 'YYYY-MM', or 'YYYY'
  revenue: number;
  orders: number;
  avgOrderValue: number;
}

export interface OrderStatusBreakdownItem {
  status: string;
  count: number;
  totalValue: number;
}

export interface TopProductItem {
  productId: string;
  productName: string;
  sku: string;
  image?: string;
  totalQuantitySold: number;
  totalRevenue: number;
  orderCount: number;
}

export interface TopCategoryItem {
  categoryId?: string;
  categoryName: string;
  totalRevenue: number;
  itemsSold: number;
}

export interface TopCustomerItem {
  userId: string;
  name: string;
  email: string;
  totalSpent: number;
  orderCount: number;
  lastOrderDate: string;
}

export interface InventoryAlertsReport {
  outOfStockCount: number;
  lowStockCount: number;
  outOfStockItems: Array<{
    inventoryId: string;
    productId: string;
    productName?: string;
    sku: string;
    availableQuantity: number;
  }>;
  lowStockItems: Array<{
    inventoryId: string;
    productId: string;
    productName?: string;
    sku: string;
    availableQuantity: number;
    lowStockThreshold: number;
  }>;
}

// ── Category Models ──────────────────────────────────────
export interface Category {
  _id: string;
  name: string;
  slug: string;
  parentId?: string;
  description?: string;
  image?: string;
  banner?: string;
  seoTitle?: string;
  seoDescription?: string;
  status: boolean;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Banner Models ────────────────────────────────────────
export type BannerType = 'HOMEPAGE' | 'OFFER' | 'FESTIVAL' | 'POPUP';
export type BannerPosition = 'TOP' | 'MIDDLE' | 'BOTTOM' | 'SIDEBAR';

export interface Banner {
  _id: string;
  title: string;
  type: BannerType;
  position: BannerPosition;
  imageUrl: string;
  mobileImageUrl?: string;
  linkUrl?: string;
  linkLabel?: string;
  displayOrder: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

// ── Review Moderation Model ──────────────────────────────
export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Review {
  _id: string;
  productId: string;
  userId: string;
  rating: number; // 1 to 5
  title: string;
  comment: string;
  images?: string[];
  videos?: string[];
  status: ReviewStatus;
  adminResponse?: string;
  isVerifiedPurchase: boolean;
  helpfulVotes: number;
  createdAt: string;
}
```

---

## 3. Detailed Route Specifications

### 3.0 Admin Authentication APIs (`/auth/admin/*`)

#### A. POST `/auth/admin/register` — Register Admin Account
- **Description**: Registers a new administrator account explicitly assigned `roles: ["admin"]` and `isEmailVerified: true`.
- **Auth Required**: Public (Optional secret key check via `adminSecretKey`).
- **Headers**: `Content-Type: application/json`
- **Request Payload**:
  ```json
  {
    "email": "admin@niakylie.com",
    "password": "AdminSecurePassword123!",
    "firstName": "System",
    "lastName": "Administrator",
    "adminSecretKey": "NK_ADMIN_SECRET_KEY_2026"
  }
  ```
- **Success Response (HTTP 201 Created)**:
  ```json
  {
    "message": "Admin account registered successfully",
    "user": {
      "id": "64f1a2b3c4d5e6f7a8b9c0d1",
      "email": "admin@niakylie.com",
      "firstName": "System",
      "lastName": "Administrator",
      "roles": ["admin"]
    }
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Validation failure (missing required fields or password < 8 chars).
  - `401 Unauthorized`: Invalid `adminSecretKey`.
  - `409 Conflict`: Account with this email address already exists.

---

#### B. POST `/auth/admin/login` — Admin Portal Authentication
- **Description**: Authenticates an administrator account. Verifies credentials **and** confirms that the user account possesses `Role.ADMIN` (`roles: ["admin"]`). Rejects regular customer login attempts with `401 Unauthorized`.
- **Auth Required**: Public
- **Headers**: `Content-Type: application/json`
- **Request Payload**:
  ```json
  {
    "email": "admin@niakylie.com",
    "password": "AdminSecurePassword123!"
  }
  ```
- **Success Response (HTTP 200 OK)**:
  ```json
  {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "64f1a2b3c4d5e6f7a8b9c0d1",
      "email": "admin@niakylie.com",
      "firstName": "System",
      "lastName": "Administrator",
      "roles": ["admin"]
    }
  }
  ```
- **Error Responses**:
  - `401 Unauthorized`: `"Invalid admin email or password"` or `"Access Denied: This account does not have Admin privileges"`.
  - `401 Unauthorized`: `"Admin account has been deactivated"`.

---

#### C. POST `/auth/admin/logout` — Revoke Admin Session
- **Description**: Terminates active admin session and invalidates the session refresh token in MongoDB.
- **Auth Required**: ✅ JWT Bearer Token (`Authorization: Bearer <accessToken>`)
- **Headers**: 
  - `Authorization: Bearer <accessToken>`
  - `Content-Type: application/json`
- **Request Payload**: Empty body `{}`
- **Success Response (HTTP 200 OK)**:
  ```json
  {
    "message": "Logged out successfully"
  }
  ```
- **Error Responses**:
  - `401 Unauthorized`: Missing or invalid Bearer token.

---

### 3.1 Dashboard Metrics APIs (`/admin/dashboard/*`)

#### A. GET `/admin/dashboard/summary`
- **Description**: Returns top-level store performance indicators.
- **Request**: Query `startDate?`, `endDate?`
- **Response (200)**:
  ```json
  {
    "totalRevenue": 154200.5,
    "totalOrders": 342,
    "averageOrderValue": 450.88,
    "totalCustomers": 1250,
    "newCustomers": 84,
    "totalProducts": 180,
    "inventoryAlerts": { "outOfStockCount": 3, "lowStockCount": 12 }
  }
  ```

#### B. GET `/admin/dashboard/revenue`
- **Description**: Aggregated revenue timeline.
- **Request**: Query `period?` (`'daily'` | `'weekly'` | `'monthly'` | `'yearly'`)
- **Response (200)**: `RevenueAnalyticsItem[]`

#### C. GET `/admin/dashboard/orders-breakdown`
- **Description**: Distribution of orders by lifecycle status.
- **Response (200)**: `OrderStatusBreakdownItem[]`

#### D. GET `/admin/dashboard/top-products`
- **Description**: Top products by revenue.
- **Request**: Query `limit?` (default: 10)
- **Response (200)**: `TopProductItem[]`

#### E. GET `/admin/dashboard/top-categories`
- **Description**: Top revenue-generating categories.
- **Response (200)**: `TopCategoryItem[]`

#### F. GET `/admin/dashboard/top-customers`
- **Description**: High-value customer ranking.
- **Response (200)**: `TopCustomerItem[]`

#### G. GET `/admin/dashboard/inventory-alerts`
- **Description**: Stock health report listing low/out-of-stock SKUs.
- **Response (200)**: `InventoryAlertsReport`

#### H. DELETE `/admin/dashboard/cache`
- **Description**: Flushes Redis cache to force metric recalculation.
- **Response (200)**: `{ "message": "Dashboard cache cleared successfully" }`

---

### 3.2 Category Management APIs (`/categories`)

#### A. POST `/categories` — Create Category
- **Content-Type**: `multipart/form-data`
- **Form Data Fields**:
  - `name`: string (Required)
  - `parentId`: string (Optional - MongoDB ObjectID)
  - `description`: string (Optional)
  - `seoTitle`: string (Optional)
  - `seoDescription`: string (Optional)
  - `image`: File (Optional - JPG/PNG/WEBP, Max 5MB)
  - `banner`: File (Optional - JPG/PNG/WEBP, Max 5MB)
- **Response (201)**: Created `Category` object.

#### B. PUT `/categories/:id` — Update Category
- **Content-Type**: `multipart/form-data`
- **Form Data Fields**: Same as POST + `status?: boolean`
- **Response (200)**: Updated `Category` object.

#### C. DELETE `/categories/:id` — Delete Category
- **Response (204)**: No Content (Soft deletes category & child categories).

---

### 3.3 Product Management APIs (`/products`)

#### A. POST `/products` — Create Product
- **Content-Type**: `application/json`
- **Request Payload**:
  ```json
  {
    "title": "Embroidered Silk Anarkali",
    "description": "Premium festive designer Anarkali suit set",
    "categoryId": "64f1a2b3c4d5e6f7a8b9c0c9",
    "brandId": "64f1a2b3c4d5e6f7a8b9c0b1",
    "basePrice": 4999.00,
    "discountPrice": 3999.00,
    "sku": "NK-ANK-001",
    "attributes": { "fabric": "Silk", "work": "Zari Embroidery" },
    "isFeatured": true,
    "isActive": true
  }
  ```
- **Response (201)**: Created Product Object.

#### B. PUT `/products/:id` — Update Product
- **Content-Type**: `application/json`
- **Request Payload**: Partial/Full Update Product DTO fields.
- **Response (200)**: Updated Product Object.

#### C. DELETE `/products/:id` — Delete Product
- **Response (204)**: No Content (Soft deletes product).

---

### 3.4 Banner Management APIs (`/banners/admin`)

#### A. POST `/banners/admin` — Create Banner
- **Content-Type**: `multipart/form-data`
- **Form Data Fields**:
  - `title`: string (Required)
  - `type`: `'HOMEPAGE'` | `'OFFER'` | `'FESTIVAL'` | `'POPUP'` (Required)
  - `position`: `'TOP'` | `'MIDDLE'` | `'BOTTOM'` | `'SIDEBAR'` (Optional)
  - `linkUrl`: string (Optional)
  - `displayOrder`: number (Optional)
  - `isActive`: boolean (Optional)
  - `image`: File (Required - Desktop image)
  - `mobileImage`: File (Optional - Mobile image)
- **Response (201)**: Created `Banner` object.

#### B. PUT `/banners/admin/:id` — Update Banner
- **Content-Type**: `multipart/form-data`
- **Form Data Fields**: Same as POST (all fields optional to update/replace images).
- **Response (200)**: Updated `Banner` object.

#### C. DELETE `/banners/admin/:id` — Delete Banner
- **Response (200)**: `{ "message": "Banner deleted" }`

---

### 3.5 Order Management APIs (`/orders/admin`)

#### A. GET `/orders/admin` — Fetch All Orders
- **Request**: Query `page?`, `limit?`, `status?`, `search?`, `startDate?`, `endDate?`
- **Response (200)**: Paginated order list object with `items`, `totalItems`, `totalPages`.

#### B. PATCH `/orders/admin/:orderId/status` — Update Order Status
- **Content-Type**: `application/json`
- **Request Payload**:
  ```json
  {
    "status": "CONFIRMED", // PENDING | CONFIRMED | PACKED | SHIPPED | OUT_FOR_DELIVERY | DELIVERED | CANCELLED | REFUNDED
    "note": "Payment verified and order pushed to warehouse fulfillment"
  }
  ```
- **Response (200)**: Updated Order Object.

---

### 3.6 Review Moderation APIs (`/reviews/admin`)

#### A. PATCH `/reviews/admin/:id/moderate` — Approve/Reject Review
- **Content-Type**: `application/json`
- **Request Payload**:
  ```json
  {
    "status": "APPROVED", // 'APPROVED' or 'REJECTED'
    "adminResponse": "Thank you for loving NiaKylie festive wear!"
  }
  ```
- **Response (200)**: Updated `Review` object.

#### B. DELETE `/reviews/:id` — Delete Review
- **Response (200)**: `{ "message": "Review deleted successfully" }`

---

## 4. Complete Frontend API Service File (`src/api/admin.ts`)

Copy and paste this production-ready API service into your frontend codebase:

```ts
import { apiClient } from './client';
import {
  DashboardQueryDto,
  DashboardSummary,
  RevenueAnalyticsItem,
  OrderStatusBreakdownItem,
  TopProductItem,
  TopCategoryItem,
  TopCustomerItem,
  InventoryAlertsReport,
  Category,
  Banner,
  Review,
} from '../types/admin';

export const adminApi = {
  // ─── 1. DASHBOARD ANALYTICS ─────────────────────────────
  getSummary: (query?: DashboardQueryDto): Promise<DashboardSummary> =>
    apiClient.get('/admin/dashboard/summary', { params: query }),

  getRevenueAnalytics: (query?: DashboardQueryDto): Promise<RevenueAnalyticsItem[]> =>
    apiClient.get('/admin/dashboard/revenue', { params: query }),

  getOrderStatusBreakdown: (query?: DashboardQueryDto): Promise<OrderStatusBreakdownItem[]> =>
    apiClient.get('/admin/dashboard/orders-breakdown', { params: query }),

  getTopProducts: (query?: DashboardQueryDto): Promise<TopProductItem[]> =>
    apiClient.get('/admin/dashboard/top-products', { params: query }),

  getTopCategories: (query?: DashboardQueryDto): Promise<TopCategoryItem[]> =>
    apiClient.get('/admin/dashboard/top-categories', { params: query }),

  getTopCustomers: (query?: DashboardQueryDto): Promise<TopCustomerItem[]> =>
    apiClient.get('/admin/dashboard/top-customers', { params: query }),

  getInventoryAlerts: (): Promise<InventoryAlertsReport> =>
    apiClient.get('/admin/dashboard/inventory-alerts'),

  clearCache: (): Promise<{ message: string }> =>
    apiClient.delete('/admin/dashboard/cache'),

  // ─── 2. CATEGORY MANAGEMENT ──────────────────────────────
  createCategory: (formData: FormData): Promise<Category> =>
    apiClient.post('/categories', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  updateCategory: (id: string, formData: FormData): Promise<Category> =>
    apiClient.put(`/categories/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  deleteCategory: (id: string): Promise<void> =>
    apiClient.delete(`/categories/${id}`),

  // ─── 3. PRODUCT MANAGEMENT ───────────────────────────────
  createProduct: (payload: Record<string, any>) =>
    apiClient.post('/products', payload),

  updateProduct: (id: string, payload: Record<string, any>) =>
    apiClient.put(`/products/${id}`, payload),

  deleteProduct: (id: string): Promise<void> =>
    apiClient.delete(`/products/${id}`),

  // ─── 4. BANNER MANAGEMENT ────────────────────────────────
  getAllBanners: (): Promise<Banner[]> =>
    apiClient.get('/banners/admin/all'),

  createBanner: (formData: FormData): Promise<Banner> =>
    apiClient.post('/banners/admin', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  updateBanner: (id: string, formData: FormData): Promise<Banner> =>
    apiClient.put(`/banners/admin/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  deleteBanner: (id: string): Promise<{ message: string }> =>
    apiClient.delete(`/banners/admin/${id}`),

  // ─── 5. ORDER MANAGEMENT ─────────────────────────────────
  getAllOrders: (params?: Record<string, any>) =>
    apiClient.get('/orders/admin', { params }),

  updateOrderStatus: (orderId: string, status: string, note?: string) =>
    apiClient.patch(`/orders/admin/${orderId}/status`, { status, note }),

  // ─── 6. REVIEW MODERATION ────────────────────────────────
  moderateReview: (reviewId: string, status: 'APPROVED' | 'REJECTED', adminResponse?: string): Promise<Review> =>
    apiClient.patch(`/reviews/admin/${reviewId}/moderate`, { status, adminResponse }),

  deleteReview: (reviewId: string): Promise<{ message: string }> =>
    apiClient.delete(`/reviews/${reviewId}`),
};
```
