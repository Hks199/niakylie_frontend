import { apiClient } from './client';
import { Address, AddressPayload, User } from '../types/auth';

export const addressesApi = {
  /**
   * Fetch all saved delivery addresses.
   * Route: GET /users/profile/addresses
   */
  getAddresses: (): Promise<Address[]> =>
    apiClient.get('/users/profile/addresses'),

  /**
   * Add new delivery address.
   * Route: POST /users/profile/addresses
   * Returns full updated User object — addresses are embedded in User.
   */
  createAddress: (payload: AddressPayload): Promise<User> =>
    apiClient.post('/users/profile/addresses', payload),

  /**
   * Update address by MongoDB _id.
   * Route: PUT /users/profile/addresses/:addressId
   * Returns full updated User object.
   */
  updateAddress: (addressId: string, payload: AddressPayload): Promise<User> =>
    apiClient.put(`/users/profile/addresses/${addressId}`, payload),

  /**
   * Delete address by MongoDB _id.
   * Route: DELETE /users/profile/addresses/:addressId
   * Returns full updated User object.
   */
  deleteAddress: (addressId: string): Promise<User> =>
    apiClient.delete(`/users/profile/addresses/${addressId}`),
};

// Re-export Address type for convenience in consumers
export type { Address, AddressPayload };
