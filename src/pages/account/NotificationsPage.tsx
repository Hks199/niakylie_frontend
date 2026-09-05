import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Bell,
  CheckCheck,
  Trash2,
  Package,
  Tag,
  ShieldAlert,
  Loader2,
  Mail,
  MessageSquare,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Filter,
  BellRing,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { notificationsApi, AppNotification, NotificationPreferences } from '../../api/notifications';
import { profileApi } from '../../api/profile';
import { useAuthStore } from '../../store/useAuthStore';
import { User } from '../../types/auth';
import { checkIsAdmin } from '../../utils/roleUtils';

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

/** Admin-only: product review alerts must not appear in the customer notification inbox */
function isProductReviewNotification(n: AppNotification): boolean {
  const meta = n.metadata || {};
  if (meta.isAdminEvent && (meta.targetTab === 'reviews' || meta.reviewId)) return true;
  if (meta.targetTab === 'reviews' || meta.reviewId) return true;
  const title = (n.title || '').toLowerCase();
  return title.includes('product review') || title.includes('customer review') || title.includes('new review');
}

export function NotificationsPage() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const isAdmin = checkIsAdmin(user);
  const [filterType, setFilterType] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [prefSuccess, setPrefSuccess] = useState('');
  const [prefError, setPrefError] = useState('');
  const [permissionStatus, setPermissionStatus] = useState<string>('default');

  // Check browser notification permission status on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermissionStatus(Notification.permission);
    } else {
      setPermissionStatus('unsupported');
    }
  }, []);

  const queryParams = useMemo(() => {
    const params: { page: number; limit: number; isRead?: boolean; type?: string } = {
      page,
      limit,
    };
    if (filterType === 'unread') {
      params.isRead = false;
    } else if (filterType === 'order_update') {
      params.type = 'ORDER_UPDATE';
    } else if (filterType === 'offer') {
      params.type = 'OFFER';
    }
    return params;
  }, [page, limit, filterType]);

  // 1. Fetch user notifications (paginated)
  const { data: notificationsData, isLoading: loadingNotifications, isFetching } = useQuery({
    queryKey: ['myNotifications', queryParams],
    queryFn: () => notificationsApi.getMyNotifications(queryParams),
    placeholderData: (prev) => prev,
  });

  // 2. Fetch user profile for initial notification preferences
  const { data: profile } = useQuery<User>({
    queryKey: ['profile'],
    queryFn: profileApi.getProfile,
  });

  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email: profile?.notificationPreferences?.email ?? true,
    sms: profile?.notificationPreferences?.sms ?? true,
    push: profile?.notificationPreferences?.push ?? true,
  });

  useEffect(() => {
    if (profile?.notificationPreferences) {
      setPreferences({
        email: profile.notificationPreferences.email ?? true,
        sms: profile.notificationPreferences.sms ?? true,
        push: profile.notificationPreferences.push ?? true,
      });
    }
  }, [profile?.notificationPreferences]);

  const handleFilterChange = (nextFilter: string) => {
    setFilterType(nextFilter);
    setPage(1);
  };

  // Mutations
  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myNotifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadNotificationsCount'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myNotifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadNotificationsCount'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myNotifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadNotificationsCount'] });
    },
  });

  const updatePrefMutation = useMutation({
    mutationFn: (newPrefs: NotificationPreferences) => notificationsApi.updateNotificationPreferences(newPrefs),
    onSuccess: (updatedUser: any) => {
      setPrefSuccess('Notification preferences updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      if (updatedUser?.notificationPreferences) {
        const { user, setUser } = useAuthStore.getState();
        if (user) {
          setUser({ ...user, notificationPreferences: updatedUser.notificationPreferences });
        }
      }
      setTimeout(() => setPrefSuccess(''), 4000);
    },
    onError: (err: any) => {
      setPrefError(err?.message || 'Failed to update preferences.');
      setTimeout(() => setPrefError(''), 4000);
    },
  });

  const handleNotificationClick = (n: AppNotification) => {
    const notifId = n._id || (n as any).id;
    if (!n.isRead && notifId) {
      markReadMutation.mutate(notifId);
    }
    if (n.metadata?.link) {
      window.location.href = n.metadata.link;
      return;
    }
    const notifType = (n.type || '').toUpperCase();
    if (notifType.includes('ORDER') || n.metadata?.orderNumber) {
      window.location.href = '/account/orders';
    } else if (notifType.includes('OFFER') || notifType.includes('COUPON') || notifType.includes('PRICE') || notifType.includes('PROMOTIONAL')) {
      window.location.href = '/products';
    }
  };

  const handleTogglePref = async (key: keyof NotificationPreferences) => {
    const nextValue = !preferences[key];

    if (key === 'push' && nextValue) {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'default') {
          const perm = await Notification.requestPermission();
          setPermissionStatus(perm);
          if (perm === 'denied') {
            setPrefError('Push notifications are blocked in your browser. Please update browser site permissions.');
            setTimeout(() => setPrefError(''), 5000);
          }
        } else if (Notification.permission === 'denied') {
          setPermissionStatus('denied');
          setPrefError('Push notifications are blocked in your browser. Please update browser site permissions.');
          setTimeout(() => setPrefError(''), 5000);
        }
      }
    }

    const updated = { ...preferences, [key]: nextValue };
    setPreferences(updated);
    updatePrefMutation.mutate(updated);
  };

  const handleRequestBrowserPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const perm = await Notification.requestPermission();
      setPermissionStatus(perm);
      if (perm === 'granted') {
        setPrefSuccess('Browser notification permission granted!');
        setTimeout(() => setPrefSuccess(''), 4000);
      } else if (perm === 'denied') {
        setPrefError('Permission denied. Please unblock notifications in your browser settings bar.');
        setTimeout(() => setPrefError(''), 5000);
      }
    }
  };

  const rawNotifications: AppNotification[] = Array.isArray(notificationsData)
    ? notificationsData
    : Array.isArray((notificationsData as any)?.data)
    ? (notificationsData as any).data
    : [];

  // Server already applies filter/type; only strip residual admin review alerts for customers
  const notifications = rawNotifications.filter((n) => {
    if (!isAdmin && isProductReviewNotification(n)) return false;
    return true;
  });

  const totalCount =
    typeof (notificationsData as any)?.total === 'number'
      ? (notificationsData as any).total
      : notifications.length;

  const totalPages = Math.max(1, Math.ceil(totalCount / limit));

  // Keep page in bounds when total shrinks (e.g. after delete)
  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const unreadCount =
    typeof (notificationsData as any)?.unreadCount === 'number'
      ? (notificationsData as any).unreadCount
      : notifications.filter((n) => !n.isRead).length;

  const getIcon = (type: string) => {
    const t = (type || '').toLowerCase();
    switch (t) {
      case 'order_update':
        return <Package className="w-5 h-5 text-indigo-600" />;
      case 'offer':
      case 'coupon':
      case 'price_drop':
      case 'promotional':
        return <Tag className="w-5 h-5 text-emerald-600" />;
      case 'system':
      case 'back_in_stock':
        return <Bell className="w-5 h-5 text-amber-600" />;
      default:
        return <ShieldAlert className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* ── Main Header ────────────────────────────────────────────── */}
      <div className="bg-white border border-gray-100 rounded-xl sm:rounded-3xl p-3.5 sm:p-6 shadow-sm space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-gray-100">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm sm:text-xl font-extrabold text-brand-slate-dark font-display">Notifications</h2>
              {unreadCount > 0 && (
                <span className="text-[9px] sm:text-[10px] font-extrabold bg-brand-crimson text-white px-1.5 sm:px-2 py-0.5 rounded-full">
                  {unreadCount} UNREAD
                </span>
              )}
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">Stay updated on your order dispatches, special deals, and account alerts.</p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={() => markAllReadMutation.mutate()}
              disabled={markAllReadMutation.isPending}
              className="flex items-center justify-center space-x-1.5 text-[11px] sm:text-xs font-bold text-brand-crimson hover:text-brand-crimson-dark bg-brand-crimson/5 hover:bg-brand-crimson/10 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl transition-all"
            >
              {markAllReadMutation.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCheck className="w-3.5 h-3.5" />
              )}
              <span>Mark All as Read</span>
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[9px] sm:text-[10px] font-bold uppercase text-slate-400 flex items-center space-x-1 mr-0.5">
            <Filter className="w-3 h-3" />
            <span>Filter:</span>
          </span>
          {[
            { id: 'all', label: 'All Notifications' },
            { id: 'unread', label: `Unread (${unreadCount})` },
            { id: 'order_update', label: 'Orders' },
            { id: 'offer', label: 'Offers & Deals' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleFilterChange(tab.id)}
              className={`px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold transition-all whitespace-nowrap ${
                filterType === tab.id
                  ? 'bg-brand-slate-dark text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        {loadingNotifications && !notifications.length ? (
          <div className="flex items-center justify-center py-10 sm:py-12">
            <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-brand-crimson" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-10 sm:py-12 space-y-2.5 sm:space-y-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <p className="font-extrabold text-xs sm:text-sm text-brand-slate-dark">
              {filterType === 'unread' ? 'No Unread Notifications' : 'No notifications to display'}
            </p>
            <p className="text-[11px] sm:text-xs text-slate-400 max-w-sm mx-auto">
              {filterType === 'unread'
                ? "You are all caught up! All your order updates and promotional alerts have been read."
                : 'Order status updates and promotional updates will appear here.'}
            </p>

            {filterType !== 'all' && (
              <div className="pt-1.5 sm:pt-2">
                <button
                  onClick={() => handleFilterChange('all')}
                  className="text-[11px] sm:text-xs font-bold text-brand-crimson bg-brand-crimson/10 hover:bg-brand-crimson/20 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl transition-all"
                >
                  View All Notifications
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className={`space-y-2.5 sm:space-y-3 pt-1 sm:pt-2 ${isFetching ? 'opacity-60' : ''} transition-opacity`}>
            {notifications.map((n: AppNotification, idx: number) => {
              const notifId = n._id || (n as any).id || String(idx);
              const notifType = (n.type || '').toUpperCase();
              const isOrderNotif = notifType.includes('ORDER') || !!n.metadata?.orderNumber;
              const isOfferNotif = notifType.includes('OFFER') || notifType.includes('COUPON') || notifType.includes('PRICE') || notifType.includes('PROMOTIONAL');

              return (
                <div
                  key={notifId}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all flex items-start space-x-2.5 sm:space-x-4 cursor-pointer group ${
                    !n.isRead
                      ? 'bg-brand-crimson/5 border-brand-crimson/30 shadow-sm hover:border-brand-crimson/50'
                      : 'bg-white border-gray-100 hover:border-gray-300'
                  }`}
                >
                  <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-slate-50 border border-slate-100 flex-shrink-0 group-hover:scale-105 transition-transform">
                    {getIcon(n.type)}
                  </div>

                  <div className="flex-1 min-w-0 space-y-0.5 sm:space-y-1">
                    <div className="flex items-center justify-between gap-1.5 sm:gap-2">
                      <h4 className="font-extrabold text-[11px] sm:text-xs text-brand-slate-dark flex items-center space-x-1.5 sm:space-x-2">
                        <span>{n.title}</span>
                        {!n.isRead && (
                          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-brand-crimson animate-pulse" />
                        )}
                        {n.channel === 'push' && (
                          <span className="text-[8px] sm:text-[9px] font-extrabold uppercase bg-purple-100 text-purple-700 px-1 sm:px-1.5 py-0.5 rounded">
                            PUSH
                          </span>
                        )}
                      </h4>
                      <span className="text-[9px] sm:text-[10px] text-slate-400 whitespace-nowrap">
                        {n.createdAt
                          ? new Date(n.createdAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : ''}
                      </span>
                    </div>

                    <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">{n.message}</p>

                    <div className="flex items-center space-x-2.5 sm:space-x-3 pt-1" onClick={(e) => e.stopPropagation()}>
                      {isOrderNotif && (
                        <button
                          onClick={() => {
                            if (!n.isRead && notifId) markReadMutation.mutate(notifId);
                            window.location.href = '/account/orders';
                          }}
                          className="text-[10px] sm:text-[11px] font-bold text-indigo-600 hover:underline"
                        >
                          View Order Details →
                        </button>
                      )}
                      {isOfferNotif && (
                        <button
                          onClick={() => {
                            if (!n.isRead && notifId) markReadMutation.mutate(notifId);
                            window.location.href = '/products';
                          }}
                          className="text-[10px] sm:text-[11px] font-bold text-emerald-600 hover:underline"
                        >
                          Shop Offer →
                        </button>
                      )}
                      {!n.isRead && (
                        <button
                          onClick={() => markReadMutation.mutate(notifId)}
                          disabled={markReadMutation.isPending}
                          className="text-[10px] sm:text-[11px] font-bold text-brand-crimson hover:underline"
                        >
                          Mark read
                        </button>
                      )}
                      <button
                        onClick={() => deleteMutation.mutate(notifId)}
                        disabled={deleteMutation.isPending}
                        className="text-[10px] sm:text-[11px] font-medium text-slate-400 hover:text-rose-600 flex items-center space-x-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Pagination Controls */}
            {totalCount > 0 && (
              <div className="pt-3 sm:pt-4 mt-1 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] sm:text-xs">
                <div className="flex items-center flex-wrap justify-center gap-x-1.5 text-slate-500 font-medium">
                  <span>Showing</span>
                  <span className="font-bold text-slate-800">
                    {Math.min((page - 1) * limit + 1, totalCount)}
                  </span>
                  <span>–</span>
                  <span className="font-bold text-slate-800">
                    {Math.min(page * limit, totalCount)}
                  </span>
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
                      aria-label="Items per page"
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

                    <div className="px-2.5 sm:px-3.5 py-1 bg-white border border-gray-200 rounded-lg sm:rounded-xl font-bold text-slate-700 shadow-sm whitespace-nowrap">
                      {page} / {totalPages}
                    </div>

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
            )}
          </div>
        )}
      </div>

      {/* ── Notification Preferences Toggles Panel ────────────────── */}
      <div className="bg-white border border-gray-100 rounded-xl sm:rounded-3xl p-3.5 sm:p-6 shadow-sm space-y-4 sm:space-y-5">
        <div>
          <h3 className="text-sm sm:text-base font-extrabold text-brand-slate-dark font-display">Notification Preferences</h3>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">Control how and where you receive notifications from NIAKYLIE.</p>
        </div>

        {prefSuccess && (
          <div className="p-2.5 sm:p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{prefSuccess}</span>
          </div>
        )}

        {prefError && (
          <div className="p-2.5 sm:p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{prefError}</span>
          </div>
        )}

        <div className="space-y-3 sm:space-y-4 divide-y divide-gray-100">
          {/* Email Channel */}
          <div className="flex items-center justify-between pt-2.5 sm:pt-3">
            <div className="flex items-start space-x-2.5 sm:space-x-3">
              <div className="p-2 sm:p-2.5 bg-blue-50 text-blue-600 rounded-lg sm:rounded-xl mt-0.5 flex-shrink-0">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <p className="font-extrabold text-[11px] sm:text-xs text-brand-slate-dark">Email Notifications</p>
                <p className="text-[10px] sm:text-[11px] text-slate-500">Order invoices, dispatch tracking details, and account security emails.</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 ml-2">
              <input
                type="checkbox"
                checked={preferences.email}
                onChange={() => handleTogglePref('email')}
                className="sr-only peer"
              />
              <div className="w-9 sm:w-11 h-5 sm:h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 sm:after:h-5 after:w-4 sm:after:w-5 after:transition-all peer-checked:bg-brand-crimson"></div>
            </label>
          </div>

          {/* SMS Channel */}
          <div className="flex items-center justify-between pt-2.5 sm:pt-3 opacity-60">
            <div className="flex items-start space-x-2.5 sm:space-x-3">
              <div className="p-2 sm:p-2.5 bg-slate-100 text-slate-400 rounded-lg sm:rounded-xl mt-0.5 flex-shrink-0">
                <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-1.5 sm:space-x-2 flex-wrap">
                  <p className="font-extrabold text-[11px] sm:text-xs text-slate-600">SMS & WhatsApp Alerts</p>
                  <span className="text-[8px] sm:text-[9px] font-extrabold uppercase bg-slate-200 text-slate-600 px-1 sm:px-1.5 py-0.5 rounded">
                    Soon
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-400">Instant delivery updates and OTP verification alerts sent to your phone.</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-not-allowed ml-2" title="SMS & WhatsApp Alerts are currently disabled for upcoming implementation">
              <input
                type="checkbox"
                checked={false}
                disabled
                className="sr-only peer"
              />
              <div className="w-9 sm:w-11 h-5 sm:h-6 bg-slate-200 rounded-full peer cursor-not-allowed after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 sm:after:h-5 after:w-4 sm:after:w-5"></div>
            </label>
          </div>

          {/* Push Channel */}
          <div className="flex flex-col space-y-2.5 sm:space-y-3 pt-2.5 sm:pt-3">
            <div className="flex items-center justify-between">
              <div className="flex items-start space-x-2.5 sm:space-x-3">
                <div className="p-2 sm:p-2.5 bg-purple-50 text-purple-600 rounded-lg sm:rounded-xl mt-0.5 flex-shrink-0">
                  <Smartphone className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center space-x-1.5 sm:space-x-2 flex-wrap">
                    <p className="font-extrabold text-[11px] sm:text-xs text-brand-slate-dark">In-App & Push Notifications</p>

                    {/* Browser Push Permission Status Badge */}
                    {permissionStatus === 'granted' && (
                      <span className="text-[9px] sm:text-[10px] font-bold bg-emerald-100 text-emerald-700 px-1.5 sm:px-2 py-0.5 rounded-md flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Granted</span>
                      </span>
                    )}
                    {permissionStatus === 'denied' && (
                      <span className="text-[9px] sm:text-[10px] font-bold bg-red-100 text-red-700 px-1.5 sm:px-2 py-0.5 rounded-md flex items-center space-x-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>Blocked</span>
                      </span>
                    )}
                    {permissionStatus === 'default' && (
                      <span className="text-[9px] sm:text-[10px] font-bold bg-amber-100 text-amber-700 px-1.5 sm:px-2 py-0.5 rounded-md flex items-center space-x-1">
                        <BellRing className="w-3 h-3" />
                        <span>Required</span>
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">
                    Real-time alerts for price drops, new collection releases, order updates, and exclusive discount coupons.
                  </p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 ml-2">
                <input
                  type="checkbox"
                  checked={preferences.push}
                  onChange={() => handleTogglePref('push')}
                  className="sr-only peer"
                />
                <div className="w-9 sm:w-11 h-5 sm:h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 sm:after:h-5 after:w-4 sm:after:w-5 after:transition-all peer-checked:bg-brand-crimson"></div>
              </label>
            </div>

            {permissionStatus === 'default' && (
              <div className="pl-9 sm:pl-11 pt-0.5 sm:pt-1">
                <button
                  onClick={handleRequestBrowserPermission}
                  className="text-[10px] sm:text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-lg sm:rounded-xl transition-all flex items-center space-x-1 sm:space-x-1.5"
                >
                  <BellRing className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span>Grant Browser Notification Permission</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotificationsPage;
