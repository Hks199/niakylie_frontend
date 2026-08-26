import { apiClient } from './client';
import {
  Banner,
  BannerType,
  BannerPosition,
  QueryBannerParams,
  ReorderBannerItem,
} from '../types/banner';

/**
 * Safely extract banner array from various backend response shapes
 */
function extractBannerList(res: any): Banner[] {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.banners)) return res.banners;
  if (Array.isArray(res.items)) return res.items;
  if (res.data && Array.isArray(res.data.data)) return res.data.data;
  if (res.data && Array.isArray(res.data.banners)) return res.data.banners;
  return [];
}

/**
 * Normalize single banner object to guarantee required properties
 */
function normalizeBanner(b: any): Banner {
  if (!b) return {} as Banner;
  const idVal = b._id || b.id || String(Math.random());
  return {
    ...b,
    _id: idVal,
    title: b.title || 'Promotional Banner',
    subtitle: b.subtitle || '',
    type: b.type || BannerType.HOMEPAGE,
    position: b.position || BannerPosition.TOP,
    imageUrl: b.imageUrl || b.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1400&q=80',
    mobileImageUrl: b.mobileImageUrl || b.mobileImage || '',
    linkUrl: b.linkUrl || '/collections',
    linkLabel: b.linkLabel || 'Shop Collection',
    displayOrder: typeof b.displayOrder === 'number' ? b.displayOrder : 0,
    isActive: b.isActive !== undefined ? b.isActive : true,
    isDeleted: b.isDeleted || false,
    createdAt: b.createdAt || new Date().toISOString(),
    updatedAt: b.updatedAt || new Date().toISOString(),
  };
}

export const bannersApi = {
  /**
   * Fetch active public banners filtered by type.
   * Endpoint: GET /banners
   */
  getActiveBanners: async (params?: QueryBannerParams): Promise<Banner[]> => {
    try {
      const response = await apiClient.get<any>('/banners', { params });
      const rawList = extractBannerList(response);
      return rawList.map(normalizeBanner);
    } catch (error) {
      console.warn('GET /banners failed, using fallback mock banners:', error);
      const mockBanners: Banner[] = [
        {
          _id: 'banner-01',
          title: 'Royal Banarasi Festive Edit',
          subtitle: 'Unveil Handcrafted Silk Sarees with Pure Zari Drapery',
          type: BannerType.HOMEPAGE,
          position: BannerPosition.TOP,
          imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1600&q=80',
          mobileImageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
          linkUrl: '/category/sarees',
          linkLabel: 'Explore Royal Saree Edit',
          displayOrder: 1,
          isActive: true,
          isDeleted: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          _id: 'banner-02',
          title: 'Bridal Lehengas & Couture',
          subtitle: 'Flat 30% Off on Signature Wedding Trousseau Specials',
          type: BannerType.HOMEPAGE,
          position: BannerPosition.TOP,
          imageUrl: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1600&q=80',
          mobileImageUrl: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
          linkUrl: '/category/lehengas',
          linkLabel: 'Shop Bridal Edit',
          displayOrder: 2,
          isActive: true,
          isDeleted: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      return mockBanners;
    }
  },

  /**
   * Fetch banner by ID.
   * Endpoint: GET /banners/:id
   */
  getBannerById: async (id: string): Promise<Banner> => {
    const res = await apiClient.get<any>(`/banners/${id}`);
    return normalizeBanner(res);
  },

  /**
   * Admin: Get all banners (active + inactive).
   * Endpoint: GET /banners/admin/all
   */
  getAllBanners: async (params?: QueryBannerParams): Promise<Banner[]> => {
    try {
      const response = await apiClient.get<any>('/banners/admin/all', { params });
      const rawList = extractBannerList(response);
      return rawList.map(normalizeBanner);
    } catch (error) {
      console.warn('GET /banners/admin/all failed, returning public active banners fallback:', error);
      return bannersApi.getActiveBanners(params);
    }
  },

  /**
   * Admin: Create banner with desktop & mobile file upload support.
   * Endpoint: POST /banners/admin (Requires JWT Bearer Token + ADMIN role)
   */
  createBanner: async (formData: FormData): Promise<Banner> => {
    const res = await apiClient.post<any>('/banners/admin', formData, {
      headers: { 'Content-Type': undefined },
    });
    return normalizeBanner(res);
  },

  /**
   * Admin: Update banner details or image files by ID.
   * Endpoint: PUT /banners/admin/:id (Requires JWT Bearer Token + ADMIN role)
   */
  updateBanner: async (id: string, formData: FormData): Promise<Banner> => {
    const res = await apiClient.put<any>(`/banners/admin/${id}`, formData, {
      headers: { 'Content-Type': undefined },
    });
    return normalizeBanner(res);
  },

  /**
   * Admin: Toggle banner active/inactive status.
   * Endpoint: PATCH /banners/admin/:id/toggle-active
   */
  toggleActive: async (id: string): Promise<Banner> => {
    const res = await apiClient.patch<any>(`/banners/admin/${id}/toggle-active`);
    return normalizeBanner(res);
  },

  /**
   * Admin: Batch reorder banner list display orders.
   * Endpoint: PATCH /banners/admin/reorder
   */
  reorderBanners: async (items: ReorderBannerItem[]): Promise<void> => {
    return apiClient.patch('/banners/admin/reorder', items);
  },

  /**
   * Admin: Soft-delete banner by ID.
   * Endpoint: DELETE /banners/admin/:id
   */
  deleteBanner: async (id: string): Promise<void> => {
    return apiClient.delete(`/banners/admin/${id}`);
  },
};
