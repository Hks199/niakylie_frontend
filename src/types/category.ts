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
  ancestors?: CategoryAncestor[];
  description?: string;
  image?: string;      // URL path, e.g. "/uploads/categories/image-123.jpg"
  banner?: string;     // URL path, e.g. "/uploads/categories/banner-123.jpg"
  status: boolean;     // true = active, false = disabled
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  isDeleted?: boolean;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
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
  meta?: {
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
  seoKeywords?: string[];
  image?: File;
  banner?: File;
}

// ── Update Category DTO Payload ───────────────────────────
export interface UpdateCategoryInput extends Partial<CreateCategoryInput> {
  status?: boolean;
}
