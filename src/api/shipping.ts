import { apiClient } from './client';

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
  checkPincode: async (pincode: string): Promise<PincodeCheckResponse> => {
    try {
      return await apiClient.post<PincodeCheckResponse>('/shipping/check-pincode', { pincode });
    } catch (error) {
      throw error;
    }
  },
};
