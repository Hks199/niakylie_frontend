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
      // Mock fallback calculation if API is offline
      const isValid = /^\d{6}$/.test(pincode);
      if (!isValid) {
        return {
          deliverable: false,
          pincode,
          estimatedDays: 0,
          deliveryDate: '',
          codAvailable: false,
          expressAvailable: false,
          message: 'Invalid 6-digit Pincode',
        };
      }

      const today = new Date();
      const delivery = new Date(today);
      delivery.setDate(today.getDate() + 2);

      const formattedDate = delivery.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      });

      return {
        deliverable: true,
        pincode,
        estimatedDays: 2,
        deliveryDate: formattedDate,
        codAvailable: true,
        expressAvailable: true,
        message: `Express Delivery by ${formattedDate}`,
      };
    }
  },
};
