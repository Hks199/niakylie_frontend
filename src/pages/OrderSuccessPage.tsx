import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, Package, Truck, Download, ArrowRight } from 'lucide-react';
import { ordersApi } from '../api/orders';

interface OrderSuccessPageProps {
  orderId?: string;
}

export function OrderSuccessPage({ orderId = '' }: OrderSuccessPageProps) {
  const { data: order } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => ordersApi.getOrderDetails(orderId),
    enabled: !!orderId,
  });


  const displayOrderId = order?.orderId || orderId;
  const estimatedDelivery = order?.estimatedDelivery || (() => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long' });
  })();

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 text-center animate-in fade-in duration-500">
      {/* Success Icon with pulse ring */}
      <div className="relative w-24 h-24 mx-auto mb-6">
        <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-40" />
        <div className="relative w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center shadow-xl shadow-emerald-200">
          <CheckCircle2 className="w-12 h-12 text-white" />
        </div>
      </div>

      <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-slate-dark font-display mb-2">
        Order Confirmed! 🎉
      </h1>
      <p className="text-slate-500 text-sm mb-8">
        Thank you for shopping with NiaKylie. Your order has been placed successfully.
      </p>

      {/* Order Details Card */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 text-left space-y-4 shadow-sm mb-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Order ID</p>
            <p className="text-lg font-extrabold text-brand-slate-dark">{displayOrderId}</p>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
            <span className="text-xs font-extrabold text-emerald-700 uppercase">Confirmed</span>
          </div>
        </div>

        {/* Delivery Estimate */}
        <div className="flex items-center space-x-3 bg-slate-50 p-4 rounded-2xl">
          <div className="p-2 bg-brand-crimson/10 text-brand-crimson rounded-xl">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Estimated Delivery</p>
            <p className="text-sm font-extrabold text-brand-slate-dark">{estimatedDelivery}</p>
          </div>
        </div>

        {/* What Happens Next Steps */}
        <div className="space-y-3 pt-2">
          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">What happens next</p>
          {[
            { step: '1', text: 'Order processing & quality check (24 hrs)' },
            { step: '2', text: 'Packaging & dispatch from our warehouse' },
            { step: '3', text: 'Out for delivery at your doorstep' },
          ].map(({ step, text }) => (
            <div key={step} className="flex items-center space-x-3 text-xs">
              <div className="w-6 h-6 rounded-full bg-brand-crimson text-white font-extrabold flex items-center justify-center flex-shrink-0 text-[10px]">
                {step}
              </div>
              <span className="text-slate-600">{text}</span>
            </div>
          ))}
        </div>

        {/* Order Amount Summary */}
        {order?.totals?.total && (
          <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-sm font-extrabold text-brand-slate-dark">
            <span>Amount Paid</span>
            <span className="text-brand-crimson">₹{order.totals.total.toLocaleString('en-IN')}</span>
          </div>
        )}
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
        <button
          onClick={() => window.print()}
          className="flex-1 flex items-center justify-center space-x-2 border-2 border-gray-300 hover:border-brand-crimson text-slate-600 hover:text-brand-crimson font-extrabold text-xs py-4 rounded-2xl transition-all"
        >
          <Download className="w-4 h-4" />
          <span>DOWNLOAD RECEIPT</span>
        </button>

        <a
          href="/products"
          className="flex-1 flex items-center justify-center space-x-2 bg-brand-crimson hover:bg-brand-crimson-dark text-white font-extrabold text-xs py-4 rounded-2xl shadow-xl uppercase tracking-wider group transition-all"
        >
          <Package className="w-4 h-4" />
          <span>CONTINUE SHOPPING</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </a>
      </div>
    </div>
  );
}

export default OrderSuccessPage;
