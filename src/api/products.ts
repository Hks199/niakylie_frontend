import { apiClient } from './client';
import { Product } from '../types';

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

const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    _id: 'p1',
    title: 'Crimson Red Banarasi Silk Saree',
    name: 'Crimson Red Banarasi Silk Saree',
    slug: 'crimson-red-banarasi-silk-saree',
    brand: 'NiaKylie Signature',
    price: 2999,
    originalPrice: 5999,
    discountPercentage: 50,
    rating: 4.8,
    reviewCount: 142,
    thumbnail: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
    categoryId: 'sarees',
    variants: [
      { id: 'v1-s', sku: 'BS-RED-S', size: 'Free Size', color: 'Red', price: 2999, stock: 10 },
    ],
    isFeatured: true,
    isTrending: true,
    createdAt: '2026-08-01',
  },
  {
    id: 'p2',
    _id: 'p2',
    title: 'Royal Mustard Anarkali Suit Set',
    name: 'Royal Mustard Anarkali Suit Set',
    slug: 'royal-mustard-anarkali-suit-set',
    brand: 'Biba',
    price: 2499,
    originalPrice: 4999,
    discountPercentage: 50,
    rating: 4.6,
    reviewCount: 98,
    thumbnail: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=80',
    categoryId: 'kurta-sets',
    variants: [
      { id: 'v2-m', sku: 'ANR-MST-M', size: 'M', color: 'Gold', price: 2499, stock: 5 },
    ],
    isFeatured: true,
    isTrending: false,
    createdAt: '2026-08-02',
  },
  {
    id: 'p3',
    _id: 'p3',
    title: 'Emerald Velvet Bridal Lehenga',
    name: 'Emerald Velvet Bridal Lehenga',
    slug: 'emerald-velvet-bridal-lehenga',
    brand: 'NiaKylie Signature',
    price: 8999,
    originalPrice: 17999,
    discountPercentage: 50,
    rating: 4.9,
    reviewCount: 215,
    thumbnail: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80',
    categoryId: 'lehengas',
    variants: [
      { id: 'v3-m', sku: 'LHG-EMR-M', size: 'M', color: 'Green', price: 8999, stock: 3 },
    ],
    isFeatured: true,
    isTrending: true,
    createdAt: '2026-08-05',
  },
  {
    id: 'p4',
    _id: 'p4',
    title: 'Pastel Floral Organza Saree',
    name: 'Pastel Floral Organza Saree',
    slug: 'pastel-floral-organza-saree',
    brand: 'Ritu Kumar',
    price: 3499,
    originalPrice: 6999,
    discountPercentage: 50,
    rating: 4.7,
    reviewCount: 76,
    thumbnail: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
    categoryId: 'sarees',
    variants: [
      { id: 'v4-fs', sku: 'ORG-PST-FS', size: 'Free Size', color: 'Pink', price: 3499, stock: 8 },
    ],
    isFeatured: false,
    isTrending: true,
    createdAt: '2026-08-04',
  },
];

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
    ? rawImage.startsWith('http')
      ? rawImage
      : `http://localhost:3000${rawImage}`
    : 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80';

  const allImages = Array.isArray(p.images) && p.images.length > 0
    ? p.images.map((img: string) => (img.startsWith('http') ? img : `http://localhost:3000${img}`))
    : [imageVal];

  const rawVariants = Array.isArray(p.variants) ? p.variants : [];
  const normalizedVariants = rawVariants.map((v: any) => {
    const vId = v._id || v.id || String(Math.random());
    const vOffer = v.offerPrice ?? v.price ?? p.price ?? 2999;
    const vMrp = v.mrp ?? v.originalPrice ?? p.originalPrice ?? vOffer * 1.5;
    const vImages = Array.isArray(v.images) && v.images.length > 0
      ? v.images.map((img: string) => (img.startsWith('http') ? img : `http://localhost:3000${img}`))
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

      const hasFilterParams = Boolean(
        params?.search ||
        params?.category ||
        params?.categoryId ||
        params?.brand ||
        params?.brandId ||
        params?.minPrice ||
        params?.maxPrice ||
        params?.color ||
        params?.discount ||
        params?.rating ||
        params?.isFeatured ||
        params?.isTrending ||
        params?.isBestSeller
      );

      const finalItems = normalizedItems.length > 0
        ? normalizedItems
        : (hasFilterParams ? [] : MOCK_PRODUCTS);

      const total = response?.meta?.total ?? response?.total ?? (normalizedItems.length > 0 ? normalizedItems.length : finalItems.length);
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
      console.warn('GET /products failed, returning fallback mock products:', error);
      return {
        items: MOCK_PRODUCTS,
        total: MOCK_PRODUCTS.length,
        page: 1,
        totalPages: 1,
      };
    }
  },

  getProductBySlug: async (slug: string): Promise<Product> => {
    try {
      const res = await apiClient.get<any>(`/products/${slug}`);
      return normalizeProduct(res);
    } catch (error) {
      const found = MOCK_PRODUCTS.find((p) => p.slug === slug || p.id === slug || p._id === slug);
      return found || MOCK_PRODUCTS[0];
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
