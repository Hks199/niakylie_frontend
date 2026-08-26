import { X } from 'lucide-react';
import { FilterState } from './FilterSidebar';

interface ActiveFilterChipsProps {
  filters: FilterState;
  onRemoveCategory: (slug: string) => void;
  onRemoveBrand: (brand: string) => void;
  onRemoveColor: (color: string) => void;
  onRemovePrice: () => void;
  onRemoveDiscount: () => void;
  onRemoveRating: () => void;
  onClearAll: () => void;
}

export function ActiveFilterChips({
  filters,
  onRemoveCategory,
  onRemoveBrand,
  onRemoveColor,
  onRemovePrice,
  onRemoveDiscount,
  onRemoveRating,
  onClearAll,
}: ActiveFilterChipsProps) {
  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.brands.length > 0 ||
    filters.colors.length > 0 ||
    filters.minPrice !== undefined ||
    filters.discount !== undefined ||
    filters.rating !== undefined;

  if (!hasActiveFilters) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6 p-3 bg-slate-50 border border-gray-100 rounded-2xl">
      <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mr-1">Active Filters:</span>

      {/* Categories */}
      {filters.categories.map((c) => (
        <span
          key={c}
          className="inline-flex items-center text-xs font-bold bg-white text-brand-slate-dark border border-gray-200 px-3 py-1 rounded-full shadow-sm"
        >
          <span className="capitalize">{c.replace('-', ' ')}</span>
          <button onClick={() => onRemoveCategory(c)} className="ml-1.5 text-slate-400 hover:text-brand-crimson">
            <X className="w-3.5 h-3.5" />
          </button>
        </span>
      ))}

      {/* Brands */}
      {filters.brands.map((b) => (
        <span
          key={b}
          className="inline-flex items-center text-xs font-bold bg-white text-brand-slate-dark border border-gray-200 px-3 py-1 rounded-full shadow-sm"
        >
          <span>{b}</span>
          <button onClick={() => onRemoveBrand(b)} className="ml-1.5 text-slate-400 hover:text-brand-crimson">
            <X className="w-3.5 h-3.5" />
          </button>
        </span>
      ))}

      {/* Colors */}
      {filters.colors.map((clr) => (
        <span
          key={clr}
          className="inline-flex items-center text-xs font-bold bg-white text-brand-slate-dark border border-gray-200 px-3 py-1 rounded-full shadow-sm"
        >
          <span>Color: {clr}</span>
          <button onClick={() => onRemoveColor(clr)} className="ml-1.5 text-slate-400 hover:text-brand-crimson">
            <X className="w-3.5 h-3.5" />
          </button>
        </span>
      ))}

      {/* Price Range */}
      {filters.minPrice !== undefined && (
        <span className="inline-flex items-center text-xs font-bold bg-white text-brand-slate-dark border border-gray-200 px-3 py-1 rounded-full shadow-sm">
          <span>
            ₹{filters.minPrice.toLocaleString('en-IN')} - ₹{(filters.maxPrice || 50000).toLocaleString('en-IN')}
          </span>
          <button onClick={onRemovePrice} className="ml-1.5 text-slate-400 hover:text-brand-crimson">
            <X className="w-3.5 h-3.5" />
          </button>
        </span>
      )}

      {/* Discount */}
      {filters.discount !== undefined && (
        <span className="inline-flex items-center text-xs font-bold bg-white text-brand-slate-dark border border-gray-200 px-3 py-1 rounded-full shadow-sm">
          <span>{filters.discount}%+ Off</span>
          <button onClick={onRemoveDiscount} className="ml-1.5 text-slate-400 hover:text-brand-crimson">
            <X className="w-3.5 h-3.5" />
          </button>
        </span>
      )}

      {/* Rating */}
      {filters.rating !== undefined && (
        <span className="inline-flex items-center text-xs font-bold bg-white text-brand-slate-dark border border-gray-200 px-3 py-1 rounded-full shadow-sm">
          <span>{filters.rating}★ & Above</span>
          <button onClick={onRemoveRating} className="ml-1.5 text-slate-400 hover:text-brand-crimson">
            <X className="w-3.5 h-3.5" />
          </button>
        </span>
      )}

      {/* Clear All */}
      <button
        onClick={onClearAll}
        className="text-xs font-extrabold text-brand-crimson hover:underline ml-auto"
      >
        CLEAR ALL
      </button>
    </div>
  );
}

export default ActiveFilterChips;
