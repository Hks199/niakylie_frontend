# NiaKylie – Admin Dashboard API Integration Guide

> **Purpose**: Single source of truth for AI-assisted frontend integration of all Admin Dashboard (`/admin`) and administrative management APIs.  
> **Base URL**: `http://localhost:3000/api/v1` (dev) | `https://api.niakylie.com/api/v1` (prod)  
> **Auth Strategy**: JWT Bearer Token with Admin role (`Authorization: Bearer <accessToken>`).  
> **Required Role**: Account must have `roles: ["ADMIN"]`. Non-admin accounts receive `403 Forbidden`.

---

## TypeScript Type Definitions (`src/types/admin.ts`)

```ts
// ── Query Parameters ──────────────────────────────────────
export type AggregationPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface DashboardQuery {
  startDate?: string; // ISO date string e.g. '2026-01-01T00:00:00Z'
  endDate?: string;   // ISO date string e.g. '2026-12-31T23:59:59Z'
  period?: AggregationPeriod;
  limit?: number;     // Top items limit (default: 10)
}

// ── KPI Summary ───────────────────────────────────────────
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

// ── Revenue Analytics ──────────────────────────────────────
export interface RevenueAnalyticsItem {
  period: string;       // Format: 'YYYY-MM-DD', 'YYYY-Www', 'YYYY-MM', or 'YYYY'
  revenue: number;
  orders: number;
  avgOrderValue: number;
}

// ── Order Breakdown ───────────────────────────────────────
export interface OrderStatusBreakdownItem {
  status: string;       // PENDING | CONFIRMED | PACKED | SHIPPED | DELIVERED | CANCELLED | etc.
  count: number;
  totalValue: number;
}

// ── Top Performing Data ───────────────────────────────────
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

// ── Inventory Alerts ──────────────────────────────────────
export interface InventoryAlertItem {
  inventoryId: string;
  productId: string;
  productName?: string;
  sku: string;
  availableQuantity: number;
  reservedQuantity?: number;
  lowStockThreshold?: number;
}

export interface InventoryAlertsReport {
  outOfStockCount: number;
  lowStockCount: number;
  outOfStockItems: InventoryAlertItem[];
  lowStockItems: InventoryAlertItem[];
}
```

---

## Section 1: Dashboard KPI & Analytics APIs (`/admin/dashboard`)

All endpoints in this section accept optional date filter queries: `startDate`, `endDate`.

### 1.1 GET `/admin/dashboard/summary` — Key Metrics Overview
Returns aggregate KPIs (Revenue, Orders, AOV, Customers, Products, Stock Alerts).

**Auth required**: ✅ Admin  
**Query Params**: `startDate?`, `endDate?`

#### Example Request
```ts
adminApi.getSummary({ startDate: '2026-08-01T00:00:00Z' });
```

#### Success Response — HTTP 200
```json
{
  "totalRevenue": 154200.50,
  "totalOrders": 342,
  "averageOrderValue": 450.88,
  "totalCustomers": 1250,
  "newCustomers": 84,
  "totalProducts": 180,
  "inventoryAlerts": {
    "outOfStockCount": 3,
    "lowStockCount": 12
  }
}
```

---

### 1.2 GET `/admin/dashboard/revenue` — Revenue & Sales Timeline
Returns sales trend data aggregated by period.

**Auth required**: ✅ Admin  
**Query Params**: `startDate?`, `endDate?`, `period?` (`'daily'` | `'weekly'` | `'monthly'` | `'yearly'`)

#### Success Response — HTTP 200
```json
[
  {
    "period": "2026-08",
    "revenue": 54200.50,
    "orders": 120,
    "avgOrderValue": 451.67
  }
]
```

---

### 1.3 GET `/admin/dashboard/orders-breakdown` — Order Status Counts
Returns order volume and total revenue per order status.

**Auth required**: ✅ Admin

#### Success Response — HTTP 200
```json
[
  { "status": "DELIVERED", "count": 280, "totalValue": 125000.00 },
  { "status": "SHIPPED", "count": 42, "totalValue": 18900.50 },
  { "status": "PENDING", "count": 20, "totalValue": 10300.00 }
]
```

---

### 1.4 GET `/admin/dashboard/top-products` — Best Selling Products
Returns top products ranked by revenue generated and units sold.

**Auth required**: ✅ Admin  
**Query Params**: `startDate?`, `endDate?`, `limit?` (default: 10)

#### Success Response — HTTP 200
```json
[
  {
    "productId": "64f1a2b3c4d5e6f7a8b9c0d1",
    "productName": "Silk Embroidered Anarkali",
    "sku": "NK-ANK-001-RED-M",
    "image": "/uploads/products/anarkali-1.jpg",
    "totalQuantitySold": 45,
    "totalRevenue": 22500.00,
    "orderCount": 38
  }
]
```

