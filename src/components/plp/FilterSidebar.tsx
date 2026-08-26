import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, ChevronDown, Check } from 'lucide-react';
import { brandsApi } from '../../api/brands';

export interface FilterState {
  categories: string[];
  brands: string[];
  colors: string[];
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  discount?: number;
}

interface FilterSidebarProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
}

const CATEGORIES_LIST = [
  { slug: 'sarees', name: 'Silk & Banarasi Sarees' },
  { slug: 'kurta-sets', name: 'Kurta Sets & Suits' },
  { slug: 'lehengas', name: 'Bridal Lehengas' },
  { slug: 'dresses', name: 'Indo-Western Fusion' },
  { slug: 'dupattas', name: 'Dupattas & Shawls' },
];

const FALLBACK_BRANDS_LIST = [
  'NiaKylie Signature',
  'Biba',
  'Ritu Kumar',
  'Anita Dongre',
  'FabIndia',
];

const COLOR_SWATCHES = [
  { name: 'Red', hex: '#E63946' },
  { name: 'Gold', hex: '#D4AF37' },
  { name: 'Green', hex: '#10B981' },
  { name: 'Pink', hex: '#EC4899' },
  { name: 'Blue', hex: '#3B82F6' },
  { name: 'Black', hex: '#1E293B' },
];

const PRICE_PRESETS = [
  { label: 'Under ₹1,999', min: 0, max: 1999 },
  { label: '₹2,000 - ₹4,999', min: 2000, max: 4999 },
  { label: '₹5,000 - ₹9,999', min: 5000, max: 9999 },
  { label: '₹10,000+', min: 10000, max: 50000 },
];

