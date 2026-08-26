// ── Query Parameters ──────────────────────────────────────
export type AggregationPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface DashboardQuery {
  startDate?: string;
  endDate?: string;
  period?: AggregationPeriod;
  limit?: number;
}

// ── KPI Summary ───────────────────────────────────────────
export interface DashboardSummary {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  totalCustomers: number;
  newCustomers?: number;
  totalProducts?: number;
  inventoryAlerts: {
    outOfStockCount: number;
    lowStockCount: number;
  };
}

// ── Revenue Analytics ──────────────────────────────────────
export interface RevenueAnalyticsItem {
  period: string;
  revenue: number;
  orders: number;
  avgOrderValue?: number;
}

// ── Order Breakdown ───────────────────────────────────────
export interface OrderStatusBreakdownItem {
  status: string;
  count: number;
  totalValue?: number;
}

// ── Top Performing Data ───────────────────────────────────
export interface TopProductItem {
  productId: string;
  productName: string;
  sku: string;
  image?: string;
  totalQuantitySold: number;
  totalRevenue: number;
  orderCount?: number;
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
  lastOrderDate?: string;
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
  status?: 'OUT_OF_STOCK' | 'LOW_STOCK';
}

export interface InventoryAlertsReport {
  outOfStockCount: number;
  lowStockCount: number;
  outOfStockItems: InventoryAlertItem[];
  lowStockItems: InventoryAlertItem[];
}

// ── Action Payloads ───────────────────────────────────────
export interface AdjustStockPayload {
  sku: string;
  quantityChange: number;
  reason: 'PURCHASE_ORDER' | 'DAMAGE' | 'AUDIT_CORRECTION' | 'RETURN_RESTOCK';
  note?: string;
}

export interface ModerateReviewPayload {
  status: 'APPROVED' | 'REJECTED';
  adminResponse?: string;
}

export interface UpdateOrderStatusPayload {
  status: 'PENDING' | 'CONFIRMED' | 'PACKED' | 'SHIPPED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED' | 'RETURN_REQUESTED' | 'RETURNED' | 'REFUNDED';
  note?: string;
}

export interface UpdateTrackingPayload {
  trackingNumber: string;
  courierPartner: string;
  estimatedDelivery?: string;
}

// ── Admin Order (full view) ───────────────────────────────
export interface AdminOrder {
  _id: string;
  id?: string;
  orderId: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  items: {
    product: { _id: string; title: string; images: string[] };
    quantity: number;
    price: number;
    sku: string;
  }[];
  totalAmount: number;
  discountAmount?: number;
  status: string;
  paymentStatus: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  trackingNumber?: string;
  courierPartner?: string;
  estimatedDelivery?: string;
  createdAt: string;
  updatedAt: string;
}

// ── Admin Review (moderation view) ───────────────────────
export interface AdminReview {
  _id: string;
  id?: string;
  product: { _id: string; title: string; images: string[] };
  user: { _id: string; firstName: string; lastName: string; email: string };
  rating: number;
  comment: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminResponse?: string;
  createdAt: string;
}

// ── Category Payload ──────────────────────────────────────
export interface CategoryPayload {
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  parentCategory?: string;
  isActive?: boolean;
}

// ── Product Payload (admin create/update — matches backend CreateProductDto) ───
export interface AdminProductVariant {
  sku?: string;
  barcode?: string;
  color: string;
  colorHex?: string;
  size: string;
  stock?: number;
  mrp: number;
  offerPrice: number;
  isActive?: boolean;
}

export interface AdminProductPayload {
  name: string;               // Required — maps to backend `name` field
  categoryId: string;         // Required — must be a valid MongoDB ObjectId or slug
  brandId?: string;
  description?: string;
  shortDescription?: string;
  variants?: AdminProductVariant[]; // Variant-based pricing
  material?: string;
  pattern?: string;
  season?: string;
  productCollection?: string;
  tags?: string[];
  tax?: number;
  isFeatured?: boolean;
  isTrending?: boolean;
  isBestSeller?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
}

// ── Banner Payload ────────────────────────────────────────
export interface BannerPayload {
  title: string;
  subtitle?: string;
  image: string;
  link?: string;
  position?: number;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
}
