import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// Module augmentation for Axios to match unwrap response interceptor
declare module 'axios' {
  export interface AxiosInstance {
    get<T = any>(url: string, config?: any): Promise<T>;
    delete<T = any>(url: string, config?: any): Promise<T>;
    post<T = any>(url: string, data?: any, config?: any): Promise<T>;
    put<T = any>(url: string, data?: any, config?: any): Promise<T>;
    patch<T = any>(url: string, data?: any, config?: any): Promise<T>;
  }
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

/**
 * Get or initialize guest session ID from localStorage
 */
export const getGuestId = (): string => {
  let guestId = localStorage.getItem('guest_id');
  if (!guestId) {
    guestId = 'guest_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem('guest_id', guestId);
  }
  return guestId;
};

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// ─── REQUEST INTERCEPTOR ──────────────────────────────────────────────────
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Attach JWT Token if available in localStorage or Zustand store
    let token = localStorage.getItem('access_token');
    if (!token) {
      try {
        const authData = localStorage.getItem('niakylie-auth-storage');
        if (authData) {
          const parsed = JSON.parse(authData);
          token = parsed?.state?.token || null;
        }
      } catch {
        // Ignore parse error
      }
    }

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Always attach Guest ID for anonymous cart and guest sessions support
    if (config.headers) {
      config.headers['x-guest-id'] = getGuestId();
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// ─── RESPONSE INTERCEPTOR ─────────────────────────────────────────────────
apiClient.interceptors.response.use(
  (response) => {
    // Standard response format: { success: true, statusCode: 200, message: '...', data: ... }
    // If response.data.data exists, unwrap and return it directly, else return response.data
    if (response.data && response.data.data !== undefined) {
      return response.data.data;
    }
    return response.data;
  },
  (error: AxiosError<any>) => {
    if (error.response?.status === 401) {
      const requestUrl = (error.config as any)?.url || '';
      const storedToken = localStorage.getItem('access_token');

      // Only fire auth:unauthorized for explicit profile verification routes like /users/profile or /auth/me
      const isProfileVerificationRoute = requestUrl.includes('/users/profile') || requestUrl.includes('/auth/me');

      if (isProfileVerificationRoute && storedToken) {
        localStorage.removeItem('access_token');
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      }
    }

    const errorPayload = error.response?.data || {
      success: false,
      statusCode: error.response?.status || 500,
      message: error.message || 'An unexpected error occurred',
    };

    return Promise.reject(errorPayload);
  }
);

export default apiClient;
