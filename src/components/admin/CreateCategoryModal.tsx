import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  X,
  Upload,
  Layers,
  FolderPlus,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Globe,
  Trash2,
} from 'lucide-react';
import { categoriesApi, CreateCategoryPayload } from '../../api/categories';
import { useCategories } from '../../hooks/useCategories';
import { Category } from '../../types/category';

export interface CreateCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategoryType?: 'main' | 'sub';
  initialParentId?: string;
  onSuccess?: (newCategory?: Category) => void;
}

export const CreateCategoryModal: React.FC<CreateCategoryModalProps> = ({
  isOpen,
  onClose,
  initialCategoryType = 'main',
  initialParentId = '',
  onSuccess,
}) => {
  const queryClient = useQueryClient();

  // Fetch existing root parent categories for sub-category parent selection dropdown
  const { rootCategories, isLoading: isLoadingParents } = useCategories({ limit: 500 });

  // 2-Level Hierarchy Toggle: 'main' (Level 1) vs 'sub' (Level 2)
  const [categoryType, setCategoryType] = useState<'main' | 'sub'>(initialCategoryType);
  const [parentId, setParentId] = useState<string>(initialParentId);

  // Core Form Fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [isSlugTouched, setIsSlugTouched] = useState(false);
  const [description, setDescription] = useState('');
  const [displayOrder, setDisplayOrder] = useState<number>(0);
  const [status, setStatus] = useState<boolean>(true);

  // SEO Meta Section (Collapsible)
  const [isSeoOpen, setIsSeoOpen] = useState(false);
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');

  // File Upload State & Previews
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  // UI State: submitting, errors, success toast
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Sync initial props whenever modal opens or initial values change
  useEffect(() => {
    if (isOpen) {
      setCategoryType(initialCategoryType);
      if (initialCategoryType === 'sub' && initialParentId) {
        setParentId(initialParentId);
      } else if (initialCategoryType === 'sub' && rootCategories.length > 0 && !parentId) {
        const firstParentId = rootCategories[0]._id || (rootCategories[0] as any).id;
        setParentId(firstParentId);
      }
    }
  }, [isOpen, initialCategoryType, initialParentId]);

  // Real-time Slug Generation from Name (unless manually modified by user)
  useEffect(() => {
    if (!isSlugTouched) {
      const generatedSlug = name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      setSlug(generatedSlug);
    }
  }, [name, isSlugTouched]);

  // Handle auto parent ID assignment when switching hierarchy toggle
  const handleCategoryTypeSwitch = (type: 'main' | 'sub') => {
    setCategoryType(type);
    if (type === 'main') {
      setParentId('');
    } else if (type === 'sub' && !parentId && rootCategories.length > 0) {
      const defaultId = rootCategories[0]._id || (rootCategories[0] as any).id;
      setParentId(defaultId);
    }
  };

  // Image Upload Handlers
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveBanner = () => {
    setBannerFile(null);
    if (bannerPreview) URL.revokeObjectURL(bannerPreview);
    setBannerPreview(null);
  };

  // Reset form fields state
  const resetForm = () => {
    setName('');
    setSlug('');
    setIsSlugTouched(false);
    setParentId('');
    setDescription('');
    setDisplayOrder(0);
    setStatus(true);
    setSeoTitle('');
    setSeoDescription('');
    setSeoKeywords('');
    setImageFile(null);
    setBannerFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    if (bannerPreview) URL.revokeObjectURL(bannerPreview);
    setImagePreview(null);
    setBannerPreview(null);
    setErrorMessage('');
    setSuccessMessage('');
    setIsSeoOpen(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Form Submission & API Integration
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!name.trim()) {
      setErrorMessage('Category name is required.');
      return;
    }

    if (categoryType === 'sub' && !parentId) {
      setErrorMessage('Please select a Parent Category for this Sub-Category.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: CreateCategoryPayload = {
        name: name.trim(),
        slug: slug.trim() || undefined,
        parentId: categoryType === 'sub' ? parentId : null,
        description: description.trim() || undefined,
        displayOrder: Number(displayOrder) || 0,
        status: status,
        seoTitle: seoTitle.trim() || undefined,
        seoDescription: seoDescription.trim() || undefined,
        seoKeywords: seoKeywords.trim() || undefined,
        imageFile: imageFile,
        bannerFile: bannerFile,
      };

      const createdCat = await categoriesApi.createCategory(payload);

      setSuccessMessage(
        categoryType === 'main'
          ? 'Main Category (Level 1) created successfully!'
          : 'Sub-Category (Level 2) created successfully!'
      );

      // Force immediate re-fetching of all category queries across admin and storefront
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['admin-categories'] }),
        queryClient.refetchQueries({ queryKey: ['categories-list'] }),
        queryClient.refetchQueries({ queryKey: ['megamenu-categories'] }),
        queryClient.refetchQueries({ queryKey: ['category-tree'] }),
        queryClient.refetchQueries({ queryKey: ['filter-categories-list'] }),
      ]);

      if (onSuccess) {
        onSuccess(createdCat);
      }

      setTimeout(() => {
        handleClose();
      }, 1200);
    } catch (err: any) {
      console.error('Failed to create category:', err);
      const rawMsg = err?.response?.data?.message || err?.message || err?.error || 'Failed to create category.';
      const msg = Array.isArray(rawMsg) ? rawMsg.join(' · ') : String(rawMsg);
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-100">
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-slate-900 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl bg-brand-crimson/20 text-brand-crimson flex items-center justify-center font-bold flex-shrink-0">
              {categoryType === 'main' ? <FolderPlus className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" /> : <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-brand-crimson" />}
            </div>
            <div>
              <h2 className="text-xs sm:text-base font-extrabold text-white tracking-wide font-display">
                Create {categoryType === 'main' ? 'Main Category (Level 1)' : 'Sub-Category (Level 2)'}
              </h2>
              <p className="text-[9px] sm:text-[11px] text-slate-400 font-mono">POST /api/v1/categories · multipart/form-data</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 sm:p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Close Modal"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-3 sm:p-7 overflow-y-auto space-y-3.5 sm:space-y-5 flex-1 max-h-[72vh]">
          {/* Notification Feedback Banners */}
          {errorMessage && (
            <div className="p-3 sm:p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-semibold flex items-start space-x-2 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-extrabold">Error Creating Category</p>
                <p className="mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="p-3 sm:p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-semibold flex items-start space-x-2 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-extrabold">Success!</p>
                <p className="mt-0.5">{successMessage}</p>
              </div>
            </div>
          )}

          <form id="createCategoryForm" onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-5 text-[11px] sm:text-xs">
            {/* 2-Level Hierarchy Toggle */}
            <div>
              <label className="block text-[10px] sm:text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                Category Level & Hierarchy
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2.5 p-1 sm:p-1.5 bg-slate-100 rounded-xl sm:rounded-2xl">
                <button
                  type="button"
                  onClick={() => handleCategoryTypeSwitch('main')}
                  className={`py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-extrabold flex items-center justify-center space-x-1.5 sm:space-x-2 transition-all ${
                    categoryType === 'main'
                      ? 'bg-slate-900 text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <FolderPlus className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${categoryType === 'main' ? 'text-amber-400' : 'text-slate-500'}`} />
                  <span>Main Category (Level 1)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCategoryTypeSwitch('sub')}
                  className={`py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-extrabold flex items-center justify-center space-x-1.5 sm:space-x-2 transition-all ${
                    categoryType === 'sub'
                      ? 'bg-brand-crimson text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <Layers className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${categoryType === 'sub' ? 'text-white' : 'text-slate-500'}`} />
                  <span>Sub-Category (Level 2)</span>
                </button>
              </div>
            </div>

            {/* Parent Category Selection Dropdown (Only for Sub-Category) */}
            {categoryType === 'sub' && (
              <div className="animate-in fade-in duration-200">
                <label className="block text-[10px] sm:text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                  Select Parent Category (Level 1) <span className="text-rose-500">*</span>
                </label>
                <select
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  required
                  disabled={isLoadingParents}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 text-[11px] sm:text-xs font-semibold text-slate-800 outline-none focus:border-brand-crimson focus:ring-2 focus:ring-brand-crimson/10 disabled:opacity-60"
                >
                  <option value="" disabled>
                    {isLoadingParents ? 'Loading Parent Categories...' : '-- Select Parent Category --'}
                  </option>
                  {rootCategories.map((cat) => {
                    const catId = cat._id || (cat as any).id;
                    return (
                      <option key={catId} value={catId}>
                        {cat.name} ({cat.slug})
                      </option>
                    );
                  })}
                </select>
                {rootCategories.length === 0 && !isLoadingParents && (
                  <p className="text-[10px] sm:text-[11px] text-amber-600 font-semibold mt-1">
                    ⚠️ No main parent categories found. Create a Main Category first!
                  </p>
                )}
              </div>
            )}

            {/* Main Category Informational Hint */}
            {categoryType === 'main' && (
              <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 text-[10px] sm:text-[11px] text-amber-900 font-semibold flex items-center space-x-1.5">
                <FolderPlus className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                <span>Main Categories (`parentId = null`) serve as top-level navigation roots in the megamenu.</span>
              </div>
            )}

            {/* Name & Slug */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-[10px] sm:text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                  Category Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder={categoryType === 'main' ? "e.g. Women Ethnic Wear" : "e.g. Silk Sarees"}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 text-[11px] sm:text-xs font-semibold text-slate-800 outline-none focus:border-brand-crimson focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] sm:text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>URL Slug</span>
                  <span className="text-[9px] sm:text-[10px] text-slate-400 normal-case font-normal">(Auto-generated)</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => {
                      setSlug(e.target.value);
                      setIsSlugTouched(true);
                    }}
                    placeholder="e.g. ethnic-wear"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 text-[11px] sm:text-xs font-mono font-semibold text-slate-700 outline-none focus:border-brand-crimson focus:bg-white"
                  />
                  <Sparkles className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-[10px] sm:text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Write a brief overview of this category for shoppers and megamenu tooltips..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 text-[11px] sm:text-xs font-semibold text-slate-800 outline-none focus:border-brand-crimson focus:bg-white"
              />
            </div>

            {/* Status & Display Order */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 bg-slate-50 border border-slate-200/80 rounded-xl sm:rounded-2xl p-3 sm:p-4">
              <div>
                <label className="block text-[10px] sm:text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                  Display Order Priority
                </label>
                <input
                  type="number"
                  min={0}
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(Number(e.target.value))}
                  placeholder="0"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold text-slate-800 outline-none focus:border-brand-crimson"
                />
                <p className="text-[9px] sm:text-[10px] text-slate-400 mt-1">Lower numbers appear first in lists.</p>
              </div>

              <div className="flex items-center justify-between sm:justify-center sm:flex-col sm:items-start pt-1 sm:pt-0">
                <label className="block text-[10px] sm:text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                  Active Status
                </label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={status}
                    onChange={(e) => setStatus(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5.5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-emerald-500"></div>
                  <span className="ml-2.5 text-[11px] sm:text-xs font-bold text-slate-700">
                    {status ? 'Active' : 'Inactive'}
                  </span>
                </label>
              </div>
            </div>

            {/* File Uploads: Thumbnail Image & Header Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* Category Thumbnail Image */}
              <div>
                <label className="block text-[10px] sm:text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1 flex items-center space-x-1">
                  <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                  <span>Category Thumbnail</span>
                </label>

                {imagePreview ? (
                  <div className="relative group border border-slate-200 rounded-xl sm:rounded-2xl overflow-hidden bg-slate-900 flex items-center justify-center h-24 sm:h-28">
                    <img src={imagePreview} alt="Thumbnail Preview" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full transition-transform group-hover:scale-105"
                      title="Remove image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-slate-200 hover:border-brand-crimson/50 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col items-center justify-center bg-slate-50/50 hover:bg-slate-100/50 transition-colors cursor-pointer text-center h-24 sm:h-28">
                    <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 mb-1" />
                    <span className="text-[10px] sm:text-[11px] font-extrabold text-slate-600">Upload Thumbnail</span>
                    <span className="text-[9px] sm:text-[10px] text-slate-400">JPG, PNG, WEBP (Max 5MB)</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Category Header Banner */}
              <div>
                <label className="block text-[10px] sm:text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1 flex items-center space-x-1">
                  <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                  <span>Header Banner Image</span>
                </label>

                {bannerPreview ? (
                  <div className="relative group border border-slate-200 rounded-xl sm:rounded-2xl overflow-hidden bg-slate-900 flex items-center justify-center h-24 sm:h-28">
                    <img src={bannerPreview} alt="Banner Preview" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={handleRemoveBanner}
                      className="absolute top-2 right-2 p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full transition-transform group-hover:scale-105"
                      title="Remove banner"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-slate-200 hover:border-brand-crimson/50 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col items-center justify-center bg-slate-50/50 hover:bg-slate-100/50 transition-colors cursor-pointer text-center h-24 sm:h-28">
                    <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 mb-1" />
                    <span className="text-[10px] sm:text-[11px] font-extrabold text-slate-600">Upload Header Banner</span>
                    <span className="text-[9px] sm:text-[10px] text-slate-400">Wide banner for category page</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleBannerChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Collapsible SEO Meta Section */}
            <div className="border border-slate-200 rounded-xl sm:rounded-2xl overflow-hidden bg-slate-50/60">
              <button
                type="button"
                onClick={() => setIsSeoOpen(!isSeoOpen)}
                className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between text-left text-[11px] sm:text-xs font-extrabold text-slate-700 hover:bg-slate-100/70 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-crimson" />
                  <span>SEO Meta Information (Optional)</span>
                </div>
                {isSeoOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>

              {isSeoOpen && (
                <div className="p-3 sm:p-4 border-t border-slate-200 space-y-2.5 sm:space-y-3 bg-white">
                  <div>
                    <label className="block text-[10px] sm:text-[11px] font-extrabold text-slate-700 mb-1">SEO Title</label>
                    <input
                      type="text"
                      value={seoTitle}
                      onChange={(e) => setSeoTitle(e.target.value)}
                      placeholder="e.g. Buy Designer Silk Sarees Online - NiaKylie"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs font-semibold outline-none focus:border-brand-crimson"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] sm:text-[11px] font-extrabold text-slate-700 mb-1">SEO Description</label>
                    <textarea
                      value={seoDescription}
                      onChange={(e) => setSeoDescription(e.target.value)}
                      rows={2}
                      placeholder="e.g. Explore our exclusive handcrafted silk sarees collection..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs font-semibold outline-none focus:border-brand-crimson"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] sm:text-[11px] font-extrabold text-slate-700 mb-1">
                      SEO Keywords (Comma-Separated)
                    </label>
                    <input
                      type="text"
                      value={seoKeywords}
                      onChange={(e) => setSeoKeywords(e.target.value)}
                      placeholder="e.g. sarees, silk saree, ethnic wear, bridal saree"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs font-semibold outline-none focus:border-brand-crimson"
                    />
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end space-x-2 sm:space-x-3 flex-shrink-0">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl border border-slate-200 text-[11px] sm:text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="createCategoryForm"
            disabled={isSubmitting}
            className="inline-flex items-center space-x-1.5 bg-brand-crimson hover:bg-brand-crimson-dark text-white font-extrabold text-[11px] sm:text-xs px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                <span>CREATING CATEGORY...</span>
              </>
            ) : (
              <span>CREATE {categoryType === 'main' ? 'MAIN CATEGORY' : 'SUB-CATEGORY'}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateCategoryModal;
