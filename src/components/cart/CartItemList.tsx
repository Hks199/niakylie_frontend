import { Trash2, Heart } from 'lucide-react';
import { CartItem } from '../../types';
import { useCartStore } from '../../store/useCartStore';

interface CartItemListProps {
  items: CartItem[];
}

export function CartItemList({ items }: CartItemListProps) {
  const { updateQuantity, removeItem, moveToWishlist } = useCartStore();

  if (!items || items.length === 0) return null;

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const product: any = typeof item.productId === 'object' ? item.productId : item.product || {};
        const variant: any = typeof item.variantId === 'object' ? item.variantId : item.variant || {};

        const title = product.title || 'Ethnic Couture Garment';
        const rawBrand = product.brand;
        const brand = typeof rawBrand === 'object' && rawBrand !== null ? (rawBrand as any).name : (rawBrand || 'NiaKylie Signature');
        const image = product.thumbnail || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=300&q=80';
        const size = variant.size || 'M';
        const color = variant.color || 'Crimson Red';
        const originalPrice = item.originalPrice || Math.round(item.price * 2);
        const discount = item.discount || Math.round(((originalPrice - item.price) / originalPrice) * 100);

        const productIdStr =
          typeof item.productId === 'string'
            ? item.productId
            : item.productId?.id || item.productId?._id || item.product?.id || item.product?._id || '';

        return (
          <div
            key={item.id || item._id}
            className="flex items-start space-x-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm relative group"
          >
            {/* Thumbnail */}
            <div className="w-20 h-24 sm:w-24 sm:h-28 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-gray-100">
              <img src={image} alt={title} className="w-full h-full object-cover" />
            </div>

            {/* Product & Variant Details */}
            <div className="flex-1 min-w-0 space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                {brand}
              </span>

              <h4 className="text-xs sm:text-sm font-extrabold text-brand-slate-dark truncate">
                {title}
              </h4>

              {/* Size & Color Pills */}
              <div className="flex items-center space-x-2 text-[11px] font-semibold text-slate-500 pt-0.5">
                <span className="bg-slate-100 px-2 py-0.5 rounded-md">Size: {size}</span>
                <span className="bg-slate-100 px-2 py-0.5 rounded-md">Color: {color}</span>
              </div>

              {/* Price Breakdown */}
              <div className="flex items-baseline space-x-2 pt-1">
                <span className="text-sm font-extrabold text-brand-slate-dark">
                  ₹{item.price.toLocaleString('en-IN')}
                </span>
                {originalPrice > item.price && (
                  <span className="text-xs text-slate-400 line-through">
                    ₹{originalPrice.toLocaleString('en-IN')}
                  </span>
                )}
                {discount > 0 && (
                  <span className="text-[10px] font-extrabold text-brand-crimson">
                    {discount}% OFF
                  </span>
                )}
              </div>

              {/* Actions & Quantity Dropdown */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-1 text-xs">
                  <span className="font-bold text-slate-500">Qty:</span>
                  <select
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.id || item._id || '', parseInt(e.target.value, 10))}
                    className="bg-slate-50 border border-gray-200 rounded-lg px-2 py-1 font-bold text-brand-slate-dark outline-none cursor-pointer"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((qty) => (
                      <option key={qty} value={qty}>
                        {qty}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Move to Wishlist */}
                <button
                  onClick={() => moveToWishlist(item.id || item._id || '', productIdStr)}
                  className="inline-flex items-center space-x-1 text-xs font-bold text-slate-500 hover:text-brand-crimson transition-colors"
                >
                  <Heart className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Move to Wishlist</span>
                </button>

                {/* Remove Trash Button */}
                <button
                  onClick={() => removeItem(item.id || item._id || '')}
                  className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                  aria-label="Remove Item"
                  title="Remove from bag"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default CartItemList;
