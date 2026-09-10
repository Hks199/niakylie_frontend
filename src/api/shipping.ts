import { apiClient } from './client';
import { ShippingConfig } from '../utils/shipping';

export interface PincodeCheckResponse {
  deliverable: boolean;
  pincode: string;
  estimatedDays: number;
  deliveryDate: string;
  codAvailable: boolean;
  expressAvailable: boolean;
  message?: string;
}

export const shippingApi = {
  /** Public shipping prices used throughout the storefront checkout. */
  getConfig: async (): Promise<ShippingConfig> => {
    return await apiClient.get<ShippingConfig>('/shipping/config');
  },

  /** Admin-only shipping price configuration. */
  getAdminConfig: async (): Promise<ShippingConfig> => {
    return await apiClient.get<ShippingConfig>('/shipping/config/admin');
  },

  updateConfig: async (payload: ShippingConfig): Promise<ShippingConfig> => {
    return await apiClient.put<ShippingConfig>('/shipping/config/admin', payload);
  },

  checkPincode: async (pincode: string): Promise<PincodeCheckResponse> => {
    try {
      return await apiClient.post<PincodeCheckResponse>('/shipping/check-pincode', { pincode });
    } catch (error) {
      throw error;
    }
  },
};
