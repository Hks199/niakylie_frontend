import { useState } from 'react';
import { Menu, Heart, ShoppingBag } from 'lucide-react';
import { AnnouncementBar } from '../common/AnnouncementBar';
import { Megamenu } from '../common/Megamenu';
import { SearchBar } from '../common/SearchBar';
import { ProfileDropdown } from '../common/ProfileDropdown';
import { MobileDrawer } from '../common/MobileDrawer';
import { CartDrawer } from '../common/CartDrawer';
import { AuthModal } from '../common/AuthModal';
import { useCartStore } from '../../store/useCartStore';
import { useWishlistStore } from '../../store/useWishlistStore';

export function Header() {
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { itemCount, setIsCartOpen } = useCartStore();
  const { wishlistItems } = useWishlistStore();

  return (
    <>
      <header className="sticky top-0 z-40 w-full transition-all">
        {/* Top Sliding Announcement Ticker */}
        <AnnouncementBar />

        {/* Main Navbar */}
        <div className="glass-nav border-b border-gray-200/80 shadow-sm transition-all">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between gap-4">
            {/* Left: Mobile Hamburger & Logo */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              <button
                onClick={() => setIsMobileDrawerOpen(true)}
                className="lg:hidden p-1.5 rounded-lg text-slate-700 hover:text-brand-crimson hover:bg-slate-100 transition-colors focus:outline-none"
                aria-label="Open navigation menu"
              >
                <Menu className="w-6 h-6" />
              </button>

              <a href="/" className="flex items-center space-x-2 group">
                <img
                  src="/asset/niakylie_logo.png"
                  alt="NiaKylie Fashion"
                  className="h-10 sm:h-12 w-auto object-contain rounded-xl group-hover:scale-105 transition-transform shadow-sm"
                />
              </a>
            </div>

            {/* Center Left: Desktop Megamenu */}
            <div className="hidden lg:block">
              <Megamenu />
            </div>

            {/* Center Right: Search Bar */}
            <div className="flex-1 max-w-xs sm:max-w-md mx-2 sm:mx-4">
              <SearchBar />
            </div>

            {/* Right: Action Icons */}
            <div className="flex items-center space-x-3 sm:space-x-5">
              {/* Profile Dropdown */}
              <ProfileDropdown onOpenAuthModal={() => setIsAuthModalOpen(true)} />

              {/* Wishlist Link & Badge */}
              <a
                href="/account/wishlist"
                className="flex flex-col items-center group text-brand-slate hover:text-brand-crimson transition-colors relative"
                aria-label="View Wishlist"
              >
                <div className="p-1.5 rounded-full group-hover:bg-brand-crimson/10 transition-colors">
                  <Heart className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold tracking-tight hidden sm:block">Wishlist</span>
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand-crimson text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                    {wishlistItems.length}
                  </span>
                )}
              </a>

              {/* Cart Bag Drawer Trigger */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="flex flex-col items-center group text-brand-slate hover:text-brand-crimson transition-colors relative focus:outline-none"
                aria-label="Open Shopping Bag"
              >
                <div className="p-1.5 rounded-full group-hover:bg-brand-crimson/10 transition-colors">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold tracking-tight hidden sm:block">Bag</span>
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand-crimson text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Slide-over Drawers & Modals */}
      <MobileDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />
      <CartDrawer />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
}

export default Header;
