# AI PROMPT: Master Guide for Integrating "Create Category & Sub-Category" API with Frontend UI

> **Role**: Senior React & TypeScript UI Architect  
> **Task**: Build and integrate a production-ready **Create Category & Sub-Category Modal/Form Component** that connects to the NestJS `POST /api/v1/categories` backend endpoint, supporting 2-level category hierarchy (`parentId`), multipart file uploads (`image`, `banner`), validation feedback, and immediate cache invalidation.

---

## 🎯 Integration Goals & Capabilities

1. **2-Level Hierarchy Support**:
   - **Main (Root) Category**: `parentId = null` (or empty string/omitted).
   - **Sub-Category**: `parentId = "<Valid_Parent_Mongo_ObjectID>"`.
2. **Multipart Form Upload**:
   - Transmits text data and binary image files (`image` for thumbnail, `banner` for header) using `FormData`.
3. **Automatic Form Handling**:
   - Auto-generates `slug` dynamically from `name` (user can customize).
   - Auto-populates `parentId` dropdown with existing Level 1 Root Parent Categories.
4. **Validation & State Syncing**:
   - Handles `400 Bad Request` duplicate slug errors and cycle validation.
   - Clears form upon success and invalidates React Query caches (`admin-categories`, `categories-list`, `megamenu-categories`, `category-tree`).

---

## 🔌 API Endpoint Contract

```http
POST /api/v1/categories
Authorization: Bearer <ADMIN_JWT_TOKEN>
Content-Type: multipart/form-data
```

### Request Headers
- `Authorization`: `Bearer <token>` (Required, Admin role)
- `Content-Type`: `multipart/form-data`

### Form-Data Payload Parameters

| Field Name | Type | Required | Default | Description / Example |
| :--- | :--- | :--- | :--- | :--- |
| `name` | String | **Yes** | — | Category Name (e.g. `"Ethnic Wear"` or `"Silk Sarees"`) |
| `slug` | String | No | auto | URL slug (e.g. `"ethnic-wear"`). Generated if empty. |
| `parentId` | String / null | No | `null` | MongoDB `_id` of parent. `null` for Root, valid `_id` for Sub-Category. |
| `description` | String | No | `""` | Detailed description. |
| `displayOrder` | Number | No | `0` | Numeric display priority index. |
| `status` | Boolean | No | `true` | Active status flag (`"true"` or `"false"`). |
| `seoTitle` | String | No | `""` | Page SEO Meta Title. |
| `seoDescription` | String | No | `""` | SEO Meta Description tag. |
| `seoKeywords` | String / Array | No | `[]` | Comma-separated string or array (e.g. `"saree, silk, fashion"`). |
| `image` | File | No | — | Image File (JPG, PNG, WEBP, max 5MB). Field name: `image`. |
| `banner` | File | No | — | Banner Image File (JPG, PNG, WEBP, max 5MB). Field name: `banner`. |

---

## 🟢 Sample JSON Success Response (`201 Created`)

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Category created successfully",
  "data": {
    "_id": "6a8f33e2cea2875851dd2f18",
    "name": "Silk Sarees",
    "slug": "silk-sarees",
    "parentId": "60d5ecb8b392d40015f8a001",
    "ancestors": [
      {
        "_id": "60d5ecb8b392d40015f8a001",
        "name": "Ethnic Wear",
        "slug": "ethnic-wear"
      }
    ],
    "description": "Kanjivaram and Banarasi silk sarees",
    "image": "/uploads/categories/image-1787769826973-596520307.jpg",
    "banner": "/uploads/categories/banner-1787769826982-80115937.jpg",
    "displayOrder": 0,
    "status": true,
    "isDeleted": false,
    "createdAt": "2026-08-28T10:00:00.000Z",
    "updatedAt": "2026-08-28T10:00:00.000Z"
  }
}
```

---

## 🛠️ Step 1: API Service Integration Layer (`src/api/categories.ts`)

```ts
import apiClient from './client';
import { Category } from '../types/category';

export interface CreateCategoryPayload {
  name: string;
  slug?: string;
  parentId?: string | null;
  description?: string;
  displayOrder?: number;
  status?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string | string[];
  imageFile?: File | null;
  bannerFile?: File | null;
}

