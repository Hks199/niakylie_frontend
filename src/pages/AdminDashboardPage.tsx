import { useState, useRef, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Loader2,
  Bell,
  Search,
  RefreshCw,
  Menu,
  X,
  AlertTriangle,
  Package,
  ShoppingBag,
  CheckCheck,
  ChevronRight,
  Clock,
  CheckCircle2,
  Star,
} from 'lucide-react';
import { adminApi } from '../api/admin';
import { notificationsApi, AppNotification } from '../api/notifications';
import { AdminSidebar, NAV_ITEMS } from '../components/admin/AdminSidebar';
import { KpiSummaryGrid } from '../components/admin/KpiSummaryGrid';
import { AnalyticsChartsSection } from '../components/admin/AnalyticsChartsSection';
import { AdminDataTables } from '../components/admin/AdminDataTables';
import { AdminProductManagement } from '../components/admin/AdminProductManagement';
import { AdminOrdersPanel } from '../components/admin/AdminOrdersPanel';
import { AdminReviewsPanel } from '../components/admin/AdminReviewsPanel';
import { AdminBannersPanel } from '../components/admin/AdminBannersPanel';
import { AdminCategoriesPanel } from '../components/admin/AdminCategoriesPanel';
import { AdminBrandsPanel } from '../components/admin/AdminBrandsPanel';
import { AdminFaqManagement } from '../components/admin/AdminFaqManagement';
import { AdminCouponsPanel } from '../components/admin/AdminCouponsPanel';
import { AdminAnnouncementsPanel } from '../components/admin/AdminAnnouncementsPanel';

const VALID_ADMIN_TABS = NAV_ITEMS.map((item) => item.id);

function getAdminTabFromPath(pathname: string): string {
  const normalized = pathname.replace(/\/+$/, '') || '/admin';
  const segments = normalized.split('/').filter(Boolean);
  // ["admin"] → dashboard | ["admin", "orders"] → orders
  if (segments.length < 2) return 'dashboard';
  const tab = segments[1];
  if (!tab || tab === 'dashboard' || tab === 'login') return 'dashboard';
  return VALID_ADMIN_TABS.includes(tab) ? tab : 'dashboard';
}

function adminPathForTab(tab: string): string {
  return tab === 'dashboard' ? '/admin' : `/admin/${tab}`;
}

