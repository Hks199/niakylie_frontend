import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FolderTree, Plus, Trash2, Edit2, X, RefreshCw, AlertCircle, Check, Image as ImageIcon, Search, FolderPlus, Layers } from 'lucide-react';
import { categoriesApi } from '../../api/categories';
import { Category } from '../../types/category';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'parent' | 'sub'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryType, setCategoryType] = useState<'parent' | 'sub'>('parent');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState<CategoryFormData>(DEFAULT_FORM);

  const { data: categoriesResponse, isLoading, refetch } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      return await categoriesApi.getCategories({ limit: 500 });
    },
  });

  const rawCategoriesList: Category[] = Array.isArray(categoriesResponse)
    ? categoriesResponse
    : Array.isArray(categoriesResponse?.data)
    ? categoriesResponse.data
    : [];

  const categories: Category[] = rawCategoriesList.filter((c) => !c.isDeleted);

  // Filter root parent categories (parentId is null or empty)
  const parentCategories = categories.filter((c) => !c.parentId || (typeof c.parentId === 'object' && !(c.parentId as any)?._id));

  const filteredCategories = categories.filter((cat) => {
    const parentIdVal = typeof cat.parentId === 'object' && cat.parentId ? ((cat.parentId as any)._id || (cat.parentId as any).id) : cat.parentId;
    const isParent = !parentIdVal;

    if (filterType === 'parent' && !isParent) return false;
    if (filterType === 'sub' && isParent) return false;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const nameMatch = cat.name?.toLowerCase().includes(term);
      const slugMatch = cat.slug?.toLowerCase().includes(term);
      return nameMatch || slugMatch;
    }
    return true;
  });

  const handleOpenCreateParentModal = () => {
    setEditingCategory(null);
    setCategoryType('parent');
    setFormData({ ...DEFAULT_FORM, parentId: '' });
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const handleOpenCreateSubModal = (preselectedParentId?: string) => {
    setEditingCategory(null);
    setCategoryType('sub');
    const firstParentId = preselectedParentId || (parentCategories[0] ? (parentCategories[0]._id || (parentCategories[0] as any).id) : '');
    setFormData({ ...DEFAULT_FORM, parentId: firstParentId });
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat: Category) => {
    setEditingCategory(cat);
    const parentIdVal = typeof cat.parentId === 'object' && cat.parentId ? ((cat.parentId as any)._id || (cat.parentId as any).id) : (cat.parentId || '');
    setCategoryType(parentIdVal ? 'sub' : 'parent');
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
    setIsModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCategoryTypeChange = (type: 'parent' | 'sub') => {
    setCategoryType(type);
    if (type === 'parent') {
      setFormData(prev => ({ ...prev, parentId: '' }));
    } else {
      const firstParent = parentCategories[0];
      const defaultParentId = firstParent ? (firstParent._id || (firstParent as any).id) : '';
      setFormData(prev => ({ ...prev, parentId: defaultParentId }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'imageFile' | 'bannerFile') => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, [field]: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.name.trim()) {
      setErrorMessage('Category name is required.');
      return;
    }

    if (categoryType === 'sub' && !formData.parentId) {
      setErrorMessage('Please select a Parent Category for this Sub-Category.');
      return;
    }

    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('name', formData.name.trim());
      
      // If parent category type, omit parentId or send empty
      if (categoryType === 'sub' && formData.parentId) {
        fd.append('parentId', formData.parentId);
      }

      fd.append('description', formData.description || '');
      if (formData.seoTitle) fd.append('seoTitle', formData.seoTitle);
      if (formData.seoDescription) fd.append('seoDescription', formData.seoDescription);
      
      if (formData.seoKeywords.trim()) {
        const keywordsArray = formData.seoKeywords.split(',').map((k) => k.trim()).filter(Boolean);
        keywordsArray.forEach((kw) => fd.append('seoKeywords', kw));
      }

      if (formData.imageFile) {
        fd.append('image', formData.imageFile);
      }
      if (formData.bannerFile) {
        fd.append('banner', formData.bannerFile);
      }

      if (editingCategory) {
        fd.append('status', String(formData.status));
        const catId = editingCategory._id || (editingCategory as any).id;
        await categoriesApi.updateCategory(catId, fd);
        setSuccessMessage(categoryType === 'parent' ? 'Parent Category updated successfully!' : 'Sub-Category updated successfully!');
      } else {
        await categoriesApi.createCategory(fd);
        setSuccessMessage(categoryType === 'parent' ? 'Parent Category created successfully!' : 'Sub-Category created successfully!');
      }

      setTimeout(() => setSuccessMessage(''), 4000);
      setIsModalOpen(false);
      setFormData(DEFAULT_FORM);
      setEditingCategory(null);
      await invalidateAllCaches();
    } catch (err: any) {
      const rawMsg = err?.message || err?.error;
      const msg = Array.isArray(rawMsg) ? rawMsg.join(' · ') : typeof rawMsg === 'string' ? rawMsg : 'Failed to save category.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const invalidateAllCaches = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['admin-categories'], exact: false }),
      queryClient.invalidateQueries({ queryKey: ['categories-list'], exact: false }),
      queryClient.invalidateQueries({ queryKey: ['megamenu-categories'], exact: false }),
      queryClient.invalidateQueries({ queryKey: ['filter-categories-list'], exact: false }),
      queryClient.invalidateQueries({ queryKey: ['category-tree'], exact: false }),
    ]);
    await refetch();
  };

  const handleToggleActive = async (id: string) => {
    try {
      await categoriesApi.toggleActive(id);
      await invalidateAllCaches();
    } catch (err: any) {
      const rawMsg = err?.message || err?.error || err?.response?.data?.message || 'Failed to toggle active status';
      const msg = Array.isArray(rawMsg) ? rawMsg.join(' · ') : String(rawMsg);
      setErrorMessage(msg);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? Any nested sub-categories will also be deleted.')) return;
    setDeletingId(id);
    try {
      await categoriesApi.deleteCategory(id);
      setSuccessMessage('Category deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 4000);
      await invalidateAllCaches();
    } catch (err: any) {
      const rawMsg = err?.message || err?.error || err?.response?.data?.message || 'Failed to delete category';
      const msg = Array.isArray(rawMsg) ? rawMsg.join(' · ') : String(rawMsg);
      setErrorMessage(msg);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Header Card */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex items-start sm:items-center justify-between flex-wrap gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-crimson/10 text-brand-crimson flex items-center justify-center flex-shrink-0 font-bold">
            <FolderTree className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-brand-slate-dark font-display">Category & Taxonomy Management</h2>
            <p className="text-xs text-slate-400">Create parent categories, sub-categories, header banners & megamenu taxonomies</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={() => refetch()}
            className="p-2.5 rounded-2xl border border-gray-200 text-slate-600 hover:text-brand-crimson hover:border-brand-crimson transition-colors"
            title="Refresh Categories List"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleOpenCreateParentModal}
            className="inline-flex items-center space-x-2 bg-slate-900 hover:bg-black text-white font-extrabold text-xs px-4 py-3 rounded-2xl shadow-lg transition-all"
          >
            <FolderPlus className="w-4 h-4 text-amber-400" />
            <span>CREATE PARENT CATEGORY</span>
          </button>

          <button
            onClick={() => handleOpenCreateSubModal()}
            className="inline-flex items-center space-x-2 bg-brand-crimson hover:bg-brand-crimson-dark text-white font-extrabold text-xs px-5 py-3 rounded-2xl shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>ADD SUB-CATEGORY</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-3 text-xs font-bold flex items-center space-x-2 animate-in fade-in duration-200">
          <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Search & Filter Pills Bar */}
      <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-sm flex items-center justify-between flex-wrap gap-3">
        <div className="relative flex-1 max-w-md min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search category name or slug..."
            className="w-full bg-slate-50 border border-gray-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:border-brand-crimson"
          />
        </div>

        {/* Filter Type Pills */}
        <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-2xl">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
              filterType === 'all'
                ? 'bg-white text-brand-slate-dark shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            All ({categories.length})
          </button>
          <button
            onClick={() => setFilterType('parent')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
              filterType === 'parent'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Parent Categories ({parentCategories.length})
          </button>
          <button
            onClick={() => setFilterType('sub')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
              filterType === 'sub'
                ? 'bg-brand-crimson text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Sub-Categories ({categories.length - parentCategories.length})
          </button>
        </div>
      </div>

      {/* Categories Table Card */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-16 flex items-center justify-center space-x-2">
            <RefreshCw className="w-6 h-6 animate-spin text-slate-300" />
            <span className="text-xs text-slate-400 font-semibold">Loading categories...</span>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <FolderTree className="w-12 h-12 text-slate-200 mx-auto" />
            <div>
              <p className="text-sm font-extrabold text-slate-600">No Categories Found</p>
              <p className="text-xs text-slate-400">Click "CREATE PARENT CATEGORY" to start building your store navigation tree.</p>
            </div>
            <button
              onClick={handleOpenCreateParentModal}
              className="inline-flex items-center space-x-1.5 text-xs font-extrabold text-brand-crimson hover:underline"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>Create Parent Category Now</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">
                  <th className="pb-3 pl-2">Category Name</th>
                  <th className="pb-3">Slug</th>
                  <th className="pb-3">Hierarchy / Parent</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 pr-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-xs font-semibold">
                {filteredCategories.map((cat, idx) => {
                  const parentIdVal = typeof cat.parentId === 'object' && cat.parentId ? ((cat.parentId as any)._id || (cat.parentId as any).id) : cat.parentId;
                  const parentCat = parentIdVal
                    ? categories.find((c) => (c._id || (c as any).id) === parentIdVal)
                    : null;
                  const isParent = !parentIdVal;
                  const catId = cat._id || (cat as any).id || `cat-${idx}`;

                  return (
                    <tr key={catId} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 pl-2 flex items-center space-x-3">
                        {cat.image ? (
                          <img
                            src={cat.image.startsWith('http') ? cat.image : `http://localhost:3000${cat.image}`}
                            alt={cat.name}
                            className="w-10 h-10 rounded-xl object-cover border border-gray-100"
                          />
                        ) : (
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-xs border ${
                            isParent ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-rose-50 text-brand-crimson border-rose-100'
                          }`}>
                            {cat.name?.[0]?.toUpperCase() || 'C'}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="font-extrabold text-brand-slate-dark text-sm">{cat.name}</p>
                            {isParent && (
                              <span className="bg-amber-100 text-amber-800 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border border-amber-200">
                                Parent
                              </span>
                            )}
                          </div>
                          {cat.description && (
                            <p className="text-[11px] text-slate-400 line-clamp-1 max-w-xs">{cat.description}</p>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 font-mono text-[11px] text-slate-500">{cat.slug || '—'}</td>

                      <td className="py-3.5 text-slate-600">
                        {parentCat ? (
                          <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-xl text-[10px] font-bold flex items-center space-x-1 w-max">
                            <Layers className="w-3 h-3 text-slate-400" />
                            <span>Sub of {parentCat.name}</span>
                          </span>
                        ) : (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-xl text-[10px] font-extrabold flex items-center space-x-1 w-max">
                            <FolderTree className="w-3 h-3 text-emerald-600" />
                            <span>Top-Level Root Parent</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-2">
                        <button
                          onClick={() => handleToggleActive(catId)}
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all hover:scale-105 cursor-pointer ${
                            cat.status !== false ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                          title="Click to toggle Active / Inactive status"
                        >
                          {cat.status !== false ? 'ACTIVE' : 'INACTIVE'}
                        </button>
                      </td>

                      <td className="py-3.5 pr-2 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          {isParent && (
                            <button
                              onClick={() => handleOpenCreateSubModal(catId)}
                              className="px-2.5 py-1 text-[10px] font-bold text-brand-crimson bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors flex items-center space-x-1 mr-1"
                              title="Add Sub-Category under this Parent"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Sub-Cat</span>
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
                            onClick={() => handleDelete(catId)}
                            disabled={deletingId === catId}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors disabled:opacity-50"
                            title="Delete Category"
                          >
                            {deletingId === catId ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
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
      </div>

      {/* Modal: Create / Edit Category */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-lg font-extrabold text-brand-slate-dark">
                  {editingCategory
                    ? `Edit ${categoryType === 'parent' ? 'Parent Category' : 'Sub-Category'}`
                    : categoryType === 'parent'
                    ? 'Create Parent Category (Root)'
                    : 'Create Sub-Category'}
                </h3>
                <p className="text-[10px] text-slate-400 font-mono mt-1">
                  {editingCategory ? 'PUT /api/v1/categories/:id' : 'POST /api/v1/categories'} · multipart/form-data
                </p>
              </div>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setErrorMessage('');
                  setFormData(DEFAULT_FORM);
                  setEditingCategory(null);
                }}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Category Structure Radio Selector */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">Category Level & Structure</label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => handleCategoryTypeChange('parent')}
                    className={`py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center space-x-1.5 transition-all ${
                      categoryType === 'parent'
                        ? 'bg-amber-500 text-white shadow-md'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <FolderPlus className="w-3.5 h-3.5" />
                    <span>Parent Category (Root)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCategoryTypeChange('sub')}
                    className={`py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center space-x-1.5 transition-all ${
                      categoryType === 'sub'
                        ? 'bg-brand-crimson text-white shadow-md'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Sub-Category</span>
                  </button>
                </div>
              </div>

              {/* Category Name */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  Category Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder={categoryType === 'parent' ? "e.g. Women Ethnic Wear, Men Western, Footwear" : "e.g. Silk Sarees, Bridal Lehengas, Designer Kurtis"}
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-brand-crimson"
                />
              </div>

              {/* Parent Category Selection (Shown only when categoryType === 'sub') */}
              {categoryType === 'sub' && (
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">
                    Select Parent Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="parentId"
                    required
                    value={formData.parentId}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-brand-crimson"
                  >
                    <option value="" disabled>-- Select Parent Category --</option>
                    {parentCategories
                      .filter((c) => c._id !== editingCategory?._id)
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

              {/* Parent Category Informational Banner */}
              {categoryType === 'parent' && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-[11px] text-amber-900 font-semibold flex items-start space-x-2">
                  <FolderTree className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span>
                    Parent categories serve as top-level navigation roots in the main store megamenu and header bar.
                  </span>
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
                  placeholder="Brief summary of what this category contains..."
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-brand-crimson"
                />
              </div>

              {/* SEO Meta Box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 border border-gray-200 rounded-2xl p-3">
                <div className="sm:col-span-2">
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    SEO Meta Optimization (Optional)
                  </p>
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 mb-1">SEO Title</label>
                  <input
                    type="text"
                    name="seoTitle"
                    value={formData.seoTitle}
                    onChange={handleInputChange}
                    placeholder="Buy Designer Sarees Online"
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-brand-crimson"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 mb-1">SEO Description</label>
                  <input
                    type="text"
                    name="seoDescription"
                    value={formData.seoDescription}
                    onChange={handleInputChange}
                    placeholder="Explore exclusive silk sarees..."
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-brand-crimson"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-extrabold text-slate-700 mb-1">
                    SEO Keywords (Comma-Separated)
                  </label>
                  <input
                    type="text"
                    name="seoKeywords"
                    value={formData.seoKeywords}
                    onChange={handleInputChange}
                    placeholder="sarees, silk, lehenga, ethnic wear"
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-brand-crimson"
                  />
                </div>
              </div>

              {/* Image File Uploads */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1 flex items-center space-x-1">
                    <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                    <span>Category Thumbnail Image</span>
                    <span className="text-[10px] font-normal text-slate-400 ml-1">(JPG/PNG/WEBP, Max 5MB)</span>
                  </label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => handleFileChange(e, 'imageFile')}
                    className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-brand-crimson file:text-white hover:file:bg-brand-crimson-dark cursor-pointer"
                  />
                  {formData.imageFile && (
                    <p className="text-[10px] text-emerald-600 font-semibold mt-1">✓ {formData.imageFile.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1 flex items-center space-x-1">
                    <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                    <span>Category Header Banner</span>
                    <span className="text-[10px] font-normal text-slate-400 ml-1">(JPG/PNG/WEBP, Max 5MB)</span>
                  </label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => handleFileChange(e, 'bannerFile')}
                    className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 cursor-pointer"
                  />
                  {formData.bannerFile && (
                    <p className="text-[10px] text-emerald-600 font-semibold mt-1">✓ {formData.bannerFile.name}</p>
                  )}
                </div>
              </div>

              {/* Status Flag for Edit Mode */}
              {editingCategory && (
                <div className="pt-1">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="status"
                      checked={formData.status}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-brand-crimson focus:ring-brand-crimson"
                    />
                    <span className="text-xs font-bold text-slate-700">Active Category</span>
                  </label>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setErrorMessage('');
                    setFormData(DEFAULT_FORM);
                    setEditingCategory(null);
                  }}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
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
                      <span>{editingCategory ? 'SAVING...' : 'CREATING...'}</span>
                    </>
                  ) : (
                    <span>{editingCategory ? 'SAVE CHANGES' : categoryType === 'parent' ? 'CREATE PARENT CATEGORY' : 'CREATE SUB-CATEGORY'}</span>
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

export default AdminCategoriesPanel;
