import { create } from 'zustand';
import { Cart, CartItem, CartTotals, AddToCartPayload } from '../types';
import { apiClient } from '../api/client';
import { useWishlistStore } from './useWishlistStore';
import { formatImageUrl } from '../utils/imageUtils';

const initialTotals: CartTotals = {
  subtotal: 0,
  discount: 0,
  couponDiscount: 0,
  shippingFee: 0,
  tax: 0,
  total: 0,
};

interface CartState {
  cart: Cart | null;
  cartItems: CartItem[];
  itemCount: number;
  cartTotals: CartTotals;
  appliedCoupon: string | null;
  isLoading: boolean;
  isCartOpen: boolean;

  setIsCartOpen: (open: boolean) => void;
  fetchCart: () => Promise<void>;
  addToCart: (payload: AddToCartPayload) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: () => Promise<void>;
  moveToWishlist: (itemId: string, productId: string) => Promise<void>;
  clearCart: () => void;
  mergeGuestCart: () => Promise<void>;
}

const normalizeCartResponse = (rawCart: any) => {
  if (!rawCart) {
    return {
      cart: null,
      cartItems: [],
      itemCount: 0,
      cartTotals: initialTotals,
      appliedCoupon: null,
    };
  }

  const rawItems = Array.isArray(rawCart.items) ? rawCart.items : [];

  const cartItems = rawItems.map((item: any) => {
    const pObj = typeof item.productId === 'object' && item.productId !== null ? item.productId : {};
    const price = Number(item.unitPrice ?? item.price ?? pObj.offerPrice ?? pObj.price ?? 2250);
    const originalPrice = Number(item.unitMrp ?? item.originalPrice ?? item.mrp ?? pObj.mrp ?? Math.round(price * 1.33));
    const skuVal = item.sku || item._id || item.id || (pObj._id ? `SKU-${pObj._id}` : `SKU-${Math.random()}`);

    const rawImg = item.image || pObj.thumbnail || (Array.isArray(pObj.images) ? pObj.images[0] : '') || '';
    const image = rawImg
      ? formatImageUrl(rawImg)
      : 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=300&q=80';

    const pTitle = item.name || item.title || pObj.name || pObj.title || 'Fashion Garment';
    const pBrand = typeof pObj.brand === 'object' && pObj.brand !== null
      ? pObj.brand.name
      : (pObj.brand || item.brand || 'NiaKylie Signature');

    return {
      id: skuVal,
      _id: skuVal,
      sku: skuVal,
      productId: item.productId,
      variantId: item.variantId,
      quantity: Number(item.quantity || 1),
      price,
      unitPrice: price,
      originalPrice,
      unitMrp: originalPrice,
      discount: originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0,
      color: item.color || 'Standard',
      size: item.size || 'Free Size',
      image,
      product: {
        id: typeof item.productId === 'string' ? item.productId : pObj._id || pObj.id || '',
        _id: typeof item.productId === 'string' ? item.productId : pObj._id || pObj.id || '',
        title: pTitle,
        name: pTitle,
        brand: pBrand,
        thumbnail: image,
        price,
        originalPrice,
      },
      variant: {
        id: typeof item.variantId === 'string' ? item.variantId : item.variantId?._id || item.variantId?.id || skuVal,
        color: item.color || 'Standard',
        size: item.size || 'Free Size',
        sku: skuVal,
        price,
        originalPrice,
      },
    };
  });

  const computedSubtotal = cartItems.reduce((sum: number, i: any) => sum + i.price * i.quantity, 0);
  const subtotal = Number(rawCart.subtotal || computedSubtotal);
  const computedMrp = cartItems.reduce((sum: number, i: any) => sum + i.originalPrice * i.quantity, 0);
  const totalMrp = Number(rawCart.totalMrp || computedMrp);
  const couponDiscount = Number(rawCart.couponDiscount ?? 0);
  const shippingFee = subtotal >= 1000 || subtotal === 0 ? 0 : 99;
  const tax = 0;
  const total = Math.max(0, subtotal - couponDiscount + shippingFee);

  const cartTotals: CartTotals = {
    subtotal,
    discount: Math.max(0, totalMrp - subtotal),
    couponDiscount,
    shippingFee,
    tax,
    total,
  };

  const itemCount = rawCart.itemCount || cartItems.reduce((acc: number, i: any) => acc + i.quantity, 0);
  const appliedCoupon = rawCart.couponCode || rawCart.appliedCoupon || null;

  return {
    cart: {
      ...rawCart,
      items: cartItems,
      totals: cartTotals,
      appliedCoupon,
    },
    cartItems,
    itemCount,
    cartTotals,
    appliedCoupon,
  };
};

export const useCartStore = create<CartState>()((set, get) => ({
  cart: null,
  cartItems: [],
  itemCount: 0,
  cartTotals: initialTotals,
  appliedCoupon: null,
  isLoading: false,
  isCartOpen: false,

  setIsCartOpen: (open: boolean) => set({ isCartOpen: open }),

  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const rawCart = await apiClient.get<any>('/cart');
      const normalized = normalizeCartResponse(rawCart);
      set({
        ...normalized,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
    }
  },

  addToCart: async (payload: AddToCartPayload) => {
    set({ isLoading: true });
    try {
      const rawCart = await apiClient.post<any>('/cart/items', payload);
      const normalized = normalizeCartResponse(rawCart);
      set({
        ...normalized,
        isLoading: false,
        isCartOpen: true, // Open cart drawer on successful add
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  updateQuantity: async (itemId: string, quantity: number) => {
    set({ isLoading: true });
    try {
      const rawCart = await apiClient.put<any>(`/cart/items/${itemId}`, { quantity });
      const normalized = normalizeCartResponse(rawCart);
      set({
        ...normalized,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  removeItem: async (itemId: string) => {
    set({ isLoading: true });
    try {
      const rawCart = await apiClient.delete<any>(`/cart/items/${itemId}`);
      const normalized = normalizeCartResponse(rawCart);
      set({
        ...normalized,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  applyCoupon: async (code: string) => {
    set({ isLoading: true });
    try {
      const rawCart = await apiClient.post<any>('/cart/apply-coupon', { couponCode: code });
      const normalized = normalizeCartResponse(rawCart);
      set({
        ...normalized,
        appliedCoupon: code,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  removeCoupon: async () => {
    set({ isLoading: true });
    try {
      const rawCart = await apiClient.delete<any>('/cart/remove-coupon');
      const normalized = normalizeCartResponse(rawCart);
      set({
        ...normalized,
        appliedCoupon: null,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  moveToWishlist: async (itemId: string, productId: string) => {
    await useWishlistStore.getState().toggleWishlist(productId);
    await get().removeItem(itemId);
  },

  clearCart: async () => {
    set({
      cart: null,
      cartItems: [],
      itemCount: 0,
      cartTotals: initialTotals,
      appliedCoupon: null,
      isLoading: false,
    });
    try {
      await apiClient.delete('/cart/clear').catch(() => {});
    } catch (error) {
      // Ignore background clear errors
    }
  },

  mergeGuestCart: async () => {
    try {
      const guestId = localStorage.getItem('guest_id');
      const rawCart = await apiClient.post<any>('/cart/merge', { guestId });
      const normalized = normalizeCartResponse(rawCart);
      set({
        ...normalized,
        isLoading: false,
      });
    } catch (error) {
      // Fallback: fetch user cart directly
      await get().fetchCart().catch(() => {});
    }
  },
}));
