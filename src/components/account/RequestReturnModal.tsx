import { useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, RotateCcw, Loader2, AlertCircle } from 'lucide-react';
import { ordersApi, Order, RequestReturnPayload } from '../../api/orders';
import { formatImageUrl } from '../../utils/imageUtils';

const RETURN_REASONS = [
  'Product arrived damaged',
  'Wrong item / size received',
  'Quality not as expected',
  'Size / fit issue',
  'Color different from listing',
  'Changed my mind',
  'Other',
];

interface RequestReturnModalProps {
  order: Order;
  onClose: () => void;
}

export function RequestReturnModal({ order, onClose }: RequestReturnModalProps) {
  const queryClient = useQueryClient();
  const isCod = String(order.paymentMethod || '').toUpperCase() === 'COD';

  const [reason, setReason] = useState(RETURN_REASONS[0]);
  const [notes, setNotes] = useState('');
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [refundMethod, setRefundMethod] = useState<'UPI' | 'BANK'>('UPI');
  const [upiId, setUpiId] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankIfsc, setBankIfsc] = useState('');
  const [bankAccountName, setBankAccountName] = useState('');
  const [error, setError] = useState('');

  const items = order.items || [];

  const estimatedRefund = useMemo(() => {
    return items.reduce((sum, item: any, idx) => {
      const key = `${item.productId || item.id}-${item.variantId || item.sku || idx}`;
      const qty = selected[key] || 0;
      return sum + qty * (item.price || 0);
    }, 0);
  }, [items, selected]);

  const mutation = useMutation({
    mutationFn: (payload: RequestReturnPayload) => ordersApi.requestReturn(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order-details', order.orderId || order.id] });
      queryClient.invalidateQueries({ queryKey: ['user-orders'] });
      onClose();
    },
    onError: (err: any) => {
      setError(err?.message || err?.response?.data?.message || 'Failed to submit return request');
    },
  });

  const toggleItem = (key: string, maxQty: number) => {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[key]) delete next[key];
      else next[key] = maxQty;
      return next;
    });
  };

  const setQty = (key: string, qty: number, maxQty: number) => {
    const safe = Math.max(1, Math.min(maxQty, qty));
    setSelected((prev) => ({ ...prev, [key]: safe }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const returnItems = items
      .map((item: any, idx) => {
        const key = `${item.productId || item.id}-${item.variantId || item.sku || idx}`;
        const qty = selected[key];
        if (!qty) return null;
        const productId =
          typeof item.productId === 'object'
            ? item.productId?._id || item.productId?.id
            : item.productId || item.id;
        return {
          productId: String(productId),
          variantId: item.variantId ? String(item.variantId) : undefined,
          sku: item.sku,
          quantity: qty,
        };
      })
      .filter(Boolean) as RequestReturnPayload['items'];

    if (!returnItems.length) {
      setError('Select at least one item to return');
      return;
    }

    const payload: RequestReturnPayload = {
      orderId: order.orderId || order.id,
      reason,
      notes: notes.trim() || undefined,
      items: returnItems,
    };

    if (isCod) {
      payload.refundMethod = refundMethod;
      if (refundMethod === 'UPI') {
        if (!upiId.trim()) {
          setError('Enter your UPI ID for COD refund');
          return;
        }
        payload.refundDetails = { upiId: upiId.trim() };
      } else {
        if (!bankAccountNumber.trim() || !bankIfsc.trim() || !bankAccountName.trim()) {
          setError('Enter bank account number, IFSC, and account holder name');
          return;
        }
        payload.refundDetails = {
          bankAccountNumber: bankAccountNumber.trim(),
          bankIfsc: bankIfsc.trim().toUpperCase(),
          bankAccountName: bankAccountName.trim(),
        };
      }
    }

    mutation.mutate(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl">
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 sm:px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <RotateCcw className="w-4 h-4 text-brand-crimson" />
            <div>
              <h3 className="text-sm font-extrabold text-brand-slate-dark">Request Return</h3>
              <p className="text-[10px] text-slate-400">Within 7 days of delivery · Item-level</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
          {error && (
            <div className="flex items-start space-x-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-[11px] text-rose-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Select items to return
            </p>
            {items.map((item: any, idx) => {
              const key = `${item.productId || item.id}-${item.variantId || item.sku || idx}`;
              const qty = selected[key] || 0;
              const checked = qty > 0;
              return (
                <div
                  key={key}
                  className={`flex items-start space-x-3 p-3 rounded-2xl border transition-colors ${
                    checked ? 'border-brand-crimson/40 bg-brand-crimson/5' : 'border-gray-100'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleItem(key, item.quantity || 1)}
                    className="mt-1 accent-brand-crimson"
                  />
                  <img
                    src={formatImageUrl(item.image)}
                    alt={item.name}
                    className="w-12 h-14 rounded-lg object-cover border border-gray-100 bg-slate-50"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=100&q=80';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-extrabold text-brand-slate-dark truncate">{item.name}</p>
                    <p className="text-[10px] text-slate-400">
                      ₹{(item.price || 0).toLocaleString('en-IN')} · Ordered Qty {item.quantity}
                    </p>
                    {checked && (
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="text-[10px] font-bold text-slate-500">Return qty</span>
                        <input
                          type="number"
                          min={1}
                          max={item.quantity || 1}
                          value={qty}
                          onChange={(e) => setQty(key, Number(e.target.value), item.quantity || 1)}
                          className="w-16 text-xs font-bold border border-gray-200 rounded-lg px-2 py-1 outline-none focus:border-brand-crimson"
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div>
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Reason
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-1 w-full text-xs font-semibold border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-brand-crimson"
            >
              {RETURN_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Add any extra details..."
              className="mt-1 w-full text-xs border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-brand-crimson resize-none"
            />
          </div>

          {isCod && (
            <div className="space-y-3 p-3 rounded-2xl bg-slate-50 border border-gray-100">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                COD refund destination
              </p>
              <div className="flex space-x-2">
                {(['UPI', 'BANK'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setRefundMethod(m)}
                    className={`flex-1 text-[11px] font-extrabold py-2 rounded-xl border transition-all ${
                      refundMethod === m
                        ? 'bg-brand-crimson text-white border-brand-crimson'
                        : 'bg-white text-slate-600 border-gray-200'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
              {refundMethod === 'UPI' ? (
                <input
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="yourname@upi"
                  className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-brand-crimson"
                />
              ) : (
                <div className="space-y-2">
                  <input
                    value={bankAccountName}
                    onChange={(e) => setBankAccountName(e.target.value)}
                    placeholder="Account holder name"
                    className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-brand-crimson"
                  />
                  <input
                    value={bankAccountNumber}
                    onChange={(e) => setBankAccountNumber(e.target.value)}
                    placeholder="Account number"
                    className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-brand-crimson"
                  />
                  <input
                    value={bankIfsc}
                    onChange={(e) => setBankIfsc(e.target.value.toUpperCase())}
                    placeholder="IFSC code"
                    className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-brand-crimson"
                  />
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-1 border-t border-gray-100">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Est. refund</p>
              <p className="text-base font-extrabold text-brand-crimson">
                ₹{estimatedRefund.toLocaleString('en-IN')}
              </p>
            </div>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="inline-flex items-center space-x-2 bg-brand-crimson hover:bg-brand-crimson-dark text-white font-extrabold text-xs px-5 py-3 rounded-xl shadow-md disabled:opacity-60"
            >
              {mutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RotateCcw className="w-4 h-4" />
              )}
              <span>SUBMIT RETURN</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RequestReturnModal;
