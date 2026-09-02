import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Award, Plus, Trash2, Edit2, X, RefreshCw, AlertCircle, Check, Image as ImageIcon, Search } from 'lucide-react';
import { brandsApi } from '../../api/brands';
import { Brand } from '../../types/brand';

interface BrandFormData {
  name: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  status: boolean;
  logoFile: File | null;
}

const DEFAULT_FORM: BrandFormData = {
  name: '',
  description: '',
  seoTitle: '',
  seoDescription: '',
  seoKeywords: '',
  status: true,
  logoFile: null,
};

export function AdminBrandsPanel() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState<BrandFormData>(DEFAULT_FORM);

  const { data: brandsResponse, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['admin-brands', searchTerm],
    queryFn: async () => {
      return await brandsApi.getBrands({ search: searchTerm.trim() || undefined, limit: 100 });
    },
  });

  const brands: Brand[] = brandsResponse?.data || [];

  const handleOpenCreateModal = () => {
    setEditingBrand(null);
    setFormData(DEFAULT_FORM);
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (b: Brand) => {
    setEditingBrand(b);
    setFormData({
      name: b.name || '',
      description: b.description || '',
      seoTitle: b.seoTitle || '',
      seoDescription: b.seoDescription || '',
      seoKeywords: Array.isArray(b.seoKeywords) ? b.seoKeywords.join(', ') : '',
      status: b.status !== undefined ? b.status : true,
      logoFile: null,
    });
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, logoFile: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.name.trim()) {
      setErrorMessage('Brand name is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('name', formData.name.trim());
      if (formData.description) fd.append('description', formData.description);
      if (formData.seoTitle) fd.append('seoTitle', formData.seoTitle);
      if (formData.seoDescription) fd.append('seoDescription', formData.seoDescription);
      
      if (formData.seoKeywords.trim()) {
        const keywordsArray = formData.seoKeywords.split(',').map((k) => k.trim()).filter(Boolean);
        keywordsArray.forEach((kw) => fd.append('seoKeywords', kw));
      }

      if (formData.logoFile) {
        fd.append('logo', formData.logoFile);
      }

      if (editingBrand) {
        fd.append('status', String(formData.status));
        const brandId = editingBrand._id || (editingBrand as any).id;
        await brandsApi.updateBrand(brandId, fd);
        setSuccessMessage('Brand updated successfully!');
      } else {
        await brandsApi.createBrand(fd);
        setSuccessMessage('Brand created successfully!');
      }

      setTimeout(() => setSuccessMessage(''), 4000);
      setIsModalOpen(false);
      setFormData(DEFAULT_FORM);
      setEditingBrand(null);
      queryClient.invalidateQueries({ queryKey: ['admin-brands'] });
      await refetch();
    } catch (err: any) {
      const rawMsg = err?.message || err?.error;
      const msg = Array.isArray(rawMsg)
        ? rawMsg.join(' · ')
        : typeof rawMsg === 'string'
        ? rawMsg
        : 'Failed to save brand.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this brand? Products associated with it will remain unaffected.')) return;
    setDeletingId(id);
    try {
      await brandsApi.deleteBrand(id);
      setSuccessMessage('Brand deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 4000);
      queryClient.invalidateQueries({ queryKey: ['admin-brands'] });
      refetch();
    } catch (err: any) {
      alert(err?.message || 'Failed to delete brand');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Header Card */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex items-start sm:items-center justify-between flex-wrap gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center flex-shrink-0 font-bold">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-brand-slate-dark font-display">Brand Management</h2>
            <p className="text-xs text-slate-400">Create, manage, and upload logos for fashion & designer brands (POST/PUT/DELETE /api/v1/brands)</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ['admin-brands'] });
              refetch();
            }}
            disabled={isRefetching}
            className="p-2.5 rounded-2xl border border-gray-200 text-slate-600 hover:text-brand-crimson hover:border-brand-crimson transition-colors disabled:opacity-50"
            title="Refresh Brands List"
          >
            <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin text-brand-crimson' : ''}`} />
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center space-x-2 bg-brand-crimson hover:bg-brand-crimson-dark text-white font-extrabold text-xs px-5 py-3 rounded-2xl shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>ADD BRAND</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-3 text-xs font-bold flex items-center space-x-2 animate-in fade-in duration-200">
          <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-sm flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search brand name or slug..."
            className="w-full bg-slate-50 border border-gray-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:border-brand-crimson"
          />
        </div>
        <p className="text-xs font-bold text-slate-400 hidden sm:block">
          Total Brands: <span className="text-brand-slate-dark">{brands.length}</span>
        </p>
      </div>

      {/* Brands Table Card */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-16 flex items-center justify-center space-x-2">
            <RefreshCw className="w-6 h-6 animate-spin text-slate-300" />
            <span className="text-xs text-slate-400 font-semibold">Loading brand catalog...</span>
          </div>
        ) : brands.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Award className="w-12 h-12 text-slate-200 mx-auto" />
            <div>
              <p className="text-sm font-extrabold text-slate-600">No Brands Found</p>
              <p className="text-xs text-slate-400">Click "ADD BRAND" above to create your first brand partner.</p>
            </div>
            <button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center space-x-1.5 text-xs font-extrabold text-brand-crimson hover:underline"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Brand Now</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">
                  <th className="pb-3 pl-2">Brand Profile</th>
                  <th className="pb-3">Slug</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Created Date</th>
                  <th className="pb-3 pr-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-xs font-semibold">
                {brands.map((b) => {
                  const brandId = b._id || b.id || '';
                  const logoUrl = b.logo
                    ? b.logo.startsWith('http')
                      ? b.logo
                      : `http://localhost:3000${b.logo}`
                    : null;

                  return (
                    <tr key={brandId} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 pl-2 flex items-center space-x-3">
                        {logoUrl ? (
                          <img
                            src={logoUrl}
                            alt={b.name}
                            className="w-10 h-10 rounded-xl object-contain bg-slate-50 p-1 border border-gray-100"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700 font-extrabold text-sm uppercase">
                            {b.name?.[0] || 'B'}
                          </div>
                        )}
                        <div>
                          <p className="font-extrabold text-brand-slate-dark text-sm">{b.name}</p>
                          {b.description && (
                            <p className="text-[11px] text-slate-400 line-clamp-1 max-w-sm">{b.description}</p>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 font-mono text-[11px] text-slate-500">{b.slug || '—'}</td>

                      <td className="py-3.5">
                        <span
                          className={`text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                            b.status !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {b.status !== false ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>

                      <td className="py-3.5 text-slate-400 text-[11px]">
                        {b.createdAt
                          ? new Date(b.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })
                          : '—'}
                      </td>

                      <td className="py-3.5 pr-2 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => handleOpenEditModal(b)}
                            className="p-2 text-slate-400 hover:text-brand-crimson hover:bg-rose-50 rounded-xl transition-colors"
                            title="Edit Brand Details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(brandId)}
                            disabled={deletingId === brandId}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors disabled:opacity-50"
                            title="Delete Brand"
                          >
                            {deletingId === brandId ? (
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

      {/* Modal: Create / Edit Brand */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-lg font-extrabold text-brand-slate-dark">
                  {editingBrand ? 'Edit Brand' : 'Create Brand'}
                </h3>
                <p className="text-[10px] text-slate-400 font-mono mt-1">
                  {editingBrand ? 'PUT /api/v1/brands/:id' : 'POST /api/v1/brands'} · multipart/form-data
                </p>
              </div>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setErrorMessage('');
                  setFormData(DEFAULT_FORM);
                  setEditingBrand(null);
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

              {/* Brand Name */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  Brand Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Zara, NiaKylie Luxe, Anita Dongre"
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-brand-crimson"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">Brand Profile Description</label>
                <textarea
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Brief summary of brand background, couture specialties, or heritage..."
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-brand-crimson"
                />
              </div>

              {/* Brand Logo Upload */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1 flex items-center space-x-1">
                  <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                  <span>Brand Logo Image</span>
                  <span className="text-[10px] font-normal text-slate-400 ml-1">(JPG/PNG/WEBP, Max 5MB)</span>
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-brand-crimson file:text-white hover:file:bg-brand-crimson-dark cursor-pointer"
                />
                {formData.logoFile && (
                  <p className="text-[10px] text-emerald-600 font-semibold mt-1">✓ {formData.logoFile.name}</p>
                )}
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
                    placeholder="Shop Zara Clothing Online"
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
                    placeholder="Exclusive designer collection..."
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
                    placeholder="zara, couture, dresses, women fashion"
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-brand-crimson"
                  />
                </div>
              </div>

              {/* Status Flag for Edit Mode */}
              {editingBrand && (
                <div className="pt-1">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="status"
                      checked={formData.status}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-brand-crimson focus:ring-brand-crimson"
                    />
                    <span className="text-xs font-bold text-slate-700">Active Brand Partner</span>
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
                    setEditingBrand(null);
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
                      <span>{editingBrand ? 'SAVING...' : 'CREATING...'}</span>
                    </>
                  ) : (
                    <span>{editingBrand ? 'SAVE CHANGES' : 'CREATE BRAND'}</span>
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

export default AdminBrandsPanel;
