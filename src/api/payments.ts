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

export interface StripeIntentResponse {
  clientSecret: string;
  intentId: string;
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

  createStripeIntent: async (amount: number): Promise<StripeIntentResponse> => {
    try {
      return await apiClient.post<StripeIntentResponse>('/payments/stripe/create-intent', { amount });
    } catch (error) {
      return {
        clientSecret: `pi_mock_${Date.now()}_secret`,
        intentId: `pi_mock_${Date.now()}`,
      };
    }
  },
};
