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
  Tag,
  ShoppingBag,
  CheckCheck,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { adminApi } from '../api/admin';
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
import { DashboardSummary } from '../types/admin';

const DEFAULT_KPIS: DashboardSummary = {
  totalRevenue: 2485900,
  totalOrders: 1420,
  averageOrderValue: 1750,
  totalCustomers: 890,
  newCustomers: 64,
  totalProducts: 180,
  inventoryAlerts: {
    outOfStockCount: 3,
    lowStockCount: 12,
  },
};

export function AdminDashboardPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isClearingCache, setIsClearingCache] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadReadStatus, setUnreadReadStatus] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const notifRef = useRef<HTMLDivElement>(null);

  const { data: kpis, isLoading, refetch } = useQuery({
    queryKey: ['admin-summary'],
    queryFn: () => adminApi.getSummary(),
    retry: 1,
  });

  const activeKpis = kpis || DEFAULT_KPIS;

  const outOfStockCount = activeKpis.inventoryAlerts?.outOfStockCount || 0;
  const lowStockCount = activeKpis.inventoryAlerts?.lowStockCount || 0;
  const totalAlerts = outOfStockCount + lowStockCount;

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

  if (isLoading && !kpis) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-brand-crimson" />
        <p className="text-xs font-semibold text-slate-500">Loading Admin Dashboard metrics...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 animate-in fade-in duration-300 space-y-4 sm:space-y-6">
      {/* Top Admin Header Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3 bg-white border border-gray-100 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-sm">
        <div className="flex items-center space-x-3">
          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden p-2 rounded-xl border border-gray-200 text-slate-700 hover:bg-slate-50 transition-colors"
            aria-label="Open Admin Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-lg sm:text-2xl font-extrabold text-brand-slate-dark font-display">
              Executive Control Center
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-400">Overview of sales performance, store activity, and inventory health</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={handleClearCache}
            disabled={isClearingCache}
            title="Clear Redis Metrics Cache"
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl sm:rounded-2xl border border-gray-200 text-xs font-bold text-slate-600 hover:text-brand-crimson hover:border-brand-crimson transition-colors disabled:opacity-50"
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

          {/* Notification Bell Button & Interactive Dropdown Menu */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => {
                setIsNotificationsOpen((prev) => !prev);
                setUnreadReadStatus(false);
              }}
              aria-label="View Admin Notifications"
              className={`relative p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border transition-colors cursor-pointer ${
                isNotificationsOpen
                  ? 'bg-rose-50 border-brand-crimson text-brand-crimson'
                  : 'border-gray-200 text-slate-600 hover:text-brand-crimson hover:border-brand-crimson bg-white'
              }`}
            >
              <Bell className="w-4 h-4" />
              {unreadReadStatus && totalAlerts > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center border-2 border-white animate-pulse">
                  {totalAlerts}
                </span>
              )}
            </button>

            {/* Notifications Popover Menu */}
            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-gray-100 rounded-3xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center space-x-2">
                    <Bell className="w-4 h-4 text-brand-crimson" />
                    <h3 className="font-extrabold text-xs text-brand-slate-dark uppercase tracking-wider">
                      Admin Notifications
                    </h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setUnreadReadStatus(false)}
                      className="text-[10px] font-bold text-slate-400 hover:text-brand-crimson flex items-center space-x-1"
                    >
                      <CheckCheck className="w-3 h-3" />
                      <span>Mark Read</span>
                    </button>
                    <button
                      onClick={() => setIsNotificationsOpen(false)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                  {/* Out of stock inventory notification */}
                  {outOfStockCount > 0 && (
                    <div
                      onClick={() => handleNavigateTab('inventory')}
                      className="p-3.5 hover:bg-rose-50/50 transition-colors cursor-pointer flex items-start space-x-3 group"
                    >
                      <div className="p-2 rounded-xl bg-rose-100 text-rose-600 flex-shrink-0">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-extrabold text-rose-900">
                            {outOfStockCount} Items Out of Stock!
                          </p>
                          <span className="text-[9px] font-bold text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 uppercase">
                            Urgent
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Products have reached zero stock level and require inventory restocking.
                        </p>
                        <span className="inline-flex items-center text-[10px] font-extrabold text-brand-crimson group-hover:underline mt-1">
                          View Out of Stock Inventory <ChevronRight className="w-3 h-3 ml-0.5" />
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Low stock inventory notification */}
                  {lowStockCount > 0 && (
                    <div
                      onClick={() => handleNavigateTab('inventory')}
                      className="p-3.5 hover:bg-amber-50/50 transition-colors cursor-pointer flex items-start space-x-3 group"
                    >
                      <div className="p-2 rounded-xl bg-amber-100 text-amber-600 flex-shrink-0">
                        <Package className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-extrabold text-amber-900">
                            {lowStockCount} Products Low on Stock
                          </p>
                          <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 uppercase">
                            Warning
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Inventory quantity is below minimum threshold limit.
                        </p>
                        <span className="inline-flex items-center text-[10px] font-extrabold text-amber-700 group-hover:underline mt-1">
                          Manage Low Stock Alert List <ChevronRight className="w-3 h-3 ml-0.5" />
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Orders notification */}
                  <div
                    onClick={() => handleNavigateTab('orders')}
                    className="p-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex items-start space-x-3 group"
                  >
                    <div className="p-2 rounded-xl bg-blue-100 text-blue-600 flex-shrink-0">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-extrabold text-slate-800">
                          {activeKpis.totalOrders} Total Orders Processed
                        </p>
                        <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 uppercase">
                          Orders
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Track customer dispatches, courier tracking IDs & order statuses.
                      </p>
                      <span className="inline-flex items-center text-[10px] font-extrabold text-blue-600 group-hover:underline mt-1">
                        Go to Orders Control Panel <ChevronRight className="w-3 h-3 ml-0.5" />
                      </span>
                    </div>
                  </div>

                  {/* Promo Coupons Notification */}
                  <div
                    onClick={() => handleNavigateTab('coupons')}
                    className="p-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex items-start space-x-3 group"
                  >
                    <div className="p-2 rounded-xl bg-emerald-100 text-emerald-600 flex-shrink-0">
                      <Tag className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-extrabold text-slate-800">
                          Promo Codes & Coupons
                        </p>
                        <Sparkles className="w-3 h-3 text-amber-500" />
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Create, activate or edit flat ₹ and percentage % discount codes.
                      </p>
                      <span className="inline-flex items-center text-[10px] font-extrabold text-emerald-600 group-hover:underline mt-1">
                        Manage Promo Codes <ChevronRight className="w-3 h-3 ml-0.5" />
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border-t border-gray-100 text-center">
                  <button
                    onClick={() => handleNavigateTab('dashboard')}
                    className="text-xs font-extrabold text-brand-crimson hover:underline"
                  >
                    View Complete Dashboard Analytics
                  </button>
                </div>
              </div>
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
          <div className="relative z-10 w-72 max-w-[85vw] h-full p-3 shadow-2xl animate-in slide-in-from-left duration-300">
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
