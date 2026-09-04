import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight, ShieldCheck } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';

export function CartDrawer() {
  const { isCartOpen, setIsCartOpen, cartItems, cartTotals, itemCount, updateQuantity, removeItem, isLoading } =
    useCartStore();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Slide-over Container */}
      <div className="fixed inset-y-0 right-0 max-w-full sm:max-w-md w-full bg-white shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300 z-50">
        {/* Header */}
        <div className="p-3.5 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-white flex-shrink-0">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-brand-crimson" />
            <h3 className="font-extrabold text-sm sm:text-base text-brand-slate-dark font-display">
              Shopping Bag ({itemCount})
            </h3>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-3 sm:space-y-4 no-scrollbar">
          {cartItems.length > 0 ? (
            cartItems.map((item) => {
              const product = typeof item.productId === 'object' && item.productId !== null ? item.productId : item.product;
              const variant = typeof item.variantId === 'object' && item.variantId !== null ? item.variantId : item.variant;
              const title = item.name || item.title || (product as any)?.name || (product as any)?.title || 'Fashion Garment';
              const rawImg = item.image || (variant as any)?.imageUrl || (product as any)?.thumbnail || (Array.isArray((product as any)?.images) ? (product as any)?.images[0] : (product as any)?.images) || '';
              const image = rawImg
                ? (rawImg.startsWith('http') || rawImg.startsWith('data:') ? rawImg : `http://localhost:3000${rawImg.startsWith('/') ? '' : '/'}${rawImg}`)
                : 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=300&q=80';
              const size = item.size || (variant as any)?.size || 'Free Size';
              const color = item.color || (variant as any)?.color || 'Standard';

              return (
                <div
                  key={item.id || item._id}
                  className="flex space-x-2.5 sm:space-x-3 p-2.5 sm:p-3 bg-slate-50/80 rounded-2xl border border-gray-100 hover:border-gray-200 transition-all"
                >
                  <img
                    src={image}
                    alt={title}
                    className="w-16 h-20 sm:w-20 sm:h-24 object-cover rounded-xl flex-shrink-0"
                  />

                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex items-start justify-between">
                        <h4 className="text-xs font-bold text-brand-slate-dark line-clamp-1 truncate pr-1">{title}</h4>
                        <button
                          onClick={() => removeItem(item.id || item._id || '')}
                          className="text-slate-400 hover:text-red-600 transition-colors p-1 flex-shrink-0"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <p className="text-[10.5px] sm:text-[11px] text-slate-500 mt-0.5 truncate">
                        Size: <span className="font-semibold text-slate-700">{size}</span> | Color:{' '}
                        <span className="font-semibold text-slate-700">{color}</span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      {/* Quantity Selector */}
                      <div className="flex items-center space-x-1.5 sm:space-x-2 bg-white border border-gray-200 rounded-lg px-1.5 sm:px-2 py-0.5">
                        <button
                          onClick={() =>
                            item.quantity > 1
                              ? updateQuantity(item.id || item._id || '', item.quantity - 1)
                              : removeItem(item.id || item._id || '')
                          }
                          disabled={isLoading}
                          className="text-slate-500 hover:text-brand-crimson disabled:opacity-50"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-brand-slate px-1">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id || item._id || '', item.quantity + 1)}
                          disabled={isLoading}
                          className="text-slate-500 hover:text-brand-crimson disabled:opacity-50"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <span className="text-xs font-bold text-brand-slate-dark">
                          ₹{(item.subtotal || item.price * item.quantity).toLocaleString('en-IN')}
                        </span>
                        {item.originalPrice && (
                          <span className="text-[9.5px] sm:text-[10px] text-slate-400 line-through block">
                            ₹{(item.originalPrice * item.quantity).toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 sm:py-16">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-brand-crimson/10 text-brand-crimson rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <ShoppingBag className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <h4 className="font-bold text-sm sm:text-base text-brand-slate-dark mb-1">Your Shopping Bag is empty</h4>
              <p className="text-xs text-slate-500 mb-5 sm:mb-6">
                Explore our festive sarees, kurtas & dresses to add items!
              </p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="bg-brand-crimson hover:bg-brand-crimson-dark text-white font-bold text-[11px] sm:text-xs px-5 sm:px-6 py-2.5 rounded-xl shadow-md transition-all uppercase tracking-wider"
              >
                START SHOPPING NOW
              </button>
            </div>
          )}
        </div>

        {/* Footer Checkout Summary */}
        {cartItems.length > 0 && (
          <div className="p-3.5 sm:p-5 border-t border-gray-100 bg-slate-50 space-y-2.5 sm:space-y-3 flex-shrink-0">
            <div className="space-y-1.5 text-[11px] sm:text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal MRP:</span>
                <span className="font-semibold text-slate-800">
                  ₹{(cartTotals?.subtotal || 0).toLocaleString('en-IN')}
                </span>
              </div>
              {cartTotals?.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Bag Discount:</span>
                  <span>-₹{cartTotals.discount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Estimated Shipping:</span>
                <span className="text-emerald-600 font-bold">
                  {cartTotals?.shippingFee === 0 ? 'FREE' : `₹${cartTotals?.shippingFee || 0}`}
                </span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm font-extrabold text-brand-slate-dark pt-2 border-t border-gray-200">
                <span>Total Amount:</span>
                <span className="text-brand-crimson">
                  ₹{(cartTotals?.total || cartTotals?.subtotal || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <a
              href="/checkout"
              onClick={() => setIsCartOpen(false)}
              className="w-full bg-brand-crimson hover:bg-brand-crimson-dark text-white font-bold text-[11px] sm:text-xs py-2.5 sm:py-3 rounded-xl shadow-lg flex items-center justify-center space-x-2 transition-all uppercase tracking-wider group"
            >
              <span>PROCEED TO CHECKOUT</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
            </a>

            <div className="flex items-center justify-center space-x-1.5 text-[9.5px] sm:text-[10px] text-slate-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>100% Genuine Products & Secure Checkout</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CartDrawer;
