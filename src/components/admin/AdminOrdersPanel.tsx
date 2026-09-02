import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ShoppingCart,
  ChevronDown,
  Search,
  Filter,
  Truck,
  RefreshCw,
  Eye,
  XCircle,
  CheckCircle2,
  Package,
  Clock,
  Ban,
  FileText,
  X,
  Send,
  Printer,
  ShieldCheck,
} from 'lucide-react';
import { adminApi } from '../../api/admin';

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-800 border border-amber-200',
  CONFIRMED: 'bg-blue-100 text-blue-800 border border-blue-200',
  PACKED: 'bg-indigo-100 text-indigo-800 border border-indigo-200',
  SHIPPED: 'bg-purple-100 text-purple-800 border border-purple-200',
  OUT_FOR_DELIVERY: 'bg-cyan-100 text-cyan-800 border border-cyan-200',
  DELIVERED: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
  CANCELLED: 'bg-rose-100 text-rose-800 border border-rose-200',
  RETURN_REQUESTED: 'bg-orange-100 text-orange-800 border border-orange-200',
  RETURNED: 'bg-gray-100 text-gray-700 border border-gray-200',
  REFUNDED: 'bg-teal-100 text-teal-800 border border-teal-200',
};

const ORDER_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'PACKED',
  'SHIPPED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
];

const COURIER_OPTIONS = [
  'NiaKylie Express Logistics',
  'Delhivery',
  'BlueDart',
  'DTDC',
  'FedEx',
  'Ecom Express',
  'Xpressbees',
  'India Post Speed Post',
];

