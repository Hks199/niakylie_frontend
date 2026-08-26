import { useState } from 'react';
import { Truck, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { shippingApi, PincodeCheckResponse } from '../../api/shipping';

export function PincodeChecker() {
  const [pincode, setPincode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PincodeCheckResponse | null>(null);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pincode || pincode.length !== 6) return;

    setLoading(true);
    try {
      const res = await shippingApi.checkPincode(pincode);
      setResult(res);
    } catch (err) {
      setResult({
        deliverable: false,
        pincode,
        estimatedDays: 0,
        deliveryDate: '',
        codAvailable: false,
        expressAvailable: false,
        message: 'Could not check pincode serviceability',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 border border-gray-200/70 rounded-2xl p-4 space-y-3">
      <div className="flex items-center space-x-2 text-xs font-extrabold text-brand-slate-dark uppercase tracking-wider">
        <Truck className="w-4 h-4 text-brand-crimson" />
        <span>DELIVERY OPTIONS & PINCODE CHECK</span>
      </div>

      <form onSubmit={handleCheck} className="flex items-center space-x-2">
        <div className="relative flex-1">
          <input
            type="text"
            maxLength={6}
            value={pincode}
            onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
            placeholder="Enter 6-Digit Delivery Pincode"
            className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-brand-crimson uppercase"
          />
        </div>
        <button
          type="submit"
          disabled={loading || pincode.length !== 6}
          className="bg-brand-slate-dark hover:bg-brand-crimson text-white font-extrabold text-xs px-5 py-2 rounded-xl transition-all disabled:opacity-50 flex items-center space-x-1"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>CHECK</span>}
        </button>
      </form>

      {/* Result Display */}
      {result && (
        <div className="pt-2 border-t border-gray-200/60 text-xs space-y-1.5 animate-in fade-in duration-200">
          {result.deliverable ? (
            <>
              <div className="flex items-center space-x-1.5 text-emerald-700 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Get it by <strong>{result.deliveryDate}</strong></span>
              </div>
              <div className="flex items-center space-x-3 text-slate-500 font-semibold pl-5">
                <span>✓ Pay on Delivery Available</span>
                <span>✓ 14-Day Free Easy Return</span>
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-1.5 text-rose-600 font-bold">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{result.message || 'Delivery unavailable for this Pincode'}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PincodeChecker;
