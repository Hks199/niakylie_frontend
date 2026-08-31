import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, LoginPayload, RegisterPayload, RegisterResponse } from '../types/auth';
import { authApi } from '../api/auth';
import { useCartStore } from './useCartStore';
import { useWishlistStore } from './useWishlistStore';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  adminLogin: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<RegisterResponse>;
  adminRegister: (payload: { email: string; password: string; firstName: string; lastName: string; adminSecretKey?: string }) => Promise<any>;
  logout: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (payload: LoginPayload) => {
        set({ isLoading: true });
        try {
          const res = await authApi.login(payload);
          // Save token explicitly for apiClient interceptor
          if (res.accessToken) {
            localStorage.setItem('access_token', res.accessToken);
          }
          if (res.refreshToken) {
            localStorage.setItem('refresh_token', res.refreshToken);
          }
          set({
            user: res.user as unknown as User,
            token: res.accessToken,
            isAuthenticated: true,
            isLoading: false,
          });

          // Fetch logged-in user's own cart & wishlist
          useCartStore.getState().mergeGuestCart().catch(() => {});
          useCartStore.getState().fetchCart().catch(() => {});
          useWishlistStore.getState().fetchWishlist().catch(() => {});
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      adminLogin: async (payload: LoginPayload) => {
        set({ isLoading: true });
        try {
          const res = await authApi.adminLogin(payload);
          if (res.accessToken) {
            localStorage.setItem('access_token', res.accessToken);
          }
          if (res.refreshToken) {
            localStorage.setItem('refresh_token', res.refreshToken);
          }
          set({
            user: res.user as unknown as User,
            token: res.accessToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (payload: RegisterPayload): Promise<RegisterResponse> => {
        set({ isLoading: true });
        try {
          const res = await authApi.register(payload);
          set({ isLoading: false });
          return res;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      adminRegister: async (payload: { email: string; password: string; firstName: string; lastName: string; adminSecretKey?: string }): Promise<any> => {
        set({ isLoading: true });
        try {
          const res = await authApi.adminRegister(payload);
          set({ isLoading: false });
          return res;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        const token = localStorage.getItem('access_token');
        const isMockToken = token === 'mock_admin_jwt_token_2026';
        const user = get().user;

        if (!isMockToken) {
          try {
            const isAdmin = user?.roles?.includes('ADMIN') || (user as any)?.role === 'ADMIN' || (user as any)?.roles?.includes('admin');
            if (isAdmin) {
              await authApi.adminLogout();
            } else {
              await authApi.logout();
            }
          } catch {
            await authApi.logout().catch(() => {});
          }
        }

        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        set({ user: null, token: null, isAuthenticated: false, isLoading: false });

        // Reset state for logout and reload fresh guest cart
        useCartStore.getState().clearCart();
        useWishlistStore.setState({ wishlistItems: [] });
        useCartStore.getState().fetchCart().catch(() => {});
      },

      fetchProfile: async () => {
        const token = localStorage.getItem('access_token') || get().token;
        if (!token) return;

        // Don't make API call with mock token (demo mode)
        if (token === 'mock_admin_jwt_token_2026') {
          set({ isAuthenticated: true });
          return;
        }

        set({ isLoading: true });
        try {
          const profile = await authApi.getProfile();
          set({ user: profile, token, isAuthenticated: true, isLoading: false });
        } catch {
          // Keep existing state if user already set (e.g. after login)
          if (!get().user) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            set({ user: null, token: null, isAuthenticated: false, isLoading: false });
          } else {
            set({ isLoading: false });
          }
        }
      },

      /**
       * Direct user setter — used by AdminLoginPage demo fallback.
       * Always marks the session as authenticated.
       */
      setUser: (user: User | null) => {
        const token = user
          ? localStorage.getItem('access_token') || get().token || 'mock_admin_jwt_token_2026'
          : null;

        if (user && token) {
          localStorage.setItem('access_token', token);
        }

        set({
          user,
          token,
          isAuthenticated: !!user,
        });
      },
    }),
    {
      name: 'niakylie-auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Listen for 401 unauthorized events dispatched by the Axios response interceptor
// But skip if we're using a mock/demo token
if (typeof window !== 'undefined') {
  window.addEventListener('auth:unauthorized', () => {
    const token = localStorage.getItem('access_token');
    if (token === 'mock_admin_jwt_token_2026') return; // Don't log out demo admin
    useAuthStore.getState().logout();
  });
}
