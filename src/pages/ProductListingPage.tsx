import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SlidersHorizontal } from 'lucide-react';
import { PLPBreadcrumbHeader } from '../components/plp/PLPBreadcrumbHeader';
import { SortDropdown } from '../components/plp/SortDropdown';
import { FilterSidebar, FilterState } from '../components/plp/FilterSidebar';
import { ActiveFilterChips } from '../components/plp/ActiveFilterChips';
import { MobileFilterModal } from '../components/plp/MobileFilterModal';
import { ProductGridSkeleton } from '../components/plp/ProductGridSkeleton';
import { EmptyState } from '../components/plp/EmptyState';
import { Pagination } from '../components/plp/Pagination';
import { ProductCard } from '../components/home/ProductCard';
import { productsApi } from '../api';
import { useCategories } from '../hooks/useCategories';
import { buildBreadcrumbTrail } from '../utils/breadcrumb';

const initialFilterState: FilterState = {
  categories: [],
  brands: [],
  colors: [],
  minPrice: undefined,
  maxPrice: undefined,
  rating: undefined,
  discount: undefined,
};

export function ProductListingPage() {
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [sort, setSort] = useState('recommended');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<FilterState>(initialFilterState);

  // Sync state from URL query params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('category');
    const brand = params.get('brand');
    const pageParam = params.get('page');
    const sortParam = params.get('sort');

    setFilters((prev) => ({
      ...prev,
      categories: cat ? [cat] : prev.categories,
      brands: brand ? [brand] : prev.brands,
    }));

    if (pageParam) setPage(parseInt(pageParam, 10));
    if (sortParam) setSort(sortParam);
  }, []);

  // Update URL search parameters when filters change
  const updateURLParams = (newFilters: FilterState, newSort: string, newPage: number) => {
    const params = new URLSearchParams();
    if (newFilters.categories.length > 0) params.set('category', newFilters.categories[0]);
    if (newFilters.brands.length > 0) params.set('brand', newFilters.brands[0]);
    if (newFilters.colors.length > 0) params.set('color', newFilters.colors[0]);
    if (newFilters.minPrice !== undefined) params.set('minPrice', newFilters.minPrice.toString());
    if (newFilters.maxPrice !== undefined) params.set('maxPrice', newFilters.maxPrice.toString());
    if (newFilters.discount !== undefined) params.set('discount', newFilters.discount.toString());
    if (newFilters.rating !== undefined) params.set('rating', newFilters.rating.toString());
    if (newSort !== 'recommended') params.set('sort', newSort);
    if (newPage > 1) params.set('page', newPage.toString());

    const queryString = params.toString();
    const newRelativePathQuery = window.location.pathname + (queryString ? `?${queryString}` : '');
    window.history.replaceState(null, '', newRelativePathQuery);
  };

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setPage(1);
    updateURLParams(newFilters, sort, 1);
  };

  const handleSortChange = (newSort: string) => {
    setSort(newSort);
    updateURLParams(filters, newSort, page);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    updateURLParams(filters, sort, newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearAll = () => {
    setFilters(initialFilterState);
    setPage(1);
    updateURLParams(initialFilterState, sort, 1);
  };

  // Fetch Products using TanStack Query
  const { data, isLoading } = useQuery({
    queryKey: ['products', filters, sort, page],
    queryFn: () =>
      productsApi.getProducts({
        page,
        limit: 12,
        category: filters.categories[0],
        brand: filters.brands[0],
        color: filters.colors[0],
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        discount: filters.discount,
        rating: filters.rating,
        sort: sort as any,
      }),
  });

  const products = data?.items || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;

  const { allCategories } = useCategories();
  const currentCategory = filters.categories[0];
  const currentTitle = currentCategory || 'All Ethnic Couture';
  const breadcrumbs = buildBreadcrumbTrail(currentCategory, allCategories);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Breadcrumb Header */}
      <PLPBreadcrumbHeader title={currentTitle} totalItems={total} breadcrumbs={breadcrumbs} />

      {/* Control Bar: Mobile Filter Trigger & Sort Dropdown */}
      <div className="flex items-center justify-between mb-4">
        {/* Mobile Filter Button */}
        <button
          onClick={() => setIsMobileFilterOpen(true)}
          className="lg:hidden flex items-center space-x-2 bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>FILTER & SORT</span>
        </button>

        <div className="hidden lg:block text-xs font-semibold text-slate-500">
          Showing <span className="font-bold text-brand-slate-dark">{products.length}</span> of {total} items
        </div>

        {/* Sort Dropdown */}
        <SortDropdown currentSort={sort} onSortChange={handleSortChange} />
      </div>

      {/* Active Filter Chips */}
      <ActiveFilterChips
        filters={filters}
        onRemoveCategory={(c) =>
          handleFilterChange({ ...filters, categories: filters.categories.filter((cat) => cat !== c) })
        }
        onRemoveBrand={(b) =>
          handleFilterChange({ ...filters, brands: filters.brands.filter((br) => br !== b) })
        }
        onRemoveColor={(clr) =>
          handleFilterChange({ ...filters, colors: filters.colors.filter((c) => c !== clr) })
        }
        onRemovePrice={() => handleFilterChange({ ...filters, minPrice: undefined, maxPrice: undefined })}
        onRemoveDiscount={() => handleFilterChange({ ...filters, discount: undefined })}
        onRemoveRating={() => handleFilterChange({ ...filters, rating: undefined })}
        onClearAll={handleClearAll}
      />

      {/* Main Grid & Sidebar Layout */}
      <div className="flex items-start space-x-0 lg:space-x-8">
        {/* Desktop Sidebar Filter */}
        <FilterSidebar filters={filters} onFilterChange={handleFilterChange} />

        {/* Product Grid Area */}
        <div className="flex-1 w-full">
          {isLoading ? (
            <ProductGridSkeleton />
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id || product._id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />
            </>
          ) : (
            <EmptyState onClearFilters={handleClearAll} />
          )}
        </div>
      </div>

      {/* Mobile Filter Slide-Over Bottom Sheet */}
      <MobileFilterModal
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearAll={handleClearAll}
      />
    </div>
  );
}

export default ProductListingPage;
