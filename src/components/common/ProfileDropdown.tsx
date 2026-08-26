import { useState, useRef, useEffect } from 'react';
import { User as UserIcon, Package, Heart, MapPin, Shield, LogOut, ChevronRight, Sparkles } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { checkIsAdmin } from '../../utils/roleUtils';

interface ProfileDropdownProps {
  onOpenAuthModal: () => void;
}

export function ProfileDropdown({ onOpenAuthModal }: ProfileDropdownProps) {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isAdmin = checkIsAdmin(user);

  const displayName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Customer'
    : 'Customer';
  const initial = user?.firstName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U';

  return (
    <div ref={dropdownRef} className="relative">
      {/* Trigger Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex flex-col items-center group text-brand-slate hover:text-brand-crimson transition-colors focus:outline-none"
        aria-label="Profile Account"
      >
        <div className="p-1.5 rounded-full group-hover:bg-brand-crimson/10 transition-colors">
          <UserIcon className="w-5 h-5" />
        </div>
        <span className="text-[10px] font-bold tracking-tight hidden sm:block">Profile</span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white/95 backdrop-blur-xl border border-gray-100 shadow-2xl rounded-2xl p-4 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
          {isAuthenticated ? (
            /* Authenticated User Menu */
            <div>
              <div className="pb-3 border-b border-gray-100 mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-crimson to-rose-600 text-white font-extrabold flex items-center justify-center text-sm shadow-md">
                    {initial}
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="font-bold text-sm text-brand-slate-dark truncate">
                      {displayName}
                    </h4>
                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                    {isAdmin && (
                      <span className="inline-flex items-center mt-1 text-[9px] bg-amber-100 text-amber-800 font-extrabold px-2 py-0.5 rounded-full">
                        <Shield className="w-3 h-3 mr-1" />
                        Admin Privileges
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Menu Links */}
              <div className="space-y-1 text-xs font-semibold text-slate-700">
                <a
                  href="/account/orders"
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 hover:text-brand-crimson transition-colors group"
                >
                  <div className="flex items-center space-x-2.5">
                    <Package className="w-4 h-4 text-slate-400 group-hover:text-brand-crimson" />
                    <span>My Orders</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-brand-crimson" />
                </a>

                <a
                  href="/account/wishlist"
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 hover:text-brand-crimson transition-colors group"
                >
                  <div className="flex items-center space-x-2.5">
                    <Heart className="w-4 h-4 text-slate-400 group-hover:text-brand-crimson" />
                    <span>Saved Wishlist</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-brand-crimson" />
                </a>

                <a
                  href="/account/addresses"
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 hover:text-brand-crimson transition-colors group"
                >
                  <div className="flex items-center space-x-2.5">
                    <MapPin className="w-4 h-4 text-slate-400 group-hover:text-brand-crimson" />
                    <span>Saved Addresses</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-brand-crimson" />
                </a>

                {isAdmin && (
                  <a
                    href="/admin"
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-900 text-white font-bold hover:bg-brand-crimson transition-colors group mt-2 shadow-sm"
                  >
                    <div className="flex items-center space-x-2.5">
                      <Shield className="w-4 h-4 text-amber-400" />
                      <span>Admin Dashboard</span>
                    </div>
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  </a>
                )}

                <button
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-xl text-red-600 hover:bg-red-50 transition-colors mt-2"
                >
                  <div className="flex items-center space-x-2.5">
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </div>
                </button>
              </div>
            </div>
          ) : (
            /* Unauthenticated Guest Welcome Box */
            <div className="text-center py-2 space-y-3">
              <div>
                <h4 className="font-extrabold text-sm text-brand-slate-dark mb-1">Welcome to NiaKylie</h4>
                <p className="text-xs text-slate-500">To access orders, wishlist & checkout seamlessly</p>
              </div>
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenAuthModal();
                }}
                className="w-full bg-brand-crimson hover:bg-brand-crimson-dark text-white font-bold text-xs py-2.5 rounded-xl shadow-md transition-all uppercase tracking-wider"
              >
                LOGIN / REGISTER
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ProfileDropdown;
