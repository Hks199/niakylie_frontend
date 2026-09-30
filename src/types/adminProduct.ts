// ── Variant Item ──────────────────────────────────────────
export interface AdminProductVariant {
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
  isActive?: boolean;
}

// Alias for convenience
export type ProductVariant = AdminProductVariant;

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
  id?: string;
  name: string;
  title?: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  categoryId: string | ProductCategoryRef;
  categoryIds?: (string | ProductCategoryRef)[];
  categories?: ProductCategoryRef[];
  brandId?: string | ProductBrandRef;
  variants: AdminProductVariant[];
  images: string[];
  thumbnail?: string;
  material?: string;
  pattern?: string;
  season?: string;
  productCollection?: string;
  tags: string[];
  tax: number;
  isFeatured: boolean;
  isTrending: boolean;
  isBestSeller?: boolean;
  status: boolean;        // true = Active, false = Disabled
  reviewsCount?: number;
  averageRating?: number;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  isDeleted?: boolean;
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
