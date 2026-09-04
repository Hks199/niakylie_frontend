import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ShoppingBag, Loader2 } from 'lucide-react';
import { ordersApi, Order } from '../../api/orders';
import { OrderCard } from '../../components/account/OrderCard';

export function MyOrdersPage({ onViewDetails }: { onViewDetails: (id: string) => void }) {
  const [localOrders, setLocalOrders] = useState<Order[] | null>(null);

  const { data: fetchedOrders, isLoading } = useQuery({
    queryKey: ['user-orders'],
    queryFn: async () => {
      const data = await ordersApi.getUserOrders();
      return data;
    },
  });

  const orders = localOrders || fetchedOrders || [];

  const handleCancelled = (orderId: string) => {
    setLocalOrders(
      orders.map((o) =>
        o.id === orderId || o.orderId === orderId ? { ...o, status: 'CANCELLED' as const } : o
      )
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-brand-crimson" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12 sm:py-16 space-y-2.5 sm:space-y-3">
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-brand-crimson/10 rounded-full flex items-center justify-center mx-auto">
          <ShoppingBag className="w-6 h-6 sm:w-8 sm:h-8 text-brand-crimson" />
        </div>
        <h3 className="font-extrabold text-sm sm:text-base text-brand-slate-dark">No Orders Yet</h3>
        <p className="text-[11px] sm:text-xs text-slate-400">Explore our exclusive collections and place your first order.</p>
        <a
          href="/products"
          className="inline-block mt-2 bg-brand-crimson text-white font-extrabold text-[11px] sm:text-xs px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl uppercase tracking-wider"
        >
          SHOP NOW
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <h2 className="text-sm sm:text-lg font-extrabold text-brand-slate-dark">My Orders ({orders.length})</h2>
      {orders.map((order) => (
        <OrderCard
          key={order.id || order.orderId}
          order={order}
          onViewDetails={onViewDetails}
          onCancelled={handleCancelled}
        />
      ))}
    </div>
  );
}

export default MyOrdersPage;