export function FilterSidebar({ filters, onFilterChange }: FilterSidebarProps) {
  const [brandSearch, setBrandSearch] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    price: true,
    brands: true,
    colors: true,
    discount: true,
    rating: true,
  });

  const { data: brandsResponse } = useQuery({
    queryKey: ['filter-brands-list'],
    queryFn: () => brandsApi.getBrands({ limit: 50 }),
  });

  const apiBrandsList = brandsResponse?.data?.map((b) => b.name) || [];
  const activeBrandsList = apiBrandsList.length > 0 ? apiBrandsList : FALLBACK_BRANDS_LIST;

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleCategoryToggle = (slug: string) => {
    const updated = filters.categories.includes(slug)
      ? filters.categories.filter((c) => c !== slug)
      : [...filters.categories, slug];
    onFilterChange({ ...filters, categories: updated });
  };

  const handleBrandToggle = (brand: string) => {
    const updated = filters.brands.includes(brand)
      ? filters.brands.filter((b) => b !== brand)
      : [...filters.brands, brand];
    onFilterChange({ ...filters, brands: updated });
  };

  const handleColorToggle = (color: string) => {
    const updated = filters.colors.includes(color)
      ? filters.colors.filter((c) => c !== color)
      : [...filters.colors, color];
    onFilterChange({ ...filters, colors: updated });
  };

  const filteredBrands = activeBrandsList.filter((b) =>
    b.toLowerCase().includes(brandSearch.toLowerCase())
  );

  return (
    <aside className="w-64 flex-shrink-0 space-y-6 pr-6 border-r border-gray-100 hidden lg:block">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <h3 className="font-extrabold text-sm uppercase tracking-wider text-brand-slate-dark">Filters</h3>
      </div>

      {/* 1. Categories Filter Accordion */}
      <div className="border-b border-gray-100 pb-4">
        <button
          onClick={() => toggleSection('categories')}
          className="w-full flex items-center justify-between py-1 text-xs font-bold uppercase text-brand-slate-dark"
        >
          <span>Categories</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.categories ? 'rotate-180' : ''}`} />
        </button>

        {expandedSections.categories && (
          <div className="mt-3 space-y-2">
            {CATEGORIES_LIST.map((cat) => {
              const isChecked = filters.categories.includes(cat.slug);
              return (
                <label
                  key={cat.slug}
                  className="flex items-center space-x-2 text-xs text-slate-600 hover:text-brand-crimson cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleCategoryToggle(cat.slug)}
                    className="w-4 h-4 rounded text-brand-crimson focus:ring-brand-crimson/20 border-gray-300"
                  />
                  <span>{cat.name}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Price Filter Accordion */}
      <div className="border-b border-gray-100 pb-4">
        <button
          onClick={() => toggleSection('price')}
          className="w-full flex items-center justify-between py-1 text-xs font-bold uppercase text-brand-slate-dark"
        >
          <span>Price Range</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.price ? 'rotate-180' : ''}`} />
        </button>

        {expandedSections.price && (
          <div className="mt-3 space-y-2">
            {PRICE_PRESETS.map((preset, idx) => {
              const isSelected = filters.minPrice === preset.min && filters.maxPrice === preset.max;
              return (
                <label
                  key={idx}
                  className="flex items-center space-x-2 text-xs text-slate-600 hover:text-brand-crimson cursor-pointer"
                >
                  <input
                    type="radio"
                    name="price_preset"
                    checked={isSelected}
                    onChange={() => onFilterChange({ ...filters, minPrice: preset.min, maxPrice: preset.max })}
                    className="w-4 h-4 text-brand-crimson focus:ring-brand-crimson/20 border-gray-300"
                  />
                  <span>{preset.label}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Brand Filter Accordion */}
      <div className="border-b border-gray-100 pb-4">
        <button
          onClick={() => toggleSection('brands')}
          className="w-full flex items-center justify-between py-1 text-xs font-bold uppercase text-brand-slate-dark"
        >
          <span>Brands</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.brands ? 'rotate-180' : ''}`} />
        </button>

        {expandedSections.brands && (
          <div className="mt-3 space-y-2.5">
            <div className="relative">
              <input
                type="text"
                value={brandSearch}
                onChange={(e) => setBrandSearch(e.target.value)}
                placeholder="Search Brand..."
                className="w-full pl-7 pr-3 py-1.5 text-xs bg-slate-50 border border-gray-200 rounded-lg outline-none focus:border-brand-crimson"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
            </div>

            <div className="space-y-2 max-h-36 overflow-y-auto no-scrollbar">
              {filteredBrands.map((brand) => {
                const isChecked = filters.brands.includes(brand);
                return (
                  <label
                    key={brand}
                    className="flex items-center space-x-2 text-xs text-slate-600 hover:text-brand-crimson cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleBrandToggle(brand)}
                      className="w-4 h-4 rounded text-brand-crimson focus:ring-brand-crimson/20 border-gray-300"
                    />
                    <span>{brand}</span>
                  </label>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 4. Color Swatches Accordion */}
      <div className="border-b border-gray-100 pb-4">
        <button
          onClick={() => toggleSection('colors')}
          className="w-full flex items-center justify-between py-1 text-xs font-bold uppercase text-brand-slate-dark"
        >
          <span>Color Palette</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.colors ? 'rotate-180' : ''}`} />
        </button>

        {expandedSections.colors && (
          <div className="mt-3 flex flex-wrap gap-2">
            {COLOR_SWATCHES.map((color) => {
              const isSelected = filters.colors.includes(color.name);
              return (
                <button
                  key={color.name}
                  onClick={() => handleColorToggle(color.name)}
                  className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all ${
                    isSelected ? 'ring-2 ring-brand-crimson ring-offset-1 scale-110' : 'border-gray-200'
                  }`}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 text-white drop-shadow-md" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Discount Percentage Accordion */}
      <div className="border-b border-gray-100 pb-4">
        <button
          onClick={() => toggleSection('discount')}
          className="w-full flex items-center justify-between py-1 text-xs font-bold uppercase text-brand-slate-dark"
        >
          <span>Discount Range</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.discount ? 'rotate-180' : ''}`} />
        </button>

        {expandedSections.discount && (
          <div className="mt-3 space-y-2">
            {[10, 30, 50].map((d) => (
              <label key={d} className="flex items-center space-x-2 text-xs text-slate-600 hover:text-brand-crimson cursor-pointer">
                <input
                  type="radio"
                  name="discount_percentage"
                  checked={filters.discount === d}
                  onChange={() => onFilterChange({ ...filters, discount: d })}
                  className="w-4 h-4 text-brand-crimson focus:ring-brand-crimson/20 border-gray-300"
                />
                <span>{d}% and above</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* 6. Customer Rating Accordion */}
      <div>
        <button
          onClick={() => toggleSection('rating')}
          className="w-full flex items-center justify-between py-1 text-xs font-bold uppercase text-brand-slate-dark"
        >
          <span>Customer Rating</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.rating ? 'rotate-180' : ''}`} />
        </button>

        {expandedSections.rating && (
          <div className="mt-3 space-y-2">
            {[4, 3].map((r) => (
              <label key={r} className="flex items-center space-x-2 text-xs text-slate-600 hover:text-brand-crimson cursor-pointer">
                <input
                  type="radio"
                  name="rating_threshold"
                  checked={filters.rating === r}
                  onChange={() => onFilterChange({ ...filters, rating: r })}
                  className="w-4 h-4 text-brand-crimson focus:ring-brand-crimson/20 border-gray-300"
                />
                <span className="flex items-center">
                  {r}★ & above
                </span>
              </label>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}

export default FilterSidebar;