---

### 1.5 GET `/admin/dashboard/top-categories` — Top Categories
Returns revenue contribution grouped by product category.

**Auth required**: ✅ Admin

#### Success Response — HTTP 200
```json
[
  {
    "categoryId": "64f1a2b3c4d5e6f7a8b9c0c9",
    "categoryName": "Ethnic Wear",
    "totalRevenue": 85400.00,
    "itemsSold": 180
  }
]
```

---

### 1.6 GET `/admin/dashboard/top-customers` — High Value Customers
Returns top customers ranked by total spend.

**Auth required**: ✅ Admin

#### Success Response — HTTP 200
```json
[
  {
    "userId": "64f1a2b3c4d5e6f7a8b9c0d5",
    "name": "Priya Sharma",
    "email": "priya@example.com",
    "totalSpent": 14500.00,
    "orderCount": 8,
    "lastOrderDate": "2026-08-18T14:30:00.000Z"
  }
]
```

---

### 1.7 GET `/admin/dashboard/inventory-alerts` — Stock Health Report
Returns complete list of out-of-stock and low-stock items.

**Auth required**: ✅ Admin

#### Success Response — HTTP 200
```json
{
  "outOfStockCount": 1,
  "lowStockCount": 2,
  "outOfStockItems": [
    {
      "inventoryId": "64f1a2...",
      "productId": "64f1a2...",
      "productName": "Designer Lehenga",
      "sku": "NK-LHG-002-BLU-L",
      "availableQuantity": 0,
      "reservedQuantity": 0
    }
  ],
  "lowStockItems": [
    {
      "inventoryId": "64f1a3...",
      "productId": "64f1a3...",
      "productName": "Printed Silk Saree",
      "sku": "NK-SAR-005-GRN-FREE",
      "availableQuantity": 3,
      "lowStockThreshold": 5
    }
  ]
}
```

---

### 1.8 DELETE `/admin/dashboard/cache` — Reset Metrics Cache
Clears Redis dashboard cache to force fresh calculation.

**Auth required**: ✅ Admin

#### Success Response — HTTP 200
```json
{ "message": "Dashboard cache cleared successfully" }
```

---

## Section 2: Admin Order Management APIs (`/orders/admin`)

### 2.1 GET `/orders/admin` — List All Orders
**Auth required**: ✅ Admin  
**Query Params**: `page?`, `limit?`, `status?`, `search?`, `startDate?`, `endDate?`

---

### 2.2 PATCH `/orders/admin/:orderId/status` — Change Order Status
**Auth required**: ✅ Admin

#### Request Payload
```ts
{
  status: 'PENDING' | 'CONFIRMED' | 'PACKED' | 'SHIPPED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED' | 'RETURN_REQUESTED' | 'RETURNED' | 'REFUNDED';
  note?: string;
}
```

---

### 2.3 PATCH `/orders/admin/:orderId/tracking` — Update Courier Info
**Auth required**: ✅ Admin

#### Request Payload
```ts
{
  trackingNumber: string; // e.g. 'AWB9876543210'
  courierPartner: string; // e.g. 'BlueDart' / 'Delhivery'
  estimatedDelivery?: string;
}
```

---

### 2.4 PATCH `/orders/admin/:orderId/approve-return` — Approve Return
**Auth required**: ✅ Admin

---

### 2.5 PATCH `/orders/admin/:orderId/refund` — Mark Order Refunded
**Auth required**: ✅ Admin

#### Request Payload
```ts
{ notes?: string }
```

---

## Section 3: Admin Inventory Management APIs (`/inventory`)

### 3.1 GET `/inventory` — View All Stock Levels
**Auth required**: ✅ Admin

---

### 3.2 POST `/inventory/adjust` — Manual Stock Adjustment / Restock
**Auth required**: ✅ Admin

#### Request Payload
```ts
{
  sku: string;
  quantityChange: number; // positive to restock, negative to reduce
  reason: 'PURCHASE_ORDER' | 'DAMAGE' | 'AUDIT_CORRECTION' | 'RETURN_RESTOCK';
  note?: string;
}
```

---

## Section 4: Admin Review Moderation APIs (`/reviews/admin`)

### 4.1 PATCH `/reviews/admin/:id/moderate` — Moderate Customer Review
**Auth required**: ✅ Admin

#### Request Payload
```ts
{
  status: 'APPROVED' | 'REJECTED';
  adminResponse?: string; // Optional official store response to display on review
}
```

---

## Frontend Service Reference (`src/api/admin.ts`)

