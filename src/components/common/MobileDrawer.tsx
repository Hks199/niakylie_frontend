import { useState } from 'react';
import { X, ChevronDown, Heart, ShoppingBag } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useCartStore } from '../../store/useCartStore';
import { useWishlistStore } from '../../store/useWishlistStore';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuthModal: () => void;
}

const CATEGORY_ACCORDIONS = [
  {
    title: 'SAREES',
    items: ['Banarasi Silk Sarees', 'Kanjeevaram Silk', 'Organza Sarees', 'Chiffon & Georgette', 'Handloom Cotton'],
  },
  {
    title: 'BRANDS',
    items: ['NiaKylie Signature', 'Biba & Aurelia', 'Ritu Kumar Edit'],
  },
  {
    title: 'SALE (UP TO 50% OFF)',
    isSale: true,
    items: ['Clearance Sale', 'Under ₹1,499 Store', 'Buy 1 Get 1 Free'],
  },
];

export function MobileDrawer({ isOpen, onClose, onOpenAuthModal }: MobileDrawerProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const { user, isAuthenticated, logout } = useAuthStore();
  const { itemCount } = useCartStore();
  const { wishlistItems } = useWishlistStore();

  if (!isOpen) return null;

  const toggleAccordion = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-white shadow-2xl flex flex-col justify-between animate-in slide-in-from-left duration-300 z-50">
        <div>
          {/* Top Drawer Header */}
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-brand-slate-dark text-white">
            <a href="/" onClick={onClose} className="flex items-center space-x-2">
              <img
                src="/asset/niakylie_logo.png"
                alt="NiaKylie Fashion"
                className="h-9 w-auto object-contain rounded-lg bg-white p-0.5"
              />
            </a>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-slate-300 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Status Bar */}
          <div className="p-4 bg-slate-50 border-b border-gray-100 flex items-center justify-between">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-brand-crimson text-white font-bold flex items-center justify-center text-xs">
                  {user?.firstName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="text-xs font-bold text-brand-slate-dark">
                    {[user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Customer'}
                  </p>
                  <p className="text-[10px] text-slate-500">{user?.email}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-semibold text-slate-600">Welcome Guest!</span>
                <button
                  onClick={() => {
                    onClose();
                    onOpenAuthModal();
                  }}
                  className="bg-brand-crimson text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm"
                >
                  Login / Register
                </button>
              </div>
            )}
          </div>

          {/* Accordion Categories List */}
          <div className="p-4 overflow-y-auto max-h-[calc(100vh-220px)] space-y-1">
            {CATEGORY_ACCORDIONS.map((cat, idx) => (
              <div key={idx} className="border-b border-gray-100 last:border-0 pb-1">
                <button
                  onClick={() => toggleAccordion(idx)}
                  className={`w-full flex items-center justify-between py-2.5 text-xs font-bold uppercase tracking-wider ${
                    cat.isSale ? 'text-brand-crimson' : 'text-brand-slate'
                  }`}
                >
                  <span>{cat.title}</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      expandedIndex === idx ? 'rotate-180 text-brand-crimson' : 'text-slate-400'
                    }`}
                  />
                </button>

                {expandedIndex === idx && (
                  <div className="pl-3 pb-2 space-y-1.5 text-xs text-slate-600 border-l-2 border-brand-crimson/30 ml-1">
                    {cat.items.map((sub, sIdx) => (
                      <a
                        key={sIdx}
                        href={`/category/${sub.toLowerCase().replace(/\s+/g, '-')}`}
                        onClick={onClose}
                        className="block hover:text-brand-crimson py-1 font-medium transition-colors"
                      >
                        {sub}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Drawer Actions */}
        <div className="p-4 border-t border-gray-100 bg-slate-50 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <a
              href="/account/wishlist"
              onClick={onClose}
              className="flex items-center justify-center space-x-1.5 bg-white border border-gray-200 p-2 rounded-xl text-xs font-bold text-slate-700 hover:border-brand-crimson"
            >
              <Heart className="w-4 h-4 text-brand-crimson" />
              <span>Wishlist ({wishlistItems.length})</span>
            </a>
            <a
              href="/cart"
              onClick={onClose}
              className="flex items-center justify-center space-x-1.5 bg-white border border-gray-200 p-2 rounded-xl text-xs font-bold text-slate-700 hover:border-brand-crimson"
            >
              <ShoppingBag className="w-4 h-4 text-brand-crimson" />
              <span>Bag ({itemCount})</span>
            </a>
          </div>

          {isAuthenticated && (
            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="w-full text-center text-xs font-bold text-red-600 hover:underline py-1"
            >
              Logout Account
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default MobileDrawer;
