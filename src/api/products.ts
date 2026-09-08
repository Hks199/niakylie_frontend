import { apiClient } from './client';
import { Product } from '../types';
import { formatImageUrl } from '../utils/imageUtils';

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  categoryId?: string;
  brand?: string;
  brandId?: string;
  minPrice?: number;
  maxPrice?: number;
  color?: string;
  discount?: number;
  rating?: number;
  isFeatured?: boolean;
  isTrending?: boolean;
  isBestSeller?: boolean;
  sort?: 'recommended' | 'price_asc' | 'price_desc' | 'rating' | 'latest';
}

export interface ProductsResponse {
  items: Product[];
  total: number;
  page: number;
  totalPages: number;
}

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
  return [];
}

export function normalizeProduct(p: any): Product {
  if (!p) return {} as Product;
  const targetObj = p.productId && typeof p.productId === 'object' ? p.productId : p;
  const idVal = targetObj._id || targetObj.id || (typeof p === 'string' ? p : String(Math.random()));
  const nameVal = targetObj.name || targetObj.title || 'NiaKylie Fashion Item';
  const slugVal = targetObj.slug || idVal;

  const rawImage = (Array.isArray(targetObj.images) && targetObj.images[0]) || targetObj.thumbnail;
  const imageVal = rawImage
    ? formatImageUrl(rawImage)
    : 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80';

  const allImages = Array.isArray(p.images) && p.images.length > 0
    ? p.images.map((img: string) => formatImageUrl(img))
    : [imageVal];

  const rawVariants = Array.isArray(p.variants) ? p.variants : [];
  const normalizedVariants = rawVariants.map((v: any) => {
    const vId = v._id || v.id || String(Math.random());
    const vOffer = v.offerPrice ?? v.price ?? p.price ?? 2999;
    const vMrp = v.mrp ?? v.originalPrice ?? p.originalPrice ?? vOffer * 1.5;
    const vImages = Array.isArray(v.images) && v.images.length > 0
      ? v.images.map((img: string) => formatImageUrl(img))
      : allImages;

    return {
      ...v,
      id: vId,
      _id: vId,
      sku: v.sku || `NK-${nameVal.slice(0, 3).toUpperCase()}-${(v.color || 'STD').slice(0, 3).toUpperCase()}`,
      color: v.color || 'Standard',
      colorHex: v.colorHex || '#E63946',
      size: v.size || 'Free Size',
      stock: v.stock !== undefined ? Number(v.stock) : 10,
      price: Number(vOffer),
      offerPrice: Number(vOffer),
      mrp: Number(vMrp),
      originalPrice: Number(vMrp),
      discountPercentage: vMrp > vOffer ? Math.round(((vMrp - vOffer) / vMrp) * 100) : 0,
      images: vImages,
      isActive: v.isActive !== false,
    };
  });

  const firstVariant = normalizedVariants[0];
  const offerPrice = firstVariant?.price ?? p.price ?? 2999;
  const mrpPrice = firstVariant?.originalPrice ?? p.originalPrice ?? offerPrice * 1.5;

  return {
    ...p,
    _id: idVal,
    id: idVal,
    title: nameVal,
    name: nameVal,
    slug: slugVal,
    price: Number(offerPrice),
    originalPrice: Number(mrpPrice),
    discountPercentage: mrpPrice > offerPrice ? Math.round(((mrpPrice - offerPrice) / mrpPrice) * 100) : 0,
    thumbnail: imageVal,
    images: allImages,
    variants: normalizedVariants.length > 0 ? normalizedVariants : [
      {
        id: `${idVal}-v1`,
        _id: `${idVal}-v1`,
        sku: `NK-${nameVal.slice(0, 3).toUpperCase()}-RED`,
        color: 'Crimson Red',
        colorHex: '#E63946',
        size: 'Free Size',
        stock: 10,
        price: Number(offerPrice),
        offerPrice: Number(offerPrice),
        mrp: Number(mrpPrice),
        originalPrice: Number(mrpPrice),
        discountPercentage: mrpPrice > offerPrice ? Math.round(((mrpPrice - offerPrice) / mrpPrice) * 100) : 0,
        images: allImages,
        isActive: true,
      },
      {
        id: `${idVal}-v2`,
        _id: `${idVal}-v2`,
        sku: `NK-${nameVal.slice(0, 3).toUpperCase()}-GLD`,
        color: 'Royal Gold',
        colorHex: '#D4AF37',
        size: 'Free Size',
        stock: 5,
        price: Number(offerPrice),
        offerPrice: Number(offerPrice),
        mrp: Number(mrpPrice),
        originalPrice: Number(mrpPrice),
        discountPercentage: mrpPrice > offerPrice ? Math.round(((mrpPrice - offerPrice) / mrpPrice) * 100) : 0,
        images: allImages,
        isActive: true,
      },
    ],
    brand: p.brand || (typeof p.brandId === 'object' && p.brandId?.name) || 'NiaKylie Signature',
    rating: p.averageRating !== undefined ? Number(p.averageRating) : (p.rating !== undefined ? Number(p.rating) : 0),
    reviewCount: p.reviewsCount !== undefined ? Number(p.reviewsCount) : (p.reviewCount !== undefined ? Number(p.reviewCount) : 0),
    averageRating: p.averageRating !== undefined ? Number(p.averageRating) : (p.rating !== undefined ? Number(p.rating) : 0),
    reviewsCount: p.reviewsCount !== undefined ? Number(p.reviewsCount) : (p.reviewCount !== undefined ? Number(p.reviewCount) : 0),
  };
}

export const productsApi = {
  getProducts: async (params?: ProductQueryParams): Promise<ProductsResponse> => {
    try {
      const cleanedParams: Record<string, any> = params ? { ...params } : {};
      if (cleanedParams.category && typeof cleanedParams.category === 'object') {
        cleanedParams.category = cleanedParams.category._id || cleanedParams.category.slug || cleanedParams.category.id;
      }
      if (cleanedParams.categoryId && typeof cleanedParams.categoryId === 'object') {
        cleanedParams.categoryId = cleanedParams.categoryId._id || cleanedParams.categoryId.id;
      }

      const response = await apiClient.get<any>('/products', { params: cleanedParams });
      const rawList = extractProductList(response);
      const normalizedItems = rawList.map(normalizeProduct);

      const finalItems = normalizedItems;

      const total = response?.meta?.total ?? response?.total ?? finalItems.length;
      const page = params?.page || 1;
      const limit = params?.limit || 12;
      const totalPages = Math.ceil(total / limit) || 1;

      return {
        items: finalItems,
        total,
        page,
        totalPages,
      };
    } catch (error) {
      console.warn('GET /products failed:', error);
      return { items: [], total: 0, page: params?.page || 1, totalPages: 0 };
    }
  },

  getProductBySlug: async (slug: string): Promise<Product> => {
    try {
      const res = await apiClient.get<any>(`/products/${slug}`);
      return normalizeProduct(res);
    } catch (error) {
      throw error;
    }
  },

  createProduct: async (productData: any): Promise<Product> => {
    const res = await apiClient.post<any>('/products', productData);
    return normalizeProduct(res);
  },

  updateProduct: async (id: string, productData: any): Promise<Product> => {
    const res = await apiClient.put<any>(`/products/${id}`, productData);
    return normalizeProduct(res);
  },

  deleteProduct: async (id: string): Promise<void> => {
    return apiClient.delete(`/products/${id}`);
  },

  deleteVariant: async (productId: string, variantId: string): Promise<Product> => {
    const res = await apiClient.delete<any>(`/products/${productId}/variants/${variantId}`);
    return normalizeProduct(res);
  },
};
