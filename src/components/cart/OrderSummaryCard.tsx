import { ShieldCheck, Truck, RotateCcw, ArrowRight } from 'lucide-react';
import { CartTotals } from '../../types';

interface OrderSummaryCardProps {
  totals: CartTotals;
  appliedCoupon?: string | null;
  onProceedToCheckout?: () => void;
}

export function OrderSummaryCard({ totals, appliedCoupon, onProceedToCheckout }: OrderSummaryCardProps) {
  const { subtotal, discount, couponDiscount, shippingFee, tax, total } = totals;

  const totalMRP = subtotal + discount;
  const isFreeShipping = shippingFee === 0 || subtotal >= 999;

  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-6 space-y-6 shadow-sm">
      <h3 className="font-extrabold text-xs uppercase tracking-wider text-brand-slate-dark border-b border-gray-100 pb-3">
        PRICE DETAILS & ORDER SUMMARY
      </h3>

      {/* Price Lines */}
      <div className="space-y-3 text-xs">
        <div className="flex items-center justify-between text-slate-600">
          <span>Total MRP</span>
          <span>₹{totalMRP.toLocaleString('en-IN')}</span>
        </div>

        {discount > 0 && (
          <div className="flex items-center justify-between text-emerald-600 font-bold">
            <span>Discount on MRP</span>
            <span>-₹{discount.toLocaleString('en-IN')}</span>
          </div>
        )}

        {appliedCoupon && couponDiscount > 0 && (
          <div className="flex items-center justify-between text-emerald-600 font-bold">
            <span>Coupon Discount ({appliedCoupon})</span>
            <span>-₹{couponDiscount.toLocaleString('en-IN')}</span>
          </div>
        )}

        <div className="flex items-center justify-between text-slate-600">
          <span>Convenience / Shipping Fee</span>
          {isFreeShipping ? (
            <span className="text-emerald-600 font-bold uppercase">FREE</span>
          ) : (
            <span>₹{shippingFee.toLocaleString('en-IN')}</span>
          )}
        </div>

        {tax > 0 && (
          <div className="flex items-center justify-between text-slate-500">
            <span>Estimated Tax (GST)</span>
            <span>₹{tax.toLocaleString('en-IN')}</span>
          </div>
        )}

        <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-base font-extrabold text-brand-slate-dark">
          <span>Total Amount</span>
          <span className="text-brand-crimson">₹{total.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Primary Checkout CTA */}
      {onProceedToCheckout && (
        <button
          onClick={onProceedToCheckout}
          className="w-full bg-brand-crimson hover:bg-brand-crimson-dark text-white font-extrabold text-xs py-4 rounded-2xl shadow-xl flex items-center justify-center space-x-2 transition-all uppercase tracking-wider group"
        >
          <span>PROCEED TO CHECKOUT</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      )}

      {/* Trust & Guarantee Badges */}
      <div className="pt-2 border-t border-gray-100 grid grid-cols-3 gap-2 text-center text-[10px] text-slate-500 font-semibold">
        <div className="flex flex-col items-center space-y-1">
          <ShieldCheck className="w-5 h-5 text-brand-crimson" />
          <span>100% Genuine</span>
        </div>
        <div className="flex flex-col items-center space-y-1">
          <Truck className="w-5 h-5 text-brand-crimson" />
          <span>Safe Delivery</span>
        </div>
        <div className="flex flex-col items-center space-y-1">
          <RotateCcw className="w-5 h-5 text-brand-crimson" />
          <span>14 Days Return</span>
        </div>
      </div>
    </div>
  );
}

export default OrderSummaryCard;
