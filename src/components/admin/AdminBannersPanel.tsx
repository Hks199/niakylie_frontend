import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Image as ImageIcon, Plus, Trash2, Edit2, X, RefreshCw, AlertCircle, Check, Search, ToggleLeft, ToggleRight, ExternalLink, Calendar } from 'lucide-react';
import { bannersApi } from '../../api/banners';
import { Banner, BannerType, BannerPosition } from '../../types/banner';

interface BannerFormData {
  title: string;
  subtitle: string;
  type: BannerType | string;
  position: BannerPosition | string;
  linkUrl: string;
  linkLabel: string;
  displayOrder: number;
  isActive: boolean;
  startDate: string;
  endDate: string;
  imageFile: File | null;
  mobileImageFile: File | null;
}

const DEFAULT_FORM: BannerFormData = {
  title: '',
  subtitle: '',
  type: BannerType.HOMEPAGE,
  position: BannerPosition.TOP,
  linkUrl: '',
  linkLabel: 'Shop Collection',
  displayOrder: 0,
  isActive: true,
  startDate: '',
  endDate: '',
  imageFile: null,
  mobileImageFile: null,
};

export function AdminBannersPanel() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState<BannerFormData>(DEFAULT_FORM);

  const { data: bannersResponse, isLoading, refetch } = useQuery({
    queryKey: ['admin-banners'],
    queryFn: () => bannersApi.getAllBanners(),
  });

  const banners: Banner[] = Array.isArray(bannersResponse)
    ? bannersResponse
    : Array.isArray((bannersResponse as any)?.data)
    ? (bannersResponse as any).data
    : [];

  const filteredBanners = banners.filter((b) => {
    if (filterType !== 'ALL' && b.type !== filterType) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const titleMatch = b.title?.toLowerCase().includes(term);
      const subMatch = b.subtitle?.toLowerCase().includes(term);
      return titleMatch || subMatch;
    }
    return true;
  });

  const handleOpenCreateModal = () => {
    setEditingBanner(null);
    setFormData(DEFAULT_FORM);
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      type: banner.type || BannerType.HOMEPAGE,
      position: banner.position || BannerPosition.TOP,
      linkUrl: banner.linkUrl || '',
      linkLabel: banner.linkLabel || 'Shop Collection',
      displayOrder: banner.displayOrder !== undefined ? banner.displayOrder : 0,
      isActive: banner.isActive !== undefined ? banner.isActive : true,
      startDate: banner.startDate ? new Date(banner.startDate).toISOString().slice(0, 16) : '',
      endDate: banner.endDate ? new Date(banner.endDate).toISOString().slice(0, 16) : '',
      imageFile: null,
      mobileImageFile: null,
    });
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else if (name === 'displayOrder') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
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

    if (!formData.title.trim()) {
      setErrorMessage('Banner title is required.');
      return;
    }

    if (!editingBanner && !formData.imageFile) {
      setErrorMessage('Desktop banner image is required for new banners.');
      return;
    }

    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('title', formData.title.trim());
      fd.append('type', formData.type);
      if (formData.subtitle) fd.append('subtitle', formData.subtitle);
      if (formData.position) fd.append('position', formData.position);
      if (formData.linkUrl) fd.append('linkUrl', formData.linkUrl);
      if (formData.linkLabel) fd.append('linkLabel', formData.linkLabel);
      fd.append('displayOrder', String(formData.displayOrder));
      fd.append('isActive', String(formData.isActive));
      if (formData.startDate) fd.append('startDate', new Date(formData.startDate).toISOString());
      if (formData.endDate) fd.append('endDate', new Date(formData.endDate).toISOString());

      if (formData.imageFile) {
        fd.append('image', formData.imageFile);
      }
      if (formData.mobileImageFile) {
        fd.append('mobileImage', formData.mobileImageFile);
      }

      if (editingBanner) {
        await bannersApi.updateBanner(editingBanner._id, fd);
        setSuccessMessage('Banner updated successfully!');
      } else {
        await bannersApi.createBanner(fd);
        setSuccessMessage('Banner created successfully!');
      }

      setTimeout(() => setSuccessMessage(''), 4000);
      setIsModalOpen(false);
      setFormData(DEFAULT_FORM);
      setEditingBanner(null);
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      await refetch();
    } catch (err: any) {
      const rawMsg = err?.message || err?.error;
      const msg = Array.isArray(rawMsg) ? rawMsg.join(' · ') : typeof rawMsg === 'string' ? rawMsg : 'Failed to save banner.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (id: string) => {
    setTogglingId(id);
    try {
      await bannersApi.toggleActive(id);
      setSuccessMessage('Banner status updated!');
      setTimeout(() => setSuccessMessage(''), 3000);
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      refetch();
    } catch (err: any) {
      alert(err?.message || 'Failed to toggle banner status');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this promotional banner?')) return;
    setDeletingId(id);
    try {
      await bannersApi.deleteBanner(id);
      setSuccessMessage('Banner deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 4000);
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      refetch();
    } catch (err: any) {
      alert(err?.message || 'Failed to delete banner');
    } finally {
      setDeletingId(null);
    }
  };

  const resolveImageUrl = (path?: string) => {
    if (!path) return '';
    return path.startsWith('http') ? path : `http://localhost:3000${path}`;
  };

  return (
    <div className="space-y-5">
      {/* Header Card */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex items-start sm:items-center justify-between flex-wrap gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-crimson/10 text-brand-crimson flex items-center justify-center flex-shrink-0 font-bold">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-brand-slate-dark font-display">Banner & Hero Slider Management</h2>
            <p className="text-xs text-slate-400">Manage homepage hero carousels, offer banners, festival popups, and CTA links</p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={() => refetch()}
            className="p-2.5 rounded-2xl border border-gray-200 text-slate-600 hover:text-brand-crimson hover:border-brand-crimson transition-colors"
            title="Refresh Banners List"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center space-x-2 bg-brand-crimson hover:bg-brand-crimson-dark text-white font-extrabold text-xs px-5 py-3 rounded-2xl shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>ADD NEW BANNER</span>
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

      {/* Search & Filter Type Bar */}
      <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-sm flex items-center justify-between flex-wrap gap-3">
        <div className="relative flex-1 max-w-md min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search banner headline or subtitle..."
            className="w-full bg-slate-50 border border-gray-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:border-brand-crimson"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-2xl">
          {['ALL', BannerType.HOMEPAGE, BannerType.OFFER, BannerType.FESTIVAL, BannerType.POPUP].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                filterType === type
                  ? 'bg-brand-crimson text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Banners Grid / Table */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-16 flex items-center justify-center space-x-2">
            <RefreshCw className="w-6 h-6 animate-spin text-slate-300" />
            <span className="text-xs text-slate-400 font-semibold">Loading banners...</span>
          </div>
        ) : filteredBanners.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <ImageIcon className="w-12 h-12 text-slate-200 mx-auto" />
            <div>
              <p className="text-sm font-extrabold text-slate-600">No Banners Found</p>
              <p className="text-xs text-slate-400">Click "ADD NEW BANNER" to create promotional hero sliders.</p>
            </div>
            <button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center space-x-1.5 text-xs font-extrabold text-brand-crimson hover:underline"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create First Banner</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredBanners.map((banner) => (
              <div
                key={banner._id}
                className="bg-slate-50 border border-gray-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
              >
                {/* Image Banner Preview */}
                <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                  <img
                    src={resolveImageUrl(banner.imageUrl)}
                    alt={banner.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent p-3 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="bg-slate-950/70 text-amber-400 backdrop-blur-md text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border border-amber-500/20">
                        {banner.type} · ORDER #{banner.displayOrder || 0}
                      </span>
                      <button
                        onClick={() => handleToggleActive(banner._id)}
                        disabled={togglingId === banner._id}
                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center space-x-1 backdrop-blur-md shadow-sm transition-all ${
                          banner.isActive
                            ? 'bg-emerald-500/90 text-white'
                            : 'bg-slate-800/90 text-slate-400'
                        }`}
                      >
                        {togglingId === banner._id ? (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : banner.isActive ? (
                          <>
                            <ToggleRight className="w-3.5 h-3.5" />
                            <span>ACTIVE</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="w-3.5 h-3.5" />
                            <span>INACTIVE</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div>
                      <h3 className="text-white font-extrabold text-sm line-clamp-1">{banner.title}</h3>
                      {banner.subtitle && (
                        <p className="text-slate-300 text-[11px] line-clamp-1">{banner.subtitle}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Banner Details Body */}
                <div className="p-4 space-y-3 text-xs text-slate-600 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    {banner.linkUrl && (
                      <div className="flex items-center space-x-1.5 text-[11px] text-brand-crimson font-bold">
                        <ExternalLink className="w-3 h-3" />
                        <a href={banner.linkUrl} target="_blank" rel="noreferrer" className="hover:underline line-clamp-1">
                          {banner.linkLabel || 'CTA Link'}: {banner.linkUrl}
                        </a>
                      </div>
                    )}
                    {banner.mobileImageUrl && (
                      <div className="text-[10px] text-emerald-600 font-semibold flex items-center space-x-1">
                        <Check className="w-3 h-3" />
                        <span>Mobile Image Uploaded</span>
                      </div>
                    )}
                    {(banner.startDate || banner.endDate) && (
                      <div className="text-[10px] text-slate-400 flex items-center space-x-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>
                          {banner.startDate ? new Date(banner.startDate).toLocaleDateString() : 'Now'} —{' '}
                          {banner.endDate ? new Date(banner.endDate).toLocaleDateString() : 'Forever'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-gray-200/60 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">POS: {banner.position || 'TOP'}</span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleOpenEditModal(banner)}
                        className="px-3 py-1.5 bg-white border border-gray-200 hover:border-brand-crimson hover:text-brand-crimson text-slate-700 font-extrabold rounded-xl transition-all flex items-center space-x-1 text-[11px]"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(banner._id)}
                        disabled={deletingId === banner._id}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors disabled:opacity-50"
                        title="Delete Banner"
                      >
                        {deletingId === banner._id ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Create / Edit Banner */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-lg font-extrabold text-brand-slate-dark">
                  {editingBanner ? 'Edit Promotional Banner' : 'Create New Banner'}
                </h3>
                <p className="text-[10px] text-slate-400 font-mono mt-1">
                  {editingBanner ? 'PUT /api/v1/banners/admin/:id' : 'POST /api/v1/banners/admin'} · multipart/form-data
                </p>
              </div>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setErrorMessage('');
                  setFormData(DEFAULT_FORM);
                  setEditingBanner(null);
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

              {/* Title */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  Banner Headline Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g. Festive Royal Banarasi Edit, Grand Clearance Sale"
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-brand-crimson"
                />
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">Subtitle Caption</label>
                <input
                  type="text"
                  name="subtitle"
                  value={formData.subtitle}
                  onChange={handleInputChange}
                  placeholder="e.g. Flat 40% Off on Designer Wear"
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-brand-crimson"
                />
              </div>

              {/* Type & Position Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">Banner Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-brand-crimson"
                  >
                    <option value={BannerType.HOMEPAGE}>HOMEPAGE (Hero Slider)</option>
                    <option value={BannerType.OFFER}>OFFER (Promo Grid)</option>
                    <option value={BannerType.FESTIVAL}>FESTIVAL (Seasonal)</option>
                    <option value={BannerType.POPUP}>POPUP (Modal)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">Display Position</label>
                  <select
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-brand-crimson"
                  >
                    <option value={BannerPosition.TOP}>TOP</option>
                    <option value={BannerPosition.MIDDLE}>MIDDLE</option>
                    <option value={BannerPosition.BOTTOM}>BOTTOM</option>
                    <option value={BannerPosition.SIDEBAR}>SIDEBAR</option>
                  </select>
                </div>
              </div>

              {/* Link URL & CTA Label Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">Landing Target URL</label>
                  <input
                    type="text"
                    name="linkUrl"
                    value={formData.linkUrl}
                    onChange={handleInputChange}
                    placeholder="/category/sarees or /sale"
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-brand-crimson"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">CTA Button Text</label>
                  <input
                    type="text"
                    name="linkLabel"
                    value={formData.linkLabel}
                    onChange={handleInputChange}
                    placeholder="Shop Collection"
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-brand-crimson"
                  />
                </div>
              </div>

              {/* Display Order */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">Display Sort Order (Number)</label>
                <input
                  type="number"
                  name="displayOrder"
                  min={0}
                  value={formData.displayOrder}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-brand-crimson"
                />
              </div>

              {/* Desktop Image File */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1 flex items-center space-x-1">
                  <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                  <span>Desktop Banner Image {!editingBanner && <span className="text-rose-500">*</span>}</span>
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

              {/* Mobile Image File */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1 flex items-center space-x-1">
                  <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                  <span>Mobile Banner Image (Optional)</span>
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => handleFileChange(e, 'mobileImageFile')}
                  className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 cursor-pointer"
                />
                {formData.mobileImageFile && (
                  <p className="text-[10px] text-emerald-600 font-semibold mt-1">✓ {formData.mobileImageFile.name}</p>
                )}
              </div>

              {/* Active Toggle Checkbox */}
              <div>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-brand-crimson focus:ring-brand-crimson"
                  />
                  <span className="text-xs font-bold text-slate-700">Banner is Active & Visible</span>
                </label>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setErrorMessage('');
                    setFormData(DEFAULT_FORM);
                    setEditingBanner(null);
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
                      <span>{editingBanner ? 'SAVING...' : 'CREATING...'}</span>
                    </>
                  ) : (
                    <span>{editingBanner ? 'SAVE CHANGES' : 'CREATE BANNER'}</span>
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

export default AdminBannersPanel;
