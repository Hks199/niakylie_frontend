import { create } from 'zustand';
import { WishlistItem } from '../types';
import { apiClient } from '../api/client';
import { normalizeProduct } from '../api/products';

interface WishlistState {
  wishlistItems: WishlistItem[];
  isLoading: boolean;

  fetchWishlist: () => Promise<void>;
  toggleWishlist: (productId: string, variantId?: string) => Promise<boolean>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>()((set, get) => ({
  wishlistItems: [],
  isLoading: false,

  fetchWishlist: async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      set({ wishlistItems: [], isLoading: false });
      return;
    }

    set({ isLoading: true });
    try {
      const data = await apiClient.get<WishlistItem[] | { items: WishlistItem[] }>('/users/profile/wishlist');
      const rawItems: any[] = Array.isArray(data) ? data : (data as any)?.items || [];
      const items: WishlistItem[] = rawItems.map((item) => normalizeProduct(item) as any);
      set({ wishlistItems: items, isLoading: false });
    } catch {
      try {
        const data = await apiClient.get<WishlistItem[] | { items: WishlistItem[] }>('/users/wishlist');
        const rawItems: any[] = Array.isArray(data) ? data : (data as any)?.items || [];
        const items: WishlistItem[] = rawItems.map((item) => normalizeProduct(item) as any);
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

  removeFromWishlist: async (productId: string) => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    try {
      await apiClient.delete(`/users/profile/wishlist/${productId}`);
      await get().fetchWishlist();
    } catch {
      try {
        await apiClient.delete(`/users/wishlist/${productId}`);
        await get().fetchWishlist();
      } catch {
        // Fallback to fetch
        await get().fetchWishlist();
      }
    }
  },

  isInWishlist: (productId: string) => {
    if (!productId) return false;
    const items = get().wishlistItems;
    return items.some((item: any) => {
      if (typeof item === 'string') return item === productId;
      if (item._id === productId || item.id === productId) return true;
      if (typeof item.productId === 'string') return item.productId === productId;
      if (item.productId && typeof item.productId === 'object') {
        return item.productId._id === productId || item.productId.id === productId;
      }
      return false;
    });
  },
}));
