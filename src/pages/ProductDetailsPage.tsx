import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ShoppingBag, Heart, Star, Share2, Check, ChevronRight, Tag, Copy, Sparkles } from 'lucide-react';
import { ProductGallery } from '../components/pdp/ProductGallery';
import { VariantSelector } from '../components/pdp/VariantSelector';
import { PincodeChecker } from '../components/pdp/PincodeChecker';
import { ProductAccordion } from '../components/pdp/ProductAccordion';
import { ReviewsSection } from '../components/pdp/ReviewsSection';
import { SimilarProducts } from '../components/pdp/SimilarProducts';
import { productsApi } from '../api/products';
import { reviewsApi } from '../api/reviews';
import { apiClient } from '../api/client';
import { useAuthStore, useCartStore, useWishlistStore } from '../store';
import { ProductVariant } from '../types';
import { useCategories } from '../hooks/useCategories';
import { buildBreadcrumbTrail } from '../utils/breadcrumb';

interface ProductDetailsPageProps {
  slug?: string;
}

export function ProductDetailsPage({ slug = 'crimson-red-banarasi-silk-saree' }: ProductDetailsPageProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [copiedPromo, setCopiedPromo] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(undefined);
  const { addToCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const { allCategories } = useCategories();

  // Fetch Active Store Coupons (Only show promo banner if admin has created active coupons)
  const { data: activeCoupons = [] } = useQuery({
    queryKey: ['public-active-coupons'],
    queryFn: async () => {
      try {
        let res: any;
        try {
          res = await apiClient.get('/coupons/active');
        } catch {
          res = await apiClient.get('/coupons', { params: { isActive: true } });
        }
        const list = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.coupons)
          ? res.coupons
          : Array.isArray(res?.items)
          ? res.items
          : [];
        const now = new Date();
        return list.filter(
          (c: any) => c.isActive !== false && (!c.endDate || new Date(c.endDate) >= now)
        );
      } catch {
        return [];
      }
    },
  });

  const { data: product, isLoading: isProductLoading, isError: isProductError } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => productsApi.getProductBySlug(slug),
    retry: 1,
  });

  const targetProductId = product?.id || product?._id || slug;
  const { data: reviewsData } = useQuery({
    queryKey: ['product-reviews', targetProductId],
    queryFn: () => reviewsApi.getProductReviews(targetProductId),
    enabled: !!product,
  });

  // Scroll to top when navigating to a new product
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  if (isProductLoading) {
    return (
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="h-4 w-48 bg-slate-200 rounded-full animate-pulse mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12">
          <div className="lg:col-span-7">
            <div className="aspect-[3/4] w-full bg-slate-200 rounded-2xl animate-pulse" />
          </div>
          <div className="lg:col-span-5 space-y-4">
            <div className="h-3 w-24 bg-slate-200 rounded-full animate-pulse" />
            <div className="h-8 w-3/4 bg-slate-200 rounded-xl animate-pulse" />
            <div className="h-4 w-32 bg-slate-200 rounded-full animate-pulse" />
            <div className="h-16 w-full bg-slate-200 rounded-2xl animate-pulse" />
            <div className="h-24 w-full bg-slate-200 rounded-2xl animate-pulse" />
            <div className="flex space-x-3">
              <div className="h-12 flex-1 bg-slate-200 rounded-2xl animate-pulse" />
              <div className="h-12 w-12 bg-slate-200 rounded-2xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isProductError || !product) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <p className="text-sm font-semibold text-slate-500">Product not found or unavailable.</p>
        <a href="/products" className="text-xs font-extrabold text-brand-crimson hover:underline uppercase tracking-wider">← Browse All Products</a>
      </div>
    );
  }
  const activeProduct = product;

  const displayRating =
    reviewsData?.summary?.averageRating ??
    reviewsData?.averageRating ??
    (activeProduct as any).averageRating ??
    activeProduct.rating ??
    4.0;

  const displayReviewCount =
    reviewsData?.summary?.reviewCount ??
    reviewsData?.totalReviews ??
    (reviewsData as any)?.total ??
    (reviewsData?.reviews ? reviewsData.reviews.length : ((activeProduct as any).reviewsCount ?? activeProduct.reviewCount ?? 1));

  const currentVariant = selectedVariant || activeProduct.variants?.[0];
  const isWishlisted = isInWishlist(activeProduct.id || activeProduct._id || '');

  // Calculate variant-specific pricing, stock, and gallery images
  const price = currentVariant?.offerPrice ?? currentVariant?.price ?? activeProduct.price;
  const originalPrice = currentVariant?.mrp ?? currentVariant?.originalPrice ?? activeProduct.originalPrice ?? Math.round(price * 2);
  const discount = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : activeProduct.discountPercentage || 0;
  const galleryImages = (currentVariant?.images && currentVariant.images.length > 0) ? currentVariant.images : (activeProduct.images || [activeProduct.thumbnail || '']);
  const isOutOfStock = currentVariant?.stock === 0;

  const handleAddToCart = async () => {
    if (isOutOfStock) return;
    if (!isAuthenticated) {
      window.dispatchEvent(new CustomEvent('auth:require-login'));
      return;
    }
    setIsAdding(true);
    try {
      await addToCart({
        productId: activeProduct.id || activeProduct._id || '',
        variantId: currentVariant?.id || currentVariant?._id,
        quantity: 1,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setTimeout(() => setIsAdding(false), 1500);
    }
  };

  const handleWishlistToggle = async () => {
    await toggleWishlist(activeProduct.id || activeProduct._id || '');
  };

  const brandName = typeof activeProduct.brand === 'object' && activeProduct.brand !== null
    ? (activeProduct.brand as any).name
    : (activeProduct.brand || 'NiaKylie Signature');

  const productCategory = (activeProduct as any).category || (activeProduct as any).categoryId;
  const breadcrumbs = buildBreadcrumbTrail(productCategory, allCategories, activeProduct.title);

  return (
    <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 py-4 sm:py-6 animate-in fade-in duration-300">
      {/* Dynamic Product Breadcrumb Trail */}
      <nav className="flex items-center space-x-1.5 text-[11px] sm:text-xs text-slate-500 mb-4 sm:mb-6 overflow-x-auto no-scrollbar py-1.5 sm:py-2 border-b border-gray-100">
        {breadcrumbs.map((crumb, idx) => {
          const isLast = idx === breadcrumbs.length - 1;
          return (
            <div key={idx} className="flex items-center space-x-1.5 flex-shrink-0">
              {isLast ? (
                <span className="font-bold text-brand-slate-dark truncate max-w-[160px] sm:max-w-xs">{crumb.label}</span>
              ) : (
                <>
                  <a href={crumb.href} className="hover:text-brand-crimson transition-colors font-medium text-slate-600">
                    {crumb.label}
                  </a>
                  <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-300 flex-shrink-0" />
                </>
              )}
            </div>
          );
        })}
      </nav>

      {/* 2-Column Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12">
        {/* Left Column: Product Gallery (7 cols) */}
        <div className="lg:col-span-7">
          <ProductGallery images={galleryImages} title={activeProduct.title} />
        </div>

        {/* Right Column: Product Info & Actions (5 cols) */}
        <div className="lg:col-span-5 space-y-4 sm:space-y-6">
          {/* Brand & Header Title */}
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs uppercase font-extrabold text-brand-crimson tracking-widest">
                {brandName}
              </span>
              <button
                onClick={() => navigator.clipboard.writeText(window.location.href)}
                className="p-1.5 sm:p-2 rounded-full text-slate-400 hover:text-brand-slate-dark hover:bg-slate-100 transition-colors"
                aria-label="Share product"
                title="Copy product link"
              >
                <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>

            <h1 className="text-xl sm:text-3xl font-extrabold text-brand-slate-dark font-display leading-tight mt-1">
              {activeProduct.title}
            </h1>

            {/* Star Rating Badge */}
            <div className="flex items-center space-x-2 mt-2 sm:mt-3">
              <div className="bg-slate-900 text-white font-extrabold text-[11px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md flex items-center space-x-1">
                <span>{Number(displayRating).toFixed(1)}</span>
                <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-400 text-amber-400" />
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-slate-500">
                | {displayReviewCount} {displayReviewCount === 1 ? 'Rating & Review' : 'Ratings & Reviews'}
              </span>
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50 border border-gray-100 space-y-0.5 sm:space-y-1">
            <div className="flex items-baseline space-x-2 sm:space-x-3 flex-wrap">
              <span className="text-2xl sm:text-3xl font-extrabold text-brand-slate-dark font-display">
                ₹{price.toLocaleString('en-IN')}
              </span>
              {originalPrice > price && (
                <span className="text-xs sm:text-base text-slate-400 line-through">
                  MRP ₹{originalPrice.toLocaleString('en-IN')}
                </span>
              )}
              {discount > 0 && (
                <span className="text-[10px] sm:text-xs font-extrabold text-brand-crimson bg-brand-crimson/10 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full uppercase">
                  ({discount}% OFF)
                </span>
              )}
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 font-semibold">Inclusive of all taxes</p>
          </div>

          {/* Available Store Offers Banner (Only render if admin created active coupons) */}
          {activeCoupons.length > 0 && (
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl sm:rounded-2xl p-2.5 sm:p-3.5 space-y-1.5 sm:space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-[10px] sm:text-xs font-black text-amber-900 uppercase tracking-wider">
                  <Tag className="w-3.5 h-3.5 text-brand-crimson" />
                  <span>AVAILABLE STORE PROMO OFFERS</span>
                </div>
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                {activeCoupons.map((coupon: any) => {
                  const couponCode = coupon.code || '';
                  const isFlat = coupon.type === 'FLAT';
                  const discountLabel = isFlat
                    ? `Flat ₹${coupon.value} OFF`
                    : `${coupon.value}% OFF${coupon.maxDiscount ? ` up to ₹${coupon.maxDiscount}` : ''}`;
                  const offerText = coupon.description || coupon.title || `${discountLabel} on all products`;

                  return (
                    <div
                      key={coupon._id || couponCode}
                      className="flex items-center justify-between bg-white border border-amber-200 rounded-lg sm:rounded-xl p-2 sm:p-2.5 text-xs shadow-xs"
                    >
                      <div className="flex items-center space-x-1.5 sm:space-x-2 overflow-hidden pr-2">
                        <span className="font-mono font-black text-[10px] sm:text-xs text-brand-crimson bg-rose-50 border border-rose-200 px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-lg uppercase flex-shrink-0">
                          {couponCode}
                        </span>
                        <span className="text-[10px] sm:text-[11px] font-bold text-slate-700 truncate">
                          {offerText}
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(couponCode);
                          setCopiedPromo(couponCode);
                          setTimeout(() => setCopiedPromo(null), 2000);
                        }}
                        className="flex-shrink-0 flex items-center space-x-1 text-[9px] sm:text-[10px] font-extrabold bg-amber-100 hover:bg-amber-200 text-amber-900 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg transition-colors border border-amber-300"
                      >
                        {copiedPromo === couponCode ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>COPIED</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>COPY CODE</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Variant Selector (Colors & Sizes) */}
          <VariantSelector
            variants={activeProduct.variants}
            selectedVariant={currentVariant}
            onSelectVariant={(v) => setSelectedVariant(v)}
            hideSizeGuide={
              (typeof activeProduct.categoryId === 'string' && activeProduct.categoryId.toLowerCase().includes('saree')) ||
              (typeof (activeProduct as any).category === 'string' && (activeProduct as any).category.toLowerCase().includes('saree')) ||
              (typeof (activeProduct as any).category?.slug === 'string' && (activeProduct as any).category.slug.toLowerCase().includes('saree')) ||
              (typeof (activeProduct as any).category?.name === 'string' && (activeProduct as any).category.name.toLowerCase().includes('saree')) ||
              activeProduct.title?.toLowerCase().includes('saree')
            }
          />

          {/* Main Action Buttons */}
          <div className="flex items-center space-x-2.5 sm:space-x-4 pt-1 sm:pt-2">
            <button
              onClick={handleAddToCart}
              disabled={isAdding || isOutOfStock}
              className={`flex-1 font-extrabold text-xs sm:text-sm py-3.5 sm:py-4 rounded-xl sm:rounded-2xl shadow-xl flex items-center justify-center space-x-1.5 sm:space-x-2 transition-all uppercase tracking-wider ${
                isOutOfStock
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  : isAdding
                  ? 'bg-emerald-600 text-white'
                  : 'bg-brand-crimson hover:bg-brand-crimson-dark text-white'
              }`}
            >
              {isOutOfStock ? (
                <span>OUT OF STOCK</span>
              ) : isAdding ? (
                <>
                  <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>ADDED TO BAG</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>ADD TO BAG</span>
                </>
              )}
            </button>

            <button
              onClick={handleWishlistToggle}
              className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border transition-all shadow-sm focus:outline-none flex items-center justify-center ${
                isWishlisted
                  ? 'bg-brand-crimson text-white border-brand-crimson'
                  : 'bg-white text-slate-700 border-gray-300 hover:border-brand-crimson hover:text-brand-crimson'
              }`}
              aria-label="Wishlist button"
            >
              <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isWishlisted ? 'fill-white' : ''}`} />
            </button>
          </div>

          {/* Delivery Pincode Checker */}
          <PincodeChecker />

          {/* Product Accordion Specs & Details */}
          <ProductAccordion product={activeProduct} />
        </div>
      </div>

      {/* Customer Ratings & Reviews Section */}
      <ReviewsSection productId={targetProductId} productTitle={activeProduct.title} />

      {/* Similar Recommended Products */}
      <SimilarProducts
        categoryId={
          typeof activeProduct.categoryId === 'string'
            ? activeProduct.categoryId
            : (activeProduct.categoryId as any)?._id || (activeProduct.categoryId as any)?.slug
        }
        currentProductId={activeProduct.id}
      />
    </div>
  );
}

export default ProductDetailsPage;
