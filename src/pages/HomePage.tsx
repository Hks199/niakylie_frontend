import { useQuery } from '@tanstack/react-query';
import { HeroBannerCarousel } from '../components/home/HeroBannerCarousel';
import { CategoryBubbleBar } from '../components/home/CategoryBubbleBar';
import { OfferBannerGrid } from '../components/home/OfferBannerGrid';
import { TrendingProductsCarousel } from '../components/home/TrendingProductsCarousel';
import { BrandSpotlight } from '../components/home/BrandSpotlight';
import { TestimonialsSection } from '../components/home/TestimonialsSection';
import { FashionBlogFeed } from '../components/home/FashionBlogFeed';
import { PopupBannerModal } from '../components/home/PopupBannerModal';
import { bannersApi, productsApi, cmsApi } from '../api';

export function HomePage() {
  // 1. Fetch All Active Banners (HOMEPAGE, OFFER, FESTIVAL, POPUP)
  const { data: allBanners = [] } = useQuery({
    queryKey: ['banners', 'all-active'],
    queryFn: () => bannersApi.getActiveBanners(),
  });

  const homepageBanners = allBanners.filter((b) => b.type === 'HOMEPAGE' || !b.type);
  const offerBanners = allBanners.filter((b) => b.type === 'OFFER' || b.type === 'FESTIVAL');
  const popupBanners = allBanners.filter((b) => b.type === 'POPUP');

  // Fetch Featured Products
  const { data: featuredData } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => productsApi.getProducts({ isFeatured: true, limit: 8 }),
  });

  // 4. Fetch Trending Products
  const { data: trendingData } = useQuery({
    queryKey: ['products', 'trending'],
    queryFn: () => productsApi.getProducts({ isTrending: true, limit: 8 }),
  });

  // 5. Fetch Best Seller Products
  const { data: bestSellerData } = useQuery({
    queryKey: ['products', 'bestseller'],
    queryFn: () => productsApi.getProducts({ isBestSeller: true, limit: 8 }),
  });

  const featuredProducts = featuredData?.items || [];
  const trendingProducts = trendingData?.items || [];
  const bestSellerProducts = bestSellerData?.items || [];

  // 6. Fetch Blogs
  const { data: blogsRaw = [] } = useQuery({
    queryKey: ['cms', 'blogs'],
    queryFn: () => cmsApi.getBlogs(),
  });
  const blogs = blogsRaw as any[];

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-2 animate-in fade-in duration-300">
      {/* 1. Hero Banner Carousel (HOMEPAGE type) */}
      <HeroBannerCarousel banners={homepageBanners} />

      {/* 2. Category Circle Bubble Bar */}
      <CategoryBubbleBar />

      {/* 3. Offer & Festival Banner Grid (OFFER & FESTIVAL types) */}
      <OfferBannerGrid banners={offerBanners} />

      {/* 4. Trending & Featured Products Carousel */}
      <TrendingProductsCarousel
        featuredProducts={featuredProducts}
        trendingProducts={trendingProducts}
        bestSellerProducts={bestSellerProducts}
      />

      {/* 5. Brand Spotlight Grid */}
      <BrandSpotlight />

      {/* 6. Customer Testimonials */}
      <TestimonialsSection />

      {/* 7. Fashion Journal / Blog Feed */}
      <FashionBlogFeed blogs={blogs} />

      {/* 8. Promotional Modal (POPUP type) */}
      <PopupBannerModal banners={popupBanners} />
    </div>
  );
}

export default HomePage;
