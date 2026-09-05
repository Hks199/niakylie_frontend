import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ShoppingCart,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
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
  RotateCcw,
  Banknote,
} from 'lucide-react';
import { adminApi } from '../../api/admin';
import { formatImageUrl } from '../../utils/imageUtils';

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
  'RETURN_REQUESTED',
  'RETURNED',
  'REFUNDED',
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
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [trackingModalOrder, setTrackingModalOrder] = useState<any | null>(null);
  const [cancelModalOrder, setCancelModalOrder] = useState<any | null>(null);
  const [refundModalOrder, setRefundModalOrder] = useState<any | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [refundNotes, setRefundNotes] = useState('');
  const [isProcessingReturn, setIsProcessingReturn] = useState(false);

  // Tracking Form State
  const [courierPartner, setCourierPartner] = useState('NiaKylie Express Logistics');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [isSubmittingTracking, setIsSubmittingTracking] = useState(false);

  // Cancel Form State
  const [cancelReason, setCancelReason] = useState('');
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['admin-orders', search, statusFilter, page, limit],
    queryFn: () =>
      adminApi.getAllOrders({
        search: search || undefined,
        status: statusFilter || undefined,
        page,
        limit,
      }),
  });

  const orders = Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
    ? data.data
    : Array.isArray((data as any)?.data?.data)
    ? (data as any).data.data
    : Array.isArray(data?.orders)
    ? data.orders
    : Array.isArray((data as any)?.items)
    ? (data as any).items
    : [];

  // Pagination totals
  const totalCount =
    (data as any)?.total ??
    (data as any)?.totalItems ??
    (data as any)?.data?.total ??
    (data as any)?.data?.totalItems ??
    orders.length;

  const totalPages =
    (data as any)?.totalPages ??
    (data as any)?.data?.totalPages ??
    (Math.ceil(totalCount / limit) || 1);

  // Metrics counts
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
  const returnRequestedCount = orders.filter(
    (o: any) => o.orderStatus === 'RETURN_REQUESTED' || o.status === 'RETURN_REQUESTED'
  ).length;

  const refreshOrders = async () => {
    queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    queryClient.invalidateQueries({ queryKey: ['admin-summary'] });
    await refetch();
  };

  const handleApproveReturn = async (order: any) => {
    const orderId = order._id || order.id || order.orderNumber;
    setIsProcessingReturn(true);
    try {
      await adminApi.approveReturn(orderId);
      await refreshOrders();
      if (selectedOrder) setSelectedOrder(null);
    } catch (err) {
      console.error('Failed to approve return', err);
      alert((err as any)?.message || 'Failed to approve return');
    } finally {
      setIsProcessingReturn(false);
    }
  };

  const handleRejectReturn = async (order: any) => {
    const reason = rejectReason.trim() || window.prompt('Rejection reason') || '';
    if (!reason.trim()) return;
    const orderId = order._id || order.id || order.orderNumber;
    setIsProcessingReturn(true);
    try {
      await adminApi.rejectReturn(orderId, reason.trim());
      setRejectReason('');
      await refreshOrders();
      if (selectedOrder) setSelectedOrder(null);
    } catch (err) {
      console.error('Failed to reject return', err);
      alert((err as any)?.message || 'Failed to reject return');
    } finally {
      setIsProcessingReturn(false);
    }
  };

  const handleProcessRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundModalOrder) return;
    const orderId =
      refundModalOrder._id || refundModalOrder.id || refundModalOrder.orderNumber;
    setIsProcessingReturn(true);
    try {
      await adminApi.markRefunded(orderId, {
        notes: refundNotes || 'Return refund processed by admin',
      });
      setRefundModalOrder(null);
      setRefundNotes('');
      await refreshOrders();
      if (selectedOrder) setSelectedOrder(null);
    } catch (err) {
      console.error('Failed to process refund', err);
      alert((err as any)?.message || 'Failed to process refund');
    } finally {
      setIsProcessingReturn(false);
    }
  };

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
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-300">
      {/* Top Header Card */}
      <div className="bg-white border border-gray-100 rounded-xl sm:rounded-3xl p-3.5 sm:p-6 shadow-sm space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            <div className="p-2.5 sm:p-3 bg-brand-crimson/10 rounded-xl sm:rounded-2xl text-brand-crimson flex-shrink-0">
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-extrabold text-brand-slate-dark font-display">
                Order Control Center
              </h2>
              <p className="text-[10px] sm:text-xs text-slate-400">
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
              className="flex items-center space-x-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl sm:rounded-2xl border border-gray-200 text-[11px] sm:text-xs font-bold text-slate-600 hover:text-brand-crimson hover:border-brand-crimson transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Quick Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 pt-1">
          <div
            onClick={() => {
              setStatusFilter('');
              setPage(1);
            }}
            className={`cursor-pointer bg-slate-50 border p-2.5 sm:p-3 rounded-xl sm:rounded-2xl transition-all ${
              statusFilter === '' ? 'border-brand-crimson shadow-sm bg-rose-50/20' : 'border-gray-100 hover:bg-slate-100/60'
            }`}
          >
            <p className="text-[9px] sm:text-[10px] font-extrabold uppercase text-slate-400">All Orders</p>
            <p className="text-base sm:text-lg font-black text-brand-slate-dark">{totalCount}</p>
          </div>

          <div
            onClick={() => {
              setStatusFilter('CONFIRMED');
              setPage(1);
            }}
            className={`cursor-pointer bg-slate-50 border p-2.5 sm:p-3 rounded-xl sm:rounded-2xl transition-all ${
              statusFilter === 'CONFIRMED' || statusFilter === 'PENDING' ? 'border-blue-500 shadow-sm bg-blue-50/30' : 'border-gray-100 hover:bg-slate-100/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="text-[9px] sm:text-[10px] font-extrabold uppercase text-blue-600 truncate">Pending / Confirmed</p>
              <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-500 flex-shrink-0" />
            </div>
            <p className="text-base sm:text-lg font-black text-blue-900">{pendingCount}</p>
          </div>

          <div
            onClick={() => {
              setStatusFilter('SHIPPED');
              setPage(1);
            }}
            className={`cursor-pointer bg-slate-50 border p-2.5 sm:p-3 rounded-xl sm:rounded-2xl transition-all ${
              statusFilter === 'SHIPPED' ? 'border-purple-500 shadow-sm bg-purple-50/30' : 'border-gray-100 hover:bg-slate-100/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="text-[9px] sm:text-[10px] font-extrabold uppercase text-purple-600 truncate">Shipped</p>
              <Truck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-purple-500 flex-shrink-0" />
            </div>
            <p className="text-base sm:text-lg font-black text-purple-900">{shippedCount}</p>
          </div>

          <div
            onClick={() => {
              setStatusFilter('DELIVERED');
              setPage(1);
            }}
            className={`cursor-pointer bg-slate-50 border p-2.5 sm:p-3 rounded-xl sm:rounded-2xl transition-all ${
              statusFilter === 'DELIVERED' ? 'border-emerald-500 shadow-sm bg-emerald-50/30' : 'border-gray-100 hover:bg-slate-100/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="text-[9px] sm:text-[10px] font-extrabold uppercase text-emerald-600 truncate">Delivered</p>
              <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-500 flex-shrink-0" />
            </div>
            <p className="text-base sm:text-lg font-black text-emerald-900">{deliveredCount}</p>
          </div>

          <div
            onClick={() => {
              setStatusFilter('RETURN_REQUESTED');
              setPage(1);
            }}
            className={`cursor-pointer bg-slate-50 border p-2.5 sm:p-3 rounded-xl sm:rounded-2xl transition-all ${
              statusFilter === 'RETURN_REQUESTED' ? 'border-orange-500 shadow-sm bg-orange-50/30' : 'border-gray-100 hover:bg-slate-100/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="text-[9px] sm:text-[10px] font-extrabold uppercase text-orange-600 truncate">Returns</p>
              <RotateCcw className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-orange-500 flex-shrink-0" />
            </div>
            <p className="text-base sm:text-lg font-black text-orange-900">{returnRequestedCount}</p>
          </div>

          <div
            onClick={() => {
              setStatusFilter('CANCELLED');
              setPage(1);
            }}
            className={`cursor-pointer bg-slate-50 border p-2.5 sm:p-3 rounded-xl sm:rounded-2xl transition-all ${
              statusFilter === 'CANCELLED' ? 'border-rose-500 shadow-sm bg-rose-50/20' : 'border-gray-100 hover:bg-slate-100/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="text-[9px] sm:text-[10px] font-extrabold uppercase text-rose-600 truncate">Cancelled</p>
              <Ban className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-500 flex-shrink-0" />
            </div>
            <p className="text-base sm:text-lg font-black text-rose-900">{cancelledCount}</p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3 pt-1">
          {/* Live Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by order #, customer name, email..."
              className="w-full bg-slate-50 border border-gray-200 rounded-xl sm:rounded-2xl pl-9 pr-8 py-2 text-[11px] sm:text-xs font-medium outline-none focus:border-brand-crimson focus:bg-white transition-all"
            />
            {search && (
              <button
                onClick={() => {
                  setSearch('');
                  setPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Filter Dropdown */}
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-auto">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full sm:w-auto bg-slate-50 border border-gray-200 rounded-xl sm:rounded-2xl pl-8 pr-8 py-2 text-[11px] sm:text-xs font-bold text-slate-700 outline-none focus:border-brand-crimson appearance-none cursor-pointer"
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
                className="text-[11px] sm:text-xs font-bold text-rose-600 hover:underline whitespace-nowrap"
              >
                Clear Filter
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Orders Table */}
      <div className="bg-white border border-gray-100 rounded-xl sm:rounded-3xl shadow-sm overflow-hidden">
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
          <div className="overflow-x-auto scrollbar-none">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-100 text-[9px] sm:text-[10px] uppercase font-extrabold text-slate-400 tracking-wider bg-slate-50/70">
                  <th className="py-3 px-4">Order # / Invoice</th>
                  <th className="py-3 px-3">Customer Info</th>
                  <th className="py-3 px-3">Items</th>
                  <th className="py-3 px-3">Grand Total</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Courier & Tracking</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-4 text-right">Admin Controls</th>
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
                        <div className="flex items-center space-x-2.5">
                          {order.items && order.items.length > 0 ? (
                            <div className="flex items-center -space-x-2 overflow-hidden flex-shrink-0">
                              {order.items.slice(0, 3).map((item: any, idx: number) => {
                                const product = typeof item.productId === 'object' ? item.productId : item.product || {};
                                const rawImg = item.image || item.thumbnail || product.thumbnail || (Array.isArray(product.images) ? product.images[0] : product.images) || '';
                                const imgUrl = formatImageUrl(rawImg);
                                return (
                                  <img
                                    key={idx}
                                    src={imgUrl}
                                    alt={item.name || 'Order Item'}
                                    className="w-9 h-9 object-cover rounded-xl border-2 border-white shadow-xs bg-slate-100 flex-shrink-0"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=100&q=80';
                                    }}
                                  />
                                );
                              })}
                            </div>
                          ) : (
                            <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 flex-shrink-0">
                              <Package className="w-4 h-4" />
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-slate-700 line-clamp-1 max-w-[140px] sm:max-w-[200px]">
                              {order.items && order.items.length > 0
                                ? order.items.map((i: any) => i.name || i.product?.title || i.title).filter(Boolean).join(', ')
                                : `${itemsCount} Products`}
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
                          {!isCancelled && currentStatus !== 'DELIVERED' && currentStatus !== 'RETURN_REQUESTED' && currentStatus !== 'RETURNED' && currentStatus !== 'REFUNDED' && (
                            <button
                              onClick={() => setCancelModalOrder(order)}
                              title="Cancel Order"
                              className="p-2 rounded-xl border border-gray-200 text-rose-600 hover:bg-rose-100 hover:border-rose-300 transition-colors"
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {currentStatus === 'RETURN_REQUESTED' && (
                            <>
                              <button
                                onClick={() => handleApproveReturn(order)}
                                disabled={isProcessingReturn}
                                title="Approve Return (restock)"
                                className="p-2 rounded-xl border border-emerald-200 text-emerald-700 hover:bg-emerald-50 transition-colors disabled:opacity-50"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleRejectReturn(order)}
                                disabled={isProcessingReturn}
                                title="Reject Return"
                                className="p-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}

                          {currentStatus === 'RETURNED' && (
                            <button
                              onClick={() => {
                                setRefundModalOrder(order);
                                setRefundNotes('');
                              }}
                              disabled={isProcessingReturn}
                              title="Process Refund"
                              className="p-2 rounded-xl border border-teal-200 text-teal-700 hover:bg-teal-50 transition-colors disabled:opacity-50"
                            >
                              <Banknote className="w-3.5 h-3.5" />
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

            {/* Pagination Controls Bar */}
            {totalCount > 0 && (
              <div className="px-6 py-4 border-t border-gray-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                <div className="flex items-center space-x-2 text-slate-500 font-medium">
                  <span>Showing</span>
                  <span className="font-bold text-slate-800">
                    {Math.min((page - 1) * limit + 1, totalCount)}
                  </span>
                  <span>to</span>
                  <span className="font-bold text-slate-800">
                    {Math.min(page * limit, totalCount)}
                  </span>
                  <span>of</span>
                  <span className="font-bold text-slate-800">{totalCount}</span>
                  <span>orders</span>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-500 font-medium">Items per page:</span>
                    <select
                      value={limit}
                      onChange={(e) => {
                        setLimit(Number(e.target.value));
                        setPage(1);
                      }}
                      className="bg-white border border-gray-200 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-700 outline-none focus:border-brand-crimson cursor-pointer shadow-sm"
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                      disabled={page <= 1}
                      className="p-1.5 rounded-xl border border-gray-200 bg-white text-slate-600 hover:text-brand-crimson hover:border-brand-crimson disabled:opacity-30 disabled:hover:text-slate-600 disabled:hover:border-gray-200 transition-colors cursor-pointer disabled:cursor-not-allowed shadow-sm"
                      title="Previous Page"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <div className="px-3.5 py-1 bg-white border border-gray-200 rounded-xl font-bold text-slate-700 text-xs shadow-sm">
                      Page {page} of {totalPages}
                    </div>

                    <button
                      onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={page >= totalPages}
                      className="p-1.5 rounded-xl border border-gray-200 bg-white text-slate-600 hover:text-brand-crimson hover:border-brand-crimson disabled:opacity-30 disabled:hover:text-slate-600 disabled:hover:border-gray-200 transition-colors cursor-pointer disabled:cursor-not-allowed shadow-sm"
                      title="Next Page"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
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

            {/* Return / Refund Panel */}
            {selectedOrder.returnInfo && (
              <div className="border border-orange-200 bg-orange-50/60 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <RotateCcw className="w-4 h-4 text-orange-600" />
                    <p className="text-xs font-extrabold text-orange-800 uppercase tracking-wider">
                      Return Request · {selectedOrder.returnInfo.status || 'REQUESTED'}
                    </p>
                  </div>
                  {selectedOrder.returnInfo.refundAmount != null && (
                    <p className="text-sm font-black text-brand-slate-dark">
                      ₹{Number(selectedOrder.returnInfo.refundAmount).toLocaleString('en-IN')}
                    </p>
                  )}
                </div>
                <p className="text-xs text-slate-700">
                  Reason: <span className="font-semibold">{selectedOrder.returnInfo.reason || '—'}</span>
                </p>
                {selectedOrder.returnInfo.refundMethod && (
                  <p className="text-[11px] text-slate-600">
                    Refund via: <span className="font-bold">{selectedOrder.returnInfo.refundMethod}</span>
                    {selectedOrder.returnInfo.refundDetails?.upiId && (
                      <> · UPI {selectedOrder.returnInfo.refundDetails.upiId}</>
                    )}
                    {selectedOrder.returnInfo.refundDetails?.bankAccountNumber && (
                      <>
                        {' '}
                        · A/C {selectedOrder.returnInfo.refundDetails.bankAccountNumber} (
                        {selectedOrder.returnInfo.refundDetails.bankIfsc})
                      </>
                    )}
                  </p>
                )}
                {Array.isArray(selectedOrder.returnInfo.items) && (
                  <ul className="text-[11px] text-slate-600 list-disc pl-4">
                    {selectedOrder.returnInfo.items.map((ri: any, i: number) => (
                      <li key={i}>
                        {ri.name || ri.sku} × {ri.quantity} — ₹
                        {Number(ri.refundAmount || 0).toLocaleString('en-IN')}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="flex flex-wrap gap-2 pt-1">
                  {(selectedOrder.orderStatus === 'RETURN_REQUESTED' ||
                    selectedOrder.status === 'RETURN_REQUESTED') && (
                    <>
                      <button
                        onClick={() => handleApproveReturn(selectedOrder)}
                        disabled={isProcessingReturn}
                        className="text-[11px] font-extrabold bg-emerald-600 text-white px-3.5 py-2 rounded-xl disabled:opacity-50"
                      >
                        Approve & Restock
                      </button>
                      <button
                        onClick={() => handleRejectReturn(selectedOrder)}
                        disabled={isProcessingReturn}
                        className="text-[11px] font-extrabold bg-rose-600 text-white px-3.5 py-2 rounded-xl disabled:opacity-50"
                      >
                        Reject Return
                      </button>
                    </>
                  )}
                  {(selectedOrder.orderStatus === 'RETURNED' || selectedOrder.status === 'RETURNED') && (
                    <button
                      onClick={() => {
                        setRefundModalOrder(selectedOrder);
                        setRefundNotes('');
                      }}
                      disabled={isProcessingReturn}
                      className="text-[11px] font-extrabold bg-teal-600 text-white px-3.5 py-2 rounded-xl disabled:opacity-50"
                    >
                      Process Refund
                    </button>
                  )}
                </div>
              </div>
            )}

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
                {selectedOrder.items?.map((item: any, idx: number) => {
                  const product = typeof item.productId === 'object' ? item.productId : item.product || {};
                  const rawImg = item.image || item.thumbnail || product.thumbnail || (Array.isArray(product.images) ? product.images[0] : product.images) || '';
                  const imgUrl = formatImageUrl(rawImg);
                  return (
                    <div key={idx} className="p-3 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-3">
                        <img
                          src={imgUrl}
                          alt={item.name || 'Product'}
                          className="w-10 h-10 object-cover rounded-xl border border-gray-200 bg-slate-100 flex-shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=100&q=80';
                          }}
                        />
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
                  );
                })}
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

      {/* ─── MODAL 4: PROCESS RETURN REFUND ─────────────────────────────── */}
      {refundModalOrder && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white border border-gray-100 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center space-x-2">
                <Banknote className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-extrabold text-brand-slate-dark font-display">
                  Process Return Refund
                </h3>
              </div>
              <button
                onClick={() => setRefundModalOrder(null)}
                className="p-2 rounded-xl border border-gray-200 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Order{' '}
              <span className="font-bold">
                {refundModalOrder.orderNumber || refundModalOrder.orderId}
              </span>
              {' · '}
              Amount ₹
              {Number(
                refundModalOrder.returnInfo?.refundAmount ||
                  refundModalOrder.pricing?.grandTotal ||
                  0,
              ).toLocaleString('en-IN')}
            </p>

            {(refundModalOrder.paymentInfo?.method || '').toUpperCase() === 'COD' && (
              <div className="text-[11px] bg-slate-50 border border-gray-100 rounded-xl p-3 space-y-1">
                <p className="font-extrabold text-slate-700">COD refund destination</p>
                <p>
                  Method: {refundModalOrder.returnInfo?.refundMethod || 'UPI/BANK'}
                </p>
                {refundModalOrder.returnInfo?.refundDetails?.upiId && (
                  <p>UPI: {refundModalOrder.returnInfo.refundDetails.upiId}</p>
                )}
                {refundModalOrder.returnInfo?.refundDetails?.bankAccountNumber && (
                  <p>
                    Bank: {refundModalOrder.returnInfo.refundDetails.bankAccountName} ·{' '}
                    {refundModalOrder.returnInfo.refundDetails.bankAccountNumber} ·{' '}
                    {refundModalOrder.returnInfo.refundDetails.bankIfsc}
                  </p>
                )}
              </div>
            )}

            <form onSubmit={handleProcessRefund} className="space-y-3">
              <textarea
                value={refundNotes}
                onChange={(e) => setRefundNotes(e.target.value)}
                rows={2}
                placeholder="Refund notes (optional)"
                className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-brand-crimson resize-none"
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setRefundModalOrder(null)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessingReturn}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-extrabold disabled:opacity-50"
                >
                  {isProcessingReturn && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Confirm Refund</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminOrdersPanel;
