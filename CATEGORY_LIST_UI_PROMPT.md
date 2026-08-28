# AI PROMPT: Detailed Master Guide for Integrating Category List API with Frontend UI

> **Role**: Senior React & TypeScript UI Architect  
> **Task**: Connect the NestJS `GET /api/v1/categories` API endpoint to the frontend UI components (Megamenu Navigation, Product Filter Sidebar, Homepage Category Cards Grid, and Admin Table List) with resilient data fetching, pagination limit handling, and smooth state updates.

---

## 🎯 Architectural Overview & Integration Goals

The `GET /api/v1/categories` endpoint returns all categories and sub-categories in the database. To prevent UI truncation, frontend requests **MUST** pass `limit=500` (or `limit=1000`).

### Key UI Features Covered in this Prompt:
1. **Category Navigation Bar / Megamenu**: Hierarchical grouping of Level 1 Root Categories (`parentId === null`) with Level 2 Sub-Categories (`parentId === <CategoryId>`).
2. **PLP Filter Sidebar**: Interactive checkbox/radio filters linked to URL query parameters (`?category=slug`).
3. **Homepage Category Grid / Carousel**: Modern visual cards displaying thumbnail images, names, and links.
4. **Admin Dashboard Category Table**: Data table with live search, pagination control, status toggles, and sub-category badges.

---

## 🔌 API Endpoint Contract

```http
GET /api/v1/categories?page=1&limit=500&search=&parentId=&sort=-createdAt
```

### Response Envelope Structure:
```json
{
  "data": [
    {
      "_id": "60d5ecb8b392d40015f8a001",
      "name": "Women Ethnic Wear",
      "slug": "women-ethnic-wear",
      "parentId": null,
      "ancestors": [],
      "description": "Traditional sarees, kurtis and lehengas",
      "image": "/uploads/categories/image-123.jpg",
      "banner": "/uploads/categories/banner-123.jpg",
      "displayOrder": 0,
      "status": true,
      "isDeleted": false,
      "createdAt": "2026-08-27T04:00:00.000Z",
      "updatedAt": "2026-08-27T04:00:00.000Z"
    },
    {
      "_id": "60d5ecb8b392d40015f8a002",
      "name": "Silk Sarees",
      "slug": "silk-sarees",
      "parentId": "60d5ecb8b392d40015f8a001",
      "ancestors": [
        {
          "_id": "60d5ecb8b392d40015f8a001",
          "name": "Women Ethnic Wear",
          "slug": "women-ethnic-wear"
        }
      ],
      "description": "Kanjivaram and Banarasi silk sarees",
      "image": "/uploads/categories/image-456.jpg",
      "status": true,
      "isDeleted": false
    }
  ],
  "meta": {
    "total": 48,
    "page": 1,
    "limit": 500,
    "totalPages": 1
  }
}
```

---

## 🛠️ Step 1: TypeScript Interfaces (`src/types/category.ts`)

```ts
export interface CategoryAncestor {
  _id: string;
  name: string;
  slug: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  parentId: string | { _id: string; name: string; slug: string } | null;
  ancestors: CategoryAncestor[];
  description?: string;
  image?: string;
  banner?: string;
  displayOrder: number;
  status: boolean;
  isDeleted: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface QueryCategoryParams {
  page?: number;
  limit?: number; // Must be 500
  search?: string;
  parentId?: string | 'null';
  status?: boolean;
  sort?: string;
}
```

---

## 📡 Step 2: API Client Service (`src/api/categories.ts`)

```ts
import apiClient from './client';
import { Category, QueryCategoryParams } from '../types/category';

// Resilient helper to normalize response payloads
export const extractCategoryArray = (res: any): Category[] => {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.data?.data)) return res.data.data;
  return [];
};

export const categoriesApi = {
  // Fetch Category List with limit=500 default
  getCategories: async (params?: QueryCategoryParams): Promise<{ data: Category[]; total: number }> => {
    const response = await apiClient.get<any>('/categories', {
      params: { limit: 500, ...params },
    });
    const data = extractCategoryArray(response);
    const total = response?.data?.meta?.total || response?.meta?.total || data.length;
    return { data, total };
  },
};
```

---

## ⚛️ Step 3: Custom React Query Hook (`src/hooks/useCategories.ts`)

```ts
import { useQuery } from '@tanstack/react-query';
import { categoriesApi } from '../api/categories';
import { Category, QueryCategoryParams } from '../types/category';

export function useCategories(params?: QueryCategoryParams) {
  const query = useQuery({
    queryKey: ['categories-list', params],
    queryFn: () => categoriesApi.getCategories(params),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

  const allCategories: Category[] = query.data?.data || [];

  // Derived Root Parent Categories (parentId is null or empty)
  const rootCategories = allCategories.filter((cat) => {
    const pId = typeof cat.parentId === 'object' && cat.parentId ? (cat.parentId as any)._id : cat.parentId;
    return !pId || pId === 'null';
  });

  // Helper function to get sub-categories for a parent ID
  const getSubCategories = (parentCatId: string): Category[] => {
    return allCategories.filter((cat) => {
      const pId = typeof cat.parentId === 'object' && cat.parentId ? (cat.parentId as any)._id : cat.parentId;
      return String(pId) === String(parentCatId);
    });
  };

  return {
    ...query,
    allCategories,
    rootCategories,
    getSubCategories,
  };
}
```

