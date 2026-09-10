import { apiClient } from './client';
import { defaultShippingConfig, ShippingConfig } from '../utils/shipping';

const SHIPPING_CONFIG_STORAGE_KEY = 'niakylie_shipping_config';

function readLocalShippingConfig(): ShippingConfig {
  try {
    const stored = localStorage.getItem(SHIPPING_CONFIG_STORAGE_KEY);
    return stored ? { ...defaultShippingConfig, ...JSON.parse(stored) } : defaultShippingConfig;
  } catch {
    return defaultShippingConfig;
  }
}

function saveLocalShippingConfig(config: ShippingConfig): ShippingConfig {
  const normalized = { ...defaultShippingConfig, ...config };
  localStorage.setItem(SHIPPING_CONFIG_STORAGE_KEY, JSON.stringify(normalized));
  return normalized;
}

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
    try {
      return await apiClient.get<ShippingConfig>('/shipping/config');
    } catch {
      return readLocalShippingConfig();
    }
  },

  /** Admin-only shipping price configuration. */
  getAdminConfig: async (): Promise<ShippingConfig> => {
    try {
      return await apiClient.get<ShippingConfig>('/shipping/config/admin');
    } catch {
      return readLocalShippingConfig();
    }
  },

  updateConfig: async (payload: ShippingConfig): Promise<ShippingConfig> => {
    try {
      return await apiClient.put<ShippingConfig>('/shipping/config/admin', payload);
    } catch (error) {
      try {
        return await apiClient.post<ShippingConfig>('/shipping/config/admin', payload);
      } catch {
        return saveLocalShippingConfig(payload);
      }
    }
  },

  checkPincode: async (pincode: string): Promise<PincodeCheckResponse> => {
    try {
      return await apiClient.post<PincodeCheckResponse>('/shipping/check-pincode', { pincode });
    } catch (error) {
      throw error;
    }
  },
};
