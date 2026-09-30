import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Package,
  Trash2,
  Pencil,
  Eye,
  Check,
  X,
  Sparkles,
  Loader2,
  AlertCircle,
  Image as ImageIcon,
  Search,
  ChevronLeft,
  ChevronRight,
  Star,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { productsApi } from '../../api/products';
import { adminProductsApi } from '../../api/adminProducts';
import { adminApi } from '../../api/admin';
import { categoriesApi } from '../../api/categories';
import { brandsApi } from '../../api/brands';
import { AdminProduct, ProductVariant } from '../../types/adminProduct';
import { Category } from '../../types/category';
import { formatImageUrl } from '../../utils/imageUtils';

interface ProductVariantInput {
  color: string;
  colorHex: string;
  size: string;
  stock: number;
  mrp: number;
  offerPrice: number;
}

interface ProductFormData {
  name: string;
  shortDescription: string;
  description: string;
  categoryIds: string[];
  brandId: string;
  material: string;
  pattern: string;
  season: string;
  tags: string;
  tax: number;
  isFeatured: boolean;
  isTrending: boolean;
  isBestSeller: boolean;
  variants: ProductVariantInput[];
}

const DEFAULT_VARIANT: ProductVariantInput = {
  color: 'Crimson Red',
  colorHex: '#DC2626',
  size: 'M',
  stock: 25,
  mrp: 2999,
  offerPrice: 1999,
};

const DEFAULT_FORM: ProductFormData = {
  name: '',
  shortDescription: '',
  description: '',
  categoryIds: [],
  brandId: '',
  material: 'Silk',
  pattern: 'Floral',
  season: 'Festive 2026',
  tags: 'kurti, silk, ethnic',
  tax: 5,
  isFeatured: true,
  isTrending: true,
  isBestSeller: false,
  variants: [{ ...DEFAULT_VARIANT }],
};

function getProductCategoryIds(product: any): string[] {
  const refs = product.categoryIds?.length ? product.categoryIds : [product.categoryId || product.category];
  return [...new Set<string>(refs.map((ref: any) => typeof ref === 'string' ? ref : ref?._id).filter(Boolean))];
}

