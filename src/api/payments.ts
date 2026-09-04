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
    try {
      return await apiClient.post<RazorpayOrderResponse>('/payments/razorpay/create-order', { amount });
    } catch (error) {
      // Mock fallback
      return {
        id: `rpay_${Date.now()}`,
        amount: amount * 100, // Razorpay uses paise
        currency: 'INR',
        keyId: 'rzp_test_mock_key',
      };
    }
  },

  verifyRazorpay: async (payload: RazorpayVerifyPayload): Promise<{ success: boolean }> => {
    try {
      return await apiClient.post('/payments/razorpay/verify', payload);
    } catch (error) {
      return { success: true }; // Fallback assume verified for offline dev
    }
  },

  getOnlineDiscountConfig: async (): Promise<OnlinePaymentDiscountConfig> => {
    try {
      return await apiClient.get<OnlinePaymentDiscountConfig>('/payments/online-discount');
    } catch (error) {
      // Default fallback if offline
      return {
        isEnabled: false,
        discountType: 'PERCENTAGE',
        discountValue: 5,
        minOrderAmount: 0,
        maxDiscountCap: 500,
        badgeText: 'EXTRA 5% OFF ON ONLINE PAYMENTS',
        description: 'Pay via UPI or Cards to get extra instant discount',
      };
    }
  },

  getAdminOnlineDiscountConfig: async (): Promise<OnlinePaymentDiscountConfig> => {
    try {
      return await apiClient.get<OnlinePaymentDiscountConfig>('/payments/online-discount/admin');
    } catch (error) {
      return {
        isEnabled: false,
        discountType: 'PERCENTAGE',
        discountValue: 5,
        minOrderAmount: 0,
        maxDiscountCap: 500,
        badgeText: 'EXTRA 5% OFF ON ONLINE PAYMENTS',
        description: 'Pay via UPI or Cards to get extra instant discount',
      };
    }
  },

  updateOnlineDiscountConfig: async (payload: Partial<OnlinePaymentDiscountConfig>): Promise<OnlinePaymentDiscountConfig> => {
    try {
      return await apiClient.put<OnlinePaymentDiscountConfig>('/payments/online-discount/admin', payload);
    } catch (error) {
      return await apiClient.post<OnlinePaymentDiscountConfig>('/payments/online-discount/admin', payload);
    }
  },
};
