import { useState, useEffect } from 'react';
import { Tag, CheckCircle2, X, Sparkles, Loader2, Copy, Check } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { apiClient } from '../../api/client';

const FALLBACK_PROMO_PILLS = [
  { code: 'FLAT100', desc: 'Flat ₹100 Off on All Products' },
  { code: 'FESTIVE50', desc: '50% OFF Festive Discount' },
  { code: 'WELCOME10', desc: 'Flat ₹500 Off First Order' },
  { code: 'ROYAL1000', desc: '₹1,000 Off Orders Above ₹4,999' },
];

export function CouponSection() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeCoupons, setActiveCoupons] = useState<any[]>([]);

  const { appliedCoupon, applyCoupon, removeCoupon } = useCartStore();

  useEffect(() => {
    let isMounted = true;
    apiClient
      .get('/coupons/active')
      .then((res: any) => {
        if (!isMounted) return;
        const list = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.coupons)
          ? res.coupons
          : [];
        if (list.length > 0) {
          setActiveCoupons(list);
        }
      })
      .catch((err) => console.log('Coupons fetch offline, using defaults:', err));
    return () => {
      isMounted = false;
    };
  }, []);

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

  const handleCopy = (couponCode: string) => {
    navigator.clipboard.writeText(couponCode);
    setCopiedCode(couponCode);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const displayedPills =
    activeCoupons.length > 0
      ? activeCoupons.map((c) => ({
          code: c.code,
          desc:
            c.title ||
            (c.type === 'FLAT'
              ? `Flat ₹${c.value} Off`
              : `${c.value}% Off`),
        }))
      : FALLBACK_PROMO_PILLS;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 space-y-3 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs font-extrabold text-brand-slate-dark uppercase tracking-wider">
          <Tag className="w-4 h-4 text-brand-crimson" />
          <span>APPLY COUPON / PROMO CODE</span>
        </div>
        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          SAVINGS INSIDE
        </span>
      </div>

      {/* Applied Coupon Display */}
      {appliedCoupon ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <div>
              <span className="text-xs font-extrabold text-emerald-900 uppercase">
                '{appliedCoupon}' APPLIED
              </span>
              <p className="text-[10px] text-emerald-700">Coupon savings included in total price!</p>
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
              placeholder="ENTER PROMO CODE (e.g. FLAT100)"
              className="flex-1 bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-mono font-bold uppercase outline-none focus:border-brand-crimson focus:bg-white"
            />
            <button
              type="submit"
              disabled={loading || !code}
              className="bg-brand-crimson hover:bg-brand-crimson-dark text-white font-extrabold text-xs px-5 py-2 rounded-xl transition-all disabled:opacity-50 flex items-center space-x-1 shadow-sm"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>APPLY</span>}
            </button>
          </form>

          {errorMsg && <p className="text-[11px] text-rose-600 font-bold">{errorMsg}</p>}

          {/* Quick Coupon Suggestions */}
          <div className="space-y-2 pt-1 border-t border-gray-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Available Promo Codes:</span>
            </span>

            <div className="space-y-1.5">
              {displayedPills.map((p) => {
                const isCopied = copiedCode === p.code;
                return (
                  <div
                    key={p.code}
                    className="flex items-center justify-between bg-slate-50 border border-gray-100 p-2 rounded-xl hover:border-brand-crimson/30 transition-colors"
                  >
                    <div className="flex items-center space-x-2 overflow-hidden">
                      <span className="text-[11px] font-mono font-black bg-rose-50 text-brand-crimson px-2 py-0.5 rounded-lg border border-rose-200 flex-shrink-0">
                        {p.code}
                      </span>
                      <span className="text-[11px] text-slate-600 font-medium truncate">
                        {p.desc}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => handleCopy(p.code)}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
                        title="Copy Code"
                      >
                        {isCopied ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApply(p.code)}
                        className="text-[10px] font-extrabold bg-brand-crimson hover:bg-brand-crimson-dark text-white px-2.5 py-1 rounded-lg transition-colors shadow-xs uppercase tracking-wider"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default CouponSection;
