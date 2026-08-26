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

/**
 * Safely extract product list array from any response payload shape
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
  return [];
}

/**
 * Normalize product object to ensure title, price, thumbnail, _id, id, and variants exist
 */
function normalizeProduct(p: any): Product {
  if (!p) return {} as Product;
  const idVal = p._id || p.id || String(Math.random());
  const nameVal = p.name || p.title || 'NiaKylie Fashion Item';
  const slugVal = p.slug || idVal;

  const firstVariant = Array.isArray(p.variants) && p.variants.length > 0 ? p.variants[0] : null;
  const offerPrice = firstVariant?.offerPrice ?? p.discountPrice ?? p.price ?? 1999;
  const mrpPrice = firstVariant?.mrp ?? p.basePrice ?? p.originalPrice ?? offerPrice * 1.5;
  const rawImage = (Array.isArray(p.images) && p.images[0]) || p.thumbnail;
  const imageVal = rawImage
    ? rawImage.startsWith('http')
      ? rawImage
      : `http://localhost:3000${rawImage}`
    : 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80';

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
    images: Array.isArray(p.images) && p.images.length > 0 ? p.images : [imageVal],
    brand: p.brand || (typeof p.brandId === 'object' && p.brandId?.name) || 'NiaKylie Signature',
    rating: p.rating || 4.5,
    reviewCount: p.reviewCount || 12,
  };
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
];

export const productsApi = {
  /**
   * Fetch product catalog with multi-facet filters & pagination
   */
  getProducts: async (params?: ProductQueryParams): Promise<ProductsResponse> => {
    try {
      const response = await apiClient.get<any>('/products', { params });
      const rawList = extractProductList(response);
      const normalizedItems = rawList.map(normalizeProduct);

      const total =
        (response && typeof response === 'object' && (response.total || response.count || response.meta?.total)) ||
        normalizedItems.length;
      const page = params?.page || 1;
      const limit = params?.limit || 12;
      const totalPages = Math.ceil(total / limit) || 1;

      return {
        items: normalizedItems,
        total,
        page,
        totalPages,
      };
    } catch (error) {
      console.warn('GET /products failed, returning fallback mock products:', error);
      let filtered = [...MOCK_PRODUCTS];

      if (params?.search) {
        const q = params.search.toLowerCase();
        filtered = filtered.filter(
          (p) => p.title.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q)
        );
      }

      if (params?.category || params?.categoryId) {
        const cat = (params.category || params.categoryId || '').toLowerCase();
        filtered = filtered.filter(
          (p) => p.categoryId?.toLowerCase() === cat || p.slug.toLowerCase().includes(cat)
        );
      }

      const page = params?.page || 1;
      const limit = params?.limit || 12;
      const startIndex = (page - 1) * limit;
      const paginatedItems = filtered.slice(startIndex, startIndex + limit);
      const totalPages = Math.ceil(filtered.length / limit) || 1;

      return {
        items: paginatedItems,
        total: filtered.length,
        page,
        totalPages,
      };
    }
  },

  /**
   * Fetch single product details by slug or ID
   */
  getProductBySlug: async (slug: string): Promise<Product> => {
    try {
      const res = await apiClient.get<any>(`/products/${slug}`);
      return normalizeProduct(res);
    } catch (error) {
      console.warn(`GET /products/${slug} failed, returning fallback:`, error);
      const found = MOCK_PRODUCTS.find((p) => p.slug === slug || p.id === slug || p._id === slug);
      return found || MOCK_PRODUCTS[0];
    }
  },

  /**
   * Create product metadata (Admin only)
   * Endpoint: POST /products
   */
  createProduct: async (productData: any): Promise<Product> => {
    const res = await apiClient.post<any>('/products', productData);
    return normalizeProduct(res);
  },

  /**
   * Update product metadata by ID (Admin only)
   * Endpoint: PUT /products/:id
   */
  updateProduct: async (id: string, productData: any): Promise<Product> => {
    const res = await apiClient.put<any>(`/products/${id}`, productData);
    return normalizeProduct(res);
  },

  /**
   * Soft delete product by ID (Admin only)
   * Endpoint: DELETE /products/:id
   */
  deleteProduct: async (id: string): Promise<void> => {
    return apiClient.delete(`/products/${id}`);
  },

  /**
   * Delete specific product variant (Admin only)
   * Endpoint: DELETE /products/:id/variants/:variantId
   */
  deleteVariant: async (productId: string, variantId: string): Promise<Product> => {
    const res = await apiClient.delete<any>(`/products/${productId}/variants/${variantId}`);
    return normalizeProduct(res);
  },
};

