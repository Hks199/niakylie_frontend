import { useState } from 'react';
import { Tag, CheckCircle2, X, Sparkles, Loader2 } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';

const PROMO_PILLS = [
  { code: 'FESTIVE50', desc: '50% OFF Festive Discount' },
  { code: 'WELCOME10', desc: 'Flat ₹500 Off First Order' },
  { code: 'ROYAL1000', desc: '₹1,000 Off Orders Above ₹4,999' },
];

export function CouponSection() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { appliedCoupon, applyCoupon, removeCoupon } = useCartStore();

  const handleApply = async (couponCode: string) => {
    if (!couponCode) return;
    setLoading(true);
    setErrorMsg('');
    try {
      await applyCoupon(couponCode);
      setCode('');
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || 'Invalid or expired coupon code');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    setLoading(true);
    try {
      await removeCoupon();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 space-y-3 shadow-sm">
      <div className="flex items-center space-x-2 text-xs font-extrabold text-brand-slate-dark uppercase tracking-wider">
        <Tag className="w-4 h-4 text-brand-crimson" />
        <span>APPLY COUPON / PROMO CODE</span>
      </div>

      {/* Applied Coupon Display */}
      {appliedCoupon ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <div>
              <span className="text-xs font-extrabold text-emerald-900 uppercase">'{appliedCoupon}' Applied</span>
              <p className="text-[10px] text-emerald-700">Coupon savings included in totals!</p>
            </div>
          </div>
          <button
            onClick={handleRemove}
            disabled={loading}
            className="p-1 rounded-full text-emerald-700 hover:text-rose-600 transition-colors"
            title="Remove Coupon"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <>
          {/* Coupon Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleApply(code);
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="ENTER COUPON CODE"
              className="flex-1 bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold uppercase outline-none focus:border-brand-crimson"
            />
            <button
              type="submit"
              disabled={loading || !code}
              className="bg-brand-crimson hover:bg-brand-crimson-dark text-white font-extrabold text-xs px-5 py-2 rounded-xl transition-all disabled:opacity-50 flex items-center space-x-1"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>APPLY</span>}
            </button>
          </form>

          {errorMsg && <p className="text-[11px] text-rose-600 font-bold">{errorMsg}</p>}

          {/* Quick Coupon Suggestions */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Available Offers:</span>
            </span>

            <div className="flex flex-wrap gap-2">
              {PROMO_PILLS.map((p) => (
                <button
                  key={p.code}
                  type="button"
                  onClick={() => handleApply(p.code)}
                  className="text-[10px] font-bold bg-slate-100 hover:bg-brand-crimson hover:text-white text-slate-700 px-2.5 py-1 rounded-lg transition-colors border border-gray-200"
                >
                  {p.code}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default CouponSection;