export const categoriesApi = {
  createCategory: async (payload: CreateCategoryPayload): Promise<Category> => {
    const formData = new FormData();
    formData.append('name', payload.name);

    if (payload.slug) formData.append('slug', payload.slug);
    if (payload.parentId) formData.append('parentId', payload.parentId);
    if (payload.description) formData.append('description', payload.description);
    if (payload.displayOrder !== undefined) formData.append('displayOrder', String(payload.displayOrder));
    if (payload.status !== undefined) formData.append('status', String(payload.status));
    
    if (payload.seoTitle) formData.append('seoTitle', payload.seoTitle);
    if (payload.seoDescription) formData.append('seoDescription', payload.seoDescription);
    if (payload.seoKeywords) {
      const keywordsStr = Array.isArray(payload.seoKeywords)
        ? payload.seoKeywords.join(', ')
        : payload.seoKeywords;
      formData.append('seoKeywords', keywordsStr);
    }

    if (payload.imageFile) formData.append('image', payload.imageFile);
    if (payload.bannerFile) formData.append('banner', payload.bannerFile);

    const response = await apiClient.post<any>('/categories', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data?.data || response.data || response;
  },
};
```

---

## ⚛️ Step 2: Fully Functional React Component (`src/components/admin/CreateCategoryModal.tsx`)

```tsx
import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { X, Upload, Layers, Image as ImageIcon } from 'lucide-react';
import { categoriesApi } from '../../api/categories';
import { useCategories } from '../../hooks/useCategories';

interface CreateCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateCategoryModal: React.FC<CreateCategoryModalProps> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const { rootCategories } = useCategories({ limit: 500 });

  const [categoryType, setCategoryType] = useState<'main' | 'sub'>('main');
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [parentId, setParentId] = useState('');
  const [description, setDescription] = useState('');
  const [displayOrder, setDisplayOrder] = useState<number>(0);
  const [status, setStatus] = useState<boolean>(true);

  // SEO Fields
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');

  // File Upload State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Auto-generate slug from name
  useEffect(() => {
    const generatedSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    setSlug(generatedSlug);
  }, [name]);

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!name.trim()) {
      setErrorMessage('Category name is required.');
      return;
    }

    if (categoryType === 'sub' && !parentId) {
      setErrorMessage('Please select a parent category for the sub-category.');
      return;
    }

    setIsSubmitting(true);

    try {
      await categoriesApi.createCategory({
        name,
        slug,
        parentId: categoryType === 'sub' ? parentId : null,
        description,
        displayOrder,
        status,
        seoTitle,
        seoDescription,
        seoKeywords,
        imageFile,
        bannerFile,
      });

      setSuccessMessage('Category created successfully!');

      // Proactive Cache Invalidation
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-categories'], exact: false }),
        queryClient.invalidateQueries({ queryKey: ['categories-list'], exact: false }),
        queryClient.invalidateQueries({ queryKey: ['megamenu-categories'], exact: false }),
        queryClient.invalidateQueries({ queryKey: ['category-tree'], exact: false }),
      ]);

      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      const rawMsg = err?.response?.data?.message || err?.message || 'Failed to create category';
      const msg = Array.isArray(rawMsg) ? rawMsg.join(' · ') : String(rawMsg);
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-red-500" />
            <h2 className="text-base font-extrabold tracking-wide">Create New Category</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Banners */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-lg">
            ⚠️ {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-lg">
            🎉 {successMessage}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-slate-800 text-xs">
          {/* Category Type Toggle */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Category Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => { setCategoryType('main'); setParentId(''); }}
                className={`py-2 px-4 rounded-xl border text-xs font-bold transition-all ${
                  categoryType === 'main'
                    ? 'bg-red-600 text-white border-red-600 shadow-md'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                📁 Main Category (Level 1)
              </button>
              <button
                type="button"
                onClick={() => setCategoryType('sub')}
                className={`py-2 px-4 rounded-xl border text-xs font-bold transition-all ${
                  categoryType === 'sub'
                    ? 'bg-red-600 text-white border-red-600 shadow-md'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                📂 Sub-Category (Level 2)
              </button>
            </div>
          </div>

          {/* Parent Category Selection (Only for Sub-Category) */}
          {categoryType === 'sub' && (
            <div className="animate-in fade-in">
              <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Select Parent Category <span className="text-red-500">*</span>
              </label>
              <select
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
                required
              >
                <option value="">-- Choose Parent Main Category --</option>
                {rootCategories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name} ({cat.slug})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Name & Slug */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">
                Category Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sarees or Silk Sarees"
                className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">URL Slug</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="auto-generated-slug"
                className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>
          </div>

          {/* Image & Banner Uploads */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">
                Thumbnail Image (Square)
              </label>
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-3 text-center bg-slate-50 hover:bg-slate-100 transition-colors relative">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="h-16 w-16 mx-auto object-cover rounded-lg mb-1" />
                ) : (
                  <ImageIcon className="w-6 h-6 mx-auto text-slate-400 mb-1" />
                )}
                <span className="block text-[11px] text-slate-500">Upload Image File</span>
                <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">
                Header Banner Image
              </label>
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-3 text-center bg-slate-50 hover:bg-slate-100 transition-colors relative">
                {bannerPreview ? (
                  <img src={bannerPreview} alt="Preview" className="h-16 w-full object-cover rounded-lg mb-1" />
                ) : (
                  <Upload className="w-6 h-6 mx-auto text-slate-400 mb-1" />
                )}
                <span className="block text-[11px] text-slate-500">Upload Banner File</span>
                <input type="file" accept="image/*" onChange={handleBannerChange} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Brief description for category..."
              className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-lg transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Creating Category...' : 'Save Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
```

---

## ⚡ Integration Checklist & Troubleshooting
1. **Always use `multipart/form-data`**: Required whenever uploading files or sending JSON fields through FormData.
2. **Handle ParentId Properly**: `parentId` must be passed as `null` or left out for Level 1 Root Categories; pass valid 24-character hex Mongo ObjectIDs for Sub-Categories.
3. **Invalidate React Query**: Use `exact: false` when invalidating cache keys to flush all queries (`['admin-categories']`, `['categories-list']`, etc.).
