import { useState, useEffect } from 'react';
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
  Send,
} from 'lucide-react';
import { notificationsApi, AppNotification, NotificationPreferences } from '../../api/notifications';
import { profileApi } from '../../api/profile';
import { useAuthStore } from '../../store/useAuthStore';
import { User } from '../../types/auth';

export function NotificationsPage() {
  const queryClient = useQueryClient();
  const [filterType, setFilterType] = useState<string>('all');
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

  // 1. Fetch user notifications
  const { data: notificationsData, isLoading: loadingNotifications } = useQuery({
    queryKey: ['myNotifications', filterType],
    queryFn: () => {
      const isRead = filterType === 'unread' ? false : undefined;
      const type = filterType !== 'all' && filterType !== 'unread' ? filterType : undefined;
      return notificationsApi.getMyNotifications({ isRead, type });
    },
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

  const testPushMutation = useMutation({
    mutationFn: () => notificationsApi.testPushNotification(),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['myNotifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadNotificationsCount'] });
      setPrefSuccess('Test push notification generated! See notification list & browser pop-up.');

      // Fire Web Browser Native Notification popup
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification(res.notification?.title || '🔔 Push Notification Test', {
            body: res.notification?.message || 'Push notifications are working perfectly on your device!',
            icon: '/favicon.ico',
          });
        } else if (Notification.permission === 'default') {
          Notification.requestPermission().then((perm) => {
            setPermissionStatus(perm);
            if (perm === 'granted') {
              new Notification(res.notification?.title || '🔔 Push Notification Test', {
                body: res.notification?.message || 'Push notifications are working perfectly on your device!',
                icon: '/favicon.ico',
              });
            }
          });
        }
      }
      setTimeout(() => setPrefSuccess(''), 5000);
    },
    onError: (err: any) => {
      setPrefError(err?.message || 'Failed to send test push notification.');
      setTimeout(() => setPrefError(''), 5000);
    },
  });

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

  const notifications: AppNotification[] = Array.isArray(notificationsData)
    ? notificationsData
    : Array.isArray((notificationsData as any)?.data)
    ? (notificationsData as any).data
    : [];

  const unreadCount =
    typeof (notificationsData as any)?.unreadCount === 'number'
      ? (notificationsData as any).unreadCount
      : notifications.filter((n) => !n.isRead).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'order_update':
        return <Package className="w-5 h-5 text-indigo-600" />;
      case 'offer':
      case 'coupon':
      case 'price_drop':
        return <Tag className="w-5 h-5 text-emerald-600" />;
      case 'system':
      case 'back_in_stock':
        return <Bell className="w-5 h-5 text-amber-600" />;
      default:
        return <ShieldAlert className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Main Header ────────────────────────────────────────────── */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-extrabold text-brand-slate-dark font-display">Notifications</h2>
              {unreadCount > 0 && (
                <span className="text-[10px] font-extrabold bg-brand-crimson text-white px-2 py-0.5 rounded-full">
                  {unreadCount} UNREAD
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Stay updated on your order dispatches, special deals, and account alerts.</p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={() => markAllReadMutation.mutate()}
              disabled={markAllReadMutation.isPending}
              className="flex items-center justify-center space-x-1.5 text-xs font-bold text-brand-crimson hover:text-brand-crimson-dark bg-brand-crimson/5 hover:bg-brand-crimson/10 px-4 py-2 rounded-xl transition-all"
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
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center space-x-1 mr-1">
            <Filter className="w-3 h-3" />
            <span>Filter:</span>
          </span>
          {[
            { id: 'all', label: 'All Notifications' },
            { id: 'unread', label: 'Unread' },
            { id: 'order_update', label: 'Orders' },
            { id: 'offer', label: 'Offers & Deals' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
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
        {loadingNotifications ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-brand-crimson" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Bell className="w-6 h-6" />
            </div>
            <p className="font-extrabold text-sm text-brand-slate-dark">No notifications to display</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              You are all caught up! Order status updates and promotional updates will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3 pt-2">
            {notifications.map((n: AppNotification, idx: number) => {
              const notifId = n._id || (n as any).id || String(idx);
              return (
                <div
                  key={notifId}
                  className={`p-4 rounded-2xl border transition-all flex items-start space-x-4 ${
                    !n.isRead
                      ? 'bg-brand-crimson/5 border-brand-crimson/30 shadow-sm'
                      : 'bg-white border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex-shrink-0">
                    {getIcon(n.type)}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-extrabold text-xs text-brand-slate-dark flex items-center space-x-2">
                        <span>{n.title}</span>
                        {!n.isRead && (
                          <span className="w-2 h-2 rounded-full bg-brand-crimson animate-pulse" />
                        )}
                        {n.channel === 'push' && (
                          <span className="text-[9px] font-extrabold uppercase bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">
                            PUSH
                          </span>
                        )}
                      </h4>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">
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

                    <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>

                    <div className="flex items-center space-x-3 pt-1">
                      {!n.isRead && (
                        <button
                          onClick={() => markReadMutation.mutate(notifId)}
                          disabled={markReadMutation.isPending}
                          className="text-[11px] font-bold text-brand-crimson hover:underline"
                        >
                          Mark as read
                        </button>
                      )}
                      <button
                        onClick={() => deleteMutation.mutate(notifId)}
                        disabled={deleteMutation.isPending}
                        className="text-[11px] font-medium text-slate-400 hover:text-rose-600 flex items-center space-x-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Notification Preferences Toggles Panel ────────────────── */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-5">
        <div>
          <h3 className="text-base font-extrabold text-brand-slate-dark font-display">Notification Preferences</h3>
          <p className="text-xs text-slate-500 mt-0.5">Control how and where you receive notifications from NIAKYLIE.</p>
        </div>

        {prefSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{prefSuccess}</span>
          </div>
        )}

        {prefError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{prefError}</span>
          </div>
        )}

        <div className="space-y-4 divide-y divide-gray-100">
          {/* Email Channel */}
          <div className="flex items-center justify-between pt-3">
            <div className="flex items-start space-x-3">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl mt-0.5">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="font-extrabold text-xs text-brand-slate-dark">Email Notifications</p>
                <p className="text-[11px] text-slate-500">Order invoices, dispatch tracking details, and account security emails.</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.email}
                onChange={() => handleTogglePref('email')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-crimson"></div>
            </label>
          </div>

          {/* SMS Channel */}
          <div className="flex items-center justify-between pt-3 opacity-60">
            <div className="flex items-start space-x-3">
              <div className="p-2.5 bg-slate-100 text-slate-400 rounded-xl mt-0.5">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <p className="font-extrabold text-xs text-slate-600">SMS & WhatsApp Alerts</p>
                  <span className="text-[9px] font-extrabold uppercase bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">
                    Coming Soon
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Instant delivery updates and OTP verification alerts sent to your phone.</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-not-allowed" title="SMS & WhatsApp Alerts are currently disabled for upcoming implementation">
              <input
                type="checkbox"
                checked={false}
                disabled
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 rounded-full peer cursor-not-allowed after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5"></div>
            </label>
          </div>

          {/* Push Channel */}
          <div className="flex flex-col space-y-3 pt-3">
            <div className="flex items-center justify-between">
              <div className="flex items-start space-x-3">
                <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl mt-0.5">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <p className="font-extrabold text-xs text-brand-slate-dark">In-App & Push Notifications</p>

                    {/* Browser Push Permission Status Badge */}
                    {permissionStatus === 'granted' && (
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Permission Granted</span>
                      </span>
                    )}
                    {permissionStatus === 'denied' && (
                      <span className="text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-md flex items-center space-x-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>Permission Blocked</span>
                      </span>
                    )}
                    {permissionStatus === 'default' && (
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-md flex items-center space-x-1">
                        <BellRing className="w-3 h-3" />
                        <span>Permission Required</span>
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Price drop alerts, new collection drops, and exclusive discount coupons.
                  </p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input
                  type="checkbox"
                  checked={preferences.push}
                  onChange={() => handleTogglePref('push')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-crimson"></div>
              </label>
            </div>

            {/* Sub-actions for Push Notifications */}
            <div className="flex flex-wrap items-center gap-2 pl-11 pt-1">
              {permissionStatus === 'default' && (
                <button
                  onClick={handleRequestBrowserPermission}
                  className="text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-3 py-1.5 rounded-xl transition-all flex items-center space-x-1.5"
                >
                  <BellRing className="w-3.5 h-3.5" />
                  <span>Grant Browser Permission</span>
                </button>
              )}

              <button
                onClick={() => testPushMutation.mutate()}
                disabled={testPushMutation.isPending || !preferences.push}
                className={`text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all flex items-center space-x-1.5 ${
                  preferences.push
                    ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-sm hover:shadow'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
                title={!preferences.push ? 'Enable Push Notifications to test' : 'Send a test push notification'}
              >
                {testPushMutation.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>Send Test Push Notification</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotificationsPage;
