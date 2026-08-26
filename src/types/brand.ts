export interface Brand {
  _id: string;
  id?: string;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  status?: boolean;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface QueryBrandParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedBrandsResponse {
  data: Brand[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
