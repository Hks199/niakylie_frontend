import { apiClient } from './client';
import {
  AuthResponse,
  RegisterResponse,
  LoginPayload,
  RegisterPayload,
  User,
  UpdateProfilePayload,
} from '../types/auth';

export const authApi = {
  /**
   * Register new customer.
   * Payload: { email, password, firstName, lastName }
   */
  register: (payload: RegisterPayload): Promise<RegisterResponse> =>
    apiClient.post('/auth/register', payload),

  /**
   * Login user.
   * Payload: { email, password }
   * Stores access_token and refresh_token in localStorage.
   */
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const data = await apiClient.post<AuthResponse>('/auth/login', payload);
    if (data.accessToken) {
      localStorage.setItem('access_token', data.accessToken);
    }
    if (data.refreshToken) {
      localStorage.setItem('refresh_token', data.refreshToken);
    }
    return data;
  },

  /**
   * Register new Admin user.
   * Route: POST /auth/admin/register
   */
  adminRegister: (payload: { email: string; password: string; firstName: string; lastName: string; adminSecretKey?: string }): Promise<any> =>
    apiClient.post('/auth/admin/register', payload),

  /**
   * Login Admin user (Enforces Role.ADMIN privileges on backend).
   * Route: POST /auth/admin/login
   */
  adminLogin: async (payload: LoginPayload): Promise<AuthResponse> => {
    const data = await apiClient.post<AuthResponse>('/auth/admin/login', payload);
    if (data.accessToken) {
      localStorage.setItem('access_token', data.accessToken);
    }
    if (data.refreshToken) {
      localStorage.setItem('refresh_token', data.refreshToken);
    }
    return data;
  },

  /**
   * Logout Admin session.
   * Route: POST /auth/admin/logout
   */
  adminLogout: async (): Promise<void> => {
    const refreshToken = localStorage.getItem('refresh_token') || '';
    await apiClient.post('/auth/admin/logout', {}, {
      headers: { Authorization: `Bearer ${refreshToken}` },
    }).catch(() => {});
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },

  /**
   * Verify email with token from register response.
   */
  verifyEmail: (token: string) =>
    apiClient.post('/auth/verify-email', { token }),

  /**
   * Request password reset email.
   */
  forgotPassword: (email: string) =>
    apiClient.post('/auth/forgot-password', { email }),

  /**
   * Reset password using reset token.
   */
  resetPassword: (token: string, password: string) =>
    apiClient.post('/auth/reset-password', { token, password }),

  /**
   * Refresh access token.
   * The refresh token must be passed as the Bearer header — no body.
   */
  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const data = await apiClient.post<AuthResponse>('/auth/refresh', {}, {
      headers: { Authorization: `Bearer ${refreshToken}` },
    });
    if (data.accessToken) {
      localStorage.setItem('access_token', data.accessToken);
    }
    if (data.refreshToken) {
      localStorage.setItem('refresh_token', data.refreshToken);
    }
    return data;
  },

  /**
   * Get current authenticated user profile.
   * Route: GET /users/profile
   */
  getProfile: (): Promise<User> =>
    apiClient.get('/users/profile'),

  /**
   * Update profile (firstName and/or lastName only).
   * Route: PATCH /users/profile
   */
  updateProfile: (payload: UpdateProfilePayload): Promise<User> =>
    apiClient.patch('/users/profile', payload),

  /**
   * Logout current session.
   * Passes refresh token as Bearer header.
   */
  logout: async (): Promise<void> => {
    const refreshToken = localStorage.getItem('refresh_token') || '';
    await apiClient.post('/auth/logout', {}, {
      headers: { Authorization: `Bearer ${refreshToken}` },
    }).catch(() => {});
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },

  /**
   * Logout all device sessions.
   */
  logoutAll: () => apiClient.post('/auth/logout-all'),
};
