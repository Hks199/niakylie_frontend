import { useState } from 'react';
import { Heart, Trash2, ShoppingBag, ArrowRight, Check } from 'lucide-react';
import { useWishlistStore, useCartStore } from '../../store';
import { Product } from '../../types';
import { normalizeProduct } from '../../api/products';

export function MyWishlistPage() {
  const { wishlistItems, removeFromWishlist, isLoading } = useWishlistStore();
  const { addToCart } = useCartStore();
  const [addedMap, setAddedMap] = useState<Record<string, boolean>>({});
  const [removingMap, setRemovingMap] = useState<Record<string, boolean>>({});

  const handleMoveToCart = async (product: any) => {
    const productId = product._id || product.id || (typeof product.productId === 'object' ? product.productId._id : product.productId);
    const targetProduct: Product = typeof product.productId === 'object' ? product.productId : product;
    
    if (!productId) return;

    setAddedMap((prev) => ({ ...prev, [productId]: true }));
    
    const variantId = targetProduct?.variants?.[0]?.id || targetProduct?.variants?.[0]?._id;
    await addToCart({
      productId,
      variantId,
      quantity: 1,
    });

    setTimeout(() => {
      setAddedMap((prev) => ({ ...prev, [productId]: false }));
    }, 2000);
  };

  const handleRemove = async (productId: string) => {
    setRemovingMap((prev) => ({ ...prev, [productId]: true }));
    try {
      await removeFromWishlist(productId);
    } finally {
      setRemovingMap((prev) => ({ ...prev, [productId]: false }));
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-card space-y-6 animate-pulse">
        <div className="h-7 bg-slate-100 rounded-lg w-48 mb-6"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-slate-50 rounded-2xl p-4 h-72 flex flex-col justify-between">
              <div className="bg-slate-200 h-40 rounded-xl w-full"></div>
              <div className="h-4 bg-slate-200 rounded w-3/4 mt-3"></div>
              <div className="h-4 bg-slate-200 rounded w-1/2 mt-2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Extract array of normalized products from wishlistItems state
  const normalizedWishlist = wishlistItems.map((item: any) => normalizeProduct(item));

  return (
    <div className="bg-white border border-gray-100 rounded-xl sm:rounded-3xl p-3 sm:p-8 shadow-card space-y-4 sm:space-y-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 sm:pb-5">
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          <div className="p-2 sm:p-2.5 bg-rose-50 text-brand-crimson rounded-xl sm:rounded-2xl">
            <Heart className="w-4 h-4 sm:w-5 sm:h-5 fill-brand-crimson" />
          </div>
          <div>
            <h2 className="text-base sm:text-xl font-extrabold text-brand-slate-dark font-display">
              My Wishlist
            </h2>
            <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">
              {normalizedWishlist.length === 1
                ? '1 item saved in your collection'
                : `${normalizedWishlist.length} items saved in your collection`}
            </p>
          </div>
        </div>

        {normalizedWishlist.length > 0 && (
          <span className="bg-brand-crimson/10 text-brand-crimson font-extrabold text-[10px] sm:text-xs px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full">
            {normalizedWishlist.length} Saved
          </span>
        )}
      </div>

      {/* Empty State */}
      {normalizedWishlist.length === 0 ? (
        <div className="text-center py-12 sm:py-16 px-3 sm:px-4 space-y-4 sm:space-y-5">
          <div className="w-14 h-14 sm:w-20 sm:h-20 mx-auto bg-rose-50 rounded-full flex items-center justify-center text-brand-crimson shadow-inner">
            <Heart className="w-7 h-7 sm:w-10 sm:h-10 stroke-[1.5]" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5 sm:space-y-2">
            <h3 className="text-base sm:text-lg font-extrabold text-brand-slate-dark font-display">
              Your Wishlist is Empty
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed">
              Explore our latest ethnic wear, designer sarees, and modern fusion collections to save your favorite styles!
            </p>
          </div>
          <a
            href="/products"
            className="inline-flex items-center space-x-2 bg-brand-crimson hover:bg-brand-crimson-dark text-white font-extrabold text-[11px] sm:text-xs px-5 sm:px-6 py-2.5 sm:py-3.5 rounded-xl transition-all shadow-md uppercase tracking-wider group"
          >
            <span>DISCOVER COLLECTIONS</span>
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      ) : (
        /* Wishlist Grid */
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-6">
          {normalizedWishlist.map((product: any) => {
            const productId = product._id || product.id || product.slug;
            const title = product.title || product.name || 'NiaKylie Fashion Item';
            const firstVariant = product.variants && product.variants.length > 0 ? product.variants[0] : null;
            const image = product.thumbnail || product.images?.[0] || firstVariant?.images?.[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80';
            const price = product.offerPrice ?? product.price ?? firstVariant?.offerPrice ?? 0;
            const originalPrice = product.mrp ?? product.compareAtPrice ?? product.originalPrice ?? firstVariant?.mrp ?? price;
            const discount = product.discountPercentage ?? product.discount ?? firstVariant?.discount ?? (originalPrice > price && originalPrice > 0 ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0);
            const isAdded = addedMap[productId];
            const isRemoving = removingMap[productId];
            const brand = typeof product.brand === 'object' ? product.brand?.name : (product.brand || 'NiaKylie');
            const isOutOfStock = product.isAvailable === false || (product.stock === 0 && (!firstVariant || firstVariant.stock === 0));

            return (
              <div
                key={productId}
                className={`group relative bg-white border border-gray-100 rounded-xl sm:rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between ${
                  isRemoving ? 'opacity-50 scale-95' : ''
                }`}
              >
                {/* Product Image */}
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-100">
                  <a href={`/product/${product.slug || productId}`}>
                    <img
                      src={image}
                      alt={title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </a>

                  {/* Top Badges */}
                  <div className="absolute top-2 left-2 flex flex-col space-y-1">
                    {discount > 0 && (
                      <span className="bg-brand-crimson text-white text-[8px] sm:text-[10px] font-extrabold px-1.5 sm:px-2.5 py-0.5 rounded-md shadow-sm">
                        {discount}% OFF
                      </span>
                    )}
                    {isOutOfStock && (
                      <span className="bg-slate-900/80 backdrop-blur-md text-white text-[8px] sm:text-[9px] font-bold px-1.5 sm:px-2 py-0.5 rounded-md uppercase tracking-wider">
                        OUT OF STOCK
                      </span>
                    )}
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemove(productId)}
                    disabled={isRemoving}
                    className="absolute top-2 right-2 p-1.5 sm:p-2 bg-white/90 hover:bg-rose-50 text-slate-500 hover:text-brand-crimson rounded-full backdrop-blur-md transition-all shadow-sm focus:outline-none"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                </div>

                {/* Info Container */}
                <div className="p-2.5 sm:p-4 flex-grow flex flex-col justify-between space-y-2 sm:space-y-3">
                  <div>
                    <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      {brand}
                    </span>
                    <a href={`/product/${product.slug || productId}`} className="block">
                      <h4 className="text-[11px] sm:text-xs font-bold text-brand-slate-dark line-clamp-1 group-hover:text-brand-crimson transition-colors mt-0.5">
                        {title}
                      </h4>
                    </a>

                    {/* Price */}
                    <div className="flex items-center space-x-1.5 sm:space-x-2 mt-1 sm:mt-1.5">
                      <span className="text-xs sm:text-sm font-extrabold text-brand-slate-dark">
                        ₹{price.toLocaleString('en-IN')}
                      </span>
                      {originalPrice > price && (
                        <span className="text-[10px] sm:text-xs text-slate-400 line-through">
                          ₹{originalPrice.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <button
                    onClick={() => handleMoveToCart(product)}
                    disabled={isOutOfStock || isAdded}
                    className={`w-full text-[10px] sm:text-xs font-extrabold py-2 sm:py-2.5 rounded-lg sm:rounded-xl shadow-sm flex items-center justify-center space-x-1 sm:space-x-1.5 transition-all uppercase tracking-wider ${
                      isOutOfStock
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : isAdded
                        ? 'bg-emerald-600 text-white'
                        : 'bg-brand-crimson hover:bg-brand-crimson-dark text-white shadow-md'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span>ADDED</span>
                      </>
                    ) : isOutOfStock ? (
                      <span>OUT OF STOCK</span>
                    ) : (
                      <>
                        <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span>MOVE TO BAG</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MyWishlistPage;