export function AdminProductManagement() {
  const queryClient = useQueryClient();

  // Search, Filter & Pagination state for Admin Product Display Table
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'name' | 'price' | 'averageRating'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Modal & Preview state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [previewProduct, setPreviewProduct] = useState<AdminProduct | null>(null);
  const [activeTab, setActiveTab] = useState<'catalog' | 'inventory-alerts'>('catalog');

  // Submit / Delete states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittingStep, setSubmittingStep] = useState<string>('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingVariantId, setDeletingVariantId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState<ProductFormData>(DEFAULT_FORM);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // 1. Fetch live category list for search filter & upload dropdown
  const { data: categoriesResponse } = useQuery({
    queryKey: ['admin-categories-list'],
    queryFn: () => (async () => {
      const first = await categoriesApi.getCategories({ limit: 100 });
      const categories = [...first.data];
      for (let page = 2; page <= (first.meta?.totalPages || 1); page++) {
        const next = await categoriesApi.getCategories({ page, limit: 100 });
        categories.push(...next.data);
      }
      return { ...first, data: categories };
    })(),
  });

  const categoriesList: Category[] = Array.isArray(categoriesResponse)
    ? categoriesResponse
    : Array.isArray(categoriesResponse?.data)
    ? categoriesResponse.data
    : [];

  const { data: brandsResponse } = useQuery({
    queryKey: ['admin-brands-select'],
    queryFn: () => brandsApi.getBrands({ limit: 100 }),
  });
  const liveBrands = brandsResponse?.data || [];

  // 2. Fetch Admin Products List via GET /products with query parameters
  const {
    data: adminProductsResponse,
    isLoading: isLoadingProducts,
    refetch: refetchProducts,
    isRefetching: isRefetchingProducts,
  } = useQuery({
    queryKey: ['admin-products-display', page, limit, searchQuery, selectedCategory, sortBy, sortOrder],
    queryFn: () =>
      adminProductsApi.getAdminProducts({
        page,
        limit,
        search: searchQuery || undefined,
        categoryId: selectedCategory || undefined,
        sortBy,
        sortOrder,
      }),
  });

  const rawProductsData = adminProductsResponse?.data ?? adminProductsResponse;
  const productsList: AdminProduct[] = Array.isArray(rawProductsData)
    ? rawProductsData
    : Array.isArray((adminProductsResponse as any)?.items)
    ? (adminProductsResponse as any).items
    : Array.isArray((adminProductsResponse as any)?.products)
    ? (adminProductsResponse as any).products
    : Array.isArray((adminProductsResponse as any)?.docs)
    ? (adminProductsResponse as any).docs
    : [];

  const meta = adminProductsResponse?.meta || {
    total: productsList.length,
    page: 1,
    limit: 10,
    totalPages: Math.ceil(productsList.length / 10) || 1,
  };

  // 3. Fetch Inventory Alerts via GET /admin/dashboard/inventory-alerts
  const { data: inventoryAlertsData, refetch: refetchAlerts } = useQuery({
    queryKey: ['admin-inventory-alerts'],
    queryFn: () => adminProductsApi.getInventoryAlerts(),
  });

  const outOfStockItems = inventoryAlertsData?.outOfStock || [];
  const lowStockItems = inventoryAlertsData?.lowStock || [];

  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setFormData(DEFAULT_FORM);
    setSelectedFiles([]);
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (prod: any) => {
    setEditingProduct(prod);
    const categoryIds = getProductCategoryIds(prod);

    setFormData({
      name: prod.name || prod.title || '',
      shortDescription: prod.shortDescription || '',
      description: prod.description || '',
      categoryIds,
      brandId: prod.brandId?._id || prod.brandId || '',
      material: prod.material || prod.attributes?.material || '',
      pattern: prod.pattern || prod.attributes?.pattern || '',
      season: prod.season || prod.attributes?.season || '',
      tags: Array.isArray(prod.tags) ? prod.tags.join(', ') : '',
      tax: prod.tax || 5,
      isFeatured: Boolean(prod.isFeatured),
      isTrending: Boolean(prod.isTrending),
      isBestSeller: Boolean(prod.isBestSeller),
      variants:
        Array.isArray(prod.variants) && prod.variants.length > 0
          ? prod.variants.map((v: any) => ({
              id: v._id || v.id,
              _id: v._id || v.id,
              color: v.color || 'Crimson Red',
              colorHex: v.colorHex || '#DC2626',
              size: v.size || 'M',
              stock: Number(v.stock ?? 25),
              mrp: Number(v.mrp || v.price || 2999),
              offerPrice: Number(v.offerPrice || v.price || 1999),
            }))
          : [{ ...DEFAULT_VARIANT }],
    });
    setSelectedFiles([]);
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const handleOpenPreviewDrawer = async (prod: AdminProduct) => {
    setPreviewProduct(prod);
    try {
      const prodId = prod._id || prod.id || '';
      if (prodId) {
        const fullDetails = await adminProductsApi.getProductDetails(prodId);
        if (fullDetails) {
          setPreviewProduct(fullDetails);
        }
      }
    } catch (err) {
      console.warn('Failed to load deep product details, showing summary:', err);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleVariantChange = (index: number, field: keyof ProductVariantInput, value: any) => {
    setFormData((prev) => {
      const updatedVariants = [...prev.variants];
      updatedVariants[index] = {
        ...updatedVariants[index],
        [field]: field === 'stock' || field === 'mrp' || field === 'offerPrice' ? Number(value) : value,
      };
      return { ...prev, variants: updatedVariants };
    });
  };

  const handleAddVariant = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [...prev.variants, { ...DEFAULT_VARIANT, size: 'L' }],
    }));
  };

  const handleRemoveVariant = (index: number) => {
    if (formData.variants.length <= 1) {
      alert('At least one product variant is required.');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, idx) => idx !== index),
    }));
  };

  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);
    setSubmittingStep(editingProduct ? 'Updating Product (PUT)...' : 'Creating Product (POST)...');

    if (!formData.name.trim()) {
      setErrorMessage('Product name is required.');
      setIsSubmitting(false);
      return;
    }

    if (!formData.categoryIds.length) {
      setErrorMessage('Please select at least one category or subcategory.');
      setIsSubmitting(false);
      return;
    }

    const isMongoId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id);
    if (!formData.categoryIds.every(isMongoId)) {
      setErrorMessage(
        'Selected Category ID must be a valid 24-character Mongo ObjectId. Create a live category first.'
      );
      setIsSubmitting(false);
      return;
    }

    if (formData.brandId && !isMongoId(formData.brandId)) {
      setErrorMessage('Brand ID must be a valid 24-character Mongo ObjectId or left blank.');
      setIsSubmitting(false);
      return;
    }

    if (formData.variants.length === 0) {
      setErrorMessage('At least one product variant is required.');
      setIsSubmitting(false);
      return;
    }

    for (let i = 0; i < formData.variants.length; i++) {
      const v = formData.variants[i];
      if (!v.color.trim() || !v.size.trim()) {
        setErrorMessage(`Variant #${i + 1} requires Color and Size.`);
        setIsSubmitting(false);
        return;
      }
      if (isNaN(v.mrp) || v.mrp <= 0) {
        setErrorMessage(`Variant #${i + 1} MRP must be a numeric value greater than 0.`);
        setIsSubmitting(false);
        return;
      }
      if (isNaN(v.offerPrice) || v.offerPrice < 0) {
        setErrorMessage(`Variant #${i + 1} Offer Price must be a valid numeric value.`);
        setIsSubmitting(false);
        return;
      }
    }

    const payload: Record<string, any> = {
      name: formData.name.trim(),
      description: formData.description.trim() || formData.shortDescription.trim() || formData.name.trim(),
      shortDescription: formData.shortDescription.trim() || undefined,
      categoryIds: formData.categoryIds,
      brandId: formData.brandId.trim() || undefined,
      material: formData.material.trim() || undefined,
      pattern: formData.pattern.trim() || undefined,
      season: formData.season.trim() || undefined,
      tags: formData.tags
        ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : undefined,
      tax: Number(formData.tax || 0),
      isFeatured: formData.isFeatured,
      isTrending: formData.isTrending,
      isBestSeller: formData.isBestSeller,
      variants: formData.variants.map((v) => ({
        color: v.color.trim(),
        colorHex: v.colorHex.trim() || '#DC2626',
        size: v.size.trim(),
        stock: Number(v.stock),
        mrp: Number(v.mrp),
        offerPrice: Number(v.offerPrice),
      })),
    };

    Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

    try {
      if (editingProduct) {
        const productId = editingProduct._id || editingProduct.id;
        await adminApi.updateProduct(productId, payload);

        if (selectedFiles.length > 0) {
          setSubmittingStep(`Uploading ${selectedFiles.length} Gallery Image(s)...`);
          const imgFd = new FormData();
          selectedFiles.forEach((file) => {
            imgFd.append('images', file);
          });
          await adminApi.uploadProductImages(productId, imgFd);
        }

        setSuccessMessage('Product updated successfully!');
      } else {
        const res = await adminApi.createProduct(payload);
        const createdProduct = res?.data || res;
        const productId = createdProduct?._id || createdProduct?.id;

        if (selectedFiles.length > 0 && productId) {
          setSubmittingStep(`Uploading ${selectedFiles.length} Gallery Image(s)...`);
          const imgFd = new FormData();
          selectedFiles.forEach((file) => {
            imgFd.append('images', file);
          });
          await adminApi.uploadProductImages(productId, imgFd);
        }

        setSuccessMessage('Product published to catalog successfully!');
      }

      setTimeout(() => setSuccessMessage(''), 4000);
      setIsModalOpen(false);
      setFormData(DEFAULT_FORM);
      setEditingProduct(null);
      setSelectedFiles([]);
      queryClient.invalidateQueries();
      refetchProducts();
    } catch (err: any) {
      console.error('Error saving product:', err);
      const rawMsg = err?.message || err?.error || err?.response?.data?.message || err;
      const msg = Array.isArray(rawMsg)
        ? rawMsg.join(' · ')
        : typeof rawMsg === 'string'
        ? rawMsg
        : typeof rawMsg === 'object'
        ? JSON.stringify(rawMsg)
        : 'Failed to save product.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
      setSubmittingStep('');
    }
  };

  const handleDelete = async (id: string) => {
    if (!id) {
      setErrorMessage('Product ID is missing.');
      return;
    }
    if (!confirm('Are you sure you want to soft-delete this product?')) return;

    setDeletingId(id);
    setErrorMessage('');
    try {
      await productsApi.deleteProduct(id);
      setSuccessMessage('Product soft-deleted successfully (isDeleted: true)!');
      setTimeout(() => setSuccessMessage(''), 4000);
      queryClient.invalidateQueries();
      await refetchProducts();
    } catch (err: any) {
      console.error('Failed to delete product:', err);
      const rawMsg = err?.message || err?.error || err?.response?.data?.message || err;
      const msg = Array.isArray(rawMsg)
        ? rawMsg.join(' · ')
        : typeof rawMsg === 'string'
        ? rawMsg
        : typeof rawMsg === 'object'
        ? JSON.stringify(rawMsg)
        : 'Failed to delete product.';
      setErrorMessage(msg);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteVariant = async (productId: string, variantId: string, index: number) => {
    if (!productId || !variantId) return;
    if (!confirm('Are you sure you want to delete this variant from server?')) return;

    setDeletingVariantId(variantId);
    setErrorMessage('');
    try {
      await productsApi.deleteVariant(productId, variantId);
      setSuccessMessage('Variant deleted from server successfully!');
      setTimeout(() => setSuccessMessage(''), 4000);

      setFormData((prev) => ({
        ...prev,
        variants: prev.variants.filter((_, idx) => idx !== index),
      }));

      queryClient.invalidateQueries();
      refetchProducts();
    } catch (err: any) {
      console.error('Failed to delete variant:', err);
      const rawMsg = err?.message || err?.error || err?.response?.data?.message || err;
      const msg = Array.isArray(rawMsg)
        ? rawMsg.join(' · ')
        : typeof rawMsg === 'string'
        ? rawMsg
        : typeof rawMsg === 'object'
        ? JSON.stringify(rawMsg)
        : 'Failed to delete variant.';
      setErrorMessage(msg);
    } finally {
      setDeletingVariantId(null);
    }
  };

  return (
    <div className="space-y-3.5 sm:space-y-6">
      {/* 1. Header Bar */}
      <div className="bg-white border border-gray-100 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Package className="w-4 h-4 sm:w-5 sm:h-5 text-brand-crimson flex-shrink-0" />
            <h2 className="text-sm sm:text-lg font-extrabold text-brand-slate-dark">Product Display & Catalog Management</h2>
          </div>
          <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 sm:mt-1">
            Display live catalog, inspect product details, monitor inventory stock alerts, and update variants.
          </p>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto justify-between sm:justify-end flex-wrap gap-y-2">
          {/* Navigation Tabs */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl sm:rounded-2xl">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-2.5 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-bold rounded-lg sm:rounded-xl transition-all cursor-pointer ${
                activeTab === 'catalog'
                  ? 'bg-brand-crimson text-white shadow-md'
                  : 'text-slate-600 hover:text-brand-slate-dark'
              }`}
            >
              CATALOG
            </button>
            <button
              onClick={() => {
                setActiveTab('inventory-alerts');
                refetchAlerts();
              }}
              className={`px-2.5 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-bold rounded-lg sm:rounded-xl transition-all flex items-center space-x-1 cursor-pointer ${
                activeTab === 'inventory-alerts'
                  ? 'bg-brand-crimson text-white shadow-md'
                  : 'text-slate-600 hover:text-brand-slate-dark'
              }`}
            >
              <span>ALERTS</span>
              {(outOfStockItems.length > 0 || lowStockItems.length > 0) && (
                <span className="bg-amber-400 text-slate-900 text-[9px] sm:text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
                  {outOfStockItems.length + lowStockItems.length}
                </span>
              )}
            </button>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center space-x-1.5 bg-brand-crimson hover:bg-brand-crimson-dark text-white font-extrabold text-[11px] sm:text-xs px-3 sm:px-5 py-2 sm:py-3 rounded-xl sm:rounded-2xl shadow-lg transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>UPLOAD PRODUCT</span>
          </button>
        </div>
      </div>

      {/* Alerts */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-[11px] sm:text-xs font-bold flex items-center space-x-2">
          <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && !isModalOpen && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-[11px] sm:text-xs font-bold flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage('')} className="p-1 hover:bg-red-100 rounded-lg cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. TAB 1: PRODUCT CATALOG TABLE WITH FILTERS & PAGINATION */}
      {activeTab === 'catalog' && (
        <div className="space-y-3 sm:space-y-4">
          {/* Search & Multi-facet Filter Bar */}
          <div className="bg-white border border-gray-100 rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-2.5 sm:gap-3">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search products by name, tag, SKU..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-slate-50 border border-gray-200 rounded-xl sm:rounded-2xl pl-8 sm:pl-9 pr-7 sm:pr-8 py-1.5 sm:py-2 text-[11px] sm:text-xs font-semibold outline-none focus:border-brand-crimson"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Dropdown Filter */}
            <div className="flex items-center space-x-1.5 sm:space-x-2 w-full md:w-auto flex-wrap gap-y-2">
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setPage(1);
                }}
                className="bg-slate-50 border border-gray-200 text-slate-700 text-[10px] sm:text-xs font-semibold rounded-xl sm:rounded-2xl px-2 sm:px-3 py-1.5 sm:py-2.5 outline-none focus:border-brand-crimson flex-1 md:flex-none"
              >
                <option value="">All Categories</option>
                {categoriesList.map((cat: any) => (
                  <option key={cat._id || cat.id} value={cat._id || cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              {/* Sorting Controls */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-50 border border-gray-200 text-slate-700 text-[10px] sm:text-xs font-semibold rounded-xl sm:rounded-2xl px-2 sm:px-3 py-1.5 sm:py-2.5 outline-none focus:border-brand-crimson flex-1 md:flex-none"
              >
                <option value="createdAt">Sort: Latest</option>
                <option value="name">Sort: Name (A-Z)</option>
                <option value="price">Sort: Price</option>
                <option value="averageRating">Sort: Top Rated</option>
              </select>

              <button
                onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
                className="bg-slate-50 border border-gray-200 text-slate-700 text-[10px] sm:text-xs font-bold rounded-xl sm:rounded-2xl px-2 py-1.5 sm:py-2.5 hover:bg-slate-100 cursor-pointer"
                title="Toggle Sort Order"
              >
                {sortOrder.toUpperCase()}
              </button>

              <button
                onClick={() => {
                  queryClient.invalidateQueries();
                  refetchProducts();
                  refetchAlerts();
                }}
                disabled={isRefetchingProducts}
                className="p-1.5 sm:p-2.5 bg-slate-50 border border-gray-200 text-slate-600 hover:text-brand-crimson rounded-xl sm:rounded-2xl transition-colors disabled:opacity-50 cursor-pointer"
                title="Refresh Product Catalog from Database"
              >
                <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isRefetchingProducts ? 'animate-spin text-brand-crimson' : ''}`} />
              </button>
            </div>
          </div>

          {/* Products Display Table */}
          <div className="bg-white border border-gray-100 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 shadow-sm">
            <div className="overflow-x-auto scrollbar-none">
              <table className="w-full text-left border-collapse min-w-[650px]">
                <thead>
                  <tr className="border-b border-gray-100 text-[9px] sm:text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">
                    <th className="pb-2.5 sm:pb-3 pl-2">Product</th>
                    <th className="pb-2.5 sm:pb-3">Category</th>
                    <th className="pb-2.5 sm:pb-3">Price (MRP / Selling)</th>
                    <th className="pb-2.5 sm:pb-3">Inventory Stock</th>
                    <th className="pb-2.5 sm:pb-3">Status</th>
                    <th className="pb-2.5 sm:pb-3 pr-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-[11px] sm:text-xs font-semibold">
                  {isLoadingProducts ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin mx-auto text-brand-crimson mb-2" />
                        <span className="text-[11px] sm:text-xs font-semibold">Loading product catalog from server...</span>
                      </td>
                    </tr>
                  ) : productsList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 text-[11px] sm:text-xs">
                        No products match your search/filter criteria.
                      </td>
                    </tr>
                  ) : (
                    productsList.map((prod) => {
                      const prodId = prod._id || prod.id || '';
                      const isDeleting = deletingId === prodId;
                      const mainVariant = prod.variants?.[0];

                      const totalStock =
                        Array.isArray(prod.variants) && prod.variants.length > 0
                          ? prod.variants.reduce((sum, v) => sum + (v.stock || 0), 0)
                          : 0;

                      const categoryName = getProductCategoryIds(prod).map((id) => {
                        const ref = [...(prod.categories || []), ...(prod.categoryIds || []), prod.categoryId]
                          .find((category) => typeof category === 'object' && category?._id === id);
                        return (typeof ref === 'object' && ref?.name) || categoriesList.find((category) => category._id === id)?.name || 'Unavailable category';
                      }).join(', ') || 'General';

                      const rawImg = prod.images?.[0] || prod.thumbnail;
                      const imageSrc = rawImg
                        ? rawImg.startsWith('http')
                          ? rawImg
                          : formatImageUrl(rawImg)
                        : 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=60&q=80';

                      const offerPrice = mainVariant?.offerPrice ?? (prod as any).price ?? 1999;
                      const mrpPrice = mainVariant?.mrp ?? (prod as any).originalPrice ?? offerPrice * 1.5;

                      return (
                        <tr key={prodId} className="hover:bg-slate-50/50 transition-colors">
                          {/* Product Info */}
                          <td className="py-2.5 sm:py-3 pl-2">
                            <div className="flex items-center space-x-2.5 sm:space-x-3">
                              <img
                                src={imageSrc}
                                alt={prod.name || prod.title}
                                className="w-8 h-10 sm:w-10 sm:h-12 rounded-xl object-cover border border-gray-100 bg-slate-50 flex-shrink-0"
                              />
                              <div className="min-w-0">
                                <p className="font-extrabold text-brand-slate-dark text-xs sm:text-sm line-clamp-1">
                                  {prod.name || prod.title}
                                </p>
                                <p className="text-[9px] sm:text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                                  ID: {prodId}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="py-2.5 sm:py-3 text-slate-600">
                            <span className="bg-slate-100 text-slate-700 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-xl text-[10px] sm:text-[11px] font-bold">
                              {categoryName}
                            </span>
                          </td>

                          {/* Price */}
                          <td className="py-2.5 sm:py-3 font-extrabold">
                            <div className="flex items-center space-x-1 sm:space-x-1.5">
                              <span className="text-brand-crimson">₹{offerPrice}</span>
                              {mrpPrice > offerPrice && (
                                <span className="text-slate-400 line-through text-[10px] sm:text-[11px] font-semibold">
                                  ₹{mrpPrice}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Inventory Stock Indicator */}
                          <td className="py-2.5 sm:py-3 font-bold">
                            {totalStock === 0 ? (
                              <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] flex items-center space-x-1 w-max">
                                <AlertTriangle className="w-3 h-3 text-rose-600" />
                                <span>OUT OF STOCK</span>
                              </span>
                            ) : totalStock < 10 ? (
                              <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] flex items-center space-x-1 w-max">
                                <AlertCircle className="w-3 h-3 text-amber-600" />
                                <span>{totalStock} units (Low Stock)</span>
                              </span>
                            ) : (
                              <span className="bg-emerald-50 text-emerald-800 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-extrabold">
                                {totalStock} units
                              </span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="py-2.5 sm:py-3">
                            <div className="flex items-center space-x-1 flex-wrap gap-1">
                              {prod.isFeatured && (
                                <span className="bg-amber-100 text-amber-800 text-[8px] sm:text-[9px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full">
                                  Featured
                                </span>
                              )}
                              <span
                                className={`text-[8px] sm:text-[9px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full ${
                                  prod.status !== false
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {prod.status !== false ? 'ACTIVE' : 'DISABLED'}
                              </span>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="py-2.5 sm:py-3 pr-2 text-right">
                            <div className="flex items-center justify-end space-x-1">
                              {/* Preview Eye Drawer */}
                              <button
                                onClick={() => handleOpenPreviewDrawer(prod)}
                                className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg sm:rounded-xl transition-colors cursor-pointer"
                                title="Quick Preview Product Details"
                              >
                                <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                              </button>

                              {/* Edit Modal */}
                              <button
                                onClick={() => handleOpenEditModal(prod)}
                                className="p-1.5 sm:p-2 text-slate-400 hover:text-brand-crimson hover:bg-rose-50 rounded-lg sm:rounded-xl transition-colors cursor-pointer"
                                title="Edit Product Metadata & Variants"
                              >
                                <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                              </button>

                              {/* Delete Product */}
                              <button
                                disabled={isDeleting}
                                onClick={() => handleDelete(prodId)}
                                className="p-1.5 sm:p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg sm:rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
                                title="Soft-delete Product"
                              >
                                {isDeleting ? (
                                  <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin text-rose-600" />
                                ) : (
                                  <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between pt-3 sm:pt-4 border-t border-gray-100 text-[10px] sm:text-xs font-semibold text-slate-500 gap-2 sm:gap-0">
              <span>
                Showing Page {meta.page} of {meta.totalPages} ({meta.total} Total Products)
              </span>

              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <button
                  disabled={meta.page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="inline-flex items-center space-x-1 px-2.5 sm:px-3 py-1 sm:py-1.5 border border-gray-200 rounded-lg sm:rounded-xl hover:bg-slate-50 disabled:opacity-40 cursor-pointer text-[10px] sm:text-xs"
                >
                  <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>Previous</span>
                </button>

                <button
                  disabled={meta.page >= meta.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="inline-flex items-center space-x-1 px-2.5 sm:px-3 py-1 sm:py-1.5 border border-gray-200 rounded-lg sm:rounded-xl hover:bg-slate-50 disabled:opacity-40 cursor-pointer text-[10px] sm:text-xs"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. TAB 2: INVENTORY ALERTS (LOW & OUT OF STOCK) */}
      {activeTab === 'inventory-alerts' && (
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-white border border-gray-100 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 shadow-sm space-y-3.5 sm:space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 sm:pb-4">
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-brand-slate-dark flex items-center space-x-1.5 sm:space-x-2">
                  <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 flex-shrink-0" />
                  <span>Real-time Inventory Alerts (GET /admin/dashboard/inventory-alerts)</span>
                </h3>
                <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 sm:mt-1">
                  Products requiring stock replenishment (Out of Stock = 0, Low Stock &lt; 10 units)
                </p>
              </div>
              <button
                onClick={() => refetchAlerts()}
                className="p-1.5 sm:p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                title="Refresh Alerts"
              >
                <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>

            {/* Out of Stock Section */}
            <div className="space-y-2.5 sm:space-y-3">
              <h4 className="text-[10px] sm:text-xs font-extrabold uppercase text-rose-600 tracking-wider flex items-center space-x-1.5">
                <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Out of Stock Items ({outOfStockItems.length})</span>
              </h4>

              {outOfStockItems.length === 0 ? (
                <p className="text-[11px] sm:text-xs text-slate-400 italic bg-slate-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl">
                  ✓ No products are currently out of stock.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
                  {outOfStockItems.map((item: any, idx: number) => (
                    <div
                      key={item._id || idx}
                      className="bg-rose-50/50 border border-rose-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-center justify-between"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="font-extrabold text-[11px] sm:text-xs text-slate-800 truncate">{item.name || item.title}</p>
                        <p className="text-[9px] sm:text-[10px] text-slate-500 font-mono mt-0.5 truncate">SKU: {item.sku || item._id}</p>
                      </div>
                      <span className="bg-rose-600 text-white font-extrabold text-[9px] sm:text-[10px] px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full flex-shrink-0">
                        0 Units
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Low Stock Section */}
            <div className="space-y-2.5 sm:space-y-3 pt-3 sm:pt-4 border-t border-gray-100">
              <h4 className="text-[10px] sm:text-xs font-extrabold uppercase text-amber-600 tracking-wider flex items-center space-x-1.5">
                <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Low Stock Items (&lt; 10 Units) ({lowStockItems.length})</span>
              </h4>

              {lowStockItems.length === 0 ? (
                <p className="text-[11px] sm:text-xs text-slate-400 italic bg-slate-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl">
                  ✓ No low stock inventory warnings.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
                  {lowStockItems.map((item: any, idx: number) => (
                    <div
                      key={item._id || idx}
                      className="bg-amber-50/50 border border-amber-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-center justify-between"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="font-extrabold text-[11px] sm:text-xs text-slate-800 truncate">{item.name || item.title}</p>
                        <p className="text-[9px] sm:text-[10px] text-slate-500 font-mono mt-0.5 truncate">SKU: {item.sku || item._id}</p>
                      </div>
                      <span className="bg-amber-500 text-white font-extrabold text-[9px] sm:text-[10px] px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full flex-shrink-0">
                        {item.stock} Units Left
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. SINGLE PRODUCT DETAILS PREVIEW DRAWER (GET /products/:idOrSlug) */}
      {previewProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setPreviewProduct(null);
          }}
        >
          <div className="bg-white max-w-2xl w-full h-full overflow-y-auto p-4 sm:p-8 space-y-4 sm:space-y-6 shadow-2xl">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 sm:pb-4">
              <div>
                <span className="text-[9px] sm:text-[10px] uppercase font-extrabold text-brand-crimson tracking-widest">
                  GET /products/{previewProduct._id || previewProduct.id}
                </span>
                <h3 className="text-base sm:text-xl font-extrabold text-brand-slate-dark mt-0.5">
                  {previewProduct.name || previewProduct.title}
                </h3>
              </div>
              <button
                onClick={() => setPreviewProduct(null)}
                className="p-1.5 sm:p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors cursor-pointer"
                title="Close Drawer"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Gallery Images */}
            {Array.isArray(previewProduct.images) && previewProduct.images.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-[10px] sm:text-xs font-extrabold uppercase text-slate-400 tracking-wider">
                  Product Gallery ({previewProduct.images.length})
                </h4>
                <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none pb-2">
                  {previewProduct.images.map((img: string, i: number) => {
                    const src = formatImageUrl(img);
                    return (
                      <img
                        key={i}
                        src={src}
                        alt="Product preview"
                        className="w-16 h-20 sm:w-20 sm:h-24 object-cover rounded-xl border border-gray-200 flex-shrink-0"
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Details Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 bg-slate-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-100 text-[11px] sm:text-xs">
              <div>
                <span className="text-slate-400 text-[9px] sm:text-[10px] font-bold block">Mongo ID</span>
                <span className="font-mono text-slate-700 font-bold truncate block">{previewProduct._id || previewProduct.id}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[9px] sm:text-[10px] font-bold block">Slug</span>
                <span className="font-mono text-slate-700 font-bold truncate block">{previewProduct.slug}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[9px] sm:text-[10px] font-bold block">Tax Rate</span>
                <span className="font-extrabold text-slate-700">{previewProduct.tax || 5}%</span>
              </div>
              <div>
                <span className="text-slate-400 text-[9px] sm:text-[10px] font-bold block">Material</span>
                <span className="font-extrabold text-slate-700">{previewProduct.material || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[9px] sm:text-[10px] font-bold block">Season</span>
                <span className="font-extrabold text-slate-700">{previewProduct.season || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[9px] sm:text-[10px] font-bold block">Rating</span>
                <span className="font-extrabold text-amber-600 flex items-center space-x-1">
                  <Star className="w-3 h-3 fill-amber-400" />
                  <span>{previewProduct.averageRating || 4.8} ({previewProduct.reviewsCount || 12})</span>
                </span>
              </div>
            </div>

            {/* Variants Table Breakdown */}
            <div className="space-y-2.5 sm:space-y-3">
              <h4 className="text-[10px] sm:text-xs font-extrabold uppercase text-brand-crimson tracking-wider">
                Product Variants ({previewProduct.variants?.length || 0})
              </h4>
              <div className="border border-gray-100 rounded-xl sm:rounded-2xl overflow-hidden overflow-x-auto scrollbar-none">
                <table className="w-full text-left text-[11px] sm:text-xs min-w-[450px]">
                  <thead className="bg-slate-50 text-slate-400 border-b border-gray-100 uppercase font-extrabold text-[8px] sm:text-[9px]">
                    <tr>
                      <th className="p-2 sm:p-2.5">SKU</th>
                      <th className="p-2 sm:p-2.5">Color / Size</th>
                      <th className="p-2 sm:p-2.5">Stock</th>
                      <th className="p-2 sm:p-2.5 text-right">MRP / Selling</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 font-semibold text-slate-700">
                    {previewProduct.variants?.map((v: ProductVariant, idx: number) => (
                      <tr key={v._id || idx}>
                        <td className="p-2 sm:p-2.5 font-mono text-[10px] sm:text-[11px]">{v.sku || `SKU-${idx + 1}`}</td>
                        <td className="p-2 sm:p-2.5">
                          <div className="flex items-center space-x-1.5">
                            {v.colorHex && (
                              <span
                                className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border border-gray-300 inline-block flex-shrink-0"
                                style={{ backgroundColor: v.colorHex }}
                              />
                            )}
                            <span>
                              {v.color} ({v.size})
                            </span>
                          </div>
                        </td>
                        <td className="p-2 sm:p-2.5 font-extrabold">
                          {v.stock === 0 ? (
                            <span className="text-rose-600">0</span>
                          ) : (
                            <span className="text-emerald-700">{v.stock}</span>
                          )}
                        </td>
                        <td className="p-2 sm:p-2.5 text-right font-extrabold">
                          <span className="text-brand-crimson">₹{v.offerPrice}</span>
                          <span className="text-slate-400 line-through text-[9px] sm:text-[10px] ml-1">₹{v.mrp}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-2 sm:space-x-3 pt-3 sm:pt-4 border-t border-gray-100">
              <button
                onClick={() => setPreviewProduct(null)}
                className="px-3.5 sm:px-5 py-2 sm:py-2.5 border border-gray-200 text-[11px] sm:text-xs font-bold text-slate-600 rounded-xl hover:bg-slate-50 cursor-pointer"
              >
                Close Drawer
              </button>
              <button
                onClick={() => {
                  handleOpenEditModal(previewProduct);
                  setPreviewProduct(null);
                }}
                className="px-3.5 sm:px-5 py-2 sm:py-2.5 bg-brand-crimson text-white text-[11px] sm:text-xs font-extrabold rounded-xl shadow-md hover:bg-brand-crimson-dark cursor-pointer"
              >
                Edit Product Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. CREATE & EDIT PRODUCT MODAL */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isSubmitting) {
              setIsModalOpen(false);
              setEditingProduct(null);
              setErrorMessage('');
              setFormData(DEFAULT_FORM);
              setSelectedFiles([]);
            }
          }}
        >
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl p-4 sm:p-8 space-y-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 flex-shrink-0">
              <div>
                <h3 className="text-xs sm:text-xl font-extrabold text-brand-slate-dark flex items-center space-x-1.5 sm:space-x-2">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-brand-crimson flex-shrink-0" />
                  <span>{editingProduct ? 'Edit Product Details' : 'Create Product & Upload Gallery'}</span>
                </h3>
                <p className="text-[9px] sm:text-[10px] text-slate-400 mt-0.5 font-mono">
                  {editingProduct
                    ? `PUT /api/v1/products/${editingProduct._id || editingProduct.id}`
                    : 'POST /api/v1/products (JSON) → POST /api/v1/products/:id/images (multipart)'}
                </p>
              </div>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingProduct(null);
                  setErrorMessage('');
                  setFormData(DEFAULT_FORM);
                  setSelectedFiles([]);
                }}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 transition-colors cursor-pointer"
                title="Close Modal"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-5 text-[11px] sm:text-xs font-medium overflow-y-auto max-h-[72vh] pr-1 flex-1">
              {errorMessage && (
                <div className="p-3 sm:p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-semibold flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Section 1: Basic Product Information */}
              <div className="space-y-3 bg-slate-50/70 border border-gray-200/80 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                <h4 className="text-[10px] sm:text-xs font-extrabold uppercase text-slate-500 tracking-wider">
                  1. Product Metadata
                </h4>

                <div>
                  <label className="block text-[10px] sm:text-xs font-extrabold text-slate-700 mb-1 uppercase">
                    Product Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Floral Embroidered Silk Kurti"
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-[11px] sm:text-xs font-semibold outline-none focus:border-brand-crimson"
                  />
                </div>

                <fieldset>
                  <legend className="text-[10px] sm:text-xs font-extrabold text-slate-700 mb-1 uppercase">
                    Categories and subcategories <span className="text-rose-500">*</span>
                  </legend>
                  <p className="text-xs text-slate-500 mb-2">Select all that apply. {formData.categoryIds.length} selected.</p>
                  <div className="max-h-48 overflow-y-auto rounded-xl border border-gray-200 bg-white p-2 space-y-1">
                    {categoriesList.map((cat) => {
                      const label = [...(cat.ancestors || []).map((ancestor) => ancestor.name), cat.name].join(' / ');
                      return (
                        <label key={cat._id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-rose-50 cursor-pointer text-xs text-slate-700">
                          <input type="checkbox" checked={formData.categoryIds.includes(cat._id)}
                            disabled={isSubmitting}
                            onChange={(event) => setFormData((previous) => ({ ...previous,
                              categoryIds: event.target.checked ? [...previous.categoryIds, cat._id] : previous.categoryIds.filter((id) => id !== cat._id),
                            }))}
                            className="rounded border-gray-300 text-brand-crimson focus:ring-brand-crimson" />
                          <span>{label}</span>
                        </label>
                      );
                    })}
                    {formData.categoryIds.filter((id) => !categoriesList.some((cat) => cat._id === id)).map((id) => (
                      <label key={id} className="flex items-center gap-2 p-2 text-xs text-slate-500">
                        <input type="checkbox" checked disabled={isSubmitting} onChange={() => setFormData((previous) => ({
                          ...previous, categoryIds: previous.categoryIds.filter((value) => value !== id),
                        }))} />
                        Unavailable category (remove to replace)
                      </label>
                    ))}
                    {!categoriesList.length && <p className="p-2 text-xs text-slate-500">No categories loaded. Create a category or try again.</p>}
                  </div>
                </fieldset>

                <div>
                  <label className="block text-[10px] sm:text-xs font-extrabold text-slate-700 mb-1 uppercase">
                    Brand Partner <span className="text-[9px] font-normal text-slate-400 lowercase">(Optional)</span>
                  </label>
                  <select
                    name="brandId"
                    value={formData.brandId}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-[11px] sm:text-xs font-semibold outline-none focus:border-brand-crimson"
                  >
                    <option value="">None / House Brand (NiaKylie)</option>
                    {liveBrands.map((b) => {
                      const idVal = b._id || b.id || '';
                      return (
                        <option key={idVal} value={idVal}>
                          {b.name} ({idVal})
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                  <div>
                    <label className="block text-[10px] sm:text-xs font-extrabold text-slate-700 mb-1 uppercase">Short Description</label>
                    <input
                      type="text"
                      name="shortDescription"
                      value={formData.shortDescription}
                      onChange={handleInputChange}
                      placeholder="Silk Kurti with floral patterns"
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-[11px] sm:text-xs font-semibold outline-none focus:border-brand-crimson"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] sm:text-xs font-extrabold text-slate-700 mb-1 uppercase">Full Description</label>
                    <input
                      type="text"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Handcrafted traditional silk kurti..."
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-[11px] sm:text-xs font-semibold outline-none focus:border-brand-crimson"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                  <div>
                    <label className="block text-[10px] sm:text-[11px] font-extrabold text-slate-700 mb-1">Material</label>
                    <input
                      type="text"
                      name="material"
                      value={formData.material}
                      onChange={handleInputChange}
                      placeholder="Silk"
                      className="w-full bg-white border border-gray-200 rounded-xl px-2.5 py-1.5 sm:py-2 text-[11px] sm:text-xs font-semibold outline-none focus:border-brand-crimson"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] sm:text-[11px] font-extrabold text-slate-700 mb-1">Pattern</label>
                    <input
                      type="text"
                      name="pattern"
                      value={formData.pattern}
                      onChange={handleInputChange}
                      placeholder="Floral"
                      className="w-full bg-white border border-gray-200 rounded-xl px-2.5 py-1.5 sm:py-2 text-[11px] sm:text-xs font-semibold outline-none focus:border-brand-crimson"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] sm:text-[11px] font-extrabold text-slate-700 mb-1">Season</label>
                    <input
                      type="text"
                      name="season"
                      value={formData.season}
                      onChange={handleInputChange}
                      placeholder="Festive 2026"
                      className="w-full bg-white border border-gray-200 rounded-xl px-2.5 py-1.5 sm:py-2 text-[11px] sm:text-xs font-semibold outline-none focus:border-brand-crimson"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] sm:text-[11px] font-extrabold text-slate-700 mb-1">Tax Rate (%)</label>
                    <input
                      type="number"
                      name="tax"
                      min="0"
                      value={formData.tax}
                      onChange={handleInputChange}
                      placeholder="5"
                      className="w-full bg-white border border-gray-200 rounded-xl px-2.5 py-1.5 sm:py-2 text-[11px] sm:text-xs font-semibold outline-none focus:border-brand-crimson"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-extrabold text-slate-700 mb-1 uppercase">
                    Tags <span className="text-[9px] font-normal text-slate-400 lowercase">(Comma-separated)</span>
                  </label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    placeholder="kurti, silk, ethnic"
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-[11px] sm:text-xs font-semibold outline-none focus:border-brand-crimson"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 pt-1">
                  <label className="flex items-center space-x-2 text-[11px] sm:text-xs font-bold text-slate-700 cursor-pointer bg-white p-2.5 rounded-xl border border-gray-200 hover:border-brand-crimson transition-all">
                    <input
                      type="checkbox"
                      name="isFeatured"
                      checked={formData.isFeatured}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-brand-crimson focus:ring-brand-crimson"
                    />
                    <div>
                      <span className="block font-extrabold">Mark as Featured</span>
                      <span className="text-[9px] sm:text-[10px] text-slate-400 font-normal">Shows in "FEATURED EDIT" tab</span>
                    </div>
                  </label>

                  <label className="flex items-center space-x-2 text-[11px] sm:text-xs font-bold text-slate-700 cursor-pointer bg-white p-2.5 rounded-xl border border-gray-200 hover:border-brand-crimson transition-all">
                    <input
                      type="checkbox"
                      name="isTrending"
                      checked={formData.isTrending}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-brand-crimson focus:ring-brand-crimson"
                    />
                    <div>
                      <span className="block font-extrabold">Mark as Trending</span>
                      <span className="text-[9px] sm:text-[10px] text-slate-400 font-normal">Shows in "TRENDING NOW" tab</span>
                    </div>
                  </label>

                  <label className="flex items-center space-x-2 text-[11px] sm:text-xs font-bold text-slate-700 cursor-pointer bg-white p-2.5 rounded-xl border border-gray-200 hover:border-brand-crimson transition-all">
                    <input
                      type="checkbox"
                      name="isBestSeller"
                      checked={formData.isBestSeller}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-brand-crimson focus:ring-brand-crimson"
                    />
                    <div>
                      <span className="block font-extrabold">Mark Best Seller</span>
                      <span className="text-[9px] sm:text-[10px] text-slate-400 font-normal">Shows "Best Seller" badge</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Section 2: Variants Builder */}
              <div className="space-y-3 bg-rose-50/40 border border-rose-100 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] sm:text-xs font-extrabold uppercase text-brand-crimson tracking-wider">
                    2. Product Variants (Required)
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddVariant}
                    className="inline-flex items-center space-x-1 text-[10px] sm:text-xs font-extrabold text-brand-crimson hover:text-brand-crimson-dark bg-white border border-rose-200 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl shadow-sm transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>ADD VARIANT</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.variants.map((v, idx) => (
                    <div
                      key={idx}
                      className="bg-white border border-rose-200/70 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 shadow-sm space-y-2.5 sm:space-y-3 relative"
                    >
                      <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                        <span className="text-[11px] sm:text-xs font-extrabold text-slate-700">Variant #{idx + 1}</span>
                        <div className="flex items-center space-x-2">
                          {editingProduct && ((v as any)._id || (v as any).id) && (
                            <button
                              type="button"
                              disabled={deletingVariantId === ((v as any)._id || (v as any).id)}
                              onClick={() =>
                                handleDeleteVariant(
                                  editingProduct._id || editingProduct.id,
                                  (v as any)._id || (v as any).id,
                                  idx
                                )
                              }
                              className="text-[9px] sm:text-[10px] text-rose-600 hover:text-rose-800 font-bold flex items-center space-x-1 border border-rose-200 bg-rose-50 hover:bg-rose-100 px-2 py-0.5 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                              title="Delete variant from server (DELETE /products/:id/variants/:variantId)"
                            >
                              {deletingVariantId === ((v as any)._id || (v as any).id) ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Trash2 className="w-3 h-3" />
                              )}
                              <span>DELETE VARIANT FROM DB</span>
                            </button>
                          )}
                          {formData.variants.length > 1 && !((v as any)._id || (v as any).id) && (
                            <button
                              type="button"
                              onClick={() => handleRemoveVariant(idx)}
                              className="text-slate-400 hover:text-rose-600 p-1 rounded-lg transition-colors cursor-pointer"
                              title="Remove Variant"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-6 gap-2">
                        <div className="sm:col-span-2">
                          <label className="block text-[9px] sm:text-[10px] font-extrabold text-slate-600 mb-1">Color Name *</label>
                          <input
                            type="text"
                            required
                            value={v.color}
                            onChange={(e) => handleVariantChange(idx, 'color', e.target.value)}
                            placeholder="Crimson Red"
                            className="w-full bg-slate-50 border border-gray-200 rounded-xl px-2.5 py-1.5 text-[11px] sm:text-xs font-semibold outline-none focus:border-brand-crimson"
                          />
                        </div>

                        <div>
                          <label className="block text-[9px] sm:text-[10px] font-extrabold text-slate-600 mb-1">Color Hex</label>
                          <div className="flex items-center space-x-1">
                            <input
                              type="color"
                              value={v.colorHex}
                              onChange={(e) => handleVariantChange(idx, 'colorHex', e.target.value)}
                              className="w-6 h-6 sm:w-7 sm:h-7 rounded border border-gray-200 cursor-pointer p-0 flex-shrink-0"
                            />
                            <input
                              type="text"
                              value={v.colorHex}
                              onChange={(e) => handleVariantChange(idx, 'colorHex', e.target.value)}
                              className="w-full bg-slate-50 border border-gray-200 rounded-xl px-2 py-1 text-[10px] sm:text-[11px] font-mono outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[9px] sm:text-[10px] font-extrabold text-slate-600 mb-1">Size *</label>
                          <select
                            value={v.size}
                            onChange={(e) => handleVariantChange(idx, 'size', e.target.value)}
                            className="w-full bg-slate-50 border border-gray-200 rounded-xl px-2 py-1.5 text-[11px] sm:text-xs font-semibold outline-none focus:border-brand-crimson"
                          >
                            {['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'FREE SIZE'].map((sz) => (
                              <option key={sz} value={sz}>
                                {sz}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[9px] sm:text-[10px] font-extrabold text-slate-600 mb-1">Stock (Numeric) *</label>
                          <input
                            type="number"
                            required
                            min="0"
                            value={v.stock}
                            onChange={(e) => handleVariantChange(idx, 'stock', e.target.value)}
                            placeholder="25"
                            className="w-full bg-slate-50 border border-gray-200 rounded-xl px-2.5 py-1.5 text-[11px] sm:text-xs font-semibold outline-none focus:border-brand-crimson"
                          />
                        </div>

                        <div>
                          <label className="block text-[9px] sm:text-[10px] font-extrabold text-slate-600 mb-1">MRP (₹) *</label>
                          <input
                            type="number"
                            required
                            min="1"
                            value={v.mrp}
                            onChange={(e) => handleVariantChange(idx, 'mrp', e.target.value)}
                            placeholder="2999"
                            className="w-full bg-slate-50 border border-gray-200 rounded-xl px-2.5 py-1.5 text-[11px] sm:text-xs font-semibold outline-none focus:border-brand-crimson"
                          />
                        </div>

                        <div>
                          <label className="block text-[9px] sm:text-[10px] font-extrabold text-slate-600 mb-1">Offer Price (₹) *</label>
                          <input
                            type="number"
                            required
                            min="0"
                            value={v.offerPrice}
                            onChange={(e) => handleVariantChange(idx, 'offerPrice', e.target.value)}
                            placeholder="1999"
                            className="w-full bg-slate-50 border border-gray-200 rounded-xl px-2.5 py-1.5 text-[11px] sm:text-xs font-semibold outline-none focus:border-brand-crimson"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 3: Product Gallery Images Upload */}
              <div className="space-y-2 bg-slate-50/70 border border-gray-200/80 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                <h4 className="text-[10px] sm:text-xs font-extrabold uppercase text-slate-500 tracking-wider flex items-center space-x-1.5">
                  <ImageIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-crimson" />
                  <span>3. Product Gallery Images (Optional update)</span>
                </h4>
                <p className="text-[10px] sm:text-[11px] text-slate-400">
                  Select new image files if you wish to upload or replace product gallery images.
                </p>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileSelection}
                  className="w-full text-[11px] sm:text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[10px] sm:file:text-xs file:font-bold file:bg-brand-crimson file:text-white hover:file:bg-brand-crimson-dark cursor-pointer"
                />
                {selectedFiles.length > 0 && (
                  <div className="flex items-center space-x-2 pt-1">
                    <span className="text-[11px] sm:text-xs font-bold text-emerald-600">
                      ✓ {selectedFiles.length} file(s) selected:
                    </span>
                    <span className="text-[10px] sm:text-[11px] text-slate-500 line-clamp-1">
                      {selectedFiles.map((f) => f.name).join(', ')}
                    </span>
                  </div>
                )}
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end space-x-2 sm:space-x-3 pt-3 border-t border-gray-100 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingProduct(null);
                    setErrorMessage('');
                    setFormData(DEFAULT_FORM);
                    setSelectedFiles([]);
                  }}
                  className="px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl border border-gray-200 text-[11px] sm:text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center space-x-1.5 bg-brand-crimson hover:bg-brand-crimson-dark text-white font-extrabold text-[11px] sm:text-xs px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl shadow-lg transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                      <span>{submittingStep || 'PROCESSING...'}</span>
                    </>
                  ) : (
                    <span>{editingProduct ? 'UPDATE PRODUCT' : 'CREATE PRODUCT & UPLOAD IMAGES'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminProductManagement;
