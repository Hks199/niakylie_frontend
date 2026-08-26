import { useState } from 'react';
import { ChevronRight } from 'lucide-react';

export interface MegamenuCategory {
  title: string;
  slug: string;
  isSale?: boolean;
  columns: {
    heading: string;
    items: { name: string; slug: string; isHot?: boolean; isNew?: boolean }[];
  }[];
  featuredCard?: {
    title: string;
    subtitle: string;
    imageUrl: string;
    linkUrl: string;
    discountTag?: string;
  };
}

const MENU_DATA: MegamenuCategory[] = [
  {
    title: 'WOMEN',
    slug: 'women',
    columns: [
      {
        heading: 'Indian & Ethnic Wear',
        items: [
          { name: 'Kurta Sets & Suits', slug: 'kurta-sets', isHot: true },
          { name: 'Sarees', slug: 'sarees' },
          { name: 'Anarkali Dresses', slug: 'anarkalis' },
          { name: 'Lehenga Cholis', slug: 'lehengas', isNew: true },
          { name: 'Palazzo & Sharara Sets', slug: 'palazzos' },
          { name: 'Dupattas & Shawls', slug: 'dupattas' },
        ],
      },
      {
        heading: 'Western Wear',
        items: [
          { name: 'Dresses & Gowns', slug: 'dresses' },
          { name: 'Tops & Shirts', slug: 'tops' },
          { name: 'Jumpsuits & Playsuits', slug: 'jumpsuits' },
          { name: 'Jackets & Shrugs', slug: 'jackets' },
          { name: 'Skirts & Palazzos', slug: 'skirts' },
        ],
      },
      {
        heading: 'Trending Collections',
        items: [
          { name: 'Diwali Festive Edit', slug: 'festive-edit', isHot: true },
          { name: 'Silk Royale Saree Edit', slug: 'silk-royale' },
          { name: 'Bridal Trousseau', slug: 'bridal' },
          { name: 'Indo-Western Fusion', slug: 'indo-western' },
        ],
      },
    ],
    featuredCard: {
      title: 'Festive Velvet Lehengas',
      subtitle: 'Flat 40% Off on Designer Wear',
      imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80',
      linkUrl: '/category/lehengas',
      discountTag: '40% OFF',
    },
  },
  {
    title: 'ETHNIC WEAR',
    slug: 'ethnic-wear',
    columns: [
      {
        heading: 'Sarees By Fabric',
        items: [
          { name: 'Banarasi Silk Sarees', slug: 'banarasi-silk', isHot: true },
          { name: 'Kanjeevaram Silk', slug: 'kanjeevaram' },
          { name: 'Organza & Net Sarees', slug: 'organza', isNew: true },
          { name: 'Chiffon & Georgette', slug: 'chiffon' },
          { name: 'Cotton Handloom', slug: 'cotton-handloom' },
        ],
      },
      {
        heading: 'Ethnic Suits',
        items: [
          { name: 'Straight Suit Sets', slug: 'straight-suits' },
          { name: 'Sharara & Gharara Sets', slug: 'sharara-sets', isHot: true },
          { name: 'Angrakha Style Suits', slug: 'angrakha' },
          { name: 'Plus Size Suits', slug: 'plus-size' },
        ],
      },
      {
        heading: 'Occasion Wear',
        items: [
          { name: 'Wedding Guest Specials', slug: 'wedding-guest' },
          { name: 'Haldi & Mehendi Looks', slug: 'haldi-mehendi' },
          { name: 'Sangeet Party Wear', slug: 'sangeet' },
        ],
      },
    ],
    featuredCard: {
      title: 'Pure Silk Heritage Sarees',
      subtitle: 'Handcrafted by Master Weavers',
      imageUrl: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=400&q=80',
      linkUrl: '/category/sarees',
      discountTag: 'NEW ARRIVALS',
    },
  },
  {
    title: 'SAREES',
    slug: 'sarees',
    columns: [
      {
        heading: 'Shop By Craft',
        items: [
          { name: 'Zari Embroidery', slug: 'zari' },
          { name: 'Gotapatti Work', slug: 'gotapatti', isHot: true },
          { name: 'Hand Block Print', slug: 'block-print' },
          { name: 'Chanderi Brocade', slug: 'chanderi' },
        ],
      },
      {
        heading: 'Shop By Color',
        items: [
          { name: 'Crimson Red & Maroon', slug: 'red-sarees' },
          { name: 'Royal Gold & Mustard', slug: 'gold-sarees' },
          { name: 'Emerald Green', slug: 'green-sarees' },
          { name: 'Pastel Pinks & Blues', slug: 'pastel-sarees' },
        ],
      },
    ],
    featuredCard: {
      title: 'Royal Banarasi Collection',
      subtitle: 'Graceful Drapery for Celebrations',
      imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=400&q=80',
      linkUrl: '/category/sarees',
      discountTag: 'UP TO 50% OFF',
    },
  },
  {
    title: 'DRESSES',
    slug: 'dresses',
    columns: [
      {
        heading: 'Fusion Dresses',
        items: [
          { name: 'Layered Maxi Gowns', slug: 'maxi-gowns' },
          { name: 'Ethnic Jacket Dresses', slug: 'jacket-dresses', isHot: true },
          { name: 'Asymmetric Tunics', slug: 'asymmetric' },
          { name: 'Cape Style Dresses', slug: 'cape-dresses' },
        ],
      },
    ],
    featuredCard: {
      title: 'Contemporary Fusion Gowns',
      subtitle: 'Modern Silhouette, Traditional Aesthetics',
      imageUrl: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=400&q=80',
      linkUrl: '/category/dresses',
    },
  },
  {
    title: 'BRANDS',
    slug: 'brands',
    columns: [
      {
        heading: 'Featured Luxury Brands',
        items: [
          { name: 'NiaKylie Signature', slug: 'niakylie-signature', isHot: true },
          { name: 'Biba & Aurelia', slug: 'biba' },
          { name: 'Ritu Kumar Edit', slug: 'ritu-kumar' },
          { name: 'Anita Dongre Grassroot', slug: 'anita-dongre' },
          { name: 'FabIndia Select', slug: 'fabindia' },
        ],
      },
    ],
  },
  {
    title: 'SALE',
    slug: 'sale',
    isSale: true,
    columns: [
      {
        heading: 'Festival Steals',
        items: [
          { name: 'Flat 50% Off Clearance', slug: 'clearance-50', isHot: true },
          { name: 'Under ₹1,499 Store', slug: 'under-1499' },
          { name: 'Buy 1 Get 1 Free', slug: 'bogo' },
          { name: 'Saree Mega Mela', slug: 'saree-sale' },
        ],
      },
    ],
  },
];

