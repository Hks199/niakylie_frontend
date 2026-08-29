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
 * Normalize category objects to ensure both _id and id are present and fields are dynamic,
 * including unwrapping response envelopes ({ success: true, data: { ... } }) and recognizing
 * deletedAt timestamps as soft-deleted.
 */
function normalizeCategory(cat: any): Category {
  if (!cat) return {} as Category;
  const target = (cat.data && (cat.data._id || cat.data.id || cat.data.name)) ? cat.data : cat;
  const idVal = target._id || target.id || String(Math.random());
  const isSoftDeleted = target.isDeleted === true || (Boolean(target.deletedAt) && target.deletedAt !== null);

  return {
    ...target,
    _id: idVal,
    id: idVal,
    name: target.name || '',
    slug: target.slug || '',
    description: target.description !== undefined ? target.description : '',
    status: target.status !== undefined ? target.status : true,
    isDeleted: isSoftDeleted,
    deletedAt: target.deletedAt || null,
    parentId: target.parentId !== undefined ? target.parentId : null,
  };
}

export interface CreateCategoryPayload {
  name: string;
  slug?: string;
  parentId?: string | null;
  description?: string;
  displayOrder?: number;
  status?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string | string[];
  imageFile?: File | null;
  bannerFile?: File | null;
  image?: File | null;
  banner?: File | null;
}

export const categoriesApi = {
  /**
   * Fetch categories list directly from live API endpoint GET /categories
   * Fallback to GET /categories/tree if /categories returns stale empty array
   */
  getCategories: async (params?: QueryCategoryParams): Promise<PaginatedCategoriesResponse> => {
    try {
      const response = await apiClient.get<any>('/categories', {
        params: { limit: 500, ...params },
      });
      let rawList = extractCategoryList(response);

      // If /categories returns empty list (e.g. backend cache lock), fallback to /categories/tree
      if (rawList.length === 0) {
        try {
          const treeRes = await apiClient.get<any>('/categories/tree');
          const treeList = extractCategoryList(treeRes);
          if (treeList.length > 0) {
            const flattened: any[] = [];
            treeList.forEach((root: any) => {
              flattened.push(root);
              if (Array.isArray(root.subCategories)) {
                root.subCategories.forEach((sub: any) => flattened.push(sub));
              }
            });
            rawList = flattened;
          }
        } catch (treeErr) {
          console.warn('Fallback GET /categories/tree error:', treeErr);
        }
      }

      const normalizedList = rawList
        .map(normalizeCategory)
        .filter((cat) => cat && cat._id && !cat.isDeleted);

      const meta = (response && typeof response === 'object' && response.meta) ||
                   (response && response.data && response.data.meta) || {
        total: normalizedList.length,
        page: params?.page || 1,
        limit: params?.limit || 500,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      };

      return {
        data: normalizedList,
        meta,
      };
    } catch (error) {
      console.warn('GET /categories API error:', error);
      // Fallback directly to GET /categories/tree
      try {
        const treeRes = await apiClient.get<any>('/categories/tree');
        const treeList = extractCategoryList(treeRes);
        const flattened: any[] = [];
        treeList.forEach((root: any) => {
          flattened.push(root);
          if (Array.isArray(root.subCategories)) {
            root.subCategories.forEach((sub: any) => flattened.push(sub));
          }
        });
        const normalizedList = flattened
          .map(normalizeCategory)
          .filter((cat) => cat && cat._id && !cat.isDeleted);
        return {
          data: normalizedList,
          meta: { total: normalizedList.length, page: 1, limit: 500, totalPages: 1, hasNextPage: false, hasPrevPage: false },
        };
      } catch {
        return {
          data: [],
          meta: { total: 0, page: 1, limit: 500, totalPages: 0, hasNextPage: false, hasPrevPage: false },
        };
      }
    }
  },

  /**
   * Fetch 2-level category hierarchy tree array directly from GET /categories/tree
   */
  getCategoryTree: async (): Promise<Category[]> => {
    try {
      const response = await apiClient.get<any>('/categories/tree');
      const rawList = extractCategoryList(response);
      return rawList.map(normalizeCategory).filter((cat) => cat && cat._id && !cat.isDeleted);
    } catch (error) {
      console.warn('GET /categories/tree API error:', error);
      const res = await categoriesApi.getCategories({ limit: 500 });
      return res.data;
    }
  },

  /**
   * Fetch single category detail by Mongo ID or URL Slug from GET /categories/:idOrSlug
   */
  getCategoryByIdOrSlug: async (idOrSlug: string): Promise<Category> => {
    const res = await apiClient.get<any>(`/categories/${idOrSlug}`);
    return normalizeCategory(res);
  },

  /**
   * Create new category with multipart/form-data via POST /categories
   */
  createCategory: async (payload: CreateCategoryPayload | FormData): Promise<Category> => {
    let formData: FormData;
    if (payload instanceof FormData) {
      formData = payload;
    } else {
      formData = new FormData();
      formData.append('name', payload.name);
      if (payload.slug) formData.append('slug', payload.slug);
      if (payload.parentId) formData.append('parentId', payload.parentId);
      if (payload.description) formData.append('description', payload.description);
      if (payload.displayOrder !== undefined) formData.append('displayOrder', String(payload.displayOrder));
      if (payload.status !== undefined) formData.append('status', String(payload.status));
      if (payload.seoTitle) formData.append('seoTitle', payload.seoTitle);
      if (payload.seoDescription) formData.append('seoDescription', payload.seoDescription);
      if (payload.seoKeywords) {
        const keywordsStr = Array.isArray(payload.seoKeywords)
          ? payload.seoKeywords.join(', ')
          : payload.seoKeywords;
        formData.append('seoKeywords', keywordsStr);
      }
      const img = payload.imageFile || payload.image;
      if (img) formData.append('image', img);
      const bnr = payload.bannerFile || payload.banner;
      if (bnr) formData.append('banner', bnr);
    }

    const res = await apiClient.post<any>('/categories', formData, {
      headers: { 'Content-Type': undefined },
    });
    return normalizeCategory(res);
  },

  /**
   * Update category metadata or replacement files by Mongo ID via PUT /categories/:id
   */
  updateCategory: async (id: string, formData: FormData): Promise<Category> => {
    const res = await apiClient.put<any>(`/categories/${id}`, formData, {
      headers: { 'Content-Type': undefined },
    });
    return normalizeCategory(res);
  },

  /**
   * Soft-delete category and its subcategories by Mongo ID via DELETE /categories/:id
   */
  deleteCategory: async (id: string): Promise<void> => {
    return apiClient.delete(`/categories/${id}`);
  },

  /**
   * Toggle category active/inactive status by Mongo ID via PATCH /categories/:id/toggle-active
   */
  toggleActive: async (id: string): Promise<Category> => {
    const res = await apiClient.patch<any>(`/categories/${id}/toggle-active`);
    return normalizeCategory(res);
  },
};
