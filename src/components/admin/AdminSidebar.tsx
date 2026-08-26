import { LayoutDashboard, Package, ShoppingCart, Users, AlertTriangle, MessageSquare, Image, Shield, LogOut, FolderTree, Award, X } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

interface AdminSidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onCloseMobile?: () => void;
}

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'orders', label: 'Orders', icon: ShoppingCart },
  { id: 'categories', label: 'Categories', icon: FolderTree },
  { id: 'brands', label: 'Brands & Designers', icon: Award },
  { id: 'products', label: 'Products & Catalog', icon: Package },
  { id: 'inventory', label: 'Inventory Health', icon: AlertTriangle },
  { id: 'reviews', label: 'Review Moderation', icon: MessageSquare },
  { id: 'banners', label: 'Banners & Promotions', icon: Image },
  { id: 'customers', label: 'Top Customers', icon: Users },
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
    <aside className="bg-slate-900 text-white rounded-3xl p-5 shadow-xl space-y-6 flex flex-col h-full">
      {/* Brand Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-brand-crimson text-white rounded-2xl flex items-center justify-center font-extrabold shadow-lg flex-shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-sm font-display tracking-wide">NiaKylie Admin</h2>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Management Control</p>
          </div>
        </div>
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Close Menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Admin User */}
      {user && (
        <div className="flex items-center space-x-2 bg-slate-800/50 rounded-2xl px-3 py-2">
          <div className="w-7 h-7 rounded-full bg-brand-crimson flex items-center justify-center text-xs font-extrabold flex-shrink-0">
            {user.firstName?.[0]}{user.lastName?.[0]}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold truncate">{user.firstName} {user.lastName}</p>
            <p className="text-[9px] text-slate-400 truncate">{user.email}</p>
          </div>
        </div>
      )}

      {/* Nav Section */}
      <nav className="space-y-1 flex-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-brand-crimson text-white shadow-lg shadow-brand-crimson/30'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* System Status + Logout */}
      <div className="pt-4 border-t border-slate-800 space-y-3">
        <div className="text-[10px] text-slate-400 space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-slate-300">API Services Online</span>
          </div>
          <p className="text-slate-500">v2.4.0-production</p>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

export default AdminSidebar;
