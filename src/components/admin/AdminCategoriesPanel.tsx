import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FolderTree, Plus, Trash2, Edit2, X, RefreshCw, AlertCircle, Check, Image as ImageIcon } from 'lucide-react';
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState<CategoryFormData>(DEFAULT_FORM);

  const { data: categoriesResponse, isLoading, refetch } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      return await categoriesApi.getCategories({ limit: 100 });
    },
  });

  const categories: Category[] = Array.isArray(categoriesResponse)
    ? categoriesResponse
    : Array.isArray(categoriesResponse?.data)
    ? categoriesResponse.data
    : [];

  const handleOpenCreateModal = () => {
    setEditingCategory(null);
    setFormData(DEFAULT_FORM);
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name || '',
      parentId: cat.parentId || '',
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

    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('name', formData.name.trim());
      if (formData.parentId) fd.append('parentId', formData.parentId);
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
        setSuccessMessage('Category updated successfully!');
      } else {
        await categoriesApi.createCategory(fd);
        setSuccessMessage('Category created successfully!');
      }

      setTimeout(() => setSuccessMessage(''), 4000);
      setIsModalOpen(false);
      setFormData(DEFAULT_FORM);
      setEditingCategory(null);
      queryClient.invalidateQueries();
      await refetch();
    } catch (err: any) {
      const rawMsg = err?.message || err?.error;
      const msg = Array.isArray(rawMsg) ? rawMsg.join(' · ') : typeof rawMsg === 'string' ? rawMsg : 'Failed to save category.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? Sub-categories may also be affected.')) return;
    setDeletingId(id);
    try {
      await categoriesApi.deleteCategory(id);
      setSuccessMessage('Category deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 4000);
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      refetch();
    } catch (err: any) {
      alert(err?.message || 'Failed to delete category');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex items-start sm:items-center justify-between flex-wrap gap-4">
        <div className="flex items-center space-x-2">
          <FolderTree className="w-5 h-5 text-brand-crimson" />
          <div>
            <h2 className="text-lg font-extrabold text-brand-slate-dark">Category Management</h2>
            <p className="text-xs text-slate-400">Manage categories, sub-categories, and SEO taxonomies via POST/PUT/DELETE /categories</p>
          </div>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center space-x-2 bg-brand-crimson hover:bg-brand-crimson-dark text-white font-extrabold text-xs px-5 py-3 rounded-2xl shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>ADD CATEGORY</span>
        </button>
      </div>

      {/* Success Banner */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-3 text-xs font-bold flex items-center space-x-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Categories Grid / Table */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-16 flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin text-slate-300" />
          </div>
        ) : categories.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <FolderTree className="w-10 h-10 text-slate-200 mx-auto" />
            <p className="text-sm font-extrabold text-slate-400">No categories found</p>
            <p className="text-xs text-slate-400">Click "Add Category" to create your first category.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">
                  <th className="pb-3 pl-2">Category</th>
                  <th className="pb-3">Slug</th>
                  <th className="pb-3">Parent</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 pr-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-xs font-semibold">
                {categories.map((cat, idx) => {
                  const parentIdVal = typeof cat.parentId === 'object' && cat.parentId ? ((cat.parentId as any)._id || (cat.parentId as any).id) : cat.parentId;
                  const parentCat = parentIdVal
                    ? categories.find((c) => (c._id || (c as any).id) === parentIdVal)
                    : null;
                  const catId = cat._id || (cat as any).id || `cat-${idx}`;
                  return (
                    <tr key={catId} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 pl-2 flex items-center space-x-3">
                        {cat.image ? (
                          <img src={cat.image.startsWith('http') ? cat.image : `http://localhost:3000${cat.image}`} alt={cat.name} className="w-10 h-10 rounded-xl object-cover border border-gray-100" />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-brand-crimson font-extrabold text-xs">
                            {cat.name?.[0]?.toUpperCase() || 'C'}
                          </div>
                        )}
                        <div>
                          <p className="font-extrabold text-brand-slate-dark">{cat.name}</p>
                          {cat.description && <p className="text-[10px] text-slate-400 line-clamp-1 max-w-xs">{cat.description}</p>}
                        </div>
                      </td>
                      <td className="py-3 font-mono text-[11px] text-slate-500">{cat.slug || '—'}</td>
                      <td className="py-3 text-slate-600">
                        {parentCat ? (
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-[10px] font-bold">
                            Sub of {parentCat.name}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px]">Root Category</span>
                        )}
                      </td>
                      <td className="py-3">
                        <span className={`text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${cat.status !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                          {cat.status !== false ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                      <td className="py-3 pr-2 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => handleOpenEditModal(cat)}
                            className="p-2 text-slate-400 hover:text-brand-crimson hover:bg-rose-50 rounded-xl transition-colors"
                            title="Edit Category"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(cat._id)}
                            disabled={deletingId === cat._id}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors disabled:opacity-50"
                            title="Delete Category"
                          >
                            {deletingId === cat._id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
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
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-lg font-extrabold text-brand-slate-dark">
                  {editingCategory ? 'Edit Category' : 'Create Category'}
                </h3>
                <p className="text-[10px] text-slate-400 font-mono mt-1">
                  {editingCategory ? 'PUT /api/v1/categories/:id' : 'POST /api/v1/categories'} · multipart/form-data
                </p>
              </div>
              <button
                onClick={() => { setIsModalOpen(false); setErrorMessage(''); setFormData(DEFAULT_FORM); setEditingCategory(null); }}
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

              {/* Name */}
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
                  placeholder="e.g. Sarees, Lehengas, Designer Suits"
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-brand-crimson"
                />
              </div>

              {/* Parent Category */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  Parent Category <span className="text-[10px] font-normal text-slate-400 ml-1">(optional, for sub-categories)</span>
                </label>
                <select
                  name="parentId"
                  value={formData.parentId}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-brand-crimson"
                >
                  <option value="">None (Top-Level Root Category)</option>
                  {categories
                    .filter((c) => c._id !== editingCategory?._id)
                    .map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>

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

              {/* SEO Meta */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 border border-gray-200 rounded-2xl p-3">
                <div className="sm:col-span-2">
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">SEO Optimization (Optional)</p>
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
                  <label className="block text-[11px] font-extrabold text-slate-700 mb-1">SEO Keywords (Comma-Separated)</label>
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

              {/* Image files upload */}
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

              {/* Status flag for edit mode */}
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

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); setErrorMessage(''); setFormData(DEFAULT_FORM); setEditingCategory(null); }}
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
                    <span>{editingCategory ? 'SAVE CHANGES' : 'CREATE CATEGORY'}</span>
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
