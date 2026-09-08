import { apiClient } from './client';

export interface ProductReview {
  id: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  images?: string[];
  likes?: number;
}

export interface ReviewSummary {
  averageRating?: number;
  totalReviews?: number;
  starsCount?: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  summary?: {
    averageRating?: number;
    reviewCount?: number;
    ratingBreakdown?: Record<string, number>;
  };
  reviews?: ProductReview[];
}

export interface CreateReviewPayload {
  productId: string;
  rating: number;
  title?: string;
  comment: string;
  images?: string[];
  videos?: string[];
  userId?: string;
  userName?: string;
}

export const reviewsApi = {
  createReview: async (payload: CreateReviewPayload): Promise<any> => {
    try {
      let res: any;
      try {
        res = await apiClient.post('/reviews', payload);
      } catch (e) {
        res = await apiClient.post(`/reviews/product/${payload.productId}`, payload);
      }
      return res;
    } catch (error) {
      console.warn('Review API submission failed:', error);
      throw error;
    }
  },

  getProductReviews: async (productId: string): Promise<ReviewSummary> => {
    try {
      return await apiClient.get<ReviewSummary>(`/reviews/product/${productId}`);
    } catch (error) {
      try {
        return await apiClient.get<ReviewSummary>(`/products/${productId}/reviews`);
      } catch (e) {
        console.warn('Product reviews fetch failed:', e);
        return { averageRating: 0, totalReviews: 0, starsCount: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }, reviews: [] };
      }
    }
  },
};
