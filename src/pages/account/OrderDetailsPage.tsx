import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Download, Package, Loader2, Star } from 'lucide-react';
import { ordersApi } from '../../api/orders';
import { OrderTrackingTimeline } from '../../components/account/OrderTrackingTimeline';
import { WriteReviewModal } from '../../components/account/WriteReviewModal';
import { formatImageUrl } from '../../utils/imageUtils';

interface OrderDetailsPageProps {
  orderId: string;
  onBack: () => void;
}

export function OrderDetailsPage({ orderId, onBack }: OrderDetailsPageProps) {
  const [reviewProductId, setReviewProductId] = useState<string | null>(null);
  const [reviewProductTitle, setReviewProductTitle] = useState('');

  const { data: order, isLoading } = useQuery({
    queryKey: ['order-details', orderId],
    queryFn: () => ordersApi.getOrderDetails(orderId),
    enabled: !!orderId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-brand-crimson" />
      </div>
    );
  }

  if (!order) return null;

  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div className="space-y-6">
      {/* Back Button & Header */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onBack}
          className="p-2 rounded-xl border border-gray-200 text-slate-500 hover:text-brand-crimson hover:border-brand-crimson transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-lg font-extrabold text-brand-slate-dark">Order Details</h2>
          <p className="text-xs text-slate-400">{order.orderId} · Placed on {formattedDate}</p>
        </div>
      </div>

      {/* Delivery Address */}
      {order.deliveryAddress?.name && (
        <div className="bg-slate-50 border border-gray-200 rounded-2xl p-4">
          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Delivery Address</p>
          <p className="text-xs font-extrabold text-brand-slate-dark">{order.deliveryAddress.name}</p>
          <p className="text-xs text-slate-500">{order.deliveryAddress.city}, {order.deliveryAddress.state}</p>
        </div>
      )}

      {/* Shipment Tracking Timeline */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
        <p className="text-xs font-extrabold uppercase text-slate-400 tracking-wider mb-4">Shipment Status</p>
        <OrderTrackingTimeline
          status={order.status}
          courierName={order.courierName}
          trackingNumber={order.trackingNumber}
          trackingUrl={order.trackingUrl}
        />
      </div>

      {/* Order Items */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-100 flex items-center space-x-2">
          <Package className="w-4 h-4 text-brand-crimson" />
          <p className="text-xs font-extrabold uppercase text-brand-slate-dark tracking-wider">Items in This Order</p>
        </div>

        {order.items && order.items.length > 0 ? (
          order.items.map((item, idx) => {
            const itemAny = item as any;
            const product: any = typeof item.productId === 'object' ? item.productId : itemAny.product || {};
            const rawImg = itemAny.image || itemAny.thumbnail || product.thumbnail || (Array.isArray(product.images) ? product.images[0] : product.images) || '';
            const image = formatImageUrl(rawImg);
            const title = itemAny.name || product.title || 'NiaKylie Ethnic Couture Garment';
            const targetProdId = typeof item.productId === 'string' ? item.productId : (item.productId?._id || itemAny.id || product.id || 'p1');
            const color = itemAny.color;
            const size = itemAny.size;

            return (
              <div key={idx} className="flex items-center justify-between p-4 border-b border-gray-50 last:border-0">
                <div className="flex items-center space-x-3">
                  <img
                    src={image}
                    alt={title}
                    className="w-14 h-16 rounded-xl object-cover border border-gray-100 bg-slate-100 flex-shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=100&q=80';
                    }}
                  />
                  <div>
                    <p className="text-xs font-extrabold text-brand-slate-dark">{title}</p>
                    {(color || size) && (
                      <p className="text-[10px] font-semibold text-slate-400">
                        {[color, size].filter(Boolean).join(' · ')}
                      </p>
                    )}
                    <p className="text-[11px] text-slate-400">Qty: {item.quantity}</p>
                    <p className="text-xs font-bold text-brand-slate-dark mt-0.5">₹{item.price.toLocaleString('en-IN')}</p>
                  </div>
                </div>
                {order.status === 'DELIVERED' && (
                  <button
                    onClick={() => {
                      setReviewProductId(targetProdId);
                      setReviewProductTitle(title);
                    }}
                    className="text-[10px] font-extrabold text-white bg-amber-600 hover:bg-amber-700 px-3.5 py-2 rounded-xl transition-all shadow-sm flex items-center space-x-1"
                  >
                    <Star className="w-3 h-3 fill-white" />
                    <span>WRITE REVIEW</span>
                  </button>
                )}
              </div>
            );
          })
        ) : (
          <div className="p-6 text-center text-xs text-slate-400">
            <Package className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p>Handcrafted Banarasi Silk Saree × 1</p>
            <p className="font-bold text-brand-slate-dark mt-1">₹{order.totals.total.toLocaleString('en-IN')}</p>
            {order.status === 'DELIVERED' && (
              <button
                onClick={() => {
                  setReviewProductId('p1');
                  setReviewProductTitle('Banarasi Silk Saree');
                }}
                className="mt-3 text-[10px] font-extrabold text-white bg-amber-600 hover:bg-amber-700 px-3.5 py-2 rounded-xl transition-all shadow-sm flex items-center space-x-1"
              >
                <Star className="w-3 h-3 fill-white" />
                <span>WRITE REVIEW</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Price Summary */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-2 text-xs">
        <p className="font-extrabold uppercase text-slate-400 tracking-wider text-[10px] mb-3">Order Total</p>
        {order.totals.discount > 0 && (
          <div className="flex justify-between text-emerald-600 font-bold">
            <span>Discount Savings</span>
            <span>-₹{order.totals.discount.toLocaleString('en-IN')}</span>
          </div>
        )}
        <div className="flex justify-between text-slate-600">
          <span>Delivery Fee</span>
          <span>{order.totals.shippingFee === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : `₹${order.totals.shippingFee}`}</span>
        </div>
        <div className="flex justify-between font-extrabold text-base text-brand-slate-dark border-t border-gray-100 pt-2">
          <span>Amount Paid</span>
          <span className="text-brand-crimson">₹{order.totals.total.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Invoice Download */}
      <button
        onClick={() => ordersApi.downloadInvoice(order.id || order.orderId)}
        className="w-full flex items-center justify-center space-x-2 border-2 border-gray-200 hover:border-brand-crimson text-slate-600 hover:text-brand-crimson font-extrabold text-xs py-3.5 rounded-xl transition-all"
      >
        <Download className="w-4 h-4" />
        <span>DOWNLOAD INVOICE</span>
      </button>

      {/* Write Review Modal */}
      {reviewProductId && (
        <WriteReviewModal
          isOpen={!!reviewProductId}
          productId={reviewProductId}
          productTitle={reviewProductTitle}
          onClose={() => setReviewProductId(null)}
        />
      )}
    </div>
  );
}

export default OrderDetailsPage;
