import { create } from 'zustand';
import { Cart, CartItem, CartTotals, AddToCartPayload } from '../types';
import { apiClient } from '../api/client';
import { useWishlistStore } from './useWishlistStore';

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
      const cart = await apiClient.get<Cart>('/cart');
      set({
        cart,
        cartItems: cart.items || [],
        itemCount: cart.itemCount || cart.items?.reduce((acc, i) => acc + i.quantity, 0) || 0,
        cartTotals: cart.totals || initialTotals,
        appliedCoupon: cart.appliedCoupon || null,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
    }
  },

  addToCart: async (payload: AddToCartPayload) => {
    set({ isLoading: true });
    try {
      const cart = await apiClient.post<Cart>('/cart/items', payload);
      set({
        cart,
        cartItems: cart.items || [],
        itemCount: cart.itemCount || cart.items?.reduce((acc, i) => acc + i.quantity, 0) || 0,
        cartTotals: cart.totals || initialTotals,
        appliedCoupon: cart.appliedCoupon || null,
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
      const cart = await apiClient.put<Cart>(`/cart/items/${itemId}`, { quantity });
      set({
        cart,
        cartItems: cart.items || [],
        itemCount: cart.itemCount || cart.items?.reduce((acc, i) => acc + i.quantity, 0) || 0,
        cartTotals: cart.totals || initialTotals,
        appliedCoupon: cart.appliedCoupon || null,
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
      const cart = await apiClient.delete<Cart>(`/cart/items/${itemId}`);
      set({
        cart,
        cartItems: cart?.items || [],
        itemCount: cart?.itemCount || cart?.items?.reduce((acc, i) => acc + i.quantity, 0) || 0,
        cartTotals: cart?.totals || initialTotals,
        appliedCoupon: cart?.appliedCoupon || null,
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
      const cart = await apiClient.post<Cart>('/cart/coupon', { code });
      set({
        cart,
        cartItems: cart.items || [],
        itemCount: cart.itemCount || 0,
        cartTotals: cart.totals || initialTotals,
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
      const cart = await apiClient.delete<Cart>('/cart/coupon');
      set({
        cart,
        cartItems: cart.items || [],
        itemCount: cart.itemCount || 0,
        cartTotals: cart.totals || initialTotals,
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

  clearCart: () => {
    set({
      cart: null,
      cartItems: [],
      itemCount: 0,
      cartTotals: initialTotals,
      appliedCoupon: null,
      isLoading: false,
    });
  },

  mergeGuestCart: async () => {
    try {
      const guestId = localStorage.getItem('guest_id');
      const cart = await apiClient.post<Cart>('/cart/merge', { guestId });
      set({
        cart,
        cartItems: cart.items || [],
        itemCount: cart.itemCount || cart.items?.reduce((acc, i) => acc + i.quantity, 0) || 0,
        cartTotals: cart.totals || initialTotals,
        appliedCoupon: cart.appliedCoupon || null,
      });
    } catch (error) {
      // Fallback: fetch user cart directly
      await get().fetchCart().catch(() => {});
    }
  },
}));