export function AdminOrdersPanel() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [trackingModalOrder, setTrackingModalOrder] = useState<any | null>(null);
  const [cancelModalOrder, setCancelModalOrder] = useState<any | null>(null);

  // Tracking Form State
  const [courierPartner, setCourierPartner] = useState('NiaKylie Express Logistics');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [isSubmittingTracking, setIsSubmittingTracking] = useState(false);

  // Cancel Form State
  const [cancelReason, setCancelReason] = useState('');
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['admin-orders', search, statusFilter],
    queryFn: () =>
      adminApi.getAllOrders({
        search: search || undefined,
        status: statusFilter || undefined,
        limit: 50,
      }),
  });

  const orders = Array.isArray(data)
    ? data
    : Array.isArray(data?.orders)
    ? data.orders
    : Array.isArray(data?.data)
    ? data.data
    : Array.isArray((data as any)?.data?.data)
    ? (data as any).data.data
    : Array.isArray((data as any)?.items)
    ? (data as any).items
    : [];

  // Metrics counts
  const totalCount = orders.length;
  const pendingCount = orders.filter(
    (o: any) => o.orderStatus === 'PENDING' || o.status === 'PENDING' || o.orderStatus === 'CONFIRMED' || o.status === 'CONFIRMED'
  ).length;
  const shippedCount = orders.filter(
    (o: any) => o.orderStatus === 'SHIPPED' || o.status === 'SHIPPED' || o.orderStatus === 'OUT_FOR_DELIVERY' || o.status === 'OUT_FOR_DELIVERY'
  ).length;
  const deliveredCount = orders.filter(
    (o: any) => o.orderStatus === 'DELIVERED' || o.status === 'DELIVERED'
  ).length;
  const cancelledCount = orders.filter(
    (o: any) => o.orderStatus === 'CANCELLED' || o.status === 'CANCELLED'
  ).length;

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await adminApi.updateOrderStatus(orderId, newStatus);
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-summary'] });
      await refetch();
    } catch (err) {
      console.error('Failed to update order status', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleOpenTrackingModal = (order: any) => {
    setTrackingModalOrder(order);
    setCourierPartner(
      order.shippingInfo?.courierPartner || order.courierPartner || 'NiaKylie Express Logistics'
    );
    setTrackingNumber(order.shippingInfo?.trackingNumber || order.trackingNumber || '');
  };

  const handleSaveTracking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingModalOrder) return;
    setIsSubmittingTracking(true);
    try {
      const orderId =
        trackingModalOrder._id || trackingModalOrder.id || trackingModalOrder.orderNumber;
      await adminApi.updateTracking(orderId, {
        courierPartner,
        trackingNumber,
      });

      // Optionally transition status to SHIPPED if currently CONFIRMED or PACKED
      const currentStatus = trackingModalOrder.orderStatus || trackingModalOrder.status;
      let newStatus = currentStatus;
      if (currentStatus === 'CONFIRMED' || currentStatus === 'PACKED') {
        try {
          await adminApi.updateOrderStatus(orderId, 'SHIPPED', `Tracking assigned: ${trackingNumber}`);
          newStatus = 'SHIPPED';
        } catch (statusErr) {
          console.warn('Could not auto-transition status to SHIPPED:', statusErr);
        }
      }

      // If details modal is open for this order, update local selectedOrder state
      if (selectedOrder && (selectedOrder._id === orderId || selectedOrder.orderNumber === orderId)) {
        setSelectedOrder((prev: any) => ({
          ...prev,
          orderStatus: newStatus,
          status: newStatus,
          shippingInfo: {
            ...prev?.shippingInfo,
            courierPartner,
            trackingNumber,
          },
        }));
      }

      setTrackingModalOrder(null);
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      await refetch();
    } catch (err) {
      console.error('Failed to update tracking info', err);
    } finally {
      setIsSubmittingTracking(false);
    }
  };

  const handleConfirmCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelModalOrder) return;
    setIsSubmittingCancel(true);
    try {
      await adminApi.cancelOrder(cancelModalOrder._id, cancelReason || 'Cancelled by admin');
      setCancelModalOrder(null);
      setCancelReason('');
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-summary'] });
      await refetch();
    } catch (err) {
      console.error('Failed to cancel order', err);
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header Card */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-brand-crimson/10 rounded-2xl text-brand-crimson">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-brand-slate-dark font-display">
                Order Control Center
              </h2>
              <p className="text-xs text-slate-400">
                Manage live store orders, status transitions, courier dispatching, and cancellations
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
                refetch();
              }}
              disabled={isRefetching}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl border border-gray-200 text-xs font-bold text-slate-600 hover:text-brand-crimson hover:border-brand-crimson transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Quick Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
          <div
            onClick={() => setStatusFilter('')}
            className={`cursor-pointer bg-slate-50 border p-3 rounded-2xl transition-all ${
              statusFilter === '' ? 'border-brand-crimson shadow-sm bg-rose-50/20' : 'border-gray-100 hover:bg-slate-100/60'
            }`}
          >
            <p className="text-[10px] font-extrabold uppercase text-slate-400">All Orders</p>
            <p className="text-lg font-black text-brand-slate-dark">{totalCount}</p>
          </div>

          <div
            onClick={() => setStatusFilter('CONFIRMED')}
            className={`cursor-pointer bg-slate-50 border p-3 rounded-2xl transition-all ${
              statusFilter === 'CONFIRMED' || statusFilter === 'PENDING' ? 'border-blue-500 shadow-sm bg-blue-50/30' : 'border-gray-100 hover:bg-slate-100/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-extrabold uppercase text-blue-600">Pending / Confirmed</p>
              <Clock className="w-3.5 h-3.5 text-blue-500" />
            </div>
            <p className="text-lg font-black text-blue-900">{pendingCount}</p>
          </div>

          <div
            onClick={() => setStatusFilter('SHIPPED')}
            className={`cursor-pointer bg-slate-50 border p-3 rounded-2xl transition-all ${
              statusFilter === 'SHIPPED' ? 'border-purple-500 shadow-sm bg-purple-50/30' : 'border-gray-100 hover:bg-slate-100/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-extrabold uppercase text-purple-600">In-Transit / Shipped</p>
              <Truck className="w-3.5 h-3.5 text-purple-500" />
            </div>
            <p className="text-lg font-black text-purple-900">{shippedCount}</p>
          </div>

          <div
            onClick={() => setStatusFilter('DELIVERED')}
            className={`cursor-pointer bg-slate-50 border p-3 rounded-2xl transition-all ${
              statusFilter === 'DELIVERED' ? 'border-emerald-500 shadow-sm bg-emerald-50/30' : 'border-gray-100 hover:bg-slate-100/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-extrabold uppercase text-emerald-600">Delivered</p>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <p className="text-lg font-black text-emerald-900">{deliveredCount}</p>
          </div>

          <div
            onClick={() => setStatusFilter('CANCELLED')}
            className={`cursor-pointer bg-slate-50 border p-3 rounded-2xl transition-all ${
              statusFilter === 'CANCELLED' ? 'border-rose-500 shadow-sm bg-rose-50/30' : 'border-gray-100 hover:bg-slate-100/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-extrabold uppercase text-rose-600">Cancelled</p>
              <Ban className="w-3.5 h-3.5 text-rose-500" />
            </div>
            <p className="text-lg font-black text-rose-900">{cancelledCount}</p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          {/* Live Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order #, customer name, email..."
              className="w-full bg-slate-50 border border-gray-200 rounded-2xl pl-10 pr-4 py-2 text-xs font-medium outline-none focus:border-brand-crimson focus:bg-white transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Filter Dropdown */}
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-auto">
              <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-auto bg-slate-50 border border-gray-200 rounded-2xl pl-9 pr-9 py-2 text-xs font-bold text-slate-700 outline-none focus:border-brand-crimson appearance-none cursor-pointer"
              >
                <option value="">All Statuses</option>
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {statusFilter && (
              <button
                onClick={() => setStatusFilter('')}
                className="text-xs font-bold text-rose-600 hover:underline whitespace-nowrap"
              >
                Clear Filter
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Orders Table */}
      <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin text-brand-crimson" />
            <p className="text-xs font-semibold text-slate-400">Loading store orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-20 text-center space-y-2">
            <Package className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-extrabold text-brand-slate-dark">No orders found</p>
            <p className="text-xs text-slate-400">Try clearing search filters or checking again later.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-[10px] uppercase font-extrabold text-slate-400 tracking-wider bg-slate-50/70">
                  <th className="py-3.5 px-5">Order # / Invoice</th>
                  <th className="py-3.5 px-4">Customer Info</th>
                  <th className="py-3.5 px-4">Items</th>
                  <th className="py-3.5 px-4">Grand Total</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Courier & Tracking</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-5 text-right">Admin Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order: any) => {
                  const currentStatus = order.orderStatus || order.status || 'PENDING';
                  const orderNumber = order.orderNumber || order.orderId || `#${order._id?.slice(-8).toUpperCase()}`;
                  const invoiceNumber = order.invoiceNumber || `NK-INV-${order._id?.slice(-5).toUpperCase()}`;

                  const customerName = order.customerInfo
                    ? `${order.customerInfo.firstName || ''} ${order.customerInfo.lastName || ''}`.trim()
                    : order.user
                    ? `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim()
                    : 'Guest Customer';

                  const customerEmail = order.customerInfo?.email || order.user?.email || 'N/A';
                  const customerPhone = order.customerInfo?.phone || order.shippingAddress?.phone || '';

                  const itemsCount = order.items?.length || 0;
                  const grandTotal = order.pricing?.grandTotal ?? order.totalAmount ?? 0;
                  const paymentMethod = order.paymentInfo?.method || 'COD';
                  const paymentStatus = order.paymentInfo?.status || (currentStatus === 'DELIVERED' ? 'PAID' : 'PENDING');

                  const courierPartner = order.shippingInfo?.courierPartner || order.courierPartner;
                  const trackingNumber = order.shippingInfo?.trackingNumber || order.trackingNumber;

                  const isCancelled = currentStatus === 'CANCELLED';

                  return (
                    <tr
                      key={order._id}
                      className="hover:bg-slate-50/60 transition-colors text-xs"
                    >
                      {/* Order & Invoice ID */}
                      <td className="py-4 px-5">
                        <div className="space-y-0.5">
                          <span className="font-mono text-xs font-black text-brand-slate-dark block">
                            {orderNumber}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono block">
                            {invoiceNumber}
                          </span>
                        </div>
                      </td>

                      {/* Customer Info */}
                      <td className="py-4 px-4">
                        <div className="space-y-0.5">
                          <p className="font-bold text-brand-slate-dark">
                            {customerName}
                          </p>
                          <p className="text-[10px] text-slate-400">{customerEmail}</p>
                          {customerPhone && (
                            <p className="text-[10px] font-semibold text-slate-500">{customerPhone}</p>
                          )}
                        </div>
                      </td>

                      {/* Items */}
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          {order.items?.[0]?.image ? (
                            <img
                              src={order.items[0].image}
                              alt={order.items[0].name || 'Product'}
                              className="w-9 h-9 object-cover rounded-xl border border-gray-200 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 flex-shrink-0">
                              <Package className="w-4 h-4" />
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-slate-700 line-clamp-1">
                              {order.items?.[0]?.name || order.items?.[0]?.product?.title || `${itemsCount} Products`}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {itemsCount} {itemsCount === 1 ? 'item' : 'items'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Amount & Payment Info */}
                      <td className="py-4 px-4">
                        <div className="space-y-0.5">
                          <p className="font-extrabold text-brand-crimson text-sm">
                            ₹{grandTotal.toLocaleString('en-IN')}
                          </p>
                          <div className="flex items-center space-x-1.5">
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.5 bg-slate-100 rounded text-slate-600">
                              {paymentMethod}
                            </span>
                            <span
                              className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                                paymentStatus === 'PAID'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {paymentStatus}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-block text-[9px] font-black uppercase px-2.5 py-1 rounded-full ${
                            STATUS_STYLES[currentStatus] || 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {currentStatus}
                        </span>
                      </td>

                      {/* Courier & Tracking */}
                      <td className="py-4 px-4">
                        {trackingNumber ? (
                          <div className="space-y-0.5">
                            <p className="font-bold text-brand-slate-dark text-[11px]">
                              {courierPartner || 'NiaKylie Express'}
                            </p>
                            <span className="inline-block font-mono text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-1.5 py-0.5 rounded">
                              {trackingNumber}
                            </span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleOpenTrackingModal(order)}
                            disabled={isCancelled}
                            className="inline-flex items-center space-x-1 text-[10px] font-extrabold text-slate-500 bg-slate-50 border border-slate-200 hover:border-brand-crimson hover:text-brand-crimson px-2 py-1 rounded-lg transition-colors disabled:opacity-30"
                          >
                            <Truck className="w-3 h-3 text-slate-400" />
                            <span>+ Assign AWB</span>
                          </button>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4 text-slate-500 text-[11px] whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5">
                        <div className="flex items-center justify-end space-x-2">
                          {/* Change Order Status Dropdown */}
                          <div className="relative">
                            <select
                              value={currentStatus}
                              onChange={(e) => handleStatusChange(order._id, e.target.value)}
                              disabled={updatingId === order._id || isCancelled}
                              className="text-[11px] font-bold bg-slate-50 border border-gray-200 rounded-xl pl-2.5 pr-6 py-1.5 outline-none cursor-pointer hover:border-brand-crimson focus:border-brand-crimson disabled:opacity-50 disabled:cursor-not-allowed appearance-none"
                            >
                              {ORDER_STATUSES.map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>

                          {/* Quick Dispatch / Tracking Modal Button */}
                          <button
                            onClick={() => handleOpenTrackingModal(order)}
                            disabled={isCancelled}
                            title="Assign / Update Courier Tracking"
                            className="p-2 rounded-xl border border-gray-200 text-slate-600 hover:text-brand-crimson hover:border-brand-crimson hover:bg-rose-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <Truck className="w-3.5 h-3.5" />
                          </button>

                          {/* Quick Cancel Order Button */}
                          {!isCancelled && currentStatus !== 'DELIVERED' && (
                            <button
                              onClick={() => setCancelModalOrder(order)}
                              title="Cancel Order"
                              className="p-2 rounded-xl border border-gray-200 text-rose-600 hover:bg-rose-100 hover:border-rose-300 transition-colors"
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Inspect Full Order Details */}
                          <button
                            onClick={() => setSelectedOrder(order)}
                            title="Inspect Order Details & Receipt"
                            className="p-2 rounded-xl bg-brand-crimson text-white hover:bg-brand-crimson-dark shadow-sm transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {updatingId === order._id && (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin text-brand-crimson" />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── MODAL 1: ORDER TRACKING & COURIER DISPATCH ─────────────────── */}
      {trackingModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-gray-100 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center space-x-2">
                <Truck className="w-5 h-5 text-brand-crimson" />
                <h3 className="text-base font-extrabold text-brand-slate-dark font-display">
                  Courier & Tracking Info
                </h3>
              </div>
              <button
                onClick={() => setTrackingModalOrder(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Update dispatch logistics for order{' '}
              <span className="font-mono font-bold text-brand-slate-dark">
                {trackingModalOrder.orderNumber || trackingModalOrder.orderId}
              </span>
            </p>

            <form onSubmit={handleSaveTracking} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Courier Partner
                </label>
                <select
                  value={courierPartner}
                  onChange={(e) => setCourierPartner(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-brand-crimson"
                >
                  {COURIER_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tracking / AWB Number
                </label>
                <input
                  type="text"
                  required
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="e.g. AWB9876543210"
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium outline-none focus:border-brand-crimson"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setTrackingModalOrder(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingTracking}
                  className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-brand-crimson text-white text-xs font-bold hover:bg-brand-crimson-dark shadow-sm disabled:opacity-50"
                >
                  {isSubmittingTracking ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>Save & Dispatch</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL 2: CANCEL ORDER CONFIRMATION ─────────────────────────── */}
      {cancelModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-gray-100 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center space-x-2 text-rose-600">
                <Ban className="w-5 h-5" />
                <h3 className="text-base font-extrabold font-display">Cancel Order</h3>
              </div>
              <button
                onClick={() => setCancelModalOrder(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Are you sure you want to cancel order{' '}
              <span className="font-mono font-bold text-brand-slate-dark">
                {cancelModalOrder.orderNumber || cancelModalOrder.orderId}
              </span>
              ? This action will set the order status to CANCELLED.
            </p>

            <form onSubmit={handleConfirmCancel} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Reason for Cancellation
                </label>
                <textarea
                  rows={3}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g. Out of stock, customer requested cancellation, invalid address..."
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl p-3 text-xs outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCancelModalOrder(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Keep Order
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCancel}
                  className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 shadow-sm disabled:opacity-50"
                >
                  {isSubmittingCancel ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5" />
                  )}
                  <span>Confirm Cancellation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL 3: FULL ORDER INSPECTION & RECEIPT ───────────────────── */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 max-w-3xl w-full shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-brand-crimson/10 text-brand-crimson rounded-2xl">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-brand-slate-dark font-display">
                    Order Details & Invoice Receipt
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    {selectedOrder.orderNumber || selectedOrder.orderId} · Invoice #{selectedOrder.invoiceNumber || `NK-INV-${selectedOrder._id?.slice(-5).toUpperCase()}`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 rounded-2xl border border-gray-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* General Meta Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-gray-100 text-xs">
              <div>
                <p className="text-[10px] font-extrabold uppercase text-slate-400">Order Status</p>
                <span
                  className={`inline-block text-[9px] font-black uppercase px-2 py-0.5 rounded-full mt-1 ${
                    STATUS_STYLES[selectedOrder.orderStatus || selectedOrder.status] || 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {selectedOrder.orderStatus || selectedOrder.status}
                </span>
              </div>
              <div>
                <p className="text-[10px] font-extrabold uppercase text-slate-400">Payment Info</p>
                <p className="font-bold text-brand-slate-dark mt-1">
                  {selectedOrder.paymentInfo?.method || 'COD'} ({selectedOrder.paymentInfo?.status || 'PENDING'})
                </p>
              </div>
              <div>
                <p className="text-[10px] font-extrabold uppercase text-slate-400">Order Date</p>
                <p className="font-bold text-brand-slate-dark mt-1">
                  {new Date(selectedOrder.createdAt).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-extrabold uppercase text-slate-400">Tracking Info</p>
                  <button
                    type="button"
                    onClick={() => handleOpenTrackingModal(selectedOrder)}
                    className="text-[9px] font-bold text-brand-crimson hover:underline"
                  >
                    Edit
                  </button>
                </div>
                <p className="font-bold text-brand-slate-dark mt-1 truncate">
                  {selectedOrder.shippingInfo?.trackingNumber || selectedOrder.trackingNumber ? (
                    <span>
                      {selectedOrder.shippingInfo?.courierPartner || selectedOrder.courierPartner || 'Courier'}:{' '}
                      {selectedOrder.shippingInfo?.trackingNumber || selectedOrder.trackingNumber}
                    </span>
                  ) : (
                    <span className="text-slate-400 italic">Not assigned</span>
                  )}
                </p>
              </div>
            </div>

            {/* Address & Customer Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Shipping Address */}
              <div className="border border-gray-100 rounded-2xl p-4 space-y-1">
                <p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Shipping Address</p>
                <p className="text-xs font-bold text-brand-slate-dark">
                  {selectedOrder.customerInfo?.firstName || selectedOrder.user?.firstName}{' '}
                  {selectedOrder.customerInfo?.lastName || selectedOrder.user?.lastName}
                </p>
                <p className="text-xs text-slate-600">{selectedOrder.shippingAddress?.street}</p>
                <p className="text-xs text-slate-600">
                  {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.postalCode}
                </p>
                <p className="text-xs text-slate-500 font-semibold">
                  Phone: {selectedOrder.customerInfo?.phone || selectedOrder.shippingAddress?.phone || 'N/A'}
                </p>
              </div>

              {/* Customer Contact */}
              <div className="border border-gray-100 rounded-2xl p-4 space-y-1">
                <p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Customer Details</p>
                <p className="text-xs font-bold text-brand-slate-dark">
                  {selectedOrder.customerInfo?.firstName || selectedOrder.user?.firstName}{' '}
                  {selectedOrder.customerInfo?.lastName || selectedOrder.user?.lastName}
                </p>
                <p className="text-xs text-slate-600">{selectedOrder.customerInfo?.email || selectedOrder.user?.email}</p>
                <div className="flex items-center space-x-1 mt-2 text-emerald-600 font-bold text-[10px]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified Customer Order</span>
                </div>
              </div>
            </div>

            {/* Itemized Table */}
            <div>
              <p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider mb-2">Itemized Breakdown</p>
              <div className="border border-gray-100 rounded-2xl overflow-hidden divide-y divide-gray-100">
                {selectedOrder.items?.map((item: any, idx: number) => (
                  <div key={idx} className="p-3 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-10 h-10 object-cover rounded-xl border border-gray-200"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                          <Package className="w-4 h-4" />
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-brand-slate-dark">{item.name || item.product?.title || 'Product'}</p>
                        <p className="text-[10px] text-slate-400">
                          SKU: {item.sku || 'NK-STD'} · Variant: {item.color || 'Standard'} / {item.size || 'Free'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-brand-slate-dark">
                        ₹{(item.unitPrice || item.price || 0).toLocaleString('en-IN')} × {item.quantity}
                      </p>
                      <p className="font-extrabold text-brand-crimson">
                        ₹{(item.totalPrice || (item.unitPrice || item.price || 0) * item.quantity).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing Summary */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-gray-100 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-bold">₹{(selectedOrder.pricing?.subtotal || selectedOrder.totalAmount || 0).toLocaleString('en-IN')}</span>
              </div>
              {selectedOrder.pricing?.totalDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Product Discount</span>
                  <span>-₹{selectedOrder.pricing.totalDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Shipping Fee</span>
                <span>{selectedOrder.pricing?.shippingFee ? `₹${selectedOrder.pricing.shippingFee}` : 'FREE'}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-brand-slate-dark pt-2 border-t border-gray-200">
                <span>Grand Total</span>
                <span className="text-brand-crimson">
                  ₹{(selectedOrder.pricing?.grandTotal || selectedOrder.totalAmount || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => window.print()}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                <Printer className="w-4 h-4" />
                <span>Print Invoice</span>
              </button>

              <button
                onClick={() => setSelectedOrder(null)}
                className="px-6 py-2 rounded-xl bg-brand-crimson text-white text-xs font-bold hover:bg-brand-crimson-dark shadow-sm"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminOrdersPanel;
