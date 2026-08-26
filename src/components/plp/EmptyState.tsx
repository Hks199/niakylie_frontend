import { FilterX, RefreshCw } from 'lucide-react';

interface EmptyStateProps {
  onClearFilters: () => void;
}

export function EmptyState({ onClearFilters }: EmptyStateProps) {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center my-8 shadow-sm">
      <div className="w-16 h-16 bg-brand-crimson/10 text-brand-crimson rounded-full flex items-center justify-center mx-auto mb-4">
        <FilterX className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-extrabold text-brand-slate-dark mb-2">No Matching Products Found</h3>
      <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
        We couldn't find any products matching your selected filter combination. Try clearing some filters or broadening your search!
      </p>
      <button
        onClick={onClearFilters}
        className="inline-flex items-center space-x-2 bg-brand-crimson hover:bg-brand-crimson-dark text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md transition-all uppercase tracking-wider"
      >
        <RefreshCw className="w-4 h-4" />
        <span>RESET ALL FILTERS</span>
      </button>
    </div>
  );
}

export default EmptyState;
