import { useState } from 'react';
import { ProductCard } from './ProductCard';
import { Product } from '../../types';
import { Sparkles, ArrowRight } from 'lucide-react';

interface TrendingProductsCarouselProps {
  featuredProducts: Product[];
  trendingProducts: Product[];
  bestSellerProducts?: Product[];
}

export function TrendingProductsCarousel({
  featuredProducts,
  trendingProducts,
  bestSellerProducts = [],
}: TrendingProductsCarouselProps) {
  const [activeTab, setActiveTab] = useState<'featured' | 'trending' | 'bestSellers'>('featured');

  const currentProducts =
    activeTab === 'featured'
      ? featuredProducts
      : activeTab === 'trending'
      ? trendingProducts
      : bestSellerProducts.length > 0
      ? bestSellerProducts
      : featuredProducts;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Section Header with Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-gray-100 gap-4">
        <div>
          <span className="text-xs uppercase font-extrabold text-brand-crimson tracking-widest flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>CURATED FOR CELEBRATIONS</span>
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-slate-dark font-display tracking-tight mt-1">
            Trending Ethnic Couture
          </h2>
        </div>

        {/* Tabs */}
        <div className="flex items-center space-x-1 sm:space-x-2 bg-slate-100 p-1 rounded-2xl max-w-full flex-wrap justify-center sm:justify-start">
          <button
            onClick={() => setActiveTab('featured')}
            className={`px-3 sm:px-5 py-1.5 sm:py-2 text-[10.5px] sm:text-xs font-bold rounded-xl transition-all ${
              activeTab === 'featured'
                ? 'bg-brand-crimson text-white shadow-md'
                : 'text-slate-600 hover:text-brand-slate-dark'
            }`}
          >
            FEATURED EDIT
          </button>
          <button
            onClick={() => setActiveTab('trending')}
            className={`px-3 sm:px-5 py-1.5 sm:py-2 text-[10.5px] sm:text-xs font-bold rounded-xl transition-all ${
              activeTab === 'trending'
                ? 'bg-brand-crimson text-white shadow-md'
                : 'text-slate-600 hover:text-brand-slate-dark'
            }`}
          >
            TRENDING NOW
          </button>
          <button
            onClick={() => setActiveTab('bestSellers')}
            className={`px-3 sm:px-5 py-1.5 sm:py-2 text-[10.5px] sm:text-xs font-bold rounded-xl transition-all ${
              activeTab === 'bestSellers'
                ? 'bg-brand-crimson text-white shadow-md'
                : 'text-slate-600 hover:text-brand-slate-dark'
            }`}
          >
            BEST SELLERS
          </button>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {currentProducts.slice(0, 8).map((product) => (
          <ProductCard key={product.id || product._id} product={product} />
        ))}
      </div>

      {/* View All Button */}
      <div className="text-center mt-10">
        <a
          href="/products"
          className="inline-flex items-center space-x-2 bg-slate-900 hover:bg-brand-crimson text-white font-bold text-xs px-8 py-3.5 rounded-xl shadow-md transition-all uppercase tracking-wider group"
        >
          <span>VIEW FULL CATALOGUE</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </a>
      </div>
    </section>
  );
}

export default TrendingProductsCarousel;
