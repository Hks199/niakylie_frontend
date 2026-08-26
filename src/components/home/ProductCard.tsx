import { useState } from 'react';
import { Heart, ShoppingBag, Star, Check } from 'lucide-react';
import { Product } from '../../types';
import { useCartStore } from '../../store/useCartStore';
import { useWishlistStore } from '../../store/useWishlistStore';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [isAdded, setIsAdded] = useState(false);
  const { addToCart } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();

  const isWishlisted = isInWishlist(product.id || product._id || '');

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const variantId = product.variants?.[0]?.id || product.variants?.[0]?._id;
    await addToCart({
      productId: product.id || product._id || '',
      variantId,
      quantity: 1,
    });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleWishlist(product.id || product._id || '');
  };

  const originalPrice = product.originalPrice || Math.round(product.price * 2);
  const discount = product.discountPercentage || Math.round(((originalPrice - product.price) / originalPrice) * 100);

  return (
    <div className="group relative bg-white rounded-2xl border border-gray-100 shadow-card hover:shadow-hover transition-all duration-300 overflow-hidden flex flex-col justify-between">
      {/* Product Image Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-100">
        <a href={`/product/${product.slug}`}>
          <img
            src={product.thumbnail || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80'}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
          />
        </a>

        {/* Discount Badge */}
        {discount > 0 && (
          <span className="absolute top-2.5 left-2.5 bg-brand-crimson text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-sm">
            {discount}% OFF
          </span>
        )}

        {/* Star Rating Badge */}
        {product.rating && (
          <div className="absolute bottom-2.5 left-2.5 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-full shadow-sm flex items-center space-x-1 text-[11px] font-bold text-slate-800">
            <span>{product.rating}</span>
            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
            {product.reviewCount && <span className="text-[9px] text-slate-400">({product.reviewCount})</span>}
          </div>
        )}

        {/* Wishlist Heart Button */}
        <button
          onClick={handleWishlistToggle}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition-all shadow-sm focus:outline-none ${
            isWishlisted
              ? 'bg-brand-crimson text-white scale-110'
              : 'bg-white/80 text-slate-600 hover:text-brand-crimson hover:bg-white'
          }`}
          aria-label="Toggle Wishlist"
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-white' : ''}`} />
        </button>

        {/* Hover Slide Quick Add To Bag Button */}
        <div className="absolute inset-x-2 bottom-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            onClick={handleQuickAdd}
            className={`w-full text-xs font-extrabold py-2.5 rounded-xl shadow-lg flex items-center justify-center space-x-1.5 transition-all uppercase tracking-wider ${
              isAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-brand-crimson hover:bg-brand-crimson-dark text-white'
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-4 h-4" />
                <span>ADDED TO BAG</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span>QUICK ADD TO BAG</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Product Information */}
      <div className="p-3.5 space-y-1">
        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
          {product.brand || 'NiaKylie Signature'}
        </span>

        <a href={`/product/${product.slug}`} className="block">
          <h4 className="text-xs font-bold text-brand-slate-dark line-clamp-1 group-hover:text-brand-crimson transition-colors">
            {product.title}
          </h4>
        </a>

        {/* Pricing */}
        <div className="flex items-center space-x-2 pt-1">
          <span className="text-sm font-extrabold text-brand-slate-dark">
            ₹{product.price.toLocaleString('en-IN')}
          </span>
          {originalPrice > product.price && (
            <span className="text-xs text-slate-400 line-through">
              ₹{originalPrice.toLocaleString('en-IN')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