---

## 🎨 Step 4: UI Integration Components

### Component A: Header Megamenu (`src/components/common/Megamenu.tsx`)

```tsx
import React, { useState } from 'react';
import { useCategories } from '../../hooks/useCategories';

export const Megamenu: React.FC = () => {
  const { rootCategories, getSubCategories, isLoading } = useCategories({ status: true });
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex space-x-6 animate-pulse py-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-4 w-24 bg-gray-200 rounded"></div>
        ))}
      </div>
    );
  }

  return (
    <nav className="flex items-center space-x-8">
      {rootCategories.map((root) => {
        const subCategories = getSubCategories(root._id);
        const hasSubs = subCategories.length > 0;

        return (
          <div
            key={root._id}
            className="relative py-4"
            onMouseEnter={() => setActiveMenuId(root._id)}
            onMouseLeave={() => setActiveMenuId(null)}
          >
            <a
              href={`/category/${root.slug}`}
              className="text-xs font-bold uppercase tracking-wider text-slate-800 hover:text-red-600 transition-colors"
            >
              {root.name}
            </a>

            {/* Dropdown for Sub-Categories */}
            {hasSubs && activeMenuId === root._id && (
              <div className="absolute top-full left-0 w-64 bg-white border border-gray-100 shadow-2xl rounded-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
                <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-3">
                  {root.name} Categories
                </p>
                <div className="space-y-2">
                  {subCategories.map((sub) => (
                    <a
                      key={sub._id}
                      href={`/category/${sub.slug}`}
                      className="block text-xs font-semibold text-slate-600 hover:text-red-600 hover:translate-x-1 transition-all"
                    >
                      {sub.name}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
};
```

---

### Component B: PLP Filter Sidebar (`src/components/plp/FilterSidebar.tsx`)

```tsx
import React from 'react';
import { useCategories } from '../../hooks/useCategories';

interface FilterSidebarProps {
  selectedCategorySlug?: string;
  onSelectCategory: (slug: string) => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  selectedCategorySlug,
  onSelectCategory,
}) => {
  const { rootCategories, getSubCategories, isLoading } = useCategories({ status: true });

  if (isLoading) {
    return <div className="p-4 text-xs text-slate-400">Loading category filters...</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Categories</h3>

      <div className="space-y-3">
        {rootCategories.map((root) => {
          const subs = getSubCategories(root._id);
          const isSelected = selectedCategorySlug === root.slug;

          return (
            <div key={root._id} className="space-y-1.5">
              <button
                onClick={() => onSelectCategory(root.slug)}
                className={`w-full text-left text-xs font-bold flex items-center justify-between py-1 transition-colors ${
                  isSelected ? 'text-red-600 font-extrabold' : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                <span>{root.name}</span>
                {subs.length > 0 && <span className="text-[10px] text-gray-400">({subs.length})</span>}
              </button>

              {/* Nested Sub-Category Filter Checklist */}
              {subs.length > 0 && (
                <div className="pl-3 space-y-1 border-l border-gray-100">
                  {subs.map((sub) => (
                    <label
                      key={sub._id}
                      className="flex items-center space-x-2 text-[11px] text-slate-500 hover:text-slate-800 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategorySlug === sub.slug}
                        onChange={() => onSelectCategory(sub.slug)}
                        className="rounded text-red-600 focus:ring-red-500"
                      />
                      <span>{sub.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
```

---

### Component C: Homepage Category Cards Grid (`src/components/home/CategoryGrid.tsx`)

```tsx
import React from 'react';
import { useCategories } from '../../hooks/useCategories';

export const CategoryGrid: React.FC = () => {
  const { rootCategories, isLoading } = useCategories({ status: true });

  if (isLoading) return <div className="py-12 text-center text-xs text-slate-400">Loading categories...</div>;

  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-extrabold text-slate-900">Explore Top Categories</h2>
        <a href="/categories" className="text-xs font-bold text-red-600 hover:underline">
          View All &rarr;
        </a>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {rootCategories.map((cat) => {
          const imageUrl = cat.image
            ? cat.image.startsWith('http')
              ? cat.image
              : `http://localhost:3000${cat.image}`
            : 'https://via.placeholder.com/150';

          return (
            <a
              key={cat._id}
              href={`/category/${cat.slug}`}
              className="group bg-white border border-gray-100 rounded-2xl p-3 text-center shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
            >
              <div className="w-20 h-20 mx-auto rounded-full overflow-hidden mb-2 bg-slate-50">
                <img
                  src={imageUrl}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <h3 className="text-xs font-bold text-slate-800 line-clamp-1 group-hover:text-red-600">
                {cat.name}
              </h3>
            </a>
          );
        })}
      </div>
    </section>
  );
};
```

---

## ⚡ UI Checklist & Best Practices
1. **Always Request `limit=500`**: Prevent category list pagination truncation by specifying `limit=500` on category fetches.
2. **Image Host Fallback**: Prepend `http://localhost:3000` (or `process.env.VITE_API_URL`) to relative paths like `/uploads/categories/...`.
3. **Empty States**: Render friendly placeholder UI when `rootCategories.length === 0`.
4. **Active Filters**: Maintain clean synchronization between selected category state and URL parameters.
