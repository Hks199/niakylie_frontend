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

  const unreadCount = typeof unreadData === 'number' ? unreadData : unreadData?.unreadCount ?? 0;

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
    <aside className="bg-white border border-gray-100 rounded-xl sm:rounded-3xl overflow-hidden shadow-sm">
      {/* User Profile Header */}
      <div className="bg-brand-slate-dark text-white p-3 sm:p-6 flex items-center space-x-2.5 lg:space-x-0 lg:block lg:space-y-3">
        <div className="w-9 h-9 sm:w-14 sm:h-14 rounded-full bg-brand-crimson flex items-center justify-center font-extrabold text-xs sm:text-lg shadow-lg flex-shrink-0">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-extrabold text-[11px] sm:text-sm truncate">{displayName}</p>
          <p className="text-[9px] sm:text-[11px] text-slate-300 truncate">{email}</p>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="p-1.5 sm:p-3 flex lg:flex-col overflow-x-auto gap-1 lg:gap-1 scrollbar-none">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const isActive = activePage === id;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`flex items-center justify-between space-x-2 px-2.5 py-1.5 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all flex-shrink-0 lg:flex-shrink lg:w-full ${
                isActive
                  ? 'bg-brand-crimson text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-brand-slate-dark'
              }`}
            >
              <div className="flex items-center space-x-1.5 sm:space-x-2.5">
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="whitespace-nowrap lg:whitespace-normal">{label}</span>
              </div>
              {id === 'notifications' && unreadCount > 0 && (
                <span
                  className={`text-[8px] sm:text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ml-1 ${
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
            className="flex items-center space-x-2 px-2.5 py-1.5 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-extrabold bg-slate-900 text-white hover:bg-brand-crimson transition-all flex-shrink-0 lg:flex-shrink lg:w-full lg:mt-2 shadow-sm"
          >
            <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 text-amber-400" />
            <span className="whitespace-nowrap lg:whitespace-normal">Admin Dashboard</span>
          </a>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 px-2.5 py-1.5 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold text-rose-600 hover:bg-rose-50 transition-all flex-shrink-0 lg:flex-shrink lg:w-full lg:mt-2"
        >
          <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
          <span className="whitespace-nowrap lg:whitespace-normal">Logout</span>
        </button>
      </nav>
    </aside>
  );
}

export default AccountSidebar;
