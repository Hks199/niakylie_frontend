import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ShoppingBag, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { ordersApi, Order } from '../../api/orders';
import { OrderCard } from '../../components/account/OrderCard';

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

export function MyOrdersPage({ onViewDetails }: { onViewDetails: (id: string) => void }) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(() => {
    const p = Number(new URLSearchParams(window.location.search).get('page') || '1');
    return p > 0 ? p : 1;
  });
  const [limit, setLimit] = useState(() => {
    const l = Number(new URLSearchParams(window.location.search).get('limit') || '10');
    return PAGE_SIZE_OPTIONS.includes(l) ? l : 10;
  });

  // Keep page/limit in the account orders URL so reload stays on the same page
  useEffect(() => {
    const url = new URL(window.location.href);
    if (page <= 1) url.searchParams.delete('page');
    else url.searchParams.set('page', String(page));
    if (limit === 10) url.searchParams.delete('limit');
    else url.searchParams.set('limit', String(limit));
    const next = url.pathname + url.search;
    if (window.location.pathname + window.location.search !== next) {
      window.history.replaceState({}, '', next);
    }
  }, [page, limit]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['user-orders', page, limit],
    queryFn: () => ordersApi.getUserOrders({ page, limit }),
    placeholderData: (prev) => prev,
  });

  const orders: Order[] = data?.data || [];
  const totalCount = data?.total || 0;
  const totalPages = data?.totalPages || 1;

  // Clamp page if it exceeds total pages after a delete/cancel shrinks the list
  useEffect(() => {
    if (!isLoading && totalPages > 0 && page > totalPages) {
      setPage(totalPages);
    }
  }, [isLoading, page, totalPages]);

  const handleCancelled = (orderId: string) => {
    queryClient.setQueryData(['user-orders', page, limit], (old: typeof data) => {
      if (!old) return old;
      return {
        ...old,
        data: old.data.map((o) =>
          o.id === orderId || o.orderId === orderId ? { ...o, status: 'CANCELLED' as const } : o
        ),
      };
    });
  };

  if (isLoading && !data) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-brand-crimson" />
      </div>
    );
  }

  if (totalCount === 0) {
    return (
      <div className="text-center py-12 sm:py-16 space-y-2.5 sm:space-y-3">
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-brand-crimson/10 rounded-full flex items-center justify-center mx-auto">
          <ShoppingBag className="w-6 h-6 sm:w-8 sm:h-8 text-brand-crimson" />
        </div>
        <h3 className="font-extrabold text-sm sm:text-base text-brand-slate-dark">No Orders Yet</h3>
        <p className="text-[11px] sm:text-xs text-slate-400">
          Explore our exclusive collections and place your first order.
        </p>
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
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm sm:text-lg font-extrabold text-brand-slate-dark">
          My Orders ({totalCount})
        </h2>
        {isFetching && (
          <Loader2 className="w-4 h-4 animate-spin text-slate-400 flex-shrink-0" />
        )}
      </div>

      {orders.map((order) => (
        <OrderCard
          key={order.id || order.orderId}
          order={order}
          onViewDetails={onViewDetails}
          onCancelled={handleCancelled}
        />
      ))}

      {/* Pagination Controls */}
      <div className="pt-3 sm:pt-4 mt-1 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] sm:text-xs">
        <div className="flex items-center flex-wrap justify-center gap-x-1.5 text-slate-500 font-medium">
          <span>Showing</span>
          <span className="font-bold text-slate-800">
            {Math.min((page - 1) * limit + 1, totalCount)}
          </span>
          <span>–</span>
          <span className="font-bold text-slate-800">{Math.min(page * limit, totalCount)}</span>
          <span>of</span>
          <span className="font-bold text-slate-800">{totalCount}</span>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-4">
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-500 font-medium hidden sm:inline">Per page</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="bg-white border border-gray-200 rounded-lg sm:rounded-xl px-2 py-1 text-[10px] sm:text-xs font-bold text-slate-700 outline-none focus:border-brand-crimson cursor-pointer shadow-sm"
              aria-label="Orders per page"
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-1 sm:space-x-1.5">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page <= 1 || isFetching}
              className="p-1.5 rounded-lg sm:rounded-xl border border-gray-200 bg-white text-slate-600 hover:text-brand-crimson hover:border-brand-crimson disabled:opacity-30 disabled:hover:text-slate-600 disabled:hover:border-gray-200 transition-colors disabled:cursor-not-allowed shadow-sm"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-bold text-slate-700 tabular-nums">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page >= totalPages || isFetching}
              className="p-1.5 rounded-lg sm:rounded-xl border border-gray-200 bg-white text-slate-600 hover:text-brand-crimson hover:border-brand-crimson disabled:opacity-30 disabled:hover:text-slate-600 disabled:hover:border-gray-200 transition-colors disabled:cursor-not-allowed shadow-sm"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyOrdersPage;
