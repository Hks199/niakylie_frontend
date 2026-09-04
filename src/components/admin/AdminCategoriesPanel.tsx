import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  FolderTree,
  Plus,
  Trash2,
  Edit2,
  X,
  RefreshCw,
  AlertCircle,
  Check,
  Image as ImageIcon,
  Search,
  FolderPlus,
  Layers,
  ShieldAlert,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { categoriesApi } from '../../api/categories';
import { Category } from '../../types/category';
import { CreateCategoryModal } from './CreateCategoryModal';

interface CategoryFormData {
  name: string;
  parentId: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  status: boolean;
  imageFile: File | null;
  bannerFile: File | null;
}

const DEFAULT_FORM: CategoryFormData = {
  name: '',
  parentId: '',
  description: '',
  seoTitle: '',
  seoDescription: '',
  seoKeywords: '',
  status: true,
  imageFile: null,
  bannerFile: null,
};

export function AdminCategoriesPanel() {
  const queryClient = useQueryClient();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'parent' | 'sub'>('all');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Reset pagination to page 1 on search or filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType]);

  // Create Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createCategoryType, setCreateCategoryType] = useState<'main' | 'sub'>('main');
  const [createParentId, setCreateParentId] = useState('');

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editCategoryType, setEditCategoryType] = useState<'parent' | 'sub'>('parent');
  const [formData, setFormData] = useState<CategoryFormData>(DEFAULT_FORM);

  // Delete Confirmation Modal State
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  // Action Loading & Feedback State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // 1. Full List Retrieval via GET /api/v1/categories?limit=500 (Manual Refresh Only)
  const { data: categoriesResponse, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      return await categoriesApi.getCategories({ limit: 500 });
    },
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchInterval: false,
  });

  const extractCategoriesArray = (data: any): Category[] => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.categories)) return data.categories;
    if (data.data && Array.isArray(data.data.data)) return data.data.data;
    if (data.data && Array.isArray(data.data.categories)) return data.data.categories;
    return [];
  };

  const rawCategoriesList: Category[] = extractCategoriesArray(categoriesResponse);

  // Filter out soft-deleted categories (!c.isDeleted)
  const categories: Category[] = rawCategoriesList.filter(
    (c) => c && !c.isDeleted
  );

  // Identify root parent categories (parentId is null, empty string, or undefined)
  const parentCategories = categories.filter((c) => {
    const parentIdVal = typeof c.parentId === 'object' && c.parentId
      ? ((c.parentId as any)._id || (c.parentId as any).id)
      : c.parentId;
    return !parentIdVal || parentIdVal === 'null' || parentIdVal === 'undefined';
  });

  // 3. Interactive Filtering: Tabs & Live Keyword Search (Name, Slug, or Parent Name)
  const filteredCategories = categories.filter((cat) => {
    const parentIdVal = typeof cat.parentId === 'object' && cat.parentId
      ? ((cat.parentId as any)._id || (cat.parentId as any).id)
      : cat.parentId;
    const isParent = !parentIdVal || parentIdVal === 'null' || parentIdVal === 'undefined';

    // Level Tabs Filter
    if (filterType === 'parent' && !isParent) return false;
    if (filterType === 'sub' && isParent) return false;

    // Search Keyword Filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const nameMatch = cat.name?.toLowerCase().includes(term);
      const slugMatch = cat.slug?.toLowerCase().includes(term);

      // Match parent category name for sub-categories
      const parentCat = parentIdVal
        ? categories.find((c) => (c._id || (c as any).id) === parentIdVal)
        : null;
      const parentNameMatch = parentCat?.name?.toLowerCase().includes(term);

      return nameMatch || slugMatch || parentNameMatch;
    }
    return true;
  });

  // Pagination Calculations
  const totalItems = filteredCategories.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validPage = Math.min(currentPage, totalPages);
  const startIndex = (validPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedCategories = filteredCategories.slice(startIndex, endIndex);

  // 5. Proactive Cache Management & Immediate Refetching
  const invalidateAllCaches = async () => {
    await Promise.all([
      queryClient.refetchQueries({ queryKey: ['admin-categories'] }),
      queryClient.refetchQueries({ queryKey: ['categories-list'] }),
      queryClient.refetchQueries({ queryKey: ['megamenu-categories'] }),
      queryClient.refetchQueries({ queryKey: ['filter-categories-list'] }),
      queryClient.refetchQueries({ queryKey: ['category-tree'] }),
    ]);
    await refetch();
  };

  // Handlers for Create Modal
  const handleOpenCreateParentModal = () => {
    setCreateCategoryType('main');
    setCreateParentId('');
    setIsCreateModalOpen(true);
  };

  const handleOpenCreateSubModal = (preselectedParentId?: string) => {
    setCreateCategoryType('sub');
    const firstParentId = preselectedParentId || (parentCategories[0] ? (parentCategories[0]._id || (parentCategories[0] as any).id) : '');
    setCreateParentId(firstParentId);
    setIsCreateModalOpen(true);
  };

  // Handlers for Edit Modal
  const handleOpenEditModal = (cat: Category) => {
    setEditingCategory(cat);
    const parentIdVal = typeof cat.parentId === 'object' && cat.parentId
      ? ((cat.parentId as any)._id || (cat.parentId as any).id)
      : (cat.parentId || '');
    setEditCategoryType(parentIdVal ? 'sub' : 'parent');
    setFormData({
      name: cat.name || '',
      parentId: parentIdVal,
      description: cat.description || '',
      seoTitle: cat.seoTitle || '',
      seoDescription: cat.seoDescription || '',
      seoKeywords: Array.isArray(cat.seoKeywords) ? cat.seoKeywords.join(', ') : '',
      status: cat.status !== undefined ? cat.status : true,
      imageFile: null,
      bannerFile: null,
    });
    setErrorMessage('');
    setIsEditModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'imageFile' | 'bannerFile') => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, [field]: file }));
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.name.trim()) {
      setErrorMessage('Category name is required.');
      return;
    }

    if (!editingCategory) return;

    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('name', formData.name.trim());
      
      if (editCategoryType === 'sub' && formData.parentId) {
        fd.append('parentId', formData.parentId);
      }

      fd.append('description', formData.description || '');
      if (formData.seoTitle) fd.append('seoTitle', formData.seoTitle);
      if (formData.seoDescription) fd.append('seoDescription', formData.seoDescription);
      
      if (formData.seoKeywords.trim()) {
        const keywordsArray = formData.seoKeywords.split(',').map((k) => k.trim()).filter(Boolean);
        keywordsArray.forEach((kw) => fd.append('seoKeywords', kw));
      }

      if (formData.imageFile) fd.append('image', formData.imageFile);
      if (formData.bannerFile) fd.append('banner', formData.bannerFile);
      fd.append('status', String(formData.status));

      const catId = editingCategory._id || (editingCategory as any).id;
      await categoriesApi.updateCategory(catId, fd);
      
      setSuccessMessage('Category updated successfully!');
      setTimeout(() => setSuccessMessage(''), 4000);
      setIsEditModalOpen(false);
      setEditingCategory(null);
      setFormData(DEFAULT_FORM);
      await invalidateAllCaches();
    } catch (err: any) {
      const rawMsg = err?.response?.data?.message || err?.message || err?.error || 'Failed to update category.';
      const msg = Array.isArray(rawMsg) ? rawMsg.join(' · ') : String(rawMsg);
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. Action: Active Status Toggle (PATCH /api/v1/categories/:id/toggle-active)
  const handleToggleActive = async (id: string) => {
    setTogglingId(id);
    try {
      await categoriesApi.toggleActive(id);
      await invalidateAllCaches();
      setSuccessMessage('Category status updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      const rawMsg = err?.response?.data?.message || err?.message || err?.error || 'Failed to toggle active status';
      const msg = Array.isArray(rawMsg) ? rawMsg.join(' · ') : String(rawMsg);
      setErrorMessage(msg);
    } finally {
      setTogglingId(null);
    }
  };

  // 4. Action: Cascading Soft Delete (DELETE /api/v1/categories/:id)
  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    const id = categoryToDelete._id || (categoryToDelete as any).id;
    setDeletingId(id);
    try {
      await categoriesApi.deleteCategory(id);
      setSuccessMessage(`Category "${categoryToDelete.name}" deleted successfully!`);
      setTimeout(() => setSuccessMessage(''), 4000);
      setCategoryToDelete(null);
      await invalidateAllCaches();
    } catch (err: any) {
      const rawMsg = err?.response?.data?.message || err?.message || err?.error || 'Failed to delete category';
      const msg = Array.isArray(rawMsg) ? rawMsg.join(' · ') : String(rawMsg);
      setErrorMessage(msg);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Top Header Card */}
      <div className="bg-white border border-slate-100 rounded-xl sm:rounded-3xl p-3.5 sm:p-6 shadow-sm flex items-start sm:items-center justify-between flex-wrap gap-3 sm:gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-brand-crimson/10 text-brand-crimson flex items-center justify-center flex-shrink-0 font-bold shadow-inner">
            <FolderTree className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-brand-slate-dark font-display">Category & Taxonomy Management</h2>
            <p className="text-[10px] sm:text-xs text-slate-400">
              Manage Level 1 Main Categories, Level 2 Sub-Categories, header banners & taxonomy trees
            </p>
          </div>
        </div>

        {/* Action Header Buttons */}
        <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto justify-between sm:justify-end flex-wrap gap-y-2">
          <button
            onClick={() => invalidateAllCaches()}
            disabled={isRefetching}
            className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border border-slate-200 text-slate-600 hover:text-brand-crimson hover:border-brand-crimson transition-colors disabled:opacity-50"
            title="Refresh Categories List"
          >
            <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isRefetching ? 'animate-spin text-brand-crimson' : ''}`} />
          </button>

          <button
            onClick={handleOpenCreateParentModal}
            className="inline-flex items-center space-x-1.5 bg-slate-900 hover:bg-black text-white font-extrabold text-[10px] sm:text-xs px-3 sm:px-4 py-2 sm:py-3 rounded-xl sm:rounded-2xl shadow-md hover:shadow-lg transition-all"
          >
            <FolderPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
            <span>MAIN CATEGORY</span>
          </button>

          <button
            onClick={() => handleOpenCreateSubModal()}
            className="inline-flex items-center space-x-1.5 bg-brand-crimson hover:bg-brand-crimson-dark text-white font-extrabold text-[10px] sm:text-xs px-3 sm:px-5 py-2 sm:py-3 rounded-xl sm:rounded-2xl shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>ADD SUB-CAT</span>
          </button>
        </div>
      </div>

      {/* Global Notifications Banners */}
      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-xs font-semibold flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage('')} className="p-1 hover:bg-rose-100 rounded-lg text-rose-500">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-xs font-semibold flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center space-x-2">
            <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage('')} className="p-1 hover:bg-emerald-100 rounded-lg text-emerald-500">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 3. Interactive Filter Bar: Search Input & Hierarchy Tabs */}
      <div className="bg-white border border-slate-100 rounded-xl sm:rounded-3xl p-3 sm:p-4 shadow-sm flex items-center justify-between flex-wrap gap-2.5 sm:gap-3">
        <div className="relative flex-1 max-w-md w-full min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by category name, slug..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl pl-9 pr-8 py-2 text-[11px] sm:text-xs font-semibold text-slate-800 outline-none focus:border-brand-crimson focus:bg-white transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Hierarchy Filter Tabs */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl sm:rounded-2xl overflow-x-auto scrollbar-none w-full sm:w-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-extrabold transition-all whitespace-nowrap ${
              filterType === 'all'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            All ({categories.length})
          </button>

          <button
            onClick={() => setFilterType('parent')}
            className={`px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-extrabold flex items-center space-x-1 transition-all whitespace-nowrap ${
              filterType === 'parent'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <FolderPlus className="w-3 h-3" />
            <span>Main (L1) ({parentCategories.length})</span>
          </button>

          <button
            onClick={() => setFilterType('sub')}
            className={`px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-extrabold flex items-center space-x-1 transition-all whitespace-nowrap ${
              filterType === 'sub'
                ? 'bg-brand-crimson text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>Sub (L2) ({categories.length - parentCategories.length})</span>
          </button>
        </div>
      </div>

      {/* Main Category Data Table */}
      <div className="bg-white border border-slate-100 rounded-xl sm:rounded-3xl p-3.5 sm:p-6 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin text-brand-crimson" />
            <span className="text-xs text-slate-400 font-semibold">Loading category hierarchy...</span>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <FolderTree className="w-12 h-12 text-slate-200 mx-auto" />
            <div>
              <p className="text-sm font-extrabold text-slate-700">No Categories Found</p>
              <p className="text-xs text-slate-400 mt-1">
                {searchTerm
                  ? `No categories match search query "${searchTerm}"`
                  : 'Start by creating your first Level 1 Main Category.'}
              </p>
            </div>
            <button
              onClick={handleOpenCreateParentModal}
              className="inline-flex items-center space-x-1.5 text-xs font-extrabold text-brand-crimson hover:underline pt-2"
            >
              <FolderPlus className="w-4 h-4" />
              <span>Create Main Category Now</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-none">
            <table className="w-full text-left border-collapse min-w-[650px]">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">
                  <th className="pb-3 pl-2">Category Detail</th>
                  <th className="pb-3">URL Slug</th>
                  <th className="pb-3">2-Level Hierarchy & Parent</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 pr-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs font-semibold">
                {paginatedCategories.map((cat, idx) => {
                  const parentIdVal = typeof cat.parentId === 'object' && cat.parentId
                    ? ((cat.parentId as any)._id || (cat.parentId as any).id)
                    : cat.parentId;
                  const parentCat = parentIdVal
                    ? categories.find((c) => (c._id || (c as any).id) === parentIdVal) || (typeof cat.parentId === 'object' && cat.parentId ? (cat.parentId as any) : null)
                    : null;
                  const isParent = !parentIdVal || parentIdVal === 'null' || parentIdVal === 'undefined';
                  const catId = cat._id || (cat as any).id || `cat-${idx}`;

                  return (
                    <tr key={catId} className="hover:bg-slate-50/60 transition-colors group">
                      {/* Thumbnail & Name */}
                      <td className="py-3.5 pl-2 flex items-center space-x-3.5">
                        {cat.image ? (
                          <img
                            src={cat.image.startsWith('http') ? cat.image : `http://localhost:3000${cat.image}`}
                            alt={cat.name}
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=250&q=80';
                            }}
                            className="w-10 h-10 rounded-2xl object-cover border border-slate-200 shadow-sm"
                          />
                        ) : (
                          <div
                            className={`w-10 h-10 rounded-2xl flex items-center justify-center font-extrabold text-xs border shadow-sm ${
                              isParent
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-rose-50 text-brand-crimson border-rose-100'
                            }`}
                          >
                            {cat.name?.[0]?.toUpperCase() || 'C'}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="font-extrabold text-slate-900 text-sm">{cat.name}</p>
                          </div>
                          {cat.description ? (
                            <p className="text-[11px] text-slate-400 line-clamp-1 max-w-xs">{cat.description}</p>
                          ) : (
                            <p className="text-[10px] text-slate-300 italic">No description provided</p>
                          )}
                        </div>
                      </td>

                      {/* Slug */}
                      <td className="py-3.5 font-mono text-[11px] text-slate-500">{cat.slug || '—'}</td>

                      {/* 2. Hierarchy Badging (Level 1 vs Level 2) */}
                      <td className="py-3.5 text-slate-600">
                        {isParent ? (
                          <span className="bg-amber-500/10 text-amber-700 border border-amber-500/20 px-2.5 py-1 rounded-xl text-[10px] font-extrabold uppercase flex items-center space-x-1.5 w-max">
                            <FolderTree className="w-3 h-3 text-amber-600" />
                            <span>Level 1 · Main Category</span>
                          </span>
                        ) : (
                          <div className="flex items-center space-x-1.5 flex-wrap gap-1">
                            <span className="bg-brand-crimson/10 text-brand-crimson border border-brand-crimson/20 px-2.5 py-1 rounded-xl text-[10px] font-extrabold uppercase flex items-center space-x-1 w-max">
                              <Layers className="w-3 h-3 text-brand-crimson" />
                              <span>Level 2 Sub-Cat</span>
                            </span>
                            {parentCat ? (
                              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center space-x-1 border border-slate-200">
                                <ArrowUpRight className="w-3 h-3 text-slate-400" />
                                <span>Sub of {parentCat.name}</span>
                              </span>
                            ) : (
                              <span className="bg-slate-100 text-slate-400 px-2 py-0.5 rounded-lg text-[10px] italic">
                                Parent ID: {String(parentIdVal).substring(0, 8)}...
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* 4. Active Status Toggle */}
                      <td className="py-3.5 px-2">
                        <button
                          onClick={() => handleToggleActive(catId)}
                          disabled={togglingId === catId}
                          className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-[10px] font-extrabold transition-all hover:scale-105 cursor-pointer disabled:opacity-50 ${
                            cat.status !== false
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                          title="Click to toggle Active / Inactive status"
                        >
                          {togglingId === catId ? (
                            <RefreshCw className="w-3 h-3 animate-spin text-slate-600" />
                          ) : (
                            <span>{cat.status !== false ? 'ACTIVE' : 'INACTIVE'}</span>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 pr-2 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {/* 4. Add Sub-Category Shortcut on Main Category row */}
                          {isParent && (
                            <button
                              onClick={() => handleOpenCreateSubModal(catId)}
                              className="px-2.5 py-1 text-[10px] font-extrabold text-brand-crimson bg-rose-50 hover:bg-rose-100 border border-rose-100 rounded-xl transition-colors flex items-center space-x-1 mr-1"
                              title="Add Sub-Category under this Main Category"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Add Sub-Cat</span>
                            </button>
                          )}

                          <button
                            onClick={() => handleOpenEditModal(cat)}
                            className="p-2 text-slate-400 hover:text-brand-crimson hover:bg-rose-50 rounded-xl transition-colors"
                            title="Edit Category"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setCategoryToDelete(cat)}
                            disabled={deletingId === catId}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors disabled:opacity-50"
                            title="Delete Category"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {filteredCategories.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 mt-2 border-t border-slate-100 text-xs text-slate-500 font-semibold">
            {/* Info & Page Size Selector */}
            <div className="flex items-center space-x-3">
              <span>
                Showing <strong className="text-slate-900 font-extrabold">{totalItems > 0 ? startIndex + 1 : 0}</strong> to{' '}
                <strong className="text-slate-900 font-extrabold">{endIndex}</strong> of{' '}
                <strong className="text-slate-900 font-extrabold">{totalItems}</strong> categories
              </span>

              <div className="flex items-center space-x-1.5 pl-2 border-l border-slate-200">
                <span className="text-[11px] text-slate-400 font-medium">Per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 text-xs font-bold text-slate-800 outline-none focus:border-brand-crimson"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            {/* Navigation Buttons */}
            {totalPages > 1 && (
              <div className="flex items-center space-x-1">
                {/* First Page */}
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={validPage === 1}
                  className="p-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                  title="First Page"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>

                {/* Previous Page */}
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={validPage === 1}
                  className="p-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Page Number Buttons */}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => page === 1 || page === totalPages || Math.abs(page - validPage) <= 1)
                  .map((page, idx, arr) => {
                    const prevPage = arr[idx - 1];
                    const showEllipsis = prevPage && page - prevPage > 1;

                    return (
                      <div key={page} className="flex items-center">
                        {showEllipsis && <span className="px-1 text-slate-400">...</span>}
                        <button
                          onClick={() => setCurrentPage(page)}
                          className={`min-w-[32px] h-8 px-2 rounded-xl text-xs font-extrabold transition-all ${
                            validPage === page
                              ? 'bg-brand-crimson text-white shadow-sm'
                              : 'bg-slate-50 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {page}
                        </button>
                      </div>
                    );
                  })}

                {/* Next Page */}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={validPage === totalPages}
                  className="p-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                  title="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* Last Page */}
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={validPage === totalPages}
                  className="p-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                  title="Last Page"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal (Cascading Soft Delete) */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center flex-shrink-0">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Confirm Soft Delete</h3>
                <p className="text-[11px] text-slate-400">DELETE /api/v1/categories/:id</p>
              </div>
            </div>

            <div className="bg-rose-50/80 border border-rose-200/80 rounded-2xl p-4 text-xs text-rose-900 font-semibold space-y-1">
              <p className="font-extrabold text-rose-950">
                Are you sure you want to delete category "{categoryToDelete.name}"?
              </p>
              <p className="text-[11px] text-rose-800">
                ⚠️ Cascading Delete Warning: Any nested Level 2 sub-categories will also be soft-deleted and removed from store megamenus.
              </p>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setCategoryToDelete(null)}
                disabled={deletingId !== null}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deletingId !== null}
                className="inline-flex items-center space-x-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-lg transition-all disabled:opacity-50"
              >
                {deletingId ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>DELETING...</span>
                  </>
                ) : (
                  <span>YES, DELETE CATEGORY</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {isEditModalOpen && editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  Edit {editCategoryType === 'parent' ? 'Main Category (Level 1)' : 'Sub-Category (Level 2)'}
                </h3>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">PUT /api/v1/categories/:id</p>
              </div>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingCategory(null);
                }}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">Category Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-brand-crimson"
                />
              </div>

              {/* Sub-Category Parent Selection */}
              {editCategoryType === 'sub' && (
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">Parent Category *</label>
                  <select
                    name="parentId"
                    required
                    value={formData.parentId}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-brand-crimson"
                  >
                    <option value="" disabled>-- Select Parent Category --</option>
                    {parentCategories
                      .filter((c) => (c._id || (c as any).id) !== (editingCategory._id || (editingCategory as any).id))
                      .map((c) => {
                        const idVal = c._id || (c as any).id;
                        return (
                          <option key={idVal} value={idVal}>
                            {c.name}
                          </option>
                        );
                      })}
                  </select>
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">Description</label>
                <textarea
                  name="description"
                  rows={2}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-brand-crimson"
                />
              </div>

              {/* Thumbnail and Banner File Overrides */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1 flex items-center space-x-1">
                    <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                    <span>Replace Category Thumbnail</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'imageFile')}
                    className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-brand-crimson file:text-white hover:file:bg-brand-crimson-dark cursor-pointer"
                  />
                  {formData.imageFile && (
                    <p className="text-[10px] text-emerald-600 font-semibold mt-1">✓ New file selected: {formData.imageFile.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1 flex items-center space-x-1">
                    <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                    <span>Replace Header Banner</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'bannerFile')}
                    className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 cursor-pointer"
                  />
                  {formData.bannerFile && (
                    <p className="text-[10px] text-emerald-600 font-semibold mt-1">✓ New banner selected: {formData.bannerFile.name}</p>
                  )}
                </div>
              </div>

              {/* Status */}
              <div className="pt-1">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="status"
                    checked={formData.status}
                    onChange={handleInputChange}
                    className="rounded border-slate-300 text-brand-crimson focus:ring-brand-crimson"
                  />
                  <span className="text-xs font-bold text-slate-700">Active Category</span>
                </label>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingCategory(null);
                  }}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center space-x-2 bg-brand-crimson hover:bg-brand-crimson-dark text-white font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-lg transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>SAVING...</span>
                    </>
                  ) : (
                    <span>SAVE CHANGES</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Standalone Create Category & Sub-Category Modal */}
      <CreateCategoryModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        initialCategoryType={createCategoryType}
        initialParentId={createParentId}
        onSuccess={async () => {
          setSuccessMessage('Category created successfully!');
          await refetch();
          await invalidateAllCaches();
          setTimeout(() => setSuccessMessage(''), 4000);
        }}
      />
    </div>
  );
}

export default AdminCategoriesPanel;
