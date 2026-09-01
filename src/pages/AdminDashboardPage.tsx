import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Bell, Search, RefreshCw, Menu } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isClearingCache, setIsClearingCache] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { data: kpis, isLoading, refetch } = useQuery({
    queryKey: ['admin-summary'],
    queryFn: () => adminApi.getSummary(),
    retry: 1,
  });

  const activeKpis = kpis || DEFAULT_KPIS;

  const handleClearCache = async () => {
    setIsClearingCache(true);
    try {
      await adminApi.clearDashboardCache();
      await refetch();
    } catch (err) {
      console.error('Failed to clear cache', err);
    } finally {
      setIsClearingCache(false);
    }
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

          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search orders, products..."
              className="bg-slate-50 border border-gray-200 rounded-2xl pl-9 pr-4 py-2 text-xs font-medium text-slate-700 outline-none focus:border-brand-crimson w-48 md:w-56"
            />
          </div>

          <button className="relative p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border border-gray-200 text-slate-600 hover:text-brand-crimson hover:border-brand-crimson transition-colors">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
          </button>
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
              <AdminDataTables />
            </>
          ) : activeTab === 'categories' ? (
            <AdminCategoriesPanel />
          ) : activeTab === 'brands' ? (
            <AdminBrandsPanel />
          ) : activeTab === 'products' ? (
            <AdminProductManagement />
          ) : activeTab === 'inventory' ? (
            <AdminDataTables />
          ) : activeTab === 'faqs' ? (
            <AdminFaqManagement />
          ) : activeTab === 'orders' ? (
            <AdminOrdersPanel />
          ) : activeTab === 'reviews' ? (
            <AdminReviewsPanel />
          ) : activeTab === 'customers' ? (
            <AdminDataTables />
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
