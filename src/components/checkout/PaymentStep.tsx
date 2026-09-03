import { useState } from 'react';
import { Loader2, Smartphone, CreditCard, Banknote, ShieldCheck, Check } from 'lucide-react';
import { paymentsApi } from '../../api/payments';
import { ordersApi, CreateOrderPayload } from '../../api/orders';
import { useCartStore } from '../../store/useCartStore';

interface PaymentStepProps {
  selectedAddressId: string;
  shippingType: 'standard' | 'express';
  onSuccess: (orderId: string) => void;
  onBack: () => void;
}

type PaymentMethod = 'razorpay' | 'stripe' | 'cod';

const PAYMENT_OPTIONS = [
  {
    id: 'razorpay' as const,
    label: 'Razorpay',
    desc: 'UPI, Google Pay, PhonePe, NetBanking, Cards',
    icon: Smartphone,
    badge: 'POPULAR',
  },
  {
    id: 'stripe' as const,
    label: 'Credit / Debit Card',
    desc: 'Powered by Stripe — Visa, Mastercard, AmEx',
    icon: CreditCard,
    badge: 'SECURE',
  },
  {
    id: 'cod' as const,
    label: 'Cash on Delivery',
    desc: 'Pay when your order arrives at your door',
    icon: Banknote,
    badge: '',
  },
];

export function PaymentStep({ selectedAddressId, shippingType, onSuccess, onBack }: PaymentStepProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('razorpay');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { cartTotals, appliedCoupon, clearCart } = useCartStore();

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      setError('Please select a delivery address.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let extraPayload: Partial<CreateOrderPayload> = {};

      if (paymentMethod === 'razorpay') {
        // Create Razorpay order and open checkout widget
        const rzpOrder = await paymentsApi.createRazorpayOrder(cartTotals.total);

        // Check if Razorpay SDK is loaded; if not, proceed as mock
        if (typeof (window as any).Razorpay !== 'undefined') {
          await new Promise<void>((resolve, reject) => {
            const options: any = {
              key: rzpOrder.keyId,
              amount: rzpOrder.amount,
              currency: rzpOrder.currency || 'INR',
              name: 'NiaKylie Fashion',
              description: 'Ethnic Couture Purchase',
              handler: async (response: any) => {
                extraPayload = {
                  razorpayOrderId: response.razorpay_order_id || rzpOrder.id,
                  razorpayPaymentId: response.razorpay_payment_id || `pay_${Date.now()}`,
                  razorpaySignature: response.razorpay_signature || `sig_${Date.now()}`,
                };
                resolve();
              },
              modal: { ondismiss: () => reject(new Error('Payment cancelled')) },
              theme: { color: '#E63946' },
            };

            // Only attach order_id if it's a real order ID created via Razorpay API (not a local mock order_rzp_ prefix)
            if (rzpOrder.id && !rzpOrder.id.startsWith('order_rzp_')) {
              options.order_id = rzpOrder.id;
            }

            const rzp = new (window as any).Razorpay(options);
            rzp.on('payment.failed', (resp: any) => {
              reject(new Error(resp?.error?.description || 'Payment failed'));
            });
            rzp.open();
          });
        } else {
          // Mock: proceed directly in dev
          extraPayload = { razorpayOrderId: rzpOrder.id };
        }
      } else if (paymentMethod === 'stripe') {
        const intent = await paymentsApi.createStripeIntent(cartTotals.total);
        extraPayload = { stripePaymentIntentId: intent.intentId };
      }

      const order = await ordersApi.createOrder({
        addressId: selectedAddressId,
        paymentMethod,
        shippingType,
        couponCode: appliedCoupon || undefined,
        ...extraPayload,
      });

      clearCart();
      onSuccess(order.orderId || order.id);
    } catch (err: any) {
      if (err?.message === 'Payment cancelled') {
        setError('Payment was cancelled. Please try again.');
      } else {
        const msg = Array.isArray(err?.message)
          ? err.message.join(', ')
          : (err?.message || err?.response?.data?.message || 'Order placement failed. Please try again.');
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-extrabold text-brand-slate-dark">Choose Payment Method</h2>

      {/* Payment Option Cards */}
      <div className="space-y-3">
        {PAYMENT_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const isSelected = paymentMethod === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => setPaymentMethod(opt.id)}
              className={`w-full flex items-center space-x-4 p-4 rounded-2xl border-2 transition-all text-left ${
                isSelected ? 'border-brand-crimson bg-brand-crimson/5' : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className={`p-2.5 rounded-xl ${isSelected ? 'bg-brand-crimson text-white' : 'bg-slate-100 text-slate-500'}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <p className={`text-sm font-extrabold ${isSelected ? 'text-brand-crimson' : 'text-brand-slate-dark'}`}>
                    {opt.label}
                  </p>
                  {opt.badge && (
                    <span className="text-[9px] font-extrabold bg-brand-crimson/10 text-brand-crimson px-1.5 py-0.5 rounded uppercase">
                      {opt.badge}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">{opt.desc}</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isSelected ? 'border-brand-crimson bg-brand-crimson' : 'border-gray-300'}`}>
                {isSelected && <Check className="w-3 h-3 text-white" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Security Badge */}
      <div className="flex items-center space-x-2 text-xs text-slate-500 bg-slate-50 border border-gray-100 rounded-2xl p-3">
        <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
        <span>All payments are 100% secure and encrypted with 256-bit SSL.</span>
      </div>

      {error && <p className="text-xs text-rose-600 font-bold bg-rose-50 p-3 rounded-xl">{error}</p>}

      {/* Navigation Buttons */}
      <div className="flex space-x-3 pt-2">
        <button onClick={onBack} disabled={loading} className="flex-1 border-2 border-gray-300 hover:border-brand-crimson text-slate-600 hover:text-brand-crimson font-extrabold text-xs py-4 rounded-2xl transition-all uppercase tracking-wider disabled:opacity-50">
          ← BACK
        </button>
        <button onClick={handlePlaceOrder} disabled={loading} className="flex-1 bg-brand-crimson hover:bg-brand-crimson-dark text-white font-extrabold text-xs py-4 rounded-2xl shadow-xl uppercase tracking-wider transition-all flex items-center justify-center space-x-2 disabled:opacity-70">
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>PROCESSING...</span>
            </>
          ) : (
            <span>PLACE ORDER →</span>
          )}
        </button>
      </div>
    </div>
  );
}

export default PaymentStep;
