import { apiClient } from './client';
import { Banner } from '../types';

export const bannersApi = {
  /**
   * Fetch active banners by type (HOMEPAGE, OFFER, CATEGORY)
   */
  getBanners: async (type = 'HOMEPAGE'): Promise<Banner[]> => {
    const DEFAULT_HOMEPAGE_BANNERS: Banner[] = [
      {
        id: 'b1',
        title: 'Royal Banarasi & Silk Royale Saree Edit',
        subtitle: 'Handcrafted Heritage Drapery for Diwali & Festive Celebrations',
        imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1600&q=80',
        mobileImageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
        linkUrl: '/category/sarees',
        type: 'HOMEPAGE',
        discountBadge: 'FLAT 50% OFF',
        ctaText: 'EXPLORE SAREES',
      },
      {
        id: 'b2',
        title: 'Designer Anarkali & Kurta Suit Collections',
        subtitle: 'Graceful Silhouettes for Weddings & Sangeet Ceremonies',
        imageUrl: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1600&q=80',
        mobileImageUrl: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
        linkUrl: '/category/kurta-sets',
        type: 'HOMEPAGE',
        discountBadge: 'UP TO 40% OFF',
        ctaText: 'SHOP KURTA SETS',
      },
      {
        id: 'b3',
        title: 'Velvet Lehengas & Fusion Gowns',
        subtitle: 'Modern Couture Infused with Traditional Artistry',
        imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1600&q=80',
        mobileImageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
        linkUrl: '/category/lehengas',
        type: 'HOMEPAGE',
        discountBadge: 'FESTIVE SPECIAL',
        ctaText: 'EXPLORE LEHENGAS',
      },
    ];

    try {
      const data = await apiClient.get<Banner[]>('/banners', { params: { type } });
      const bannerList = Array.isArray(data) ? data : (data as any)?.banners || (data as any)?.data || [];
      if (bannerList.length > 0) return bannerList;
    } catch (error) {
      // Fallback to defaults
    }

    return type === 'HOMEPAGE' ? DEFAULT_HOMEPAGE_BANNERS : [];
  },
};
