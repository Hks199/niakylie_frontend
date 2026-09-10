import { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, RefreshCw, Save, Truck } from 'lucide-react';
import { shippingApi } from '../../api/shipping';
import { defaultShippingConfig, ShippingConfig } from '../../utils/shipping';

export function AdminShippingConfigCard() {
  const [config, setConfig] = useState<ShippingConfig>(defaultShippingConfig);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadConfig = async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await shippingApi.getAdminConfig();
      if (result) setConfig({ ...defaultShippingConfig, ...result });
    } catch (err: any) {
      const detail = err?.message || 'Shipping settings could not be loaded.';
      setError(Array.isArray(detail) ? detail.join(', ') : detail);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadConfig(); }, []);

  const saveConfig = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    setMessage('');
    setError('');
    try {
      const saved = await shippingApi.updateConfig({
        standardDeliveryFee: Math.max(0, Number(config.standardDeliveryFee) || 0),
        expressDeliveryFee: Math.max(0, Number(config.expressDeliveryFee) || 0),
        freeShippingThreshold: Math.max(0, Number(config.freeShippingThreshold) || 0),
      });
      setConfig({ ...defaultShippingConfig, ...saved });
      setMessage('Shipping fees saved. All customer carts and checkout pages now use these database values.');
    } catch (err: any) {
      const detail = err?.message || 'Shipping settings could not be saved.';
      setError(Array.isArray(detail) ? detail.join(', ') : detail);
    } finally {
      setIsSaving(false);
    }
  };

  const update = (field: keyof ShippingConfig, value: string) => {
    setConfig((current) => ({ ...current, [field]: value === '' ? 0 : Number(value) }));
  };

  return (
    <div className="bg-white border border-gray-100 rounded-xl sm:rounded-3xl p-3.5 sm:p-6 shadow-sm space-y-4">
      <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-brand-crimson/10 text-brand-crimson"><Truck className="w-5 h-5" /></div>
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-brand-slate-dark">Delivery Fee Settings</h3>
            <p className="text-[10px] sm:text-xs text-slate-500">These fees are used across customer checkout.</p>
          </div>
        </div>
        <button type="button" onClick={loadConfig} disabled={isLoading} title="Refresh settings" className="p-2 rounded-xl border border-gray-200 text-slate-500 hover:text-brand-crimson">
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {message && <p className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-[11px] font-bold text-emerald-700"><CheckCircle2 className="w-4 h-4" />{message}</p>}
      {error && <p className="rounded-xl bg-rose-50 p-3 text-[11px] font-bold text-rose-700">{error}</p>}

      {isLoading ? (
        <div className="py-6 flex items-center justify-center gap-2 text-xs text-slate-500"><Loader2 className="w-4 h-4 animate-spin" />Loading delivery settings...</div>
      ) : (
        <form onSubmit={saveConfig} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              ['standardDeliveryFee', 'Standard delivery fee', 'Applied below the free-shipping threshold'],
              ['expressDeliveryFee', 'Express delivery fee', 'Applied when Express is selected'],
              ['freeShippingThreshold', 'Free shipping threshold', 'Standard delivery is free at and above this subtotal'],
            ].map(([field, label, hint]) => (
              <label key={field} className="block rounded-xl bg-slate-50 border border-slate-100 p-3 space-y-1.5">
                <span className="block text-[10px] font-extrabold uppercase tracking-wide text-slate-500">{label} (₹)</span>
                <input type="number" min="0" required value={config[field as keyof ShippingConfig]} onChange={(e) => update(field as keyof ShippingConfig, e.target.value)} className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-bold text-brand-slate-dark outline-none focus:border-brand-crimson" />
                <span className="block text-[9px] text-slate-400">{hint}</span>
              </label>
            ))}
          </div>
          <div className="flex justify-end border-t border-gray-100 pt-3">
            <button type="submit" disabled={isSaving} className="inline-flex items-center gap-2 rounded-xl bg-brand-crimson px-4 py-2.5 text-xs font-extrabold text-white disabled:opacity-60">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isSaving ? 'Saving...' : 'Save Delivery Settings'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default AdminShippingConfigCard;
