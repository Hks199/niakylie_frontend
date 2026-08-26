import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center space-x-2 my-10">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-xl bg-white border border-gray-200 text-slate-600 hover:border-brand-crimson hover:text-brand-crimson disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:text-slate-600 transition-colors"
        aria-label="Previous Page"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`w-9 h-9 text-xs font-bold rounded-xl transition-all ${
            currentPage === p
              ? 'bg-brand-crimson text-white shadow-md'
              : 'bg-white border border-gray-200 text-slate-700 hover:border-brand-crimson hover:text-brand-crimson'
          }`}
        >
          {p}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-xl bg-white border border-gray-200 text-slate-600 hover:border-brand-crimson hover:text-brand-crimson disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:text-slate-600 transition-colors"
        aria-label="Next Page"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

export default Pagination;
