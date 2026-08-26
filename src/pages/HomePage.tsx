import { useQuery } from '@tanstack/react-query';
import { HeroBannerCarousel } from '../components/home/HeroBannerCarousel';
import { CategoryBubbleBar } from '../components/home/CategoryBubbleBar';
import { OfferBannerGrid } from '../components/home/OfferBannerGrid';
import { TrendingProductsCarousel } from '../components/home/TrendingProductsCarousel';
import { BrandSpotlight } from '../components/home/BrandSpotlight';
import { TestimonialsSection } from '../components/home/TestimonialsSection';
import { FashionBlogFeed } from '../components/home/FashionBlogFeed';
import { bannersApi, productsApi, cmsApi } from '../api';
import { BannerType } from '../types/banner';

export function HomePage() {
  // 1. Fetch Banners
  const { data: banners = [] } = useQuery({
    queryKey: ['banners', 'HOMEPAGE'],
    queryFn: () => bannersApi.getActiveBanners({ type: BannerType.HOMEPAGE }),
  });

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
      {/* 1. Hero Banner Carousel */}
      <HeroBannerCarousel banners={banners} />

      {/* 2. Category Circle Bubble Bar */}
      <CategoryBubbleBar />

      {/* 3. Offer & Festival Banner Grid */}
      <OfferBannerGrid />

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
    </div>
  );
}

export default HomePage;
