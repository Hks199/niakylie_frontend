import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Tag,
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Calendar,
  Percent,
  IndianRupee,
  X,
  Loader2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { adminApi } from '../../api/admin';

interface CouponModalForm {
  _id?: string;
  code: string;
  title: string;
  description: string;
  type: 'FLAT' | 'PERCENTAGE';
  value: number;
  minOrderAmount: number;
  maxDiscount?: number;
  usageLimit?: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

const DEFAULT_FORM: CouponModalForm = {
  code: '',
  title: '',
  description: '',
  type: 'FLAT',
  value: 100,
  minOrderAmount: 0,
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  isActive: true,
};

export function AdminCouponsPanel() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<CouponModalForm | null>(null);
  const [formData, setFormData] = useState<CouponModalForm>(DEFAULT_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Debounce search input by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['admin-coupons', debouncedSearch, statusFilter, page, limit],
    queryFn: () =>
      adminApi.getAllCoupons({
        search: debouncedSearch || undefined,
        isActive: statusFilter === '' ? undefined : statusFilter === 'true',
        page,
        limit,
      }),
  });

  const coupons: any[] = Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
    ? data.data
    : Array.isArray((data as any)?.data?.data)
    ? (data as any).data.data
    : Array.isArray(data?.coupons)
    ? data.coupons
    : Array.isArray((data as any)?.items)
    ? (data as any).items
    : [];

  const totalCount =
    (data as any)?.total ??
    (data as any)?.totalItems ??
    (data as any)?.data?.total ??
    coupons.length;

  const totalPages =
    (data as any)?.totalPages ??
    (data as any)?.data?.totalPages ??
    (Math.ceil(totalCount / limit) || 1);

  const activeCount = coupons.filter((c) => c.isActive && !c.isDeleted).length;
  const flatCount = coupons.filter((c) => c.type === 'FLAT').length;
  const percentageCount = coupons.filter((c) => c.type === 'PERCENTAGE').length;

  const handleOpenCreateModal = () => {
    setEditingCoupon(null);
    setFormData(DEFAULT_FORM);
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (coupon: any) => {
    setEditingCoupon(coupon);
    setFormData({
      _id: coupon._id,
      code: coupon.code,
      title: coupon.title || '',
      description: coupon.description || '',
      type: coupon.type || 'FLAT',
      value: coupon.value || 0,
      minOrderAmount: coupon.minOrderAmount || 0,
      maxDiscount: coupon.maxDiscount ?? undefined,
      usageLimit: coupon.usageLimit ?? undefined,
      startDate: coupon.startDate ? new Date(coupon.startDate).toISOString().split('T')[0] : '',
      endDate: coupon.endDate ? new Date(coupon.endDate).toISOString().split('T')[0] : '',
      isActive: coupon.isActive ?? true,
    });
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim()) {
      setErrorMessage('Promo Code is required.');
      return;
    }
    if (formData.value <= 0) {
      setErrorMessage('Discount value must be greater than 0.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const payload: any = {
        code: formData.code.toUpperCase().trim(),
        title: formData.title || undefined,
        description: formData.description || undefined,
        type: formData.type,
        value: Number(formData.value),
        minOrderAmount: Number(formData.minOrderAmount) || 0,
        maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : undefined,
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : undefined,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        isActive: formData.isActive,
      };

      if (editingCoupon && editingCoupon._id) {
        await adminApi.updateCoupon(editingCoupon._id, payload);
        setSuccessMessage(`Promo code '${payload.code}' updated successfully!`);
      } else {
        await adminApi.createCoupon(payload);
        setSuccessMessage(`Promo code '${payload.code}' created successfully!`);
      }

      setTimeout(() => setSuccessMessage(''), 4000);
      setIsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      await refetch();
    } catch (err: any) {
      console.error('Failed to save coupon:', err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to save promo code. Make sure code is unique.';
      setErrorMessage(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (id: string) => {
    setTogglingId(id);
    try {
      await adminApi.toggleCouponStatus(id);
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      await refetch();
    } catch (err) {
      console.error('Failed to toggle coupon status', err);
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Are you sure you want to delete promo code '${code}'?`)) return;
    setDeletingId(id);
    try {
      await adminApi.deleteCoupon(id);
      setSuccessMessage(`Promo code '${code}' deleted.`);
      setTimeout(() => setSuccessMessage(''), 4000);
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      await refetch();
    } catch (err) {
      console.error('Failed to delete coupon', err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header Card */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-brand-crimson/10 rounded-2xl text-brand-crimson">
              <Tag className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-brand-slate-dark font-display">
                Promo Code & Coupon Management
              </h2>
              <p className="text-xs text-slate-400">
                Create and manage flat & percentage promotional discount codes across all products
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
                refetch();
              }}
              disabled={isRefetching}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl border border-gray-200 text-xs font-bold text-slate-600 hover:text-brand-crimson hover:border-brand-crimson transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center space-x-2 bg-brand-crimson hover:bg-brand-crimson-dark text-white text-xs font-extrabold px-4 py-2 rounded-2xl shadow-lg shadow-brand-crimson/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Promo Code</span>
            </button>
          </div>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-center space-x-2 text-emerald-800 text-xs font-bold animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Quick Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="bg-slate-50 border border-gray-100 p-3 rounded-2xl">
            <p className="text-[10px] font-extrabold uppercase text-slate-400">Total Promo Codes</p>
            <p className="text-lg font-black text-brand-slate-dark">{totalCount}</p>
          </div>

          <div className="bg-slate-50 border border-gray-100 p-3 rounded-2xl">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-extrabold uppercase text-emerald-600">Active Promo Codes</p>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <p className="text-lg font-black text-emerald-900">{activeCount}</p>
          </div>

          <div className="bg-slate-50 border border-gray-100 p-3 rounded-2xl">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-extrabold uppercase text-blue-600">Flat ₹ OFF</p>
              <IndianRupee className="w-3.5 h-3.5 text-blue-500" />
            </div>
            <p className="text-lg font-black text-blue-900">{flatCount}</p>
          </div>

          <div className="bg-slate-50 border border-gray-100 p-3 rounded-2xl">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-extrabold uppercase text-purple-600">Percentage % OFF</p>
              <Percent className="w-3.5 h-3.5 text-purple-500" />
            </div>
            <p className="text-lg font-black text-purple-900">{percentageCount}</p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by promo code or title..."
              className="w-full bg-slate-50 border border-gray-200 rounded-2xl pl-10 pr-4 py-2 text-xs font-medium outline-none focus:border-brand-crimson focus:bg-white transition-all"
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

          <div className="relative w-full sm:w-auto">
            <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full sm:w-auto bg-slate-50 border border-gray-200 rounded-2xl pl-9 pr-9 py-2 text-xs font-bold text-slate-700 outline-none focus:border-brand-crimson appearance-none cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="true">Active Only</option>
              <option value="false">Inactive Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-brand-crimson" />
            <p className="text-xs font-semibold text-slate-500">Loading store promo codes...</p>
          </div>
        ) : coupons.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto text-brand-crimson">
              <Tag className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-extrabold text-brand-slate-dark">No Promo Codes Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Create your first promotional discount code to offer Flat ₹ or % off discounts to shoppers.
            </p>
            <button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center space-x-1.5 text-xs font-extrabold bg-brand-crimson text-white px-4 py-2 rounded-xl shadow hover:bg-brand-crimson-dark transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Promo Code</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-slate-50/50 text-[10px] uppercase font-black tracking-wider text-slate-400">
                  <th className="py-3.5 px-5">Promo Code</th>
                  <th className="py-3.5 px-4">Title & Details</th>
                  <th className="py-3.5 px-4">Discount</th>
                  <th className="py-3.5 px-4">Min Spend</th>
                  <th className="py-3.5 px-4">Validity</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {coupons.map((coupon) => {
                  const isFlat = coupon.type === 'FLAT';
                  const isExpired = new Date(coupon.endDate) < new Date();

                  return (
                    <tr key={coupon._id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Code */}
                      <td className="py-4 px-5">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-black text-xs text-brand-crimson bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-xl tracking-wider">
                            {coupon.code}
                          </span>
                          <Sparkles className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                        </div>
                      </td>

                      {/* Title */}
                      <td className="py-4 px-4 max-w-xs">
                        <p className="font-bold text-slate-800 text-xs truncate">
                          {coupon.title || coupon.code}
                        </p>
                        {coupon.description && (
                          <p className="text-[11px] text-slate-400 line-clamp-1">
                            {coupon.description}
                          </p>
                        )}
                      </td>

                      {/* Discount */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center space-x-1 text-xs font-black px-2.5 py-1 rounded-xl border ${
                            isFlat
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : 'bg-purple-50 text-purple-800 border-purple-200'
                          }`}
                        >
                          {isFlat ? (
                            <>
                              <span>₹{coupon.value} OFF</span>
                            </>
                          ) : (
                            <>
                              <span>{coupon.value}% OFF</span>
                              {coupon.maxDiscount && (
                                <span className="text-[10px] text-purple-600 font-normal">
                                  (Max ₹{coupon.maxDiscount})
                                </span>
                              )}
                            </>
                          )}
                        </span>
                      </td>

                      {/* Min Spend */}
                      <td className="py-4 px-4 font-bold text-slate-700">
                        {coupon.minOrderAmount > 0 ? (
                          `₹${coupon.minOrderAmount.toLocaleString('en-IN')}`
                        ) : (
                          <span className="text-slate-400 font-normal text-[11px]">No Min</span>
                        )}
                      </td>

                      {/* Validity */}
                      <td className="py-4 px-4 text-[11px] text-slate-500 whitespace-nowrap">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>
                            {new Date(coupon.endDate).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        {isExpired && (
                          <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded">
                            EXPIRED
                          </span>
                        )}
                      </td>

                      {/* Active Status */}
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => handleToggleStatus(coupon._id)}
                          disabled={togglingId === coupon._id}
                          className={`inline-flex items-center space-x-1 text-[10px] font-extrabold px-2.5 py-1 rounded-xl border transition-all ${
                            coupon.isActive
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200'
                              : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200'
                          }`}
                        >
                          {togglingId === coupon._id ? (
                            <RefreshCw className="w-3 h-3 animate-spin text-slate-400" />
                          ) : coupon.isActive ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>ACTIVE</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 text-slate-400" />
                              <span>OFFLINE</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleOpenEditModal(coupon)}
                            className="p-1.5 rounded-xl border border-gray-200 text-slate-600 hover:text-brand-crimson hover:border-brand-crimson hover:bg-rose-50 transition-colors"
                            title="Edit Promo Code"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDelete(coupon._id, coupon.code)}
                            disabled={deletingId === coupon._id}
                            className="p-1.5 rounded-xl border border-gray-200 text-rose-600 hover:bg-rose-100 hover:border-rose-300 transition-colors disabled:opacity-50"
                            title="Delete Promo Code"
                          >
                            {deletingId === coupon._id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
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
                  <span>promo codes</span>
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

      {/* ─── CREATE / EDIT PROMO CODE MODAL ─────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-gray-100 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center space-x-2">
                <Tag className="w-5 h-5 text-brand-crimson" />
                <h3 className="text-base font-extrabold text-brand-slate-dark font-display">
                  {editingCoupon ? 'Edit Promo Code' : 'Create New Promo Code'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMessage && (
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3 text-xs font-bold text-rose-700">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Code */}
              <div>
                <label className="block text-[11px] font-extrabold uppercase text-slate-500 mb-1">
                  Promo Code *
                </label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. FLAT100, FESTIVE20"
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-mono font-bold uppercase outline-none focus:border-brand-crimson focus:bg-white"
                />
              </div>

              {/* Title & Description */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase text-slate-500 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Flat ₹100 Off"
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-medium outline-none focus:border-brand-crimson focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase text-slate-500 mb-1">
                    Discount Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value as 'FLAT' | 'PERCENTAGE' })
                    }
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-700 outline-none focus:border-brand-crimson cursor-pointer"
                  >
                    <option value="FLAT">FLAT ₹ OFF</option>
                    <option value="PERCENTAGE">PERCENTAGE % OFF</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase text-slate-500 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Get ₹100 discount on any purchase"
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-medium outline-none focus:border-brand-crimson focus:bg-white"
                />
              </div>

              {/* Value & Min Subtotal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase text-slate-500 mb-1">
                    {formData.type === 'FLAT' ? 'Discount Amount (₹) *' : 'Discount Percent (%) *'}
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-bold outline-none focus:border-brand-crimson focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase text-slate-500 mb-1">
                    Min Subtotal Required (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minOrderAmount}
                    onChange={(e) =>
                      setFormData({ ...formData, minOrderAmount: Number(e.target.value) })
                    }
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-bold outline-none focus:border-brand-crimson focus:bg-white"
                  />
                </div>
              </div>

              {/* Start & End Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase text-slate-500 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium outline-none focus:border-brand-crimson"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase text-slate-500 mb-1">
                    Expiration Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium outline-none focus:border-brand-crimson"
                  />
                </div>
              </div>

              {/* Active Switch */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="text-xs font-bold text-slate-700">Enable Promo Code Immediately</span>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                  className={`w-11 h-6 rounded-full p-1 transition-colors ${
                    formData.isActive ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      formData.isActive ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-slate-600 font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center space-x-2 bg-brand-crimson hover:bg-brand-crimson-dark text-white font-extrabold px-5 py-2 rounded-xl shadow-lg transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingCoupon ? 'Update Promo Code' : 'Save Promo Code'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminCouponsPanel;
