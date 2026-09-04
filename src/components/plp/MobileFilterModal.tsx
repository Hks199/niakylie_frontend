import { useState } from 'react';
import { X, ArrowUpDown, ChevronDown } from 'lucide-react';
import { FilterSidebar, FilterState } from './FilterSidebar';

interface MobileFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onClearAll: () => void;
  currentSort?: string;
  onSortChange?: (sort: string) => void;
}

const SORT_OPTIONS = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Customer Rating' },
  { value: 'latest', label: "What's New" },
];

export function MobileFilterModal({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onClearAll,
  currentSort,
  onSortChange,
}: MobileFilterModalProps) {
  const [isSortOpen, setIsSortOpen] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Bottom Sheet Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-[300px] sm:max-w-xs w-full bg-white shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300 z-50">
        <div className="p-3.5 sm:p-4 border-b border-gray-100 flex items-center justify-between bg-brand-slate-dark text-white">
          <h3 className="font-extrabold text-xs sm:text-sm uppercase tracking-wider">Refine Filters & Sort</h3>
          <button onClick={onClose} className="p-1 rounded-full text-slate-300 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter & Sort Accordions Content */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-5 scrollbar-none">
          {/* Sort By Section */}
          {onSortChange && (
            <div className="border-b border-gray-100 pb-4">
              <button
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="w-full flex items-center justify-between py-1 text-xs font-bold uppercase text-brand-slate-dark"
              >
                <div className="flex items-center space-x-1.5">
                  <ArrowUpDown className="w-3.5 h-3.5 text-brand-crimson" />
                  <span>Sort By</span>
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform ${isSortOpen ? 'rotate-180' : ''}`} />
              </button>

              {isSortOpen && (
                <div className="mt-3 space-y-2">
                  {SORT_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className="flex items-center space-x-2 text-xs text-slate-600 hover:text-brand-crimson cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="mobile_sort_option"
                        checked={currentSort === opt.value}
                        onChange={() => onSortChange(opt.value)}
                        className="w-4 h-4 text-brand-crimson focus:ring-brand-crimson/20 border-gray-300"
                      />
                      <span className={currentSort === opt.value ? 'font-bold text-brand-crimson' : ''}>
                        {opt.label}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Active Filter Accordions */}
          <FilterSidebar filters={filters} onFilterChange={onFilterChange} isMobile={true} />
        </div>

        {/* Bottom Actions */}
        <div className="p-3.5 sm:p-4 border-t border-gray-100 bg-slate-50 flex items-center space-x-2.5">
          <button
            onClick={() => {
              onClearAll();
              onClose();
            }}
            className="flex-1 bg-white border border-gray-200 text-slate-700 font-bold text-xs py-2.5 sm:py-3 rounded-xl hover:bg-slate-100"
          >
            CLEAR ALL
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-brand-crimson text-white font-bold text-xs py-2.5 sm:py-3 rounded-xl shadow-md uppercase tracking-wider"
          >
            APPLY
          </button>
        </div>
      </div>
    </div>
  );
}

export default MobileFilterModal;
