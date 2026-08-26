import { X, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { CartItemList } from '../cart/CartItemList';
import { CouponSection } from '../cart/CouponSection';
import { OrderSummaryCard } from '../cart/OrderSummaryCard';
import { EmptyCart } from '../cart/EmptyCart';

export function CartDrawer() {
  const { isCartOpen, setIsCartOpen, cartItems, cartTotals, appliedCoupon } = useCartStore();

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    setIsCartOpen(false);
    window.location.href = '/checkout';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Overlay Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Slide-Over Drawer Container */}
      <div className="fixed inset-y-0 right-0 max-w-md w-full bg-slate-50 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300 z-50">
        {/* Header */}
        <div className="p-4 bg-brand-slate-dark text-white flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5 text-brand-crimson" />
            <h3 className="font-extrabold text-sm uppercase tracking-wider">
              Shopping Bag ({cartItems.length})
            </h3>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-1 rounded-full text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {cartItems.length > 0 ? (
            <>
              <CartItemList items={cartItems} />
              <CouponSection />
              <OrderSummaryCard totals={cartTotals} appliedCoupon={appliedCoupon} />
            </>
          ) : (
            <EmptyCart />
          )}
        </div>

        {/* Sticky Checkout CTA Footer */}
        {cartItems.length > 0 && (
          <div className="p-4 bg-white border-t border-gray-200 flex items-center justify-between shadow-lg">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Payable:</span>
              <div className="text-lg font-extrabold text-brand-slate-dark">
                ₹{cartTotals.total.toLocaleString('en-IN')}
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="bg-brand-crimson hover:bg-brand-crimson-dark text-white font-extrabold text-xs px-6 py-3.5 rounded-xl shadow-md flex items-center space-x-1.5 uppercase tracking-wider group"
            >
              <span>CHECKOUT</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CartDrawer;
