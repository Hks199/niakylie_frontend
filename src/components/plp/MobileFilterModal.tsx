import { X } from 'lucide-react';
import { FilterSidebar, FilterState } from './FilterSidebar';

interface MobileFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onClearAll: () => void;
}

export function MobileFilterModal({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onClearAll,
}: MobileFilterModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Bottom Sheet Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-white shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300 z-50">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-brand-slate-dark text-white">
          <h3 className="font-extrabold text-sm uppercase tracking-wider">Refine Filters</h3>
          <button onClick={onClose} className="p-1 rounded-full text-slate-300 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Accordions Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <FilterSidebar filters={filters} onFilterChange={onFilterChange} />
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-100 bg-slate-50 flex items-center space-x-3">
          <button
            onClick={() => {
              onClearAll();
              onClose();
            }}
            className="flex-1 bg-white border border-gray-200 text-slate-700 font-bold text-xs py-3 rounded-xl hover:bg-slate-100"
          >
            CLEAR ALL
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-brand-crimson text-white font-bold text-xs py-3 rounded-xl shadow-md uppercase tracking-wider"
          >
            APPLY FILTERS
          </button>
        </div>
      </div>
    </div>
  );
}

export default MobileFilterModal;
