import { CheckCircle2, Circle, ExternalLink } from 'lucide-react';
import { OrderStatus } from '../../api/orders';

interface OrderTrackingTimelineProps {
  status: OrderStatus;
  courierName?: string;
  trackingNumber?: string;
  trackingUrl?: string;
}

const STAGES: { id: OrderStatus; label: string; sub: string }[] = [
  { id: 'CONFIRMED',        label: 'Order Placed',       sub: 'We have received your order' },
  { id: 'PACKED',           label: 'Packed',             sub: 'Your order is being packed' },
  { id: 'SHIPPED',          label: 'Shipped',            sub: 'Order has been dispatched' },
  { id: 'OUT_FOR_DELIVERY', label: 'Out for Delivery',   sub: 'Order is on its way to you' },
  { id: 'DELIVERED',        label: 'Delivered',          sub: 'Order delivered successfully!' },
];

const STATUS_ORDER: Record<OrderStatus, number> = {
  PENDING: 0,
  CONFIRMED: 1,
  PACKED: 2,
  SHIPPED: 3,
  OUT_FOR_DELIVERY: 4,
  DELIVERED: 5,
  CANCELLED: -1,
};

export function OrderTrackingTimeline({ status, courierName, trackingNumber, trackingUrl }: OrderTrackingTimelineProps) {
  const currentLevel = STATUS_ORDER[status] ?? 1;

  if (status === 'CANCELLED') {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 text-center">
        <p className="text-rose-700 font-extrabold text-sm">This order has been cancelled.</p>
        <p className="text-rose-500 text-xs mt-1">Refund will be processed within 5-7 business days.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Courier Info */}
      {courierName && trackingNumber && (
        <div className="bg-slate-50 border border-gray-200 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Courier Partner</p>
            <p className="text-sm font-extrabold text-brand-slate-dark">{courierName}</p>
            <p className="text-xs text-slate-500">Tracking: <span className="font-bold">{trackingNumber}</span></p>
          </div>
          {trackingUrl && (
            <a
              href={trackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 text-xs font-extrabold text-brand-crimson hover:underline"
            >
              <span>TRACK</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      )}

      {/* Stepper Timeline */}
      <div className="relative">
        {STAGES.map((stage, idx) => {
          const isCompleted = currentLevel > STATUS_ORDER[stage.id];
          const isActive = currentLevel === STATUS_ORDER[stage.id];
          const isLast = idx === STAGES.length - 1;

          return (
            <div key={stage.id} className="flex items-start space-x-4">
              {/* Icon Column */}
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 flex-shrink-0 transition-all ${
                  isCompleted
                    ? 'bg-brand-crimson border-brand-crimson text-white'
                    : isActive
                    ? 'bg-white border-brand-crimson text-brand-crimson shadow-md shadow-brand-crimson/20'
                    : 'bg-white border-gray-200 text-slate-300'
                }`}>
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Circle className="w-4 h-4" />
                  )}
                </div>
                {!isLast && (
                  <div className={`w-0.5 h-10 mt-1 transition-all ${isCompleted ? 'bg-brand-crimson' : 'bg-gray-200'}`} />
                )}
              </div>

              {/* Label Column */}
              <div className="pb-8">
                <p className={`text-xs font-extrabold ${isActive ? 'text-brand-crimson' : isCompleted ? 'text-brand-slate-dark' : 'text-slate-400'}`}>
                  {stage.label}
                  {isActive && <span className="ml-2 text-[9px] bg-brand-crimson text-white px-1.5 py-0.5 rounded-full uppercase">Current</span>}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">{stage.sub}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default OrderTrackingTimeline;
