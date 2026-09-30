import { apiClient } from './client';
import {
  AdminProduct,
  AdminProductQueryParams,
  PaginatedAdminProductsResponse,
} from '../types/adminProduct';

/**
 * Extract product array dynamically from any backend response shape
 */
function extractProductList(res: any): any[] {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.items)) return res.items;
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.products)) return res.products;
  if (Array.isArray(res.docs)) return res.docs;
  if (res.data && Array.isArray(res.data.items)) return res.data.items;
  if (res.data && Array.isArray(res.data.data)) return res.data.data;
  if (res.data && Array.isArray(res.data.products)) return res.data.products;
  if (res.data && Array.isArray(res.data.docs)) return res.data.docs;
  if (typeof res === 'object' && (res._id || res.name || res.title)) return [res];
  return [];
}

export const adminProductsApi = {
  /**
   * Fetch live dynamic products for Admin Table from GET /products
   */
  getAdminProducts: async (params?: AdminProductQueryParams): Promise<PaginatedAdminProductsResponse> => {
    try {
      const cleanParams: Record<string, any> = {};
      if (params?.page) cleanParams.page = params.page;
      if (params?.limit) cleanParams.limit = params.limit;
      if (params?.search && params.search.trim()) cleanParams.search = params.search.trim();
      if (params?.categoryId) cleanParams.categoryId = params.categoryId;
      if (params?.brandId) cleanParams.brandId = params.brandId;
      if (params?.status !== undefined) cleanParams.status = params.status;
      if (params?.isFeatured !== undefined) cleanParams.isFeatured = params.isFeatured;
      if (params?.sortBy) cleanParams.sortBy = params.sortBy;
      if (params?.sortOrder) cleanParams.sortOrder = params.sortOrder;

      const response = await apiClient.get<any>('/products', { params: cleanParams });
      let dataList = extractProductList(response);

      const total =
        (response && typeof response === 'object' && (response.total || response.count || response.meta?.total)) ||
        dataList.length;
      const page = params?.page || 1;
      const limit = params?.limit || 10;
      const totalPages = Math.ceil(total / limit) || 1;

      return {
        data: dataList,
        meta: {
          total,
          page,
          limit,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      };
    } catch (error) {
      console.error('GET /products failed:', error);
      return {
        data: [],
        meta: { total: 0, page: 1, limit: 10, totalPages: 0, hasNextPage: false, hasPrevPage: false },
      };
    }
  },

  /**
   * Fetch single product details by Mongo ID or Slug (GET /products/:idOrSlug)
   */
  getProductDetails: async (idOrSlug: string): Promise<AdminProduct> => {
    const res = await apiClient.get<any>(`/products/${idOrSlug}`);
    if (res && (res.data || res.product)) {
      return res.data || res.product;
    }
    return res;
  },

  /**
   * Fetch live inventory alerts (GET /admin/dashboard/inventory-alerts)
   */
  getInventoryAlerts: async (): Promise<{ outOfStock: any[]; lowStock: any[] }> => {
    try {
      const res = await apiClient.get<any>('/admin/dashboard/inventory-alerts');
      return {
        outOfStock: Array.isArray(res?.outOfStock) ? res.outOfStock : [],
        lowStock: Array.isArray(res?.lowStock) ? res.lowStock : [],
      };
    } catch (error) {
      console.warn('GET /admin/dashboard/inventory-alerts failed:', error);
      return { outOfStock: [], lowStock: [] };
    }
  },
};