export function AdminDashboardPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTabState] = useState(() => getAdminTabFromPath(window.location.pathname));
  const [isClearingCache, setIsClearingCache] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifFilterTab, setNotifFilterTab] = useState<'all' | 'unread' | 'orders' | 'reviews' | 'alerts'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const notifRef = useRef<HTMLDivElement>(null);

  const setActiveTab = (tab: string) => {
    const nextTab = VALID_ADMIN_TABS.includes(tab) ? tab : 'dashboard';
    setActiveTabState(nextTab);
    const nextPath = adminPathForTab(nextTab);
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, '', nextPath);
      window.dispatchEvent(new Event('popstate'));
    }
    setIsMobileMenuOpen(false);
  };

  // Keep tab in sync with browser back/forward
  useEffect(() => {
    const syncFromUrl = () => {
      setActiveTabState(getAdminTabFromPath(window.location.pathname));
    };
    window.addEventListener('popstate', syncFromUrl);
    return () => window.removeEventListener('popstate', syncFromUrl);
  }, []);

  const { data: kpis, isLoading, refetch } = useQuery({
    queryKey: ['admin-summary'],
    queryFn: () => adminApi.getSummary(),
    retry: 1,
  });

  // Real-time Admin Notifications Queries (30s background sync; SSE handles instant updates)
  const { data: notifResponse, refetch: refetchNotifs } = useQuery({
    queryKey: ['adminNotifications'],
    queryFn: () => notificationsApi.getMyNotifications({ limit: 20 }),
    staleTime: 10000,
    refetchInterval: 30000,
    retry: 1,
  });

  const { data: unreadResponse, refetch: refetchUnreadCount } = useQuery({
    queryKey: ['unreadNotificationsCount'],
    queryFn: () => notificationsApi.getUnreadCount(),
    staleTime: 10000,
    refetchInterval: 30000,
    retry: 1,
  });

  const activeKpis = kpis || {
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    totalCustomers: 0,
    newCustomers: 0,
    totalProducts: 0,
    inventoryAlerts: { outOfStockCount: 0, lowStockCount: 0 },
  };
  const outOfStockCount = activeKpis.inventoryAlerts?.outOfStockCount || 0;
  const lowStockCount = activeKpis.inventoryAlerts?.lowStockCount || 0;
  const urgentAlertsCount = outOfStockCount + lowStockCount;

  const rawNotifList = Array.isArray(notifResponse)
    ? notifResponse
    : Array.isArray((notifResponse as any)?.data)
    ? (notifResponse as any).data
    : [];

  const liveNotifications: AppNotification[] = rawNotifList;
  const realUnreadCount = unreadResponse?.unreadCount ?? liveNotifications.filter((n) => !n.isRead).length;

  const reviewsNotifs = liveNotifications.filter(
    (n) =>
      (n.title || '').toLowerCase().includes('review') ||
      (n.message || '').toLowerCase().includes('review') ||
      !!n.metadata?.reviewId ||
      n.metadata?.targetTab === 'reviews',
  );
  const ordersNotifs = liveNotifications.filter(
    (n) =>
      !reviewsNotifs.includes(n) &&
      ((n.type || '').toString().toUpperCase() === 'ORDER_UPDATE' ||
        (n.title || '').toLowerCase().includes('order') ||
        !!n.metadata?.orderNumber ||
        n.metadata?.targetTab === 'orders'),
  );
  const alertsNotifs = liveNotifications.filter(
    (n) => !reviewsNotifs.includes(n) && !ordersNotifs.includes(n),
  );

  const totalBadgeCount = realUnreadCount + (urgentAlertsCount > 0 ? 1 : 0);

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      queryClient.invalidateQueries({ queryKey: ['adminNotifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadNotificationsCount'] });
      refetchNotifs();
      refetchUnreadCount();
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  const handleNotificationClick = async (notif: AppNotification) => {
    if (!notif.isRead) {
      try {
        await notificationsApi.markAsRead(notif._id);
        queryClient.invalidateQueries({ queryKey: ['adminNotifications'] });
        queryClient.invalidateQueries({ queryKey: ['unreadNotificationsCount'] });
        refetchNotifs();
        refetchUnreadCount();
      } catch (err) {
        console.error('Failed to mark notification read', err);
      }
    }
    const typeUpper = (notif.type || '').toString().toUpperCase();
    const titleStr = (notif.title || '').toString();
    const isReview = titleStr.includes('Review') || !!notif.metadata?.reviewId;
    const targetTab =
      notif.metadata?.targetTab ||
      (isReview ? 'reviews' : typeUpper === 'ORDER_UPDATE' ? 'orders' : 'inventory');
    setActiveTab(targetTab);
    setIsNotificationsOpen(false);
  };

  // Close notifications dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClearCache = async () => {
    setIsClearingCache(true);
    try {
      await adminApi.clearDashboardCache();
      await queryClient.invalidateQueries();
      await refetch();
    } catch (err) {
      console.error('Failed to clear cache', err);
    } finally {
      setIsClearingCache(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setActiveTab('orders');
  };

  const handleNavigateTab = (tab: string) => {
    setActiveTab(tab);
    setIsNotificationsOpen(false);
  };

  // Only block the dashboard shell on first KPI load; other tabs render immediately from the URL
  if (activeTab === 'dashboard' && isLoading && !kpis) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-brand-crimson" />
        <p className="text-xs font-semibold text-slate-500">Loading Admin Dashboard metrics...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 py-3.5 sm:py-8 animate-in fade-in duration-300 space-y-3.5 sm:space-y-6">
      {/* Top Admin Header Bar */}
      <div className="flex items-center justify-between flex-wrap gap-2.5 sm:gap-3 bg-white border border-gray-100 rounded-xl sm:rounded-3xl p-3.5 sm:p-5 shadow-sm">
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden p-1.5 sm:p-2 rounded-lg sm:rounded-xl border border-gray-200 text-slate-700 hover:bg-slate-50 transition-colors"
            aria-label="Open Admin Menu"
          >
            <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <div>
            <h1 className="text-base sm:text-2xl font-extrabold text-brand-slate-dark font-display">
              Executive Control Center
            </h1>
            <p className="text-[10px] sm:text-xs text-slate-400">Overview of sales performance, store activity, and inventory health</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={handleClearCache}
            disabled={isClearingCache}
            title="Clear Redis Metrics Cache"
            className="flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-2xl border border-gray-200 text-[11px] sm:text-xs font-bold text-slate-600 hover:text-brand-crimson hover:border-brand-crimson transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isClearingCache ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Clear Cache</span>
          </button>

          {/* Quick Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search orders, products..."
              className="bg-slate-50 border border-gray-200 rounded-2xl pl-9 pr-4 py-2 text-xs font-medium text-slate-700 outline-none focus:border-brand-crimson focus:bg-white w-48 md:w-56 transition-all"
            />
          </form>

          {/* Real-time Notification Bell Button & Interactive Dropdown Menu */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setIsNotificationsOpen((prev) => !prev)}
              aria-label="View Admin Notifications"
              className={`relative p-1.5 sm:p-2.5 rounded-lg sm:rounded-2xl border transition-all cursor-pointer ${
                isNotificationsOpen
                  ? 'bg-rose-50 border-brand-crimson text-brand-crimson shadow-md'
                  : 'border-gray-200 text-slate-600 hover:text-brand-crimson hover:border-brand-crimson bg-white'
              }`}
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700 hover:text-brand-crimson" />
              {totalBadgeCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] sm:min-w-[20px] sm:h-[20px] px-1 rounded-full bg-red-600 text-white text-[9px] sm:text-[10px] font-black flex items-center justify-center border-2 border-white shadow-md animate-pulse">
                  {totalBadgeCount > 99 ? '99+' : totalBadgeCount}
                </span>
              )}
            </button>

            {/* Notifications Popover Menu (Fits 320px screens perfectly) */}
            {isNotificationsOpen && (
              <>
                {/* Mobile Backdrop Overlay */}
                <div
                  className="fixed inset-0 bg-slate-900/20 backdrop-blur-[1px] z-40 sm:hidden"
                  onClick={() => setIsNotificationsOpen(false)}
                />

                <div className="fixed left-2 right-2 top-14 sm:top-full sm:mt-2 max-h-[75vh] sm:max-h-[85vh] sm:absolute sm:left-auto sm:right-0 sm:w-96 w-auto bg-white border border-gray-100 rounded-2xl sm:rounded-3xl shadow-2xl z-50 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
                  {/* Header Bar */}
                  <div className="p-3 sm:p-4 border-b border-gray-100 flex items-center justify-between bg-slate-50/80 flex-shrink-0">
                    <div className="flex items-center space-x-1.5 sm:space-x-2">
                      <div className="relative">
                        <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-crimson" />
                        {realUnreadCount > 0 && (
                          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500 animate-ping" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-[11px] sm:text-xs text-brand-slate-dark uppercase tracking-wider">
                          Admin Notifications
                        </h3>
                        <p className="text-[9px] text-slate-400 font-medium">Realtime Events: Orders, Reviews & Stock</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 sm:space-x-1.5">
                      {realUnreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-[9px] sm:text-[10px] font-extrabold text-brand-crimson hover:underline flex items-center space-x-0.5 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-lg"
                        >
                          <CheckCheck className="w-3 h-3" />
                          <span>Mark Read</span>
                        </button>
                      )}
                      <button
                        onClick={() => setIsNotificationsOpen(false)}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Filter Tabs Bar */}
                  <div className="flex items-center space-x-1 px-3 py-1.5 border-b border-gray-100 bg-slate-100/50 text-[10px] font-bold overflow-x-auto scrollbar-none flex-shrink-0">
                    <button
                      onClick={() => setNotifFilterTab('all')}
                      className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap ${
                        notifFilterTab === 'all'
                          ? 'bg-white text-slate-900 shadow-xs font-black'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      All ({liveNotifications.length})
                    </button>
                    <button
                      onClick={() => setNotifFilterTab('unread')}
                      className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap ${
                        notifFilterTab === 'unread'
                          ? 'bg-white text-rose-600 shadow-xs font-black'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Unread ({realUnreadCount})
                    </button>
                    <button
                      onClick={() => setNotifFilterTab('orders')}
                      className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap ${
                        notifFilterTab === 'orders'
                          ? 'bg-white text-blue-600 shadow-xs font-black'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Orders ({ordersNotifs.length})
                    </button>
                    <button
                      onClick={() => setNotifFilterTab('reviews')}
                      className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap ${
                        notifFilterTab === 'reviews'
                          ? 'bg-white text-amber-600 shadow-xs font-black'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Reviews ({reviewsNotifs.length})
                    </button>
                    <button
                      onClick={() => setNotifFilterTab('alerts')}
                      className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap ${
                        notifFilterTab === 'alerts'
                          ? 'bg-white text-red-600 shadow-xs font-black'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Stock Alerts ({alertsNotifs.length})
                    </button>
                  </div>

                  {/* Notification Items List */}
                  <div className="divide-y divide-gray-100 overflow-y-auto flex-1 min-h-0 max-h-[50vh] sm:max-h-80">
                    {/* Out of stock inventory alert */}
                    {(notifFilterTab === 'all' || notifFilterTab === 'alerts' || notifFilterTab === 'unread') &&
                      outOfStockCount > 0 && (
                        <div
                          onClick={() => handleNavigateTab('inventory')}
                          className="p-3 bg-rose-50/60 hover:bg-rose-100/50 transition-colors cursor-pointer flex items-start space-x-2.5 group border-l-4 border-rose-500"
                        >
                          <div className="p-1.5 rounded-lg bg-rose-100 text-rose-600 flex-shrink-0 mt-0.5">
                            <AlertTriangle className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-[11px] font-black text-rose-900 leading-snug">
                                {outOfStockCount} Items Out of Stock!
                              </p>
                              <span className="text-[8px] font-black text-rose-600 bg-rose-100 px-1.5 py-0.2 rounded uppercase tracking-wider">
                                Stock Alert
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-600 mt-0.5 font-medium leading-tight">
                              Products reached 0 stock limit. Restock immediately to resume orders.
                            </p>
                            <span className="inline-flex items-center text-[9px] font-extrabold text-rose-700 group-hover:underline mt-1">
                              Restock Inventory Now <ChevronRight className="w-2.5 h-2.5 ml-0.5" />
                            </span>
                          </div>
                        </div>
                      )}

                    {/* Low stock warning alert */}
                    {(notifFilterTab === 'all' || notifFilterTab === 'alerts') && lowStockCount > 0 && (
                      <div
                        onClick={() => handleNavigateTab('inventory')}
                        className="p-3 bg-amber-50/50 hover:bg-amber-100/50 transition-colors cursor-pointer flex items-start space-x-2.5 group border-l-4 border-amber-500"
                      >
                        <div className="p-1.5 rounded-lg bg-amber-100 text-amber-600 flex-shrink-0 mt-0.5">
                          <Package className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-[11px] font-extrabold text-amber-900 leading-snug">
                              {lowStockCount} Products Low on Stock
                            </p>
                            <span className="text-[8px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded uppercase">
                              Stock Alert
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-600 mt-0.5 font-medium leading-tight">
                            Inventory is below safety threshold limit.
                          </p>
                          <span className="inline-flex items-center text-[9px] font-extrabold text-amber-800 group-hover:underline mt-1">
                            Review Stock Levels <ChevronRight className="w-2.5 h-2.5 ml-0.5" />
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Dynamic Realtime Notifications List */}
                    {(() => {
                      let filtered = liveNotifications;
                      if (notifFilterTab === 'unread') {
                        filtered = liveNotifications.filter((n) => !n.isRead);
                      } else if (notifFilterTab === 'orders') {
                        filtered = ordersNotifs;
                      } else if (notifFilterTab === 'reviews') {
                        filtered = reviewsNotifs;
                      } else if (notifFilterTab === 'alerts') {
                        filtered = alertsNotifs;
                      }

                      const isStockBannerVisible =
                        (notifFilterTab === 'all' || notifFilterTab === 'alerts' || notifFilterTab === 'unread') &&
                        (outOfStockCount > 0 || (notifFilterTab !== 'unread' && lowStockCount > 0));

                      if (filtered.length === 0 && !isStockBannerVisible) {
                        return (
                          <div className="p-6 text-center space-y-1">
                            <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" />
                            <p className="text-xs font-bold text-slate-700">
                              No {notifFilterTab === 'all' ? 'notifications' : notifFilterTab} found
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {notifFilterTab === 'unread'
                                ? 'All caught up! No unread notifications right now.'
                                : notifFilterTab === 'orders'
                                ? 'No order update notifications.'
                                : notifFilterTab === 'reviews'
                                ? 'No product review notifications.'
                                : notifFilterTab === 'alerts'
                                ? 'No stock alert notifications.'
                                : 'No notifications to display right now.'}
                            </p>
                          </div>
                        );
                      }

                      return filtered.map((notif) => {
                        const notifTypeStr = (notif.type || '').toString().toUpperCase();
                        const titleLower = (notif.title || '').toLowerCase();
                        const isOrder =
                          notifTypeStr === 'ORDER_UPDATE' ||
                          titleLower.includes('order') ||
                          !!notif.metadata?.orderNumber;
                        const isReview = titleLower.includes('review') || !!notif.metadata?.reviewId;

                        const displayMessage = (notif.message || '')
                          .replace(/^Your order #/, 'Order #')
                          .replace(/^Your order /, 'Order ');

                        return (
                          <div
                            key={notif._id || (notif as any).id}
                            onClick={() => handleNotificationClick(notif)}
                            className={`p-3 transition-colors cursor-pointer flex items-start space-x-2.5 group relative ${
                              !notif.isRead ? 'bg-rose-50/30 hover:bg-rose-50/70 font-semibold' : 'hover:bg-slate-50'
                            }`}
                          >
                            {!notif.isRead && (
                              <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                            )}

                            <div
                              className={`p-1.5 rounded-lg flex-shrink-0 mt-0.5 ${
                                isOrder
                                  ? 'bg-blue-100 text-blue-600'
                                  : isReview
                                  ? 'bg-amber-100 text-amber-600'
                                  : 'bg-rose-100 text-rose-600'
                              }`}
                            >
                              {isOrder ? (
                                <ShoppingBag className="w-3.5 h-3.5" />
                              ) : isReview ? (
                                <Star className="w-3.5 h-3.5" />
                              ) : (
                                <AlertTriangle className="w-3.5 h-3.5" />
                              )}
                            </div>

                            <div className="flex-1 min-w-0 pr-4">
                              <div className="flex items-center justify-between gap-1">
                                <p className="text-[11px] font-extrabold text-brand-slate-dark leading-snug truncate">
                                  {notif.title}
                                </p>
                              </div>
                              <p className="text-[10px] text-slate-600 leading-tight font-medium mt-0.5 line-clamp-2">
                                {displayMessage}
                              </p>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className="text-[8px] font-bold text-slate-400 flex items-center">
                                  <Clock className="w-2.5 h-2.5 mr-0.5" />
                                  {notif.createdAt
                                    ? new Date(notif.createdAt).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      })
                                    : 'Just now'}
                                </span>
                                <span className="text-[9px] font-black text-brand-crimson group-hover:underline">
                                  Open →
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Horizontal Pill Scroll Navigation */}
      <div className="flex lg:hidden overflow-x-auto scrollbar-none space-x-2 pb-1 -mx-3 px-3">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap flex-shrink-0 transition-all ${
                isActive
                  ? 'bg-brand-crimson text-white shadow-md'
                  : 'bg-white border border-gray-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Mobile Sidebar Overlay Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Slide-over Content */}
          <div className="relative z-10 w-72 max-w-[85vw] h-full max-h-[100dvh] p-2.5 sm:p-3 shadow-2xl animate-in slide-in-from-left duration-300">
            <AdminSidebar
              activeTab={activeTab}
              onSelectTab={setActiveTab}
              onCloseMobile={() => setIsMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Admin Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Desktop Sidebar Nav (Only visible on lg screens, non-overlapping) */}
        <div className="hidden lg:block lg:col-span-3 lg:sticky lg:top-24">
          <AdminSidebar activeTab={activeTab} onSelectTab={setActiveTab} />
        </div>

        {/* Main Content Panel Area */}
        <div className="lg:col-span-9 space-y-6 sm:space-y-8 min-w-0">
          {activeTab === 'dashboard' ? (
            <>
              <KpiSummaryGrid kpis={activeKpis} />
              <AnalyticsChartsSection />
              <AdminDataTables showInventoryAlerts={true} showTopProductsAndCustomers={true} />
            </>
          ) : activeTab === 'categories' ? (
            <AdminCategoriesPanel />
          ) : activeTab === 'brands' ? (
            <AdminBrandsPanel />
          ) : activeTab === 'products' ? (
            <AdminProductManagement />
          ) : activeTab === 'inventory' ? (
            <AdminDataTables showInventoryAlerts={true} showTopProductsAndCustomers={false} />
          ) : activeTab === 'faqs' ? (
            <AdminFaqManagement />
          ) : activeTab === 'orders' ? (
            <AdminOrdersPanel />
          ) : activeTab === 'coupons' ? (
            <AdminCouponsPanel />
          ) : activeTab === 'announcements' ? (
            <AdminAnnouncementsPanel />
          ) : activeTab === 'reviews' ? (
            <AdminReviewsPanel />
          ) : activeTab === 'customers' ? (
            <AdminDataTables showInventoryAlerts={false} showTopProductsAndCustomers={true} />
          ) : activeTab === 'banners' ? (
            <AdminBannersPanel />
          ) : (
            <div className="bg-white border border-gray-100 rounded-3xl p-8 sm:p-12 text-center text-slate-400 space-y-2">
              <p className="font-extrabold text-brand-slate-dark text-base uppercase tracking-wider">
                {activeTab} Management Panel
              </p>
              <p className="text-xs">This section is coming soon.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboardPage;
