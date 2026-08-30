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

  // 2. Fetch All Products (General Catalog)
  const { data: allProductsData } = useQuery({
    queryKey: ['products', 'all-homepage'],
    queryFn: () => productsApi.getProducts({ limit: 12 }),
  });
  const allProducts = allProductsData?.items || [];

  // 3. Fetch Featured Products
  const { data: featuredData } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => productsApi.getProducts({ isFeatured: true, limit: 8 }),
  });

  // 4. Fetch Trending Products
  const { data: trendingData } = useQuery({
    queryKey: ['products', 'trending'],
    queryFn: () => productsApi.getProducts({ isTrending: true, limit: 8 }),
  });

  // Fallback to all products if specific flags (isFeatured / isTrending) return empty arrays
  const featuredProducts =
    featuredData?.items && featuredData.items.length > 0 ? featuredData.items : allProducts;
  const trendingProducts =
    trendingData?.items && trendingData.items.length > 0 ? trendingData.items : allProducts;

  // 5. Fetch Blogs
  const { data: blogsRaw = [] } = useQuery({
    queryKey: ['cms', 'blogs'],
    queryFn: () => cmsApi.getBlogs(),
  });
  const blogs = blogsRaw as any[];

  return (
    <div className="w-full space-y-2 animate-in fade-in duration-300">
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
