import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { useCategories } from '../../hooks/useCategories';
import { formatImageUrl } from '../../utils/imageUtils';

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
    fallbackImageUrl?: string;
    linkUrl: string;
    discountTag?: string;
  };
}

export function Megamenu() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const { allCategories, rootCategories, isLoading } = useCategories({ limit: 500, status: true });

  const activeRoots = rootCategories.filter((r) => r.status !== false && !r.isDeleted && !r.deletedAt);

  if (isLoading) {
    return (
      <div className="flex space-x-6 animate-pulse py-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-4 w-20 bg-slate-200 rounded"></div>
        ))}
      </div>
    );
  }

  if (activeRoots.length === 0) {
    return null;
  }

  const menuDataToDisplay: MegamenuCategory[] = activeRoots.map((root) => {
    const rootId = root._id || (root as any).id;
    const subCats = allCategories.filter((c) => {
      if (c.status === false || c.isDeleted || c.deletedAt) return false;
      const pId = typeof c.parentId === 'object' && c.parentId ? ((c.parentId as any)._id || (c.parentId as any).id) : c.parentId;
      return String(pId) === String(rootId);
    });

    return {
      title: root.name.toUpperCase(),
      slug: root.slug,
      columns: [
        {
          heading: `${root.name} Categories`,
          items: subCats.length > 0
            ? subCats.map((s) => ({ name: s.name, slug: s.slug }))
            : [{ name: `All ${root.name}`, slug: root.slug }],
        },
      ],
      featuredCard: (root.banner || root.image)
        ? {
            title: root.name,
            subtitle: root.description || 'Exclusive Collection',
            imageUrl: formatImageUrl(root.banner || root.image),
            fallbackImageUrl: root.image ? formatImageUrl(root.image) : undefined,
            linkUrl: `/category/${root.slug}`,
            discountTag: 'EXPLORE',
          }
        : undefined,
    };
  });

  return (
    <nav className="relative flex items-center space-x-1 sm:space-x-4 lg:space-x-8 font-sans font-semibold text-xs sm:text-sm tracking-wider">
      {menuDataToDisplay.map((menu) => (
        <div
          key={menu.slug}
          className="relative py-4"
          onMouseEnter={() => setActiveMenu(menu.slug)}
          onMouseLeave={() => setActiveMenu(null)}
        >
          <a
            href={`/category/${menu.slug}`}
            className={`inline-flex items-center space-x-1 py-1 px-2.5 rounded-md transition-all duration-200 uppercase ${
              activeMenu === menu.slug
                ? 'text-brand-crimson bg-gray-50 font-bold'
                : 'text-brand-slate hover:text-brand-crimson'
            }`}
          >
            <span>{menu.title}</span>
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
                        onError={(event) => {
                          const fallbackUrl = menu.featuredCard?.fallbackImageUrl;
                          if (fallbackUrl && event.currentTarget.src !== fallbackUrl) {
                            event.currentTarget.src = fallbackUrl;
                          } else {
                            event.currentTarget.style.display = 'none';
                          }
                        }}
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
