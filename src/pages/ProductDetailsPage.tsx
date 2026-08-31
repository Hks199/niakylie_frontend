import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ShoppingBag, Heart, Star, Share2, Check, ChevronRight } from 'lucide-react';
import { ProductGallery } from '../components/pdp/ProductGallery';
import { VariantSelector } from '../components/pdp/VariantSelector';
import { PincodeChecker } from '../components/pdp/PincodeChecker';
import { ProductAccordion } from '../components/pdp/ProductAccordion';
import { ReviewsSection } from '../components/pdp/ReviewsSection';
import { SimilarProducts } from '../components/pdp/SimilarProducts';
import { productsApi } from '../api/products';
import { useCartStore, useWishlistStore } from '../store';
import { ProductVariant } from '../types';
import { useCategories } from '../hooks/useCategories';
import { buildBreadcrumbTrail } from '../utils/breadcrumb';

interface ProductDetailsPageProps {
  slug?: string;
}

export function ProductDetailsPage({ slug = 'crimson-red-banarasi-silk-saree' }: ProductDetailsPageProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(undefined);
  const { addToCart } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const { allCategories } = useCategories();

  const { data: product } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => productsApi.getProductBySlug(slug),
  });

  // Fallback product if loading or API offline
  const activeProduct = product || {
    id: 'p1',
    title: 'Crimson Red Banarasi Silk Saree',
    slug: 'crimson-red-banarasi-silk-saree',
    brand: 'NiaKylie Signature',
    description:
      'Immerse yourself in timeless Indian royalty with this handcrafted Banarasi silk drapery featuring soft Zari floral brocade weaving across the body.',
    price: 2999,
    originalPrice: 5999,
    discountPercentage: 50,
    rating: 4.8,
    reviewCount: 142,
    thumbnail: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=1000&q=80',
    ],
    variants: [
      { id: 'v1-s', sku: 'BS-RED-S', size: 'Free Size', color: 'Crimson Red', colorHex: '#E63946', price: 2999, stock: 10 },
      { id: 'v1-g', sku: 'BS-GLD-S', size: 'Free Size', color: 'Royal Gold', colorHex: '#D4AF37', price: 2999, stock: 6 },
    ],
    categoryId: 'sarees',
  };

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-in fade-in duration-300">
      {/* Dynamic Product Breadcrumb Trail */}
      <nav className="flex items-center space-x-1.5 text-xs text-slate-500 mb-6 overflow-x-auto no-scrollbar py-2 border-b border-gray-100">
        {breadcrumbs.map((crumb, idx) => {
          const isLast = idx === breadcrumbs.length - 1;
          return (
            <div key={idx} className="flex items-center space-x-1.5 flex-shrink-0">
              {isLast ? (
                <span className="font-bold text-brand-slate-dark truncate max-w-xs">{crumb.label}</span>
              ) : (
                <>
                  <a href={crumb.href} className="hover:text-brand-crimson transition-colors font-medium text-slate-600">
                    {crumb.label}
                  </a>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
                </>
              )}
            </div>
          );
        })}
      </nav>

      {/* 2-Column Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column: Product Gallery (7 cols) */}
        <div className="lg:col-span-7">
          <ProductGallery images={galleryImages} title={activeProduct.title} />
        </div>

        {/* Right Column: Product Info & Actions (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Brand & Header Title */}
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-extrabold text-brand-crimson tracking-widest">
                {brandName}
              </span>
              <button
                onClick={() => navigator.clipboard.writeText(window.location.href)}
                className="p-2 rounded-full text-slate-400 hover:text-brand-slate-dark hover:bg-slate-100 transition-colors"
                aria-label="Share product"
                title="Copy product link"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-slate-dark font-display leading-tight mt-1">
              {activeProduct.title}
            </h1>

            {/* Star Rating Badge */}
            <div className="flex items-center space-x-2 mt-3">
              <div className="bg-slate-900 text-white font-extrabold text-xs px-2.5 py-1 rounded-md flex items-center space-x-1">
                <span>{activeProduct.rating || 4.8}</span>
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              </div>
              <span className="text-xs font-bold text-slate-500">
                | {activeProduct.reviewCount || 142} Ratings & Reviews
              </span>
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-gray-100 space-y-1">
            <div className="flex items-baseline space-x-3">
              <span className="text-3xl font-extrabold text-brand-slate-dark font-display">
                ₹{price.toLocaleString('en-IN')}
              </span>
              {originalPrice > price && (
                <span className="text-base text-slate-400 line-through">
                  MRP ₹{originalPrice.toLocaleString('en-IN')}
                </span>
              )}
              {discount > 0 && (
                <span className="text-xs font-extrabold text-brand-crimson bg-brand-crimson/10 px-2.5 py-1 rounded-full uppercase">
                  ({discount}% OFF)
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 font-semibold">Inclusive of all taxes</p>
          </div>

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
          <div className="flex items-center space-x-4 pt-2">
            <button
              onClick={handleAddToCart}
              disabled={isAdding || isOutOfStock}
              className={`flex-1 font-extrabold text-xs sm:text-sm py-4 rounded-2xl shadow-xl flex items-center justify-center space-x-2 transition-all uppercase tracking-wider ${
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
                  <Check className="w-5 h-5" />
                  <span>ADDED TO BAG</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-5 h-5" />
                  <span>ADD TO BAG</span>
                </>
              )}
            </button>

            <button
              onClick={handleWishlistToggle}
              className={`p-4 rounded-2xl border transition-all shadow-sm focus:outline-none flex items-center justify-center ${
                isWishlisted
                  ? 'bg-brand-crimson text-white border-brand-crimson'
                  : 'bg-white text-slate-700 border-gray-300 hover:border-brand-crimson hover:text-brand-crimson'
              }`}
              aria-label="Wishlist button"
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-white' : ''}`} />
            </button>
          </div>

          {/* Delivery Pincode Checker */}
          <PincodeChecker />

          {/* Product Accordion Specs & Details */}
          <ProductAccordion product={activeProduct} />
        </div>
      </div>

      {/* Customer Ratings & Reviews Section */}
      <ReviewsSection productId={activeProduct.id || activeProduct._id || 'p1'} />

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
