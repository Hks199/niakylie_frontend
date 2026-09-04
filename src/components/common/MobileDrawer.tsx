import { useState, useEffect } from 'react';
import { X, ChevronDown, Heart, ShoppingBag, HelpCircle, PhoneCall, FolderTree } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useCartStore } from '../../store/useCartStore';
import { useWishlistStore } from '../../store/useWishlistStore';
import { useCategories } from '../../hooks/useCategories';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuthModal: () => void;
}

export function MobileDrawer({ isOpen, onClose, onOpenAuthModal }: MobileDrawerProps) {
  const [expandedSlugs, setExpandedSlugs] = useState<string[]>([]);
  const { user, isAuthenticated, logout } = useAuthStore();
  const { itemCount } = useCartStore();
  const { wishlistItems } = useWishlistStore();

  // Dynamic API Categories
  const { allCategories, rootCategories, isLoading } = useCategories({ limit: 500, status: true });

  const activeRoots = rootCategories.filter((r) => r.status !== false && !r.isDeleted && !r.deletedAt);

  // Helper to guarantee subcategories exist for every category
  const getSubCategoriesForRoot = (root: any) => {
    const rootId = root._id || root.id;

    // 1. Direct parentId match from DB categories list
    const dbSubs = allCategories.filter((c) => {
      if (c.status === false || c.isDeleted || c.deletedAt) return false;
      const pId = typeof c.parentId === 'object' && c.parentId ? ((c.parentId as any)._id || (c.parentId as any).id) : c.parentId;
      return String(pId) === String(rootId) || (c.parentId && String(c.parentId) === String(root.slug));
    });

    if (dbSubs.length > 0) {
      return dbSubs.map((s) => ({ name: s.name, slug: s.slug }));
    }

    // 2. Embedded subCategories array from GET /categories/tree endpoint
    if (Array.isArray(root.subCategories) && root.subCategories.length > 0) {
      return root.subCategories.map((s: any) => ({
        name: s.name || s.title,
        slug: s.slug || (s.name ? s.name.toLowerCase().replace(/\s+/g, '-') : 'all'),
      }));
    }

    // 3. Category-specific subcategories fallback
    const nameLower = (root.name || '').toLowerCase();
    if (nameLower.includes('saree')) {
      return [
        { name: 'Banarasi Silk Sarees', slug: 'banarasi-silk-sarees' },
        { name: 'Kanjeevaram Sarees', slug: 'kanjeevaram-sarees' },
        { name: 'Organza & Chiffon', slug: 'organza-chiffon' },
        { name: 'Handloom Cotton', slug: 'handloom-cotton' },
        { name: 'Party Wear Sarees', slug: 'party-wear-sarees' },
      ];
    }
    if (nameLower.includes('lehenga')) {
      return [
        { name: 'Bridal Couture Lehengas', slug: 'bridal-lehengas' },
        { name: 'Partywear & Festive', slug: 'partywear-lehengas' },
        { name: 'Crop Top & Skirt Sets', slug: 'crop-top-lehengas' },
        { name: 'Velvet & Silk Edit', slug: 'velvet-lehengas' },
      ];
    }
    if (nameLower.includes('kurta') || nameLower.includes('suit') || nameLower.includes('dress') || nameLower.includes('anarkali')) {
      return [
        { name: 'Anarkali & Sharara Suits', slug: 'anarkali-sharara' },
        { name: 'Straight Cut Kurtis', slug: 'straight-kurtis' },
        { name: 'Palazzo Sets', slug: 'palazzo-sets' },
        { name: 'Indo-Western Edit', slug: 'indo-western' },
      ];
    }

    // Fallback subcategories for any generic category
    return [
      { name: `New Arrivals in ${root.name}`, slug: root.slug },
      { name: `Best Sellers in ${root.name}`, slug: root.slug },
      { name: `Trending ${root.name}`, slug: root.slug },
      { name: `Budget Friendly ${root.name}`, slug: root.slug },
    ];
  };

  // Categories list to render (uses activeRoots or default fallback categories)
  const categoriesToRender = activeRoots.length > 0 ? activeRoots : [
    { name: 'SAREES', slug: 'sarees' },
    { name: 'LEHENGAS', slug: 'lehengas' },
    { name: 'KURTA SETS & SUITS', slug: 'kurta-sets' },
  ];

  // Auto-expand all categories whenever the drawer is opened or categories load
  useEffect(() => {
    if (categoriesToRender.length > 0) {
      setExpandedSlugs(categoriesToRender.map((r) => r.slug));
    }
  }, [categoriesToRender.length, isOpen]);

  if (!isOpen) return null;

  const toggleAccordion = (slug: string) => {
    setExpandedSlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div className="fixed inset-y-0 left-0 max-w-xs sm:max-w-sm w-full bg-white shadow-2xl flex flex-col justify-between animate-in slide-in-from-left duration-300 z-50">
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
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Status Bar */}
          <div className="p-4 bg-slate-50 border-b border-gray-100 flex items-center justify-between">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-brand-crimson text-white font-bold flex items-center justify-center text-xs shadow-sm">
                  {user?.firstName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-brand-slate-dark truncate">
                    {[user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Customer Account'}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
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
                  className="bg-brand-crimson hover:bg-brand-crimson-dark text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm transition-colors"
                >
                  Login / Register
                </button>
              </div>
            )}
          </div>

          {/* Accordion Categories List */}
          <div className="p-4 overflow-y-auto max-h-[calc(100vh-250px)] space-y-1 scrollbar-none">
            <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-2 flex items-center space-x-1">
              <FolderTree className="w-3.5 h-3.5 text-brand-crimson" />
              <span>Explore Categories & Collections</span>
            </div>

            {isLoading ? (
              <div className="space-y-3 py-2 animate-pulse">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-8 bg-slate-100 rounded-lg w-full" />
                ))}
              </div>
            ) : (
              categoriesToRender.map((root) => {
                const subCats = getSubCategoriesForRoot(root);
                const isExpanded = expandedSlugs.includes(root.slug);

                return (
                  <div key={root.slug} className="border-b border-gray-100 last:border-0 pb-1">
                    {/* Category Header Button with Dropdown Chevron */}
                    <button
                      onClick={() => toggleAccordion(root.slug)}
                      className="w-full flex items-center justify-between py-2.5 text-xs font-extrabold uppercase tracking-wider text-brand-slate hover:text-brand-crimson transition-colors group"
                    >
                      <span className="group-hover:text-brand-crimson">{root.name}</span>
                      <div className="flex items-center space-x-1">
                        <span className="text-[10px] font-semibold text-slate-400 normal-case bg-slate-100 px-1.5 py-0.5 rounded">
                          {subCats.length} items
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform duration-200 ${
                            isExpanded ? 'rotate-180 text-brand-crimson' : 'text-slate-400'
                          }`}
                        />
                      </div>
                    </button>

                    {/* Subcategories Dropdown Items */}
                    {isExpanded && (
                      <div className="pl-3 pb-2 space-y-1.5 text-xs text-slate-600 border-l-2 border-brand-crimson/40 ml-1 animate-in fade-in duration-150">
                        <a
                          href={`/category/${root.slug}`}
                          onClick={onClose}
                          className="block text-brand-crimson font-bold py-1 hover:underline text-[11px]"
                        >
                          Explore All {root.name} →
                        </a>
                        {subCats.map((sub: { name: string; slug: string }, idx: number) => (
                          <a
                            key={idx}
                            href={`/category/${sub.slug}`}
                            onClick={onClose}
                            className="block hover:text-brand-crimson py-1 font-medium transition-colors text-slate-700"
                          >
                            {sub.name}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {/* Quick Links Section */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1">
                Help & Support
              </div>
              <a
                href="/faqs"
                onClick={onClose}
                className="flex items-center space-x-2 text-xs font-bold text-slate-700 hover:text-brand-crimson py-1.5 transition-colors"
              >
                <HelpCircle className="w-4 h-4 text-brand-crimson" />
                <span>Frequently Asked Questions (FAQs)</span>
              </a>
              <a
                href="/pages/contact-us"
                onClick={onClose}
                className="flex items-center space-x-2 text-xs font-bold text-slate-700 hover:text-brand-crimson py-1.5 transition-colors"
              >
                <PhoneCall className="w-4 h-4 text-brand-crimson" />
                <span>Contact Customer Support</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Drawer Actions */}
        <div className="p-4 border-t border-gray-100 bg-slate-50 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <a
              href="/account/wishlist"
              onClick={onClose}
              className="flex items-center justify-center space-x-1.5 bg-white border border-gray-200 p-2.5 rounded-xl text-xs font-bold text-slate-700 hover:border-brand-crimson transition-all shadow-xs"
            >
              <Heart className="w-4 h-4 text-brand-crimson" />
              <span>Wishlist ({wishlistItems.length})</span>
            </a>
            <a
              href="/cart"
              onClick={onClose}
              className="flex items-center justify-center space-x-1.5 bg-white border border-gray-200 p-2.5 rounded-xl text-xs font-bold text-slate-700 hover:border-brand-crimson transition-all shadow-xs"
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
