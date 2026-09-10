import { LayoutDashboard, Package, ShoppingCart, Users, AlertTriangle, MessageSquare, Image, LogOut, FolderTree, Award, HelpCircle, X, Tag, Megaphone } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

interface AdminSidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onCloseMobile?: () => void;
}

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'orders', label: 'Orders', icon: ShoppingCart },
  { id: 'coupons', label: 'Promo & Coupons', icon: Tag },
  { id: 'announcements', label: 'Announcements Bar', icon: Megaphone },
  { id: 'categories', label: 'Categories', icon: FolderTree },
  { id: 'brands', label: 'Brands & Designers', icon: Award },
  { id: 'products', label: 'Products & Catalog', icon: Package },
  { id: 'inventory', label: 'Inventory Health', icon: AlertTriangle },
  { id: 'faqs', label: 'FAQ Management', icon: HelpCircle },
  { id: 'reviews', label: 'Review Moderation', icon: MessageSquare },
  { id: 'banners', label: 'Banners & Promotions', icon: Image },
  { id: 'customers', label: 'Users', icon: Users },
];

export function AdminSidebar({ activeTab, onSelectTab, onCloseMobile }: AdminSidebarProps) {
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new Event('popstate'));
  };

  const handleSelect = (tabId: string) => {
    onSelectTab(tabId);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <aside className="bg-slate-900 text-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-xl flex flex-col h-full max-h-[100dvh] overflow-hidden space-y-3 sm:space-y-5">
      {/* Brand Header */}
      <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-800 flex-shrink-0">
        <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
          <img
            src="/asset/niakylie_logo.png"
            alt="NiaKylie Admin Logo"
            className="h-8 sm:h-10 w-auto object-contain rounded-xl bg-white p-0.5 shadow-md flex-shrink-0"
          />
          <div className="min-w-0">
            <h2 className="font-extrabold text-xs sm:text-sm font-display tracking-wide text-white truncate">NiaKylie Admin</h2>
            <p className="text-[9px] sm:text-[10px] text-slate-400 font-semibold uppercase tracking-wider truncate">Management Control</p>
          </div>
        </div>
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex-shrink-0"
            title="Close Menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Admin User */}
      {user && (
        <div className="flex items-center space-x-2 bg-slate-800/50 rounded-xl sm:rounded-2xl px-2.5 py-1.5 sm:px-3 sm:py-2 flex-shrink-0">
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-brand-crimson flex items-center justify-center text-[10px] sm:text-xs font-extrabold flex-shrink-0">
            {user.firstName?.[0]}{user.lastName?.[0]}
          </div>
          <div className="overflow-hidden min-w-0">
            <p className="text-[11px] sm:text-xs font-bold truncate text-white">{user.firstName} {user.lastName}</p>
            <p className="text-[8.5px] sm:text-[9px] text-slate-400 truncate">{user.email}</p>
          </div>
        </div>
      )}

      {/* Nav Section (Scrollable on mobile) */}
      <nav className="space-y-1 flex-1 overflow-y-auto pr-1 min-h-0">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className={`w-full flex items-center space-x-2.5 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-brand-crimson text-white shadow-lg shadow-brand-crimson/30'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* System Status + Logout (Pinned at bottom) */}
      <div className="pt-3 sm:pt-4 border-t border-slate-800 space-y-2.5 sm:space-y-3 flex-shrink-0">
        <div className="text-[9px] sm:text-[10px] text-slate-400 space-y-0.5">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-slate-300">API Services Online</span>
          </div>
          <p className="text-slate-500">v2.4.0-production</p>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs font-bold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

export default AdminSidebar;
