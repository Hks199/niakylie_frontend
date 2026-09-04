import { CartItemList } from '../components/cart/CartItemList';
import { CouponSection } from '../components/cart/CouponSection';
import { OrderSummaryCard } from '../components/cart/OrderSummaryCard';
import { EmptyCart } from '../components/cart/EmptyCart';
import { useCartStore } from '../store/useCartStore';

export function CartPage() {
  const { cartItems, cartTotals, appliedCoupon } = useCartStore();

  const handleCheckout = () => {
    window.location.href = '/checkout';
  };

  return (
    <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 py-4 sm:py-8 animate-in fade-in duration-300">
      <h1 className="text-lg sm:text-3xl font-extrabold text-brand-slate-dark font-display mb-4 sm:mb-6">
        Shopping Bag ({cartItems.length} Items)
      </h1>

      {cartItems.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-8 items-start">
          {/* Left Column: Item List & Coupon (7 cols) */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6">
            <CartItemList items={cartItems} />
            <CouponSection />
          </div>

          {/* Right Column: Order Summary (5 cols) */}
          <div className="lg:col-span-5 sticky top-24">
            <OrderSummaryCard
              totals={cartTotals}
              appliedCoupon={appliedCoupon}
              onProceedToCheckout={handleCheckout}
            />
          </div>
        </div>
      ) : (
        <EmptyCart />
      )}
    </div>
  );
}

export default CartPage;
