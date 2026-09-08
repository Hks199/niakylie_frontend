import { apiClient } from './client';

export interface RazorpayOrderResponse {
  id: string;
  amount: number;
  currency: string;
  keyId: string;
}

export interface RazorpayVerifyPayload {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface OnlinePaymentDiscountConfig {
  isEnabled: boolean;
  discountType: 'PERCENTAGE' | 'FLAT';
  discountValue: number;
  minOrderAmount: number;
  maxDiscountCap: number;
  badgeText: string;
  description: string;
}

export const paymentsApi = {
  createRazorpayOrder: async (amount: number): Promise<RazorpayOrderResponse> => {
    return await apiClient.post<RazorpayOrderResponse>('/payments/razorpay/create-order', { amount });
  },

  verifyRazorpay: async (payload: RazorpayVerifyPayload): Promise<{ success: boolean }> => {
    return await apiClient.post('/payments/razorpay/verify', payload);
  },

  getOnlineDiscountConfig: async (): Promise<OnlinePaymentDiscountConfig> => {
    return await apiClient.get<OnlinePaymentDiscountConfig>('/payments/online-discount');
  },

  getAdminOnlineDiscountConfig: async (): Promise<OnlinePaymentDiscountConfig> => {
    return await apiClient.get<OnlinePaymentDiscountConfig>('/payments/online-discount/admin');
  },

  updateOnlineDiscountConfig: async (payload: Partial<OnlinePaymentDiscountConfig>): Promise<OnlinePaymentDiscountConfig> => {
    try {
      return await apiClient.put<OnlinePaymentDiscountConfig>('/payments/online-discount/admin', payload);
    } catch (error) {
      return await apiClient.post<OnlinePaymentDiscountConfig>('/payments/online-discount/admin', payload);
    }
  },
};
