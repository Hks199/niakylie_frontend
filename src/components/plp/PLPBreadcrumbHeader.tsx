import { ChevronRight } from 'lucide-react';
import { BreadcrumbItem } from '../../utils/breadcrumb';

interface PLPBreadcrumbHeaderProps {
  title: string;
  totalItems?: number;
  breadcrumbs?: BreadcrumbItem[];
}

export function PLPBreadcrumbHeader({ title, totalItems, breadcrumbs }: PLPBreadcrumbHeaderProps) {
  const items: BreadcrumbItem[] = breadcrumbs && breadcrumbs.length > 0
    ? breadcrumbs
    : [
        { label: 'Home', href: '/' },
        { label: title || 'All Ethnic Couture', href: '#' },
      ];

  return (
    <div className="py-4 border-b border-gray-100 mb-6">
      {/* Breadcrumb Trail */}
      <nav className="flex items-center space-x-1.5 text-xs text-slate-500 mb-2 overflow-x-auto no-scrollbar">
        {items.map((crumb, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <div key={idx} className="flex items-center space-x-1.5 flex-shrink-0">
              {isLast ? (
                <span className="font-bold text-brand-slate-dark capitalize">{crumb.label}</span>
              ) : (
                <>
                  <a href={crumb.href} className="hover:text-brand-crimson transition-colors font-medium">
                    {crumb.label}
                  </a>
                  <ChevronRight className="w-3 h-3 text-slate-300 flex-shrink-0" />
                </>
              )}
            </div>
          );
        })}
      </nav>

      {/* Category Header Title & Item Count */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-slate-dark font-display capitalize">
          {title} {title !== 'All Ethnic Couture' ? 'Collection' : ''}
        </h1>
        {totalItems !== undefined && (
          <span className="text-xs font-bold text-slate-500">
            - <span className="text-brand-crimson font-extrabold">{totalItems}</span> Items Found
          </span>
        )}
      </div>
    </div>
  );
}

export default PLPBreadcrumbHeader;
