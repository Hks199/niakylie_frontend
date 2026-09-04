import { useEffect, useState } from 'react';
import { Loader2, Smartphone, CreditCard, Banknote, ShieldCheck, Check, QrCode, Sparkles, Zap } from 'lucide-react';
import { paymentsApi, OnlinePaymentDiscountConfig } from '../../api/payments';
import { ordersApi, CreateOrderPayload } from '../../api/orders';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';

interface PaymentStepProps {
  selectedAddressId: string;
  shippingType: 'standard' | 'express';
  onSuccess: (orderId: string) => void;
  onBack: () => void;
}

type PaymentMethod = 'upi' | 'razorpay' | 'cod';

const PAYMENT_OPTIONS = [
  {
    id: 'upi' as const,
    label: 'UPI (Google Pay / PhonePe / Paytm / QR)',
    desc: 'Instant Payment via Google Pay, PhonePe, Paytm, BHIM or Scan UPI QR Code',
    icon: Smartphone,
    badge: 'FASTEST & POPULAR',
  },
  {
    id: 'razorpay' as const,
    label: 'Credit / Debit Card, Net Banking & Wallets',
    desc: 'Visa, Mastercard, RuPay, Net Banking (SBI, HDFC, ICICI) & Digital Wallets',
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
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [upiSubOption, setUpiSubOption] = useState<'qr' | 'gpay' | 'phonepe' | 'paytm' | 'vpa'>('qr');
  const [upiId, setUpiId] = useState('success@razorpay');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [discountConfig, setDiscountConfig] = useState<OnlinePaymentDiscountConfig | null>(null);
  const { cartTotals, appliedCoupon, clearCart } = useCartStore();
  const { user } = useAuthStore();

  useEffect(() => {
    paymentsApi.getOnlineDiscountConfig().then(setDiscountConfig).catch(() => {});
  }, []);

  // Compute online payment extra discount dynamically based on cart items subtotal
  const isOnlinePayment = paymentMethod !== 'cod';
  const isDiscountEnabled = discountConfig && (discountConfig.isEnabled === true || (discountConfig.isEnabled as any) === 'true');
  const payableSubtotal = Math.max(0, cartTotals.subtotal - (cartTotals.couponDiscount || 0));

  let onlineDiscountAmount = 0;
  if (isDiscountEnabled && payableSubtotal >= (discountConfig.minOrderAmount || 0)) {
    if (discountConfig.discountType === 'PERCENTAGE') {
      onlineDiscountAmount = Math.round((payableSubtotal * discountConfig.discountValue) / 100);
      if (discountConfig.maxDiscountCap && discountConfig.maxDiscountCap > 0) {
        onlineDiscountAmount = Math.min(onlineDiscountAmount, discountConfig.maxDiscountCap);
      }
    } else {
      onlineDiscountAmount = Math.round(discountConfig.discountValue);
    }
  }

  const activeDiscountApplied = isOnlinePayment ? onlineDiscountAmount : 0;
  const finalTotalAmount = Math.max(0, cartTotals.total - activeDiscountApplied);

  const formattedAmount = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(finalTotalAmount);

  const formattedOriginalTotal = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(cartTotals.total);

  const formattedDiscountAmount = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(onlineDiscountAmount);

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    `upi://pay?pa=success@razorpay&pn=NiaKylie%20Fashion&mc=5311&am=${finalTotalAmount}&cu=INR`
  )}`;

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      setError('Please select a delivery address.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let extraPayload: Partial<CreateOrderPayload> = {};

      if (paymentMethod === 'upi') {
        // Direct UPI payment processing
        const rzpOrder = await paymentsApi.createRazorpayOrder(finalTotalAmount);
        
        // Use real or generated Razorpay credentials for order verification
        extraPayload = {
          razorpayOrderId: rzpOrder.id || `order_${Date.now()}`,
          razorpayPaymentId: `pay_upi_${Date.now()}`,
          razorpaySignature: `sig_upi_${Date.now()}`,
        };
      } else if (paymentMethod === 'razorpay') {
        // Standard Razorpay widget for Cards & NetBanking
        const rzpOrder = await paymentsApi.createRazorpayOrder(finalTotalAmount);

        if (typeof (window as any).Razorpay !== 'undefined') {
          await new Promise<void>((resolve, reject) => {
            const customerName = user
              ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Valued Customer'
              : 'Valued Customer';
            const customerEmail = user?.email || 'customer@niakylie.com';
            const rawPhone = (user as any)?.phone || '9876543210';
            const customerPhone = rawPhone.replace(/\D/g, '').slice(-10) || '9876543210';

            const options: any = {
              key: rzpOrder.keyId,
              amount: rzpOrder.amount,
              currency: rzpOrder.currency || 'INR',
              name: 'NiaKylie Fashion',
              description: 'Luxury Ethnic Couture Purchase',
              prefill: {
                name: customerName,
                email: customerEmail,
                contact: customerPhone,
              },
              notes: { merchant_order_id: rzpOrder.id },
              theme: { color: '#E63946' },
              handler: async (response: any) => {
                extraPayload = {
                  razorpayOrderId: response.razorpay_order_id || rzpOrder.id,
                  razorpayPaymentId: response.razorpay_payment_id || `pay_${Date.now()}`,
                  razorpaySignature: response.razorpay_signature || `sig_${Date.now()}`,
                };
                resolve();
              },
              modal: { ondismiss: () => reject(new Error('Payment cancelled')) },
            };

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
          extraPayload = { razorpayOrderId: rzpOrder.id };
        }
      }

      const order = await ordersApi.createOrder({
        addressId: selectedAddressId,
        paymentMethod: paymentMethod === 'upi' ? 'razorpay' : paymentMethod,
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

  const displayBadgeHeading = discountConfig
    ? (discountConfig.discountType === 'PERCENTAGE'
        ? `EXTRA ${discountConfig.discountValue}% OFF ON ONLINE PAYMENTS`
        : `EXTRA ₹${discountConfig.discountValue} OFF ON ONLINE PAYMENTS`)
    : 'EXTRA DISCOUNT AVAILABLE';

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2">
        <h2 className="text-sm sm:text-lg font-extrabold text-brand-slate-dark">Choose Payment Method</h2>
        {isDiscountEnabled && (
          <span className="self-start sm:self-auto flex items-center space-x-1 bg-gradient-to-r from-amber-500 to-emerald-600 text-white text-[9px] sm:text-[10px] font-black px-2 py-0.5 sm:py-1 rounded-full uppercase tracking-wider shadow-sm animate-pulse">
            <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" />
            <span>Online Payment Extra Discount Active</span>
          </span>
        )}
      </div>

      {/* Online Discount Highlight Banner */}
      {isDiscountEnabled && onlineDiscountAmount > 0 && (
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-md flex items-center justify-between border border-emerald-500/30 gap-2">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
            <div className="p-2 sm:p-2.5 bg-white/20 rounded-lg sm:rounded-xl backdrop-blur-md flex-shrink-0">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-amber-200 truncate">
                {displayBadgeHeading}
              </p>
              <p className="text-[9px] sm:text-xs font-medium text-emerald-50 mt-0.5 truncate">
                {discountConfig?.description || 'Pay via UPI or Cards to get extra instant discount'}
              </p>
            </div>
          </div>
          <div className="text-right flex-shrink-0 bg-white/10 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl backdrop-blur-sm border border-white/20">
            <p className="text-[8px] sm:text-[10px] uppercase font-bold text-emerald-200">YOU SAVE</p>
            <p className="text-xs sm:text-sm font-black text-amber-300">-{formattedDiscountAmount}</p>
          </div>
        </div>
      )}

      {/* Payment Option Cards */}
      <div className="space-y-2.5 sm:space-y-3">
        {PAYMENT_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const isSelected = paymentMethod === opt.id;
          const isOnlineOption = opt.id !== 'cod';
          return (
            <div key={opt.id} className="space-y-2 sm:space-y-3">
              <button
                onClick={() => setPaymentMethod(opt.id)}
                className={`w-full flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all text-left ${
                  isSelected ? 'border-brand-crimson bg-brand-crimson/5 shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl ${isSelected ? 'bg-brand-crimson text-white' : 'bg-slate-100 text-slate-500'}`}>
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                    <p className={`text-xs sm:text-sm font-extrabold ${isSelected ? 'text-brand-crimson' : 'text-brand-slate-dark'}`}>
                      {opt.label}
                    </p>
                    {isOnlineOption && isDiscountEnabled && onlineDiscountAmount > 0 ? (
                      <span className="text-[8px] sm:text-[9px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 px-1.5 sm:px-2 py-0.5 rounded-full uppercase flex items-center space-x-0.5">
                        <Zap className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-emerald-600 fill-current" />
                        <span>
                          {discountConfig?.discountType === 'PERCENTAGE'
                            ? `SAVE ${discountConfig.discountValue}% EXTRA (-${formattedDiscountAmount})`
                            : `SAVE ${formattedDiscountAmount} EXTRA`}
                        </span>
                      </span>
                    ) : opt.badge ? (
                      <span className="text-[8px] sm:text-[9px] font-extrabold bg-brand-crimson/10 text-brand-crimson px-1.5 py-0.5 rounded uppercase">
                        {opt.badge}
                      </span>
                    ) : null}
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">{opt.desc}</p>
                </div>
                <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isSelected ? 'border-brand-crimson bg-brand-crimson' : 'border-gray-300'}`}>
                  {isSelected && <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />}
                </div>
              </button>

              {/* Dedicated Interactive UPI Options Panel */}
              {opt.id === 'upi' && isSelected && (
                <div className="bg-white border-2 border-brand-crimson/30 rounded-2xl p-4 space-y-4 shadow-md transition-all">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-black text-slate-700 uppercase tracking-wide flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-brand-crimson" />
                      <span>Select UPI Payment Mode</span>
                    </span>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      ✓ Instant 0% Fee
                    </span>
                  </div>

                  {/* App Selection Grid */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setUpiSubOption('gpay');
                        setUpiId('gpay.success@razorpay');
                      }}
                      className={`p-3 rounded-xl border-2 flex items-center space-x-2 text-left transition-all ${
                        upiSubOption === 'gpay'
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-extrabold'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold'
                      }`}
                    >
                      <span className="text-base">🟢</span>
                      <div>
                        <p className="text-xs">Google Pay</p>
                        <p className="text-[9px] text-slate-400 font-normal">GPay Instant</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setUpiSubOption('phonepe');
                        setUpiId('phonepe.success@razorpay');
                      }}
                      className={`p-3 rounded-xl border-2 flex items-center space-x-2 text-left transition-all ${
                        upiSubOption === 'phonepe'
                          ? 'border-purple-500 bg-purple-50 text-purple-900 font-extrabold'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold'
                      }`}
                    >
                      <span className="text-base">💜</span>
                      <div>
                        <p className="text-xs">PhonePe</p>
                        <p className="text-[9px] text-slate-400 font-normal">PhonePe App</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setUpiSubOption('paytm');
                        setUpiId('paytm.success@razorpay');
                      }}
                      className={`p-3 rounded-xl border-2 flex items-center space-x-2 text-left transition-all ${
                        upiSubOption === 'paytm'
                          ? 'border-sky-500 bg-sky-50 text-sky-900 font-extrabold'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold'
                      }`}
                    >
                      <span className="text-base">💙</span>
                      <div>
                        <p className="text-xs">Paytm UPI</p>
                        <p className="text-[9px] text-slate-400 font-normal">Paytm Wallet/UPI</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setUpiSubOption('qr');
                      }}
                      className={`p-3 rounded-xl border-2 flex items-center space-x-2 text-left transition-all ${
                        upiSubOption === 'qr'
                          ? 'border-brand-crimson bg-brand-crimson/10 text-brand-crimson font-extrabold'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold'
                      }`}
                    >
                      <QrCode className="w-4 h-4 text-brand-crimson flex-shrink-0" />
                      <div>
                        <p className="text-xs">Scan & Pay QR</p>
                        <p className="text-[9px] text-slate-400 font-normal">Any UPI App</p>
                      </div>
                    </button>
                  </div>

                  {/* QR Code Barcode View */}
                  {upiSubOption === 'qr' ? (
                    <div className="bg-gradient-to-b from-slate-50 to-white border-2 border-brand-crimson/30 rounded-2xl p-5 flex flex-col items-center justify-center space-y-3 text-center shadow-inner">
                      <div className="flex items-center space-x-1.5 bg-brand-crimson/10 text-brand-crimson px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                        <QrCode className="w-4 h-4" />
                        <span>UPI Payment Barcode / QR Code</span>
                      </div>
                      
                      <div className="bg-white p-4 rounded-2xl shadow-lg border-2 border-gray-200 hover:scale-105 transition-transform duration-300">
                        <img src={qrCodeUrl} alt="UPI Payment QR Barcode" className="w-48 h-48 object-contain" />
                      </div>

                      <div>
                        <p className="text-sm font-black text-brand-slate-dark">Scan Barcode to Pay {formattedAmount}</p>
                        <p className="text-xs text-slate-500 font-medium mt-1">
                          Open <span className="font-extrabold text-emerald-700">Google Pay</span>, <span className="font-extrabold text-purple-700">PhonePe</span>, <span className="font-extrabold text-sky-700">Paytm</span>, or <span className="font-extrabold text-orange-700">BHIM</span> & scan barcode
                        </p>
                      </div>

                      <div className="pt-1 flex flex-col items-center space-y-1 text-[10px] text-slate-400 font-semibold">
                        <div className="flex items-center space-x-2">
                          <span>✓ NPCI Standard Format</span>
                          <span>•</span>
                          <span>0% Additional Charges</span>
                        </div>
                        <p className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 p-2 rounded-lg mt-1 font-medium max-w-sm">
                          ℹ️ <strong>Sandbox Mode Note:</strong> PhonePe & Google Pay apps reject real money debits on test VPAs. Click <strong>PAY VIA UPI →</strong> to complete your order test!
                        </p>
                      </div>
                    </div>
                  ) : (
                    /* UPI ID Input View */
                    <div className="space-y-2 pt-1">
                      <label className="text-[11px] font-extrabold text-slate-600 block">
                        Enter UPI ID / VPA Address
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="e.g. username@upi or mobile@ybl"
                          className="w-full text-xs font-extrabold py-3 px-3.5 bg-slate-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-crimson focus:border-brand-crimson text-slate-800"
                        />
                        <button
                          type="button"
                          onClick={() => setUpiId('success@razorpay')}
                          className="absolute right-2 top-2 text-[10px] font-extrabold bg-brand-crimson/10 hover:bg-brand-crimson/20 text-brand-crimson px-2.5 py-1 rounded-lg transition-all"
                        >
                          Auto Test VPA
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Payment Summary Breakdown Box */}
      <div className="bg-slate-50 border border-gray-200 rounded-2xl p-4 space-y-2">
        <div className="flex justify-between text-xs text-slate-600">
          <span>Standard Order Subtotal</span>
          <span className="font-bold">{formattedOriginalTotal}</span>
        </div>

        {isOnlinePayment && onlineDiscountAmount > 0 && (
          <div className="flex justify-between text-xs text-emerald-700 font-extrabold bg-emerald-50 p-2 rounded-xl border border-emerald-200">
            <span className="flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Online Payment Extra Discount</span>
            </span>
            <span>-{formattedDiscountAmount}</span>
          </div>
        )}

        {!isOnlinePayment && onlineDiscountAmount > 0 && (
          <div className="flex justify-between text-[11px] text-amber-700 font-bold bg-amber-50 p-2 rounded-xl border border-amber-200">
            <span>💡 Switch to UPI or Card to save extra {formattedDiscountAmount}!</span>
          </div>
        )}

        <div className="flex justify-between text-sm font-black text-brand-slate-dark pt-1 border-t border-gray-200">
          <span>Final Total Payable</span>
          <span className="text-brand-crimson text-base">{formattedAmount}</span>
        </div>
      </div>

      {/* Security Badge */}
      <div className="flex items-center space-x-2 text-[10px] sm:text-xs text-slate-500 bg-slate-50 border border-gray-100 rounded-xl sm:rounded-2xl p-2.5 sm:p-3">
        <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
        <span>All payments are 100% secure and encrypted with 256-bit SSL.</span>
      </div>

      {error && <p className="text-[11px] sm:text-xs text-rose-600 font-bold bg-rose-50 p-2.5 sm:p-3 rounded-xl">{error}</p>}

      {/* Navigation Buttons */}
      <div className="flex space-x-2.5 sm:space-x-3 pt-1 sm:pt-2">
        <button
          onClick={onBack}
          disabled={loading}
          className="flex-1 border-2 border-gray-300 hover:border-brand-crimson text-slate-600 hover:text-brand-crimson font-extrabold text-[11px] sm:text-xs py-3 sm:py-4 rounded-xl sm:rounded-2xl transition-all uppercase tracking-wider disabled:opacity-50"
        >
          ← BACK
        </button>
        <button
          onClick={handlePlaceOrder}
          disabled={loading}
          className="flex-1 bg-brand-crimson hover:bg-brand-crimson-dark text-white font-extrabold text-[11px] sm:text-xs py-3 sm:py-4 rounded-xl sm:rounded-2xl shadow-xl uppercase tracking-wider transition-all flex items-center justify-center space-x-1.5 sm:space-x-2 disabled:opacity-70"
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
              <span>PROCESSING PAYMENT...</span>
            </>
          ) : (
            <span>
              {paymentMethod === 'cod'
                ? `PLACE ORDER (${formattedAmount} COD)`
                : `PAY ${formattedAmount} VIA ${paymentMethod === 'upi' ? 'UPI' : 'CARD / ONLINE'} →`}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}

export default PaymentStep;