export function Megamenu() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  return (
    <nav className="relative flex items-center space-x-1 sm:space-x-4 lg:space-x-8 font-sans font-semibold text-xs sm:text-sm tracking-wider">
      {MENU_DATA.map((menu) => (
        <div
          key={menu.slug}
          className="relative py-4"
          onMouseEnter={() => setActiveMenu(menu.slug)}
          onMouseLeave={() => setActiveMenu(null)}
        >
          <a
            href={`/category/${menu.slug}`}
            className={`inline-flex items-center space-x-1 py-1 px-2.5 rounded-md transition-all duration-200 uppercase ${
              menu.isSale
                ? 'text-brand-crimson font-extrabold hover:bg-brand-crimson/10'
                : activeMenu === menu.slug
                ? 'text-brand-crimson bg-gray-50 font-bold'
                : 'text-brand-slate hover:text-brand-crimson'
            }`}
          >
            <span>{menu.title}</span>
            {menu.isSale && (
              <span className="bg-brand-crimson text-white text-[9px] px-1.5 py-0.5 rounded font-extrabold animate-pulse">
                50% OFF
              </span>
            )}
          </a>

          {/* Megamenu Dropdown Container */}
          {activeMenu === menu.slug && (
            <div className="absolute top-full left-0 w-screen max-w-5xl -ml-4 sm:-ml-12 lg:-ml-32 bg-white/95 backdrop-blur-xl border border-gray-100 shadow-2xl rounded-2xl p-6 sm:p-8 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Links Columns */}
                <div className="md:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-6">
                  {menu.columns.map((col, idx) => (
                    <div key={idx} className="space-y-3">
                      <h4 className="text-xs uppercase font-extrabold tracking-wider text-brand-slate-dark border-b border-gray-100 pb-2 flex items-center justify-between">
                        <span>{col.heading}</span>
                      </h4>
                      <ul className="space-y-2 text-xs">
                        {col.items.map((item) => (
                          <li key={item.slug}>
                            <a
                              href={`/category/${item.slug}`}
                              className="text-slate-600 hover:text-brand-crimson hover:translate-x-1 transition-all inline-flex items-center space-x-1.5 group"
                            >
                              <span className="group-hover:font-semibold">{item.name}</span>
                              {item.isHot && (
                                <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.5 rounded">
                                  HOT
                                </span>
                              )}
                              {item.isNew && (
                                <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.5 rounded">
                                  NEW
                                </span>
                              )}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* Featured Promo Card Column */}
                {menu.featuredCard && (
                  <div className="md:col-span-1 border-l border-gray-100 pl-6 hidden md:block">
                    <div className="group relative rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <img
                        src={menu.featuredCard.imageUrl}
                        alt={menu.featuredCard.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/30 to-transparent p-4 flex flex-col justify-end text-white">
                        {menu.featuredCard.discountTag && (
                          <span className="bg-brand-crimson text-white text-[10px] font-bold px-2 py-0.5 rounded-full inline-block w-max mb-1">
                            {menu.featuredCard.discountTag}
                          </span>
                        )}
                        <h5 className="font-bold text-sm leading-tight text-white mb-0.5">
                          {menu.featuredCard.title}
                        </h5>
                        <p className="text-[11px] text-slate-300 mb-2">{menu.featuredCard.subtitle}</p>
                        <a
                          href={menu.featuredCard.linkUrl}
                          className="inline-flex items-center text-xs font-semibold text-brand-gold hover:text-white transition-colors"
                        >
                          Explore Collection <ChevronRight className="w-3.5 h-3.5 ml-1" />
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </nav>
  );
}

export default Megamenu;
