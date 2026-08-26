import { apiClient } from './client';
import { Brand, QueryBrandParams } from '../types/brand';

/**
 * Safely extract brand list from any response structure
 */
function extractBrandList(res: any): Brand[] {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.brands)) return res.brands;
  if (Array.isArray(res.items)) return res.items;
  if (res.data && Array.isArray(res.data.data)) return res.data.data;
  if (res.data && Array.isArray(res.data.brands)) return res.data.brands;
  if (res.data && Array.isArray(res.data.items)) return res.data.items;
  return [];
}

/**
 * Normalize brand object ensuring _id and id are assigned
 */
function normalizeBrand(b: any): Brand {
  if (!b) return {} as Brand;
  const idVal = b._id || b.id || String(Math.random());
  return {
    ...b,
    _id: idVal,
    id: idVal,
    name: b.name || '',
    slug: b.slug || '',
    description: b.description || '',
    status: b.status !== undefined ? b.status : true,
  };
}

export const brandsApi = {
  /**
   * Get all brands with search, sorting, and pagination
   */
  getBrands: async (params?: QueryBrandParams): Promise<{ data: Brand[]; total: number }> => {
    try {
      const cleanParams = params ? Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== undefined && v !== '')
      ) : {};
      
      const res: any = await apiClient.get('/brands', { params: cleanParams });
      const rawList = extractBrandList(res);
      const data = rawList.map(normalizeBrand);
      const total = res?.total || res?.data?.total || data.length;

      return { data, total };
    } catch (error) {
      console.warn('Failed to fetch brands from API, returning empty result:', error);
      return { data: [], total: 0 };
    }
  },

  /**
   * Get single brand by ID or slug
   */
  getBrandByIdOrSlug: async (idOrSlug: string): Promise<Brand> => {
    const res: any = await apiClient.get(`/brands/${idOrSlug}`);
    const raw = res?.data || res;
    return normalizeBrand(raw);
  },

  /**
   * Create a new brand (Admin only)
   * accepts FormData or JSON payload
   */
  createBrand: async (data: FormData | Partial<Brand>): Promise<Brand> => {
    const isFormData = data instanceof FormData;
    const res: any = await apiClient.post(
      '/brands',
      data,
      isFormData
        ? { headers: { 'Content-Type': 'multipart/form-data' } }
        : undefined
    );
    return normalizeBrand(res?.data || res);
  },

  /**
   * Update an existing brand (Admin only)
   */
  updateBrand: async (id: string, data: FormData | Partial<Brand>): Promise<Brand> => {
    const isFormData = data instanceof FormData;
    const res: any = await apiClient.put(
      `/brands/${id}`,
      data,
      isFormData
        ? { headers: { 'Content-Type': 'multipart/form-data' } }
        : undefined
    );
    return normalizeBrand(res?.data || res);
  },

  /**
   * Soft-delete a brand (Admin only)
   */
  deleteBrand: async (id: string): Promise<void> => {
    await apiClient.delete(`/brands/${id}`);
  },
};

export default brandsApi;
