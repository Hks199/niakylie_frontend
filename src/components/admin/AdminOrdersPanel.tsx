import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ShoppingCart, ChevronDown, Search, Filter, Truck, RefreshCw, Eye } from 'lucide-react';
import { adminApi } from '../../api/admin';

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  PACKED: 'bg-indigo-100 text-indigo-800',
  SHIPPED: 'bg-purple-100 text-purple-800',
  OUT_FOR_DELIVERY: 'bg-cyan-100 text-cyan-800',
  DELIVERED: 'bg-emerald-100 text-emerald-800',
  CANCELLED: 'bg-rose-100 text-rose-800',
  RETURN_REQUESTED: 'bg-orange-100 text-orange-800',
  RETURNED: 'bg-gray-100 text-gray-700',
  REFUNDED: 'bg-teal-100 text-teal-800',
};

const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];

export function AdminOrdersPanel() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-orders', search, statusFilter],
    queryFn: () =>
      adminApi.getAllOrders({
        search: search || undefined,
        status: statusFilter || undefined,
        limit: 20,
      }),
  });

  const orders = data?.orders || [];

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await adminApi.updateOrderStatus(orderId, newStatus);
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      await refetch();
    } catch (err) {
      console.error('Failed to update order status', err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <ShoppingCart className="w-5 h-5 text-brand-crimson" />
          <div>
            <h2 className="text-lg font-extrabold text-brand-slate-dark">Order Management</h2>
            <p className="text-xs text-slate-400">View, update status and track all customer orders</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 flex-wrap gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search order ID or email..."
              className="bg-slate-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium outline-none focus:border-brand-crimson w-52"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-gray-200 rounded-xl pl-9 pr-8 py-2 text-xs font-medium outline-none focus:border-brand-crimson appearance-none cursor-pointer"
            >
              <option value="">All Statuses</option>
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-16 flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin text-slate-300" />
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs font-semibold">
            No orders found matching your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 text-[10px] uppercase font-extrabold text-slate-400 tracking-wider bg-slate-50/50">
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map((order) => (
                  <>
                    <tr key={order._id} className="hover:bg-slate-50/40 transition-colors text-xs font-semibold">
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                        #{order.orderId || order._id?.slice(-8).toUpperCase()}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-bold text-brand-slate-dark">
                          {order.user?.firstName} {order.user?.lastName}
                        </p>
                        <p className="text-[10px] text-slate-400">{order.user?.email}</p>
                      </td>
                      <td className="py-3 px-4 text-slate-500">{order.items?.length || 0} items</td>
                      <td className="py-3 px-4 font-extrabold text-brand-crimson">
                        ₹{(order.totalAmount || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-[9px] font-extrabold uppercase px-2.5 py-1 rounded-full ${STATUS_STYLES[order.status] || 'bg-gray-100 text-gray-700'}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-[10px]">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end space-x-2">
                          {/* Status Updater */}
                          <div className="relative">
                            <select
                              value={order.status}
                              onChange={(e) => handleStatusChange(order._id, e.target.value)}
                              disabled={updatingId === order._id}
                              className="text-[10px] font-bold bg-slate-100 border border-gray-200 rounded-xl px-2 py-1.5 pr-6 outline-none cursor-pointer hover:border-brand-crimson focus:border-brand-crimson disabled:opacity-50 appearance-none"
                            >
                              {ORDER_STATUSES.map((s) => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>

                          {/* Expand */}
                          <button
                            onClick={() => setExpandedId(expandedId === order._id ? null : order._id)}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-brand-crimson hover:bg-rose-50 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {updatingId === order._id && (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin text-brand-crimson" />
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Expanded Row: Order Items + Shipping */}
                    {expandedId === order._id && (
                      <tr key={`${order._id}-expanded`} className="bg-slate-50/50">
                        <td colSpan={7} className="px-6 py-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Items */}
                            <div>
                              <p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider mb-2">Order Items</p>
                              <div className="space-y-2">
                                {order.items?.map((item, idx) => (
                                  <div key={idx} className="flex items-center justify-between bg-white rounded-xl p-2 border border-gray-100">
                                    <p className="text-xs font-bold text-brand-slate-dark">{item.product?.title || 'Product'}</p>
                                    <p className="text-xs text-slate-500">x{item.quantity} × ₹{(item.price || 0).toLocaleString('en-IN')}</p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Shipping */}
                            <div>
                              <p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider mb-2">Shipping Address</p>
                              <div className="bg-white rounded-xl p-3 border border-gray-100 text-xs text-slate-600 space-y-0.5">
                                <p className="font-bold">{order.shippingAddress?.street}</p>
                                <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} — {order.shippingAddress?.postalCode}</p>
                                {order.trackingNumber && (
                                  <div className="flex items-center space-x-1 mt-1 text-brand-crimson font-bold">
                                    <Truck className="w-3 h-3" />
                                    <span>{order.trackingNumber} · {order.courierPartner}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminOrdersPanel;
