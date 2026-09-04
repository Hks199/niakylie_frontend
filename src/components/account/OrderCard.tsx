import { useState } from 'react';
import { Eye, Download, X, Package, Star } from 'lucide-react';
import { Order, OrderStatus, ordersApi } from '../../api/orders';
import { formatImageUrl } from '../../utils/imageUtils';

interface OrderCardProps {
  order: Order;
  onViewDetails: (orderId: string) => void;
  onCancelled: (orderId: string) => void;
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; bg: string; text: string }> = {
  PENDING:          { label: 'Pending',          bg: 'bg-amber-100',   text: 'text-amber-800'  },
  CONFIRMED:        { label: 'Confirmed',        bg: 'bg-blue-100',    text: 'text-blue-800'   },
  PACKED:           { label: 'Packed',           bg: 'bg-indigo-100',  text: 'text-indigo-800' },
  SHIPPED:          { label: 'Shipped',          bg: 'bg-violet-100',  text: 'text-violet-800' },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery', bg: 'bg-orange-100',  text: 'text-orange-800' },
  DELIVERED:        { label: 'Delivered',        bg: 'bg-emerald-100', text: 'text-emerald-800'},
  CANCELLED:        { label: 'Cancelled',        bg: 'bg-rose-100',    text: 'text-rose-800'   },
};

export function OrderCard({ order, onViewDetails, onCancelled }: OrderCardProps) {
  const [cancelling, setCancelling] = useState(false);
  const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.CONFIRMED;
  const canCancel = order.status === 'PENDING' || order.status === 'CONFIRMED';

  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    try {
      await ordersApi.cancelOrder(order.id || order.orderId);
      onCancelled(order.id || order.orderId);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-sm space-y-3 sm:space-y-4 hover:shadow-md transition-shadow">
      {/* Header Row */}
      <div className="flex items-start justify-between flex-wrap gap-1.5 sm:gap-2">
        <div className="min-w-0">
          <p className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 tracking-wider">Order ID</p>
          <p className="font-extrabold text-xs sm:text-sm text-brand-slate-dark truncate">{order.orderId}</p>
          <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">Placed on {formattedDate}</p>
        </div>
        <span className={`text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full ${statusCfg.bg} ${statusCfg.text}`}>
          {statusCfg.label}
        </span>
      </div>

      {/* Items Thumbnail Strip */}
      <div className="flex items-center space-x-2.5 sm:space-x-3">
        {order.items && order.items.length > 0 ? (
          <div className="flex items-center -space-x-2 overflow-hidden flex-shrink-0">
            {order.items.slice(0, 4).map((item: any, idx: number) => {
              const product = typeof item.productId === 'object' ? item.productId : item.product || {};
              const rawImg = item.image || item.thumbnail || product.thumbnail || (Array.isArray(product.images) ? product.images[0] : product.images) || '';
              const imgUrl = formatImageUrl(rawImg);
              return (
                <img
                  key={idx}
                  src={imgUrl}
                  alt={item.name || 'Order Item'}
                  className="w-9 h-11 sm:w-10 sm:h-12 rounded-lg object-cover border-2 border-white shadow-xs bg-slate-100"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=100&q=80';
                  }}
                />
              );
            })}
          </div>
        ) : (
          <Package className="w-6 h-6 sm:w-8 sm:h-8 text-brand-crimson/70 flex-shrink-0" />
        )}
        <div className="text-[11px] sm:text-xs text-slate-500 min-w-0">
          <p className="font-bold text-brand-slate-dark line-clamp-1">
            {order.items && order.items.length > 0
              ? order.items.map((i: any) => i.name || i.title).filter(Boolean).join(', ')
              : 'NiaKylie Ethnic Couture Item'}
          </p>
          <p className="truncate">Delivery by <span className="font-bold">{order.estimatedDelivery}</span></p>
        </div>
      </div>

      {/* Total & Action Buttons */}
      <div className="border-t border-gray-100 pt-2.5 sm:pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <p className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400">Order Total</p>
          <p className="text-sm sm:text-base font-extrabold text-brand-slate-dark">₹{order.totals.total.toLocaleString('en-IN')}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {order.status === 'DELIVERED' && (
            <button
              onClick={() => onViewDetails(order.id || order.orderId)}
              className="flex items-center space-x-1 text-[9px] sm:text-[10px] font-extrabold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg transition-all"
            >
              <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-500 fill-amber-500" />
              <span>REVIEW</span>
            </button>
          )}
          {canCancel && (
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="flex items-center space-x-1 text-[9px] sm:text-[10px] font-extrabold text-rose-600 hover:bg-rose-50 border border-rose-200 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg transition-all"
            >
              <X className="w-3 h-3" />
              <span>{cancelling ? 'CANCELLING...' : 'CANCEL'}</span>
            </button>
          )}
          <button
            onClick={() => ordersApi.downloadInvoice(order.id || order.orderId)}
            className="flex items-center space-x-1 text-[9px] sm:text-[10px] font-extrabold text-slate-600 hover:bg-slate-100 border border-gray-200 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg transition-all"
          >
            <Download className="w-3 h-3" />
            <span>INVOICE</span>
          </button>
          <button
            onClick={() => onViewDetails(order.id || order.orderId)}
            className="flex items-center space-x-1 text-[9px] sm:text-[10px] font-extrabold text-white bg-brand-crimson hover:bg-brand-crimson-dark px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg transition-all"
          >
            <Eye className="w-3 h-3" />
            <span>DETAILS</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderCard;
