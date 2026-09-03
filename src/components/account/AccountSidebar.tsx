import { ShoppingBag, Heart, MapPin, User, Bell, LogOut, Shield } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../store/useAuthStore';
import { notificationsApi } from '../../api/notifications';

interface AccountSidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

const NAV_ITEMS = [
  { id: 'orders', label: 'My Orders', icon: ShoppingBag },
  { id: 'wishlist', label: 'My Wishlist', icon: Heart },
  { id: 'addresses', label: 'Saved Addresses', icon: MapPin },
  { id: 'profile', label: 'Profile Info', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
];

export function AccountSidebar({ activePage, onNavigate }: AccountSidebarProps) {
  const { user, logout } = useAuthStore();

  const { data: unreadData } = useQuery({
    queryKey: ['unreadNotificationsCount'],
    queryFn: () => notificationsApi.getUnreadCount(),
    enabled: !!user,
    refetchInterval: 30000,
  });

  const unreadCount = unreadData?.unreadCount ?? 0;

  const firstName = user?.firstName || '';
  const lastName = user?.lastName || '';
  const displayName = (firstName + ' ' + lastName).trim() || 'Guest User';
  const email = user?.email || '';
  const initials = ((firstName[0] || '') + (lastName[0] || '')).toUpperCase() || 'G';

  const isAdmin = user?.roles?.includes('ADMIN') ?? false;

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  return (
    <aside className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
      {/* User Profile Header */}
      <div className="bg-brand-slate-dark text-white p-6 space-y-3">
        <div className="w-14 h-14 rounded-full bg-brand-crimson flex items-center justify-center font-extrabold text-lg shadow-lg">
          {initials}
        </div>
        <div>
          <p className="font-extrabold text-sm">{displayName}</p>
          <p className="text-[11px] text-slate-300">{email}</p>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="p-3 space-y-1">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const isActive = activePage === id;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-brand-crimson text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-brand-slate-dark'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{label}</span>
              </div>
              {id === 'notifications' && unreadCount > 0 && (
                <span
                  className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-white text-brand-crimson' : 'bg-brand-crimson text-white'
                  }`}
                >
                  {unreadCount}
                </span>
              )}
            </button>
          );
        })}

        {/* Admin Control Link - Only shown for Admin role */}
        {isAdmin && (
          <a
            href="/admin"
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-extrabold bg-slate-900 text-white hover:bg-brand-crimson transition-all mt-2 shadow-sm"
          >
            <Shield className="w-4 h-4 flex-shrink-0 text-amber-400" />
            <span>Admin Dashboard</span>
          </a>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-all mt-2"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          <span>Logout</span>
        </button>
      </nav>
    </aside>
  );
}

export default AccountSidebar;
