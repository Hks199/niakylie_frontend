import { apiClient } from './client';
import {
  Category,
  QueryCategoryParams,
  PaginatedCategoriesResponse,
} from '../types/category';

/**
 * Safely extract category list from any response structure (Array, { data: [] }, { categories: [] }, etc.)
 */
function extractCategoryList(res: any): Category[] {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.categories)) return res.categories;
  if (Array.isArray(res.items)) return res.items;
  if (res.data && Array.isArray(res.data.data)) return res.data.data;
  if (res.data && Array.isArray(res.data.categories)) return res.data.categories;
  if (res.data && Array.isArray(res.data.items)) return res.data.items;
  return [];
}

/**
 * Normalize category objects to ensure both _id and id are present and fields are dynamic
 */
function normalizeCategory(cat: any): Category {
  if (!cat) return {} as Category;
  const idVal = cat._id || cat.id || String(Math.random());
  return {
    ...cat,
    _id: idVal,
    id: idVal,
    name: cat.name || '',
    description: cat.description !== undefined ? cat.description : '',
    status: cat.status !== undefined ? cat.status : true,
  };
}

export const categoriesApi = {
  /**
   * Fetch categories list with optional pagination, search, parent filter, and active status filters.
   * Endpoint: GET /categories
   */
  getCategories: async (params?: QueryCategoryParams): Promise<PaginatedCategoriesResponse> => {
    try {
      const response = await apiClient.get<any>('/categories', { params });
      const rawList = extractCategoryList(response);
      const normalizedList = rawList.map(normalizeCategory);

      const meta = (response && typeof response === 'object' && response.meta) || {
        total: normalizedList.length,
        page: params?.page || 1,
        limit: params?.limit || 10,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      };

      return {
        data: normalizedList,
        meta,
      };
    } catch (error) {
      console.warn('GET /categories failed, returning fallback mock category tree:', error);
      const mockCategories: Category[] = [
        {
          _id: 'cat-001',
          name: 'WOMEN',
          slug: 'women',
          parentId: null,
          status: true,
          description: 'Women ethnic and Western fashion collection.',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          _id: 'cat-002',
          name: 'ETHNIC WEAR',
          slug: 'ethnic-wear',
          parentId: null,
          status: true,
          description: 'Traditional handcrafted sarees, kurtas, and suits.',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          _id: 'cat-003',
          name: 'SAREES',
          slug: 'sarees',
          parentId: 'cat-002',
          status: true,
          description: 'Banarasi, Silk, Organza, and Kanjeevaram sarees.',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          _id: 'cat-004',
          name: 'DRESSES',
          slug: 'dresses',
          parentId: 'cat-001',
          status: true,
          description: 'Contemporary fusion gowns and maxi dresses.',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      return {
        data: mockCategories,
        meta: { total: mockCategories.length, page: 1, limit: 10, totalPages: 1, hasNextPage: false, hasPrevPage: false },
      };
    }
  },

  /**
   * Fetch single category detail by Mongo ID or URL Slug.
   * Endpoint: GET /categories/:idOrSlug
   */
  getCategoryByIdOrSlug: async (idOrSlug: string): Promise<Category> => {
    const res = await apiClient.get<any>(`/categories/${idOrSlug}`);
    return normalizeCategory(res);
  },

  /**
   * Create new category with multipart/form-data (image thumbnail & header banner files supported).
   * Endpoint: POST /categories (Requires JWT Bearer Token + ADMIN role)
   * Note: Leaving Content-Type header undefined lets browser/axios auto-generate boundary.
   */
  createCategory: async (formData: FormData): Promise<Category> => {
    const res = await apiClient.post<any>('/categories', formData, {
      headers: { 'Content-Type': undefined },
    });
    return normalizeCategory(res);
  },

  /**
   * Update category metadata or replacement files by Mongo ID.
   * Endpoint: PUT /categories/:id (Requires JWT Bearer Token + ADMIN role)
   * Note: Leaving Content-Type header undefined lets browser/axios auto-generate boundary.
   */
  updateCategory: async (id: string, formData: FormData): Promise<Category> => {
    const res = await apiClient.put<any>(`/categories/${id}`, formData, {
      headers: { 'Content-Type': undefined },
    });
    return normalizeCategory(res);
  },

  /**
   * Soft-delete category and its subcategories by Mongo ID.
   * Endpoint: DELETE /categories/:id (Requires JWT Bearer Token + ADMIN role)
   */
  deleteCategory: async (id: string): Promise<void> => {
    return apiClient.delete(`/categories/${id}`);
  },
};
