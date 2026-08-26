import { apiClient } from './client';
import { User } from '../types/auth';

export const wishlistApi = {
  /**
   * Get array of wishlist product IDs.
   * Route: GET /users/profile/wishlist
   */
  getWishlist: (): Promise<string[]> =>
    apiClient.get('/users/profile/wishlist'),

  /**
   * Add product to wishlist.
   * Route: POST /users/profile/wishlist/:productId
   * Returns full updated User object.
   */
  addToWishlist: (productId: string): Promise<User> =>
    apiClient.post(`/users/profile/wishlist/${productId}`),

  /**
   * Remove product from wishlist.
   * Route: DELETE /users/profile/wishlist/:productId
   * Returns full updated User object.
   */
  removeFromWishlist: (productId: string): Promise<User> =>
    apiClient.delete(`/users/profile/wishlist/${productId}`),
};
