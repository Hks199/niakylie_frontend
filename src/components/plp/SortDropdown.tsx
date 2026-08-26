import { ArrowUpDown } from 'lucide-react';

interface SortDropdownProps {
  currentSort: string;
  onSortChange: (sort: string) => void;
}

const SORT_OPTIONS = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Customer Rating' },
  { value: 'latest', label: "What's New" },
];

export function SortDropdown({ currentSort, onSortChange }: SortDropdownProps) {
  return (
    <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-xl px-3 py-1.5 shadow-sm hover:border-gray-300 transition-all">
      <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
      <span className="text-xs font-bold text-slate-500 hidden sm:inline">Sort by:</span>
      <select
        value={currentSort}
        onChange={(e) => onSortChange(e.target.value)}
        className="bg-transparent text-xs font-bold text-brand-slate-dark outline-none cursor-pointer pr-1"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default SortDropdown;
