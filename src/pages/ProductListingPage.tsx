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
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>(initialFilterState);

  // Sync state from URL query params on mount & location changes
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('category');
    const brand = params.get('brand');
    const colorParam = params.get('color');
    const pageParam = params.get('page');
    const sortParam = params.get('sort');
    const minPriceParam = params.get('minPrice');
    const maxPriceParam = params.get('maxPrice');
    const discountParam = params.get('discount');
    const ratingParam = params.get('rating');
    const qParam = params.get('q') || params.get('search') || '';

    let pathCat: string | undefined;
    if (window.location.pathname.startsWith('/category/')) {
      pathCat = decodeURIComponent(window.location.pathname.replace('/category/', ''));
    }

    setSearchQuery(qParam);

    let categoriesArr: string[] = [];
    if (cat) {
      categoriesArr = cat.split(',').map((c) => c.trim()).filter(Boolean);
    } else if (pathCat) {
      categoriesArr = [pathCat];
    }

    const brandsArr = brand ? brand.split(',').map((b) => b.trim()).filter(Boolean) : [];
    const colorsArr = colorParam ? colorParam.split(',').map((c) => c.trim()).filter(Boolean) : [];

    setFilters({
      categories: categoriesArr,
      brands: brandsArr,
      colors: colorsArr,
      minPrice: minPriceParam ? parseFloat(minPriceParam) : undefined,
      maxPrice: maxPriceParam ? parseFloat(maxPriceParam) : undefined,
      discount: discountParam ? parseFloat(discountParam) : undefined,
      rating: ratingParam ? parseFloat(ratingParam) : undefined,
    });

    if (pageParam) setPage(parseInt(pageParam, 10));
    if (sortParam) setSort(sortParam);
  }, [window.location.pathname, window.location.search]);

  // Update URL search parameters when filters change
  const updateURLParams = (newFilters: FilterState, newSort: string, newPage: number) => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (newFilters.categories.length > 0) params.set('category', newFilters.categories.join(','));
    if (newFilters.brands.length > 0) params.set('brand', newFilters.brands.join(','));
    if (newFilters.colors.length > 0) params.set('color', newFilters.colors.join(','));
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
    setSearchQuery('');
    updateURLParams(initialFilterState, sort, 1);
  };

  // Fetch Products using TanStack Query
  const { data, isLoading } = useQuery({
    queryKey: ['products', filters, sort, page, searchQuery],
    queryFn: () =>
      productsApi.getProducts({
        page,
        limit: 12,
        search: searchQuery || undefined,
        category: filters.categories.length > 0 ? filters.categories.join(',') : undefined,
        brand: filters.brands.length > 0 ? filters.brands.join(',') : undefined,
        color: filters.colors.length > 0 ? filters.colors.join(',') : undefined,
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
  const currentBrand = filters.brands[0];
  const currentTitle = searchQuery
    ? `Search Results for "${searchQuery}"`
    : currentBrand
    ? `${currentBrand} Collection`
    : currentCategory
    ? allCategories.find((c) => c.slug === currentCategory || c.name === currentCategory)?.name || currentCategory
    : 'All Ethnic Couture';
  const breadcrumbs = buildBreadcrumbTrail(currentCategory, allCategories);

  return (
    <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 py-4 sm:py-6">
      {/* Breadcrumb Header */}
      <PLPBreadcrumbHeader title={currentTitle} totalItems={total} breadcrumbs={breadcrumbs} />

      {/* Control Bar: Mobile Filter Trigger & Sort Dropdown */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        {/* Mobile Filter Button */}
        <button
          onClick={() => setIsMobileFilterOpen(true)}
          className="lg:hidden flex items-center space-x-1.5 bg-slate-900 text-white text-[11px] sm:text-xs font-bold px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl shadow-md"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>FILTER</span>
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
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-6">
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
        currentSort={sort}
        onSortChange={handleSortChange}
      />
    </div>
  );
}

export default ProductListingPage;