```ts
import { apiClient } from './client';
import {
  DashboardQuery,
  DashboardSummary,
  RevenueAnalyticsItem,
  OrderStatusBreakdownItem,
  TopProductItem,
  TopCategoryItem,
  TopCustomerItem,
  InventoryAlertsReport,
} from '../types/admin';

export const adminApi = {
  // ─── Dashboard Analytics ─────────────────────────────────
  getSummary: (query?: DashboardQuery): Promise<DashboardSummary> =>
    apiClient.get('/admin/dashboard/summary', { params: query }),

  getRevenueAnalytics: (query?: DashboardQuery): Promise<RevenueAnalyticsItem[]> =>
    apiClient.get('/admin/dashboard/revenue', { params: query }),

  getOrderStatusBreakdown: (query?: DashboardQuery): Promise<OrderStatusBreakdownItem[]> =>
    apiClient.get('/admin/dashboard/orders-breakdown', { params: query }),

  getTopProducts: (query?: DashboardQuery): Promise<TopProductItem[]> =>
    apiClient.get('/admin/dashboard/top-products', { params: query }),

  getTopCategories: (query?: DashboardQuery): Promise<TopCategoryItem[]> =>
    apiClient.get('/admin/dashboard/top-categories', { params: query }),

  getTopCustomers: (query?: DashboardQuery): Promise<TopCustomerItem[]> =>
    apiClient.get('/admin/dashboard/top-customers', { params: query }),

  getInventoryAlerts: (): Promise<InventoryAlertsReport> =>
    apiClient.get('/admin/dashboard/inventory-alerts'),

  clearDashboardCache: (): Promise<{ message: string }> =>
    apiClient.delete('/admin/dashboard/cache'),

  // ─── Order Management ────────────────────────────────────
  getAllOrders: (params?: any) =>
    apiClient.get('/orders/admin', { params }),

  getOrderDetails: (orderId: string) =>
    apiClient.get(`/orders/admin/${orderId}`),

  updateOrderStatus: (orderId: string, status: string, note?: string) =>
    apiClient.patch(`/orders/admin/${orderId}/status`, { status, note }),

  updateTrackingInfo: (orderId: string, payload: { trackingNumber: string; courierPartner: string }) =>
    apiClient.patch(`/orders/admin/${orderId}/tracking`, payload),

  approveReturn: (orderId: string) =>
    apiClient.patch(`/orders/admin/${orderId}/approve-return`),

  markRefunded: (orderId: string, notes?: string) =>
    apiClient.patch(`/orders/admin/${orderId}/refund`, { notes }),

  // ─── Inventory Management ────────────────────────────────
  adjustStock: (payload: { sku: string; quantityChange: number; reason: string; note?: string }) =>
    apiClient.post('/inventory/adjust', payload),

  // ─── Review Moderation ───────────────────────────────────
  moderateReview: (reviewId: string, payload: { status: 'APPROVED' | 'REJECTED'; adminResponse?: string }) =>
    apiClient.patch(`/reviews/admin/${reviewId}/moderate`, payload),
};
```

---

## Quick Endpoint Reference Table

| Category | Method | Route | Description |
|---|---|---|---|
| Dashboard | GET | `/admin/dashboard/summary` | Overall KPI summary (revenue, orders, customers) |
| Dashboard | GET | `/admin/dashboard/revenue` | Sales trend analytics timeline |
| Dashboard | GET | `/admin/dashboard/orders-breakdown` | Orders count and total value per status |
| Dashboard | GET | `/admin/dashboard/top-products` | Top revenue generating products |
| Dashboard | GET | `/admin/dashboard/top-categories` | Top revenue generating categories |
| Dashboard | GET | `/admin/dashboard/top-customers` | Top spending customers |
| Dashboard | GET | `/admin/dashboard/inventory-alerts` | Out-of-stock & low-stock inventory list |
| Dashboard | DELETE | `/admin/dashboard/cache` | Clear Redis metrics cache |
| Orders | GET | `/orders/admin` | List all customer orders |
| Orders | GET | `/orders/admin/:orderId` | View order details |
| Orders | PATCH | `/orders/admin/:orderId/status` | Update order status |
| Orders | PATCH | `/orders/admin/:orderId/tracking` | Set shipment tracking details |
| Orders | PATCH | `/orders/admin/:orderId/approve-return` | Approve customer return request |
| Orders | PATCH | `/orders/admin/:orderId/refund` | Process order refund |
| Inventory | POST | `/inventory/adjust` | Adjust stock / restock SKU |
| Reviews | PATCH | `/reviews/admin/:id/moderate` | Approve/reject review with admin note |
