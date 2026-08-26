import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Image, Plus, Trash2, X, RefreshCw, AlertCircle, Check, ToggleLeft, ToggleRight } from 'lucide-react';
import { adminApi, AdminBanner } from '../../api/admin';

const BANNER_TYPES = ['HOMEPAGE', 'OFFER', 'FESTIVAL', 'POPUP'] as const;
const BANNER_POSITIONS = ['TOP', 'MIDDLE', 'BOTTOM', 'SIDEBAR'] as const;

interface BannerFormData {
  title: string;
  type: string;
  position: string;
  linkUrl: string;
  displayOrder: string;
  isActive: boolean;
  imageFile: File | null;
  mobileImageFile: File | null;
}

const DEFAULT_FORM: BannerFormData = {
  title: '',
  type: 'HOMEPAGE',
  position: 'TOP',
  linkUrl: '',
  displayOrder: '1',
  isActive: true,
  imageFile: null,
  mobileImageFile: null,
};

export function AdminBannersPanel() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState<BannerFormData>(DEFAULT_FORM);

  const { data: banners = [], isLoading, refetch } = useQuery<AdminBanner[]>({
    queryKey: ['admin-banners'],
    queryFn: () => adminApi.getAllBanners(),
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'imageFile' | 'mobileImageFile') => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, [field]: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.imageFile) {
      setErrorMessage('Desktop banner image is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Build multipart/form-data as per guide §3.4
      const fd = new FormData();
      fd.append('title', formData.title);
      fd.append('type', formData.type);
      fd.append('position', formData.position);
      if (formData.linkUrl) fd.append('linkUrl', formData.linkUrl);
      fd.append('displayOrder', formData.displayOrder);
      fd.append('isActive', String(formData.isActive));
      fd.append('image', formData.imageFile);                                      // Required desktop image
      if (formData.mobileImageFile) fd.append('mobileImage', formData.mobileImageFile);  // Optional mobile image

      await adminApi.createBanner(fd);
      setSuccessMessage('Banner created successfully!');
      setTimeout(() => setSuccessMessage(''), 4000);
      setIsModalOpen(false);
      setFormData(DEFAULT_FORM);
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      refetch();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to create banner. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this banner permanently?')) return;
    setDeletingId(id);
    try {
      await adminApi.deleteBanner(id);
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      refetch();
    } catch (err) {
      console.error('Banner delete failed:', err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex items-start sm:items-center justify-between flex-wrap gap-4">
        <div className="flex items-center space-x-2">
          <Image className="w-5 h-5 text-brand-crimson" />
          <div>
            <h2 className="text-lg font-extrabold text-brand-slate-dark">Banners & Promotions</h2>
            <p className="text-xs text-slate-400">Manage homepage, offer and festival banners via POST /banners/admin</p>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center space-x-2 bg-brand-crimson hover:bg-brand-crimson-dark text-white font-extrabold text-xs px-5 py-3 rounded-2xl shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>ADD BANNER</span>
        </button>
      </div>

      {/* Success */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-3 text-xs font-bold flex items-center space-x-2">
          <Check className="w-4 h-4" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Banners Grid */}
      {isLoading ? (
        <div className="bg-white border border-gray-100 rounded-3xl p-16 flex items-center justify-center">
          <RefreshCw className="w-6 h-6 animate-spin text-slate-300" />
        </div>
      ) : banners.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-3xl p-16 text-center space-y-2">
          <Image className="w-10 h-10 text-slate-200 mx-auto" />
          <p className="text-sm font-extrabold text-slate-400">No banners yet</p>
          <p className="text-xs text-slate-400">Click "Add Banner" to create your first promotional banner.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {banners.map((banner) => (
            <div key={banner._id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
              {/* Image Preview */}
              <div className="relative h-36 bg-slate-100">
                <img
                  src={banner.imageUrl}
                  alt={banner.title}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=60'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent" />
                {/* Delete button */}
                <button
                  onClick={() => handleDelete(banner._id)}
                  disabled={deletingId === banner._id}
                  className="absolute top-2 right-2 p-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50"
                >
                  {deletingId === banner._id
                    ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    : <Trash2 className="w-3.5 h-3.5" />
                  }
                </button>
                {/* Status pill */}
                <div className={`absolute top-2 left-2 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${banner.isActive ? 'bg-emerald-500 text-white' : 'bg-slate-500 text-white'}`}>
                  {banner.isActive ? 'ACTIVE' : 'INACTIVE'}
                </div>
              </div>
              {/* Info */}
              <div className="p-3 space-y-1">
                <p className="text-xs font-extrabold text-brand-slate-dark truncate">{banner.title}</p>
                <div className="flex items-center space-x-2 flex-wrap gap-1">
                  <span className="text-[9px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{banner.type}</span>
                  <span className="text-[9px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{banner.position}</span>
                  <span className="text-[9px] text-slate-400">Order: {banner.displayOrder}</span>
                </div>
                {banner.linkUrl && (
                  <p className="text-[10px] text-brand-crimson truncate">{banner.linkUrl}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Banner Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-lg font-extrabold text-brand-slate-dark">Create Banner</h3>
                <p className="text-[10px] text-slate-400 font-mono mt-1">POST /banners/admin · multipart/form-data</p>
              </div>
              <button onClick={() => { setIsModalOpen(false); setErrorMessage(''); setFormData(DEFAULT_FORM); }}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors">
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

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">Banner Title <span className="text-rose-500">*</span></label>
                <input type="text" name="title" required value={formData.title} onChange={handleInputChange}
                  placeholder="Summer Festive Sale" className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-brand-crimson" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">Type <span className="text-rose-500">*</span></label>
                  <select name="type" value={formData.type} onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-semibold outline-none focus:border-brand-crimson">
                    {BANNER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">Position</label>
                  <select name="position" value={formData.position} onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-semibold outline-none focus:border-brand-crimson">
                    {BANNER_POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">Link URL</label>
                  <input type="text" name="linkUrl" value={formData.linkUrl} onChange={handleInputChange}
                    placeholder="/products/sarees" className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-brand-crimson" />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">Display Order</label>
                  <input type="number" name="displayOrder" min="1" value={formData.displayOrder} onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-brand-crimson" />
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  Desktop Image <span className="text-rose-500">*</span>
                  <span className="text-[10px] font-normal text-slate-400 ml-1">→ field name: "image" · Max 5MB · JPG/PNG/WEBP</span>
                </label>
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => handleFileChange(e, 'imageFile')}
                  className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-brand-crimson file:text-white hover:file:bg-brand-crimson-dark cursor-pointer" />
                {formData.imageFile && (
                  <p className="text-[10px] text-emerald-600 font-semibold mt-1">✓ {formData.imageFile.name}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  Mobile Image (optional)
                  <span className="text-[10px] font-normal text-slate-400 ml-1">→ field name: "mobileImage"</span>
                </label>
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => handleFileChange(e, 'mobileImageFile')}
                  className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 cursor-pointer" />
                {formData.mobileImageFile && (
                  <p className="text-[10px] text-emerald-600 font-semibold mt-1">✓ {formData.mobileImageFile.name}</p>
                )}
              </div>

              {/* Active Toggle */}
              <label className="flex items-center space-x-2 cursor-pointer">
                {formData.isActive
                  ? <ToggleRight className="w-6 h-6 text-emerald-500" />
                  : <ToggleLeft className="w-6 h-6 text-slate-400" />}
                <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleInputChange} className="sr-only" />
                <span className="text-xs font-bold text-slate-700">Active (visible on storefront)</span>
              </label>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => { setIsModalOpen(false); setErrorMessage(''); setFormData(DEFAULT_FORM); }}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-slate-600 hover:bg-slate-50">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting}
                  className="inline-flex items-center space-x-2 bg-brand-crimson hover:bg-brand-crimson-dark text-white font-extrabold text-xs px-6 py-2.5 rounded-xl transition-all disabled:opacity-50">
                  {isSubmitting ? <><RefreshCw className="w-4 h-4 animate-spin" /><span>UPLOADING...</span></> : <span>CREATE BANNER</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminBannersPanel;
