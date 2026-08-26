import { apiClient } from './client';
import { User, UpdateProfilePayload } from '../types/auth';

export const profileApi = {
  /**
   * Fetch authenticated user's full profile.
   * Route: GET /users/profile
   * Requires: JWT Bearer token in Authorization header.
   */
  getProfile: (): Promise<User> =>
    apiClient.get('/users/profile'),

  /**
   * Update profile (firstName and/or lastName only).
   * Route: PATCH /users/profile  ← Note: PATCH, not PUT
   * Only firstName and lastName are accepted by backend UpdateProfileDto.
   */
  updateProfile: (payload: UpdateProfilePayload): Promise<User> =>
    apiClient.patch('/users/profile', payload),

  /**
   * Upload avatar image.
   * Route: PATCH /users/profile/avatar
   * Content-Type: multipart/form-data — field name must be 'avatar'.
   * Max 5MB, allowed types: jpg, jpeg, png, webp.
   */
  uploadAvatar: (file: File): Promise<User> => {
    const formData = new FormData();
    formData.append('avatar', file);
    return apiClient.patch('/users/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Export type re-exports so consumers can import from one place
export type { User, UpdateProfilePayload };
