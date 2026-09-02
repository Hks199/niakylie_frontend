import { ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { CartTotals } from '../../types';
import { CouponSection } from '../cart/CouponSection';

interface CheckoutSidebarProps {
  totals: CartTotals;
  appliedCoupon: string | null;
  shippingType: 'standard' | 'express';
}

export function CheckoutSidebar({ totals, appliedCoupon, shippingType }: CheckoutSidebarProps) {
  const { subtotal, discount, couponDiscount, tax } = totals;
  const shippingFee = shippingType === 'express' ? 149 : 0;
  const totalMRP = subtotal + discount;
  const grandTotal = Math.max(0, subtotal - couponDiscount + shippingFee);

  return (
    <div className="space-y-4 sticky top-24">
      {/* Coupon Application Panel */}
      <CouponSection />

      {/* Price Details Card */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-5">
        <h3 className="font-extrabold text-xs uppercase tracking-wider text-brand-slate-dark border-b border-gray-100 pb-3">
          PRICE DETAILS
        </h3>

        <div className="space-y-3 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Total MRP</span>
            <span>₹{totalMRP.toLocaleString('en-IN')}</span>
          </div>

          {discount > 0 && (
            <div className="flex justify-between text-emerald-600 font-bold">
              <span>Discount on MRP</span>
              <span>-₹{discount.toLocaleString('en-IN')}</span>
            </div>
          )}

          {appliedCoupon && couponDiscount > 0 && (
            <div className="flex justify-between text-emerald-600 font-bold">
              <span>Coupon ({appliedCoupon})</span>
              <span>-₹{couponDiscount.toLocaleString('en-IN')}</span>
            </div>
          )}

          <div className="flex justify-between text-slate-600">
            <span>Delivery Fee</span>
            {shippingFee === 0 ? (
              <span className="font-bold text-emerald-600">FREE</span>
            ) : (
              <span>₹{shippingFee}</span>
            )}
          </div>

          {tax > 0 && (
            <div className="flex justify-between text-slate-500">
              <span>Estimated Tax</span>
              <span>₹{tax.toLocaleString('en-IN')}</span>
            </div>
          )}

          <div className="pt-3 border-t border-gray-100 flex justify-between text-base font-extrabold text-brand-slate-dark">
            <span>Total Payable</span>
            <span className="text-brand-crimson">₹{grandTotal.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Trust Badges */}
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
            <span>7 Days Return</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutSidebar;
