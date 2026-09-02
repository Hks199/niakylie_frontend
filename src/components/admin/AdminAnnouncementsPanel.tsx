import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Megaphone,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Loader2,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  Tag,
  Truck,
  Sparkles,
  Gift,
  Flame,
  Link as LinkIcon,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { adminApi } from '../../api/admin';

interface AnnouncementForm {
  text: string;
  badge: string;
  icon: string;
  link: string;
  priority: number;
  isActive: boolean;
}

const DEFAULT_FORM: AnnouncementForm = {
  text: '',
  badge: 'Limited Time',
  icon: 'Tag',
  link: '',
  priority: 0,
  isActive: true,
};

const BADGE_PRESETS = [
  'Limited Time',
  'Free Shipping',
  'Just Arrived',
  'Exclusive Offer',
  'Festive Sale',
  'Best Value',
];

const ICON_OPTIONS = [
  { label: 'Tag 🏷️', value: 'Tag', icon: Tag },
  { label: 'Truck 🚚', value: 'Truck', icon: Truck },
  { label: 'Sparkles ✨', value: 'Sparkles', icon: Sparkles },
  { label: 'Gift 🎁', value: 'Gift', icon: Gift },
  { label: 'Flame 🔥', value: 'Flame', icon: Flame },
];

export function AdminAnnouncementsPanel() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [formData, setFormData] = useState<AnnouncementForm>(DEFAULT_FORM);
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
    queryKey: ['admin-announcements', debouncedSearch, statusFilter, page, limit],
    queryFn: () =>
      adminApi.getAllAnnouncements({
        search: debouncedSearch || undefined,
        isActive: statusFilter === '' ? undefined : statusFilter === 'true',
        page,
        limit,
      }),
  });

  const announcements: any[] = Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
    ? data.data
    : Array.isArray((data as any)?.announcements)
    ? (data as any).announcements
    : Array.isArray((data as any)?.items)
    ? (data as any).items
    : [];

  const totalCount =
    (data as any)?.total ??
    (data as any)?.data?.total ??
    announcements.length;

  const totalPages =
    (data as any)?.totalPages ??
    (data as any)?.data?.totalPages ??
    (Math.ceil(totalCount / limit) || 1);

  const stats = (data as any)?.stats;
  const totalCountAll = stats?.total ?? totalCount;
  const activeCount = stats?.active ?? announcements.filter((a) => a.isActive && !a.isDeleted).length;

  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setFormData(DEFAULT_FORM);
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: any) => {
    setEditingItem(item);
    setFormData({
      text: item.text || '',
      badge: item.badge || 'Limited Time',
      icon: item.icon || 'Tag',
      link: item.link || '',
      priority: item.priority || 0,
      isActive: item.isActive ?? true,
    });
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.text.trim()) {
      setErrorMessage('Announcement message text is required');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      if (editingItem) {
        await adminApi.updateAnnouncement(editingItem._id, formData);
        setSuccessMessage('Announcement updated successfully!');
      } else {
        await adminApi.createAnnouncement(formData);
        setSuccessMessage('New announcement created successfully!');
      }

      setIsModalOpen(false);
      await queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
      refetch();

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || 'Failed to save announcement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (id: string) => {
    setTogglingId(id);
    try {
      await adminApi.toggleAnnouncementStatus(id);
      await queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
      refetch();
    } catch (err) {
      console.error('Failed to toggle status:', err);
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await adminApi.deleteAnnouncement(id);
      await queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
      refetch();
      setSuccessMessage('Announcement deleted successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Failed to delete announcement:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const renderIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'Truck':
        return <Truck className="w-3.5 h-3.5" />;
      case 'Sparkles':
        return <Sparkles className="w-3.5 h-3.5 text-amber-400" />;
      case 'Gift':
        return <Gift className="w-3.5 h-3.5 text-purple-400" />;
      case 'Flame':
        return <Flame className="w-3.5 h-3.5 text-orange-400" />;
      default:
        return <Tag className="w-3.5 h-3.5 text-rose-400" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header & Actions */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-rose-50 text-brand-crimson border border-rose-100">
              <Megaphone className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-brand-slate-dark">
                Storefront Announcement Bar
              </h2>
              <p className="text-xs text-slate-400">
                Manage live rotating top bar announcements, offer badges, and promotional ticker links
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5 w-full sm:w-auto">
            <button
              onClick={() => refetch()}
              disabled={isRefetching}
              title="Refresh Announcements"
              className="p-2.5 rounded-2xl border border-gray-200 text-slate-600 hover:text-brand-crimson hover:border-brand-crimson transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={handleOpenCreateModal}
              className="flex-1 sm:flex-none flex items-center justify-center space-x-2 bg-brand-crimson hover:bg-brand-crimson-dark text-white font-extrabold text-xs px-5 py-2.5 rounded-2xl transition-all shadow-md hover:shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span>Create Announcement</span>
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

        {/* KPI Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
          <div className="bg-slate-50 border border-gray-100 p-3 rounded-2xl">
            <p className="text-[10px] font-extrabold uppercase text-slate-400">Total Announcements</p>
            <p className="text-lg font-black text-brand-slate-dark">{totalCountAll}</p>
          </div>

          <div className="bg-slate-50 border border-gray-100 p-3 rounded-2xl">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-extrabold uppercase text-emerald-600">Active Store Tickers</p>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <p className="text-lg font-black text-emerald-900">{activeCount}</p>
          </div>

          <div className="bg-slate-50 border border-gray-100 p-3 rounded-2xl col-span-2 sm:col-span-1">
            <p className="text-[10px] font-extrabold uppercase text-purple-600">Display Order</p>
            <p className="text-xs text-slate-500 font-semibold mt-1">Sorted by Priority & Recency</p>
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
              placeholder="Search announcement message or badge..."
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
              <option value="false">Inactive / Hidden</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Announcements Table */}
      <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-brand-crimson" />
            <p className="text-xs font-semibold text-slate-500">Loading store announcements...</p>
          </div>
        ) : announcements.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto text-brand-crimson">
              <Megaphone className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-extrabold text-brand-slate-dark">No Announcements Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Create custom store announcements to display sale codes, free shipping offers, or new arrivals at the top of the store.
            </p>
            <button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center space-x-1.5 text-xs font-extrabold bg-brand-crimson text-white px-4 py-2 rounded-xl shadow hover:bg-brand-crimson-dark transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Announcement</span>
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-gray-100 text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">
                    <th className="py-3.5 px-4 sm:px-6">Announcement Text</th>
                    <th className="py-3.5 px-4">Badge & Icon</th>
                    <th className="py-3.5 px-4">Target Link</th>
                    <th className="py-3.5 px-4">Priority</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs font-medium">
                  {announcements.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center space-x-2.5">
                          <span className="p-1.5 rounded-lg bg-slate-100 text-slate-700">
                            {renderIconComponent(item.icon)}
                          </span>
                          <span className="font-extrabold text-brand-slate-dark max-w-xs sm:max-w-md truncate">
                            {item.text}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span className="inline-flex items-center space-x-1 text-[10px] uppercase font-black bg-rose-50 text-brand-crimson px-2.5 py-1 rounded-full border border-rose-200">
                          {renderIconComponent(item.icon)}
                          <span>{item.badge || 'Announcement'}</span>
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        {item.link ? (
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1 text-slate-600 hover:text-brand-crimson hover:underline font-mono text-[11px]"
                          >
                            <LinkIcon className="w-3 h-3" />
                            <span className="max-w-[120px] truncate">{item.link}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        ) : (
                          <span className="text-slate-300 italic text-[11px]">None</span>
                        )}
                      </td>

                      <td className="py-4 px-4 font-mono font-bold text-slate-600">
                        {item.priority || 0}
                      </td>

                      <td className="py-4 px-4">
                        <button
                          onClick={() => handleToggleStatus(item._id)}
                          disabled={togglingId === item._id}
                          className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase transition-all ${
                            item.isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          {togglingId === item._id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : item.isActive ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Active</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 text-slate-400" />
                              <span>Inactive</span>
                            </>
                          )}
                        </button>
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-brand-crimson hover:bg-rose-50 transition-colors"
                            title="Edit Announcement"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            disabled={deletingId === item._id}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50"
                            title="Delete Announcement"
                          >
                            {deletingId === item._id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-gray-100 bg-slate-50/50 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">
                  Showing Page <strong className="text-slate-800">{page}</strong> of{' '}
                  <strong className="text-slate-800">{totalPages}</strong>
                </span>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-1.5 rounded-xl border border-gray-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-mono font-bold text-slate-700 px-2">{page}</span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="p-1.5 rounded-xl border border-gray-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-40"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal Form for Create / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-gray-100 rounded-3xl shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <Megaphone className="w-5 h-5 text-brand-crimson" />
                <h3 className="font-extrabold text-base text-brand-slate-dark">
                  {editingItem ? 'Edit Announcement' : 'Create New Announcement'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3 flex items-center space-x-2 text-rose-700 text-xs font-bold">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
              {/* Message Text */}
              <div className="space-y-1">
                <label className="block text-[11px] font-extrabold uppercase text-slate-500">
                  Announcement Message Text <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  placeholder="e.g. FLAT 50% OFF FESTIVE SALE | Use Code: FESTIVE50"
                  className="w-full bg-slate-50 border border-gray-200 rounded-2xl p-3 outline-none focus:border-brand-crimson focus:bg-white font-medium transition-all"
                />
              </div>

              {/* Badge Text & Preset Chips */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-extrabold uppercase text-slate-500">
                  Offer Badge Text
                </label>
                <input
                  type="text"
                  value={formData.badge}
                  onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                  placeholder="e.g. Limited Time, Free Shipping"
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-brand-crimson focus:bg-white"
                />
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {BADGE_PRESETS.map((preset) => (
                    <button
                      type="button"
                      key={preset}
                      onClick={() => setFormData({ ...formData, badge: preset })}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition-colors ${
                        formData.badge === preset
                          ? 'bg-brand-crimson text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Icon & Priority Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-extrabold uppercase text-slate-500">
                    Badge Icon
                  </label>
                  <select
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-brand-crimson appearance-none cursor-pointer"
                  >
                    {ICON_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-extrabold uppercase text-slate-500">
                    Priority (Order)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })
                    }
                    placeholder="0"
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-brand-crimson"
                  />
                </div>
              </div>

              {/* Target Link URL */}
              <div className="space-y-1">
                <label className="block text-[11px] font-extrabold uppercase text-slate-500">
                  Shortcut Target Link (Optional)
                </label>
                <input
                  type="text"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  placeholder="e.g. /category/silk-sarees or #sale"
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-brand-crimson"
                />
              </div>

              {/* Active Toggle Switch */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="text-xs font-extrabold text-slate-700">Activate Ticker On Storefront</span>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                    formData.isActive ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      formData.isActive ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 font-bold hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-brand-crimson hover:bg-brand-crimson-dark text-white font-extrabold px-6 py-2 rounded-xl shadow-md transition-all flex items-center space-x-1.5 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>{editingItem ? 'Save Changes' : 'Publish Announcement'}</span>
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

export default AdminAnnouncementsPanel;
