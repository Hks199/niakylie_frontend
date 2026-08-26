import { ChevronRight } from 'lucide-react';

interface PLPBreadcrumbHeaderProps {
  title: string;
  totalItems: number;
  categoryPath?: string[];
}

export function PLPBreadcrumbHeader({ title, totalItems, categoryPath = ['Home', 'Women'] }: PLPBreadcrumbHeaderProps) {
  return (
    <div className="py-4 border-b border-gray-100 mb-6">
      {/* Breadcrumb Trail */}
      <nav className="flex items-center space-x-1.5 text-xs text-slate-500 mb-2">
        {categoryPath.map((crumb, idx) => (
          <div key={idx} className="flex items-center space-x-1.5">
            <a href="/" className="hover:text-brand-crimson transition-colors">
              {crumb}
            </a>
            <ChevronRight className="w-3 h-3 text-slate-300" />
          </div>
        ))}
        <span className="font-bold text-brand-slate-dark capitalize">{title}</span>
      </nav>

      {/* Category Header Title & Item Count */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-slate-dark font-display capitalize">
          {title} Collection
        </h1>
        <span className="text-xs font-bold text-slate-500">
          - <span className="text-brand-crimson font-extrabold">{totalItems}</span> Items Found
        </span>
      </div>
    </div>
  );
}

export default PLPBreadcrumbHeader;
