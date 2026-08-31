import { create } from 'zustand';
import { WishlistItem } from '../types';
import { apiClient } from '../api/client';

interface WishlistState {
  wishlistItems: WishlistItem[];
  isLoading: boolean;

  fetchWishlist: () => Promise<void>;
  toggleWishlist: (productId: string, variantId?: string) => Promise<boolean>;
  isInWishlist: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>()((set, get) => ({
  wishlistItems: [],
  isLoading: false,

  fetchWishlist: async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    set({ isLoading: true });
    try {
      const data = await apiClient.get<WishlistItem[] | { items: WishlistItem[] }>('/users/profile/wishlist');
      const items: WishlistItem[] = Array.isArray(data) ? data : (data as any)?.items || [];
      set({ wishlistItems: items, isLoading: false });
    } catch {
      try {
        const data = await apiClient.get<WishlistItem[] | { items: WishlistItem[] }>('/users/wishlist');
        const items: WishlistItem[] = Array.isArray(data) ? data : (data as any)?.items || [];
        set({ wishlistItems: items, isLoading: false });
      } catch {
        set({ isLoading: false });
      }
    }
  },

  toggleWishlist: async (productId: string, variantId?: string) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      // Prompt user or throw unauthorized error if trying to wishlist without login
      window.dispatchEvent(new CustomEvent('auth:require-login'));
      return false;
    }

    try {
      const res = await apiClient.post<{ isWishlisted?: boolean }>('/users/wishlist/toggle', { productId, variantId });
      await get().fetchWishlist();
      return res?.isWishlisted ?? true;
    } catch (error) {
      throw error;
    }
  },

  isInWishlist: (productId: string) => {
    const items = get().wishlistItems;
    return items.some((item) => {
      if (typeof item.productId === 'string') {
        return item.productId === productId;
      }
      return item.productId?.id === productId || item.productId?._id === productId;
    });
  },
}));
