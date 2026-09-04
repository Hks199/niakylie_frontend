import { useState, useEffect } from 'react';
import { Zap, Sparkles, CheckCircle2, Save, Loader2, RefreshCw } from 'lucide-react';
import { paymentsApi, OnlinePaymentDiscountConfig } from '../../api/payments';

export function AdminOnlinePaymentDiscountCard() {
  const [config, setConfig] = useState<OnlinePaymentDiscountConfig>({
    isEnabled: true,
    discountType: 'PERCENTAGE',
    discountValue: 5,
    minOrderAmount: 0,
    maxDiscountCap: 500,
    badgeText: 'EXTRA 5% OFF ON ONLINE PAYMENTS',
    description: 'Pay via UPI or Cards to get extra instant discount',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchConfig = async () => {
    setIsLoading(true);
    try {
      const res = await paymentsApi.getAdminOnlineDiscountConfig();
      if (res) setConfig(res);
    } catch (err) {
      console.error('Failed to fetch online discount config', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const payload: Partial<OnlinePaymentDiscountConfig> = {
        isEnabled: Boolean(config.isEnabled),
        discountType: config.discountType,
        discountValue: Number(config.discountValue),
        minOrderAmount: Number(config.minOrderAmount),
        maxDiscountCap: Number(config.maxDiscountCap),
        badgeText: config.badgeText,
        description: config.description,
      };
      const updated = await paymentsApi.updateOnlineDiscountConfig(payload);
      if (updated) setConfig(updated);
      setSuccessMsg('Online Payment Extra Discount configuration saved successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to save online discount settings.';
      setErrorMsg(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-700/60 space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-700/60 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
            <Zap className="w-6 h-6 fill-current" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-black text-white font-display">
                Online Payment Extra Discount Settings
              </h3>
              <span className="text-[10px] font-extrabold bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full uppercase">
                AUTOMATIC CHECKOUT PROMO
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Offer instant extra discount (% or Flat ₹) to shoppers who choose online payment options (UPI, Cards, NetBanking).
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchConfig}
          disabled={isLoading}
          className="p-2 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 transition-colors"
          title="Refresh Settings"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {successMsg && (
        <div className="bg-emerald-500/20 border border-emerald-500/40 rounded-2xl p-3 flex items-center space-x-2 text-emerald-300 text-xs font-bold animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-500/20 border border-rose-500/40 rounded-2xl p-3 text-xs font-bold text-rose-300">
          {errorMsg}
        </div>
      )}

      {isLoading ? (
        <div className="py-8 flex items-center justify-center space-x-2 text-xs text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
          <span>Loading discount settings...</span>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          {/* Status Switch & Discount Type */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3.5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">Enable Extra Discount</p>
                <p className="text-[10px] text-slate-400">Toggle status on checkout</p>
              </div>
              <button
                type="button"
                onClick={() => setConfig({ ...config, isEnabled: !config.isEnabled })}
                className={`w-12 h-6 rounded-full p-1 transition-colors ${
                  config.isEnabled ? 'bg-emerald-500' : 'bg-slate-600'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    config.isEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3.5 space-y-1">
              <label className="block text-[10px] font-extrabold uppercase text-slate-400">
                Discount Calculation Type
              </label>
              <select
                value={config.discountType}
                onChange={(e) => {
                  const newType = e.target.value as 'PERCENTAGE' | 'FLAT';
                  const newBadge = newType === 'PERCENTAGE'
                    ? `EXTRA ${config.discountValue}% OFF ON ONLINE PAYMENTS`
                    : `EXTRA ₹${config.discountValue} OFF ON ONLINE PAYMENTS`;
                  setConfig({ ...config, discountType: newType, badgeText: newBadge });
                }}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-emerald-400 outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="PERCENTAGE">PERCENTAGE (% OFF)</option>
                <option value="FLAT">FLAT AMOUNT (₹ OFF)</option>
              </select>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3.5 space-y-1">
              <label className="block text-[10px] font-extrabold uppercase text-slate-400">
                {config.discountType === 'PERCENTAGE' ? 'Discount Percentage (%)' : 'Flat Discount (₹)'}
              </label>
              <input
                type="number"
                min="0"
                required
                value={config.discountValue}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  const newBadge = config.discountType === 'PERCENTAGE'
                    ? `EXTRA ${val}% OFF ON ONLINE PAYMENTS`
                    : `EXTRA ₹${val} OFF ON ONLINE PAYMENTS`;
                  setConfig({ ...config, discountValue: val, badgeText: newBadge });
                }}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-black text-amber-300 outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Caps & Requirements */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3.5 space-y-1">
              <label className="block text-[10px] font-extrabold uppercase text-slate-400">
                Minimum Order Subtotal (₹)
              </label>
              <input
                type="number"
                min="0"
                value={config.minOrderAmount}
                onChange={(e) => setConfig({ ...config, minOrderAmount: Number(e.target.value) })}
                placeholder="e.g. 0 or 500"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-white outline-none focus:border-emerald-500"
              />
            </div>

            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3.5 space-y-1">
              <label className="block text-[10px] font-extrabold uppercase text-slate-400">
                Maximum Discount Cap (₹)
              </label>
              <input
                type="number"
                min="0"
                value={config.maxDiscountCap}
                onChange={(e) => setConfig({ ...config, maxDiscountCap: Number(e.target.value) })}
                placeholder="e.g. 500"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-white outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Badge & Description */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3.5 space-y-1">
              <label className="block text-[10px] font-extrabold uppercase text-slate-400">
                Checkout Badge Heading
              </label>
              <input
                type="text"
                value={config.badgeText}
                onChange={(e) => setConfig({ ...config, badgeText: e.target.value })}
                placeholder="e.g. EXTRA 5% OFF ON ONLINE PAYMENTS"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-white outline-none focus:border-emerald-500"
              />
            </div>

            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3.5 space-y-1">
              <label className="block text-[10px] font-extrabold uppercase text-slate-400">
                Checkout Promo Subtitle
              </label>
              <input
                type="text"
                value={config.description}
                onChange={(e) => setConfig({ ...config, description: e.target.value })}
                placeholder="e.g. Pay via UPI or Cards to get extra instant discount"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-200 outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-700/60">
            <div className="flex items-center space-x-1.5 text-[11px] text-slate-400">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Changes apply instantly to user checkout calculations.</span>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-extrabold px-5 py-2.5 rounded-2xl shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Settings...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Discount Settings</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
export default AdminOnlinePaymentDiscountCard;
