import { Truck, Zap } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';

interface OrderSummaryStepProps {
  shippingType: 'standard' | 'express';
  onShippingChange: (type: 'standard' | 'express') => void;
  onNext: () => void;
  onBack: () => void;
}

const SHIPPING_OPTIONS = [
  {
    id: 'standard' as const,
    label: 'Standard Delivery',
    desc: '5-7 Business Days',
    price: 0,
    priceLabel: 'FREE',
    icon: Truck,
  },
  {
    id: 'express' as const,
    label: 'Express Delivery',
    desc: '1-2 Business Days',
    price: 149,
    priceLabel: '₹149',
    icon: Zap,
  },
];

export function OrderSummaryStep({ shippingType, onShippingChange, onNext, onBack }: OrderSummaryStepProps) {
  const { cartItems } = useCartStore();

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-extrabold text-brand-slate-dark">Order Summary & Shipping</h2>

      {/* Order Items Preview */}
      <div className="bg-white border border-gray-100 rounded-2xl divide-y divide-gray-50 shadow-sm overflow-hidden">
        {cartItems.map((item) => {
          const product: any = typeof item.productId === 'object' ? item.productId : item.product || {};
          const variant: any = typeof item.variantId === 'object' ? item.variantId : item.variant || {};
          const image = product.thumbnail || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=100&q=80';
          const title = product.title || 'Ethnic Couture Garment';

          return (
            <div key={item.id || item._id} className="flex items-center space-x-4 p-4">
              <img src={image} alt={title} className="w-14 h-16 rounded-xl object-cover flex-shrink-0 border border-gray-100" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-extrabold text-brand-slate-dark truncate">{title}</p>
                <div className="flex items-center space-x-2 mt-1 text-[10px] font-semibold text-slate-500">
                  <span>Size: {variant.size || 'M'}</span>
                  <span>•</span>
                  <span>Qty: {item.quantity}</span>
                </div>
              </div>
              <span className="text-sm font-extrabold text-brand-slate-dark flex-shrink-0">
                ₹{(item.price * item.quantity).toLocaleString('en-IN')}
              </span>
            </div>
          );
        })}
      </div>

      {/* Delivery Speed Options */}
      <div className="space-y-3">
        <h3 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Select Delivery Speed</h3>
        {SHIPPING_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const isSelected = shippingType === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => onShippingChange(opt.id)}
              className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-left ${
                isSelected ? 'border-brand-crimson bg-brand-crimson/5' : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-xl ${isSelected ? 'bg-brand-crimson text-white' : 'bg-slate-100 text-slate-500'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className={`text-xs font-extrabold ${isSelected ? 'text-brand-crimson' : 'text-brand-slate-dark'}`}>{opt.label}</p>
                  <p className="text-[10px] text-slate-400">{opt.desc}</p>
                </div>
              </div>
              <span className={`text-sm font-extrabold ${opt.price === 0 ? 'text-emerald-600' : 'text-brand-slate-dark'}`}>
                {opt.priceLabel}
              </span>
            </button>
          );
        })}
      </div>

      {/* Navigation Buttons */}
      <div className="flex space-x-3 pt-2">
        <button onClick={onBack} className="flex-1 border-2 border-gray-300 hover:border-brand-crimson text-slate-600 hover:text-brand-crimson font-extrabold text-xs py-4 rounded-2xl transition-all uppercase tracking-wider">
          ← BACK
        </button>
        <button onClick={onNext} className="flex-1 bg-brand-crimson hover:bg-brand-crimson-dark text-white font-extrabold text-xs py-4 rounded-2xl shadow-xl uppercase tracking-wider transition-all">
          CONTINUE TO PAYMENT →
        </button>
      </div>
    </div>
  );
}

export default OrderSummaryStep;
