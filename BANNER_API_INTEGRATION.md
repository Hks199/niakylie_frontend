# NiaKylie – Banner API Integration Reference

> **Purpose**: Master integration specification for all **Banner & Promotional Carousel APIs** (Public & Admin). Any AI or frontend developer can use this guide to connect homepage hero sliders, offer banners, festival promotional popups, and Admin Banner Management Panels with 100% contract compliance.  
> **Base URL**: `http://localhost:3000/api/v1` (Dev) | `https://api.niakylie.com/api/v1` (Prod)  
> **Auth Requirements**:
> - `GET /banners` & `GET /banners/:id`: Public (No token required)
> - `GET /banners/admin/all`, `POST /banners/admin`, `PUT /banners/admin/:id`, `PATCH /banners/admin/:id/toggle-active`, `PATCH /banners/admin/reorder`, `DELETE /banners/admin/:id`: Requires JWT Bearer Token (`Authorization: Bearer <accessToken>`) with `roles: ["ADMIN"]` or `"admin"`.

---

## 1. Quick Reference: Banner Routes Table

| Method | Endpoint | Description | Content-Type | Auth Required |
|---|---|---|---|---|
| `GET` | `/banners` | Fetch active banners (respects date scheduling window & filters by `type`) | — | Public |
| `GET` | `/banners/:id` | Fetch banner details by ID | — | Public |
| `GET` | `/banners/admin/all` | [Admin] List all banners including inactive & scheduled ones | — | ✅ JWT + ADMIN |
| `POST` | `/banners/admin` | [Admin] Create banner with desktop (`image`) & mobile (`mobileImage`) file uploads | `multipart/form-data` | ✅ JWT + ADMIN |
| `PUT` | `/banners/admin/:id` | [Admin] Update banner metadata & replace desktop/mobile images | `multipart/form-data` | ✅ JWT + ADMIN |
| `PATCH` | `/banners/admin/:id/toggle-active` | [Admin] Toggle active/inactive status | — | ✅ JWT + ADMIN |
| `PATCH` | `/banners/admin/reorder` | [Admin] Batch reorder banner list display orders | `application/json` | ✅ JWT + ADMIN |
| `DELETE` | `/banners/admin/:id` | [Admin] Soft-delete banner and remove images | — | ✅ JWT + ADMIN |

---

## 2. TypeScript Interfaces (`src/types/banner.ts`)

```ts
// ── Banner Enums ──────────────────────────────────────────
export enum BannerType {
  HOMEPAGE = 'HOMEPAGE',
  OFFER = 'OFFER',
  FESTIVAL = 'FESTIVAL',
  POPUP = 'POPUP',
}

export enum BannerPosition {
  TOP = 'TOP',
  MIDDLE = 'MIDDLE',
  BOTTOM = 'BOTTOM',
  SIDEBAR = 'SIDEBAR',
}

// ── Master Banner Interface ────────────────────────────────
export interface Banner {
  _id: string;
  title: string;
  subtitle?: string;
  type: BannerType;
  position: BannerPosition;
  imageUrl: string;          // Desktop image URL path
  mobileImageUrl?: string;    // Mobile image URL path
  linkUrl?: string;          // CTA link path/URL
  linkLabel?: string;        // CTA button label text
  displayOrder: number;
  isActive: boolean;
  startDate?: string;        // ISO Date String
  endDate?: string;          // ISO Date String
  metadata?: Record<string, any>;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Query Parameters for GET /banners ────────────────────
export interface QueryBannerParams {
  type?: BannerType;
  isActive?: boolean;
}

// ── Create Banner Payload ──────────────────────────────────
export interface CreateBannerInput {
  title: string;
  subtitle?: string;
  type: BannerType;
  position?: BannerPosition;
  linkUrl?: string;
  linkLabel?: string;
  displayOrder?: number;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
  image: File;              // Desktop image file
  mobileImage?: File;        // Mobile image file
}

// ── Update Banner Payload ──────────────────────────────────
export interface UpdateBannerInput extends Partial<Omit<CreateBannerInput, 'image'>> {
  image?: File;
}

// ── Batch Reorder Item ────────────────────────────────────
export interface ReorderBannerItem {
  id: string;
  displayOrder: number;
}
```

---

## 3. Detailed Endpoint Contracts

### 3.1 Fetch Active Banners (`GET /banners`)
- **Description**: Retrieves active banners sorted by `displayOrder` (asc). Filters out banners outside their `startDate` and `endDate` schedule window.
- **Auth Required**: Public
- **Query Parameters**:
  - `type` (`HOMEPAGE` | `OFFER` | `FESTIVAL` | `POPUP`, optional): Filter banners by display location/type.

#### Request Example
`GET http://localhost:3000/api/v1/banners?type=HOMEPAGE`

#### Success Response (`HTTP 200 OK`)
```json
[
  {
    "_id": "60d5ecb8b392d40015f8a001",
    "title": "Festive Diwali Sale",
    "subtitle": "Up to 50% off on all ethnic wear",
    "type": "HOMEPAGE",
    "position": "TOP",
    "imageUrl": "/uploads/banners/image-1724650000.webp",
    "mobileImageUrl": "/uploads/banners/mobile-1724650000.webp",
    "linkUrl": "/collections/ethnic-wear",
    "linkLabel": "Shop Collection",
    "displayOrder": 1,
    "isActive": true,
    "startDate": "2026-10-01T00:00:00.000Z",
    "endDate": "2026-10-31T23:59:59.000Z",
    "isDeleted": false,
    "createdAt": "2026-08-26T10:00:00.000Z",
    "updatedAt": "2026-08-26T10:00:00.000Z"
  }
]
```

---

### 3.2 Fetch Banner by ID (`GET /banners/:id`)
- **Description**: Fetch banner details by Mongo ObjectId.
- **Auth Required**: Public

#### Success Response (`HTTP 200 OK`)
```json
{
  "_id": "60d5ecb8b392d40015f8a001",
  "title": "Festive Diwali Sale",
  "subtitle": "Up to 50% off on all ethnic wear",
  "type": "HOMEPAGE",
  "position": "TOP",
  "imageUrl": "/uploads/banners/image-1724650000.webp",
  "mobileImageUrl": "/uploads/banners/mobile-1724650000.webp",
  "linkUrl": "/collections/ethnic-wear",
  "linkLabel": "Shop Collection",
  "displayOrder": 1,
  "isActive": true,
  "isDeleted": false,
  "createdAt": "2026-08-26T10:00:00.000Z",
  "updatedAt": "2026-08-26T10:00:00.000Z"
}
```

---

### 3.3 Create Banner (`POST /banners/admin`)
- **Description**: Creates a new promotional banner with desktop and optional mobile image file upload.
- **Auth Required**: ✅ JWT Bearer Token (`roles: ["ADMIN"]`)
- **Content-Type**: `multipart/form-data`

#### Multipart Form Data Fields
| Field Name | Type | Required | Description |
|---|---|---|---|
| `title` | Text | **Yes** | Banner main headline |
| `type` | Text | **Yes** | `HOMEPAGE`, `OFFER`, `FESTIVAL`, or `POPUP` |
| `subtitle` | Text | No | Secondary caption |
| `position` | Text | No | `TOP`, `MIDDLE`, `BOTTOM`, `SIDEBAR` (Default: `TOP`) |
| `linkUrl` | Text | No | Target landing URL/path |
| `linkLabel` | Text | No | Button CTA label (e.g. "Shop Now") |
| `displayOrder` | Number | No | Sorting sequence order (default: `0`) |
| `isActive` | Boolean | No | Active toggle status (default: `true`) |
| `startDate` | DateString | No | ISO Date String |
| `endDate` | DateString | No | ISO Date String |
| `image` | File | **Yes** | Desktop banner image file (JPG, PNG, WEBP, max 5MB) |
| `mobileImage` | File | No | Mobile-optimized banner image file |

#### Success Response (`HTTP 201 Created`)
```json
{
  "_id": "60d5ecb8b392d40015f8a002",
  "title": "Grand Clearance Sale",
  "type": "OFFER",
  "position": "TOP",
  "imageUrl": "/uploads/banners/image-1724650005.webp",
  "linkUrl": "/sale",
  "displayOrder": 2,
  "isActive": true,
  "isDeleted": false,
  "createdAt": "2026-08-26T10:05:00.000Z",
  "updatedAt": "2026-08-26T10:05:00.000Z"
}
```

---

### 3.4 Toggle Banner Status (`PATCH /banners/admin/:id/toggle-active`)
- **Description**: Instantly flips the `isActive` state of a banner.
- **Auth Required**: ✅ JWT Bearer Token (`roles: ["ADMIN"]`)

#### Success Response (`HTTP 200 OK`)
```json
{
  "_id": "60d5ecb8b392d40015f8a002",
  "title": "Grand Clearance Sale",
  "isActive": false,
  "updatedAt": "2026-08-26T10:10:00.000Z"
}
```

---

### 3.5 Batch Reorder Banners (`PATCH /banners/admin/reorder`)
- **Description**: Reorders multiple banners simultaneously by passing an array of IDs and display orders.
- **Auth Required**: ✅ JWT Bearer Token (`roles: ["ADMIN"]`)
- **Content-Type**: `application/json`

#### Request Body
```json
[
  { "id": "60d5ecb8b392d40015f8a001", "displayOrder": 1 },
  { "id": "60d5ecb8b392d40015f8a002", "displayOrder": 2 }
]
```

#### Success Response (`HTTP 200 OK`)
```json
{ "message": "Banners reordered successfully" }
```

---

### 3.6 Delete Banner (`DELETE /banners/admin/:id`)
- **Description**: Soft-deletes the banner.
- **Auth Required**: ✅ JWT Bearer Token (`roles: ["ADMIN"]`)

#### Success Response (`HTTP 200 OK`)
```json
{ "message": "Banner deleted successfully" }
```

---

## 4. Frontend Integration Implementation Code

### 4.1 Axios API Client (`src/api/banners.ts`)

```ts
import { apiClient } from './client';
import {
  Banner,
  BannerType,
  QueryBannerParams,
  ReorderBannerItem,
} from '../types/banner';

export const bannersApi = {
  /**
   * Fetch active public banners by type.
   */
  getActiveBanners: (params?: QueryBannerParams): Promise<Banner[]> =>
    apiClient.get('/banners', { params }),

  /**
   * Fetch banner by ID.
   */
  getBannerById: (id: string): Promise<Banner> =>
    apiClient.get(`/banners/${id}`),

  /**
   * Admin: Get all banners (active + inactive).
   */
  getAllBanners: (params?: QueryBannerParams): Promise<Banner[]> =>
    apiClient.get('/banners/admin/all', { params }),

  /**
   * Admin: Create banner with image upload.
   */
  createBanner: (formData: FormData): Promise<Banner> =>
    apiClient.post('/banners/admin', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  /**
   * Admin: Update banner details.
   */
  updateBanner: (id: string, formData: FormData): Promise<Banner> =>
    apiClient.put(`/banners/admin/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  /**
   * Admin: Toggle banner active state.
   */
  toggleActive: (id: string): Promise<Banner> =>
    apiClient.patch(`/banners/admin/${id}/toggle-active`),

  /**
   * Admin: Reorder banners.
   */
  reorderBanners: (items: ReorderBannerItem[]): Promise<void> =>
    apiClient.patch('/banners/admin/reorder', items),

  /**
   * Admin: Delete banner.
   */
  deleteBanner: (id: string): Promise<void> =>
    apiClient.delete(`/banners/admin/${id}`),
};
```

---

### 4.2 React Hero Banner Slider Component (`HeroBannerSlider.tsx`)

```tsx
import React, { useState, useEffect } from 'react';
import { bannersApi } from '../api/banners';
import { Banner, BannerType } from '../types/banner';

export function HeroBannerSlider() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bannersApi
      .getActiveBanners({ type: BannerType.HOMEPAGE })
      .then((data) => setBanners(data))
      .catch((err) => console.error('Failed to load hero banners', err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners]);

  if (loading) {
    return <div className="h-64 md:h-96 w-full bg-gray-200 animate-pulse rounded-2xl" />;
  }

  if (banners.length === 0) return null;

  const activeBanner = banners[currentIndex];

  return (
    <div className="relative w-full h-64 md:h-96 overflow-hidden rounded-2xl group shadow-lg">
      {/* BACKGROUND IMAGE (DESKTOP & MOBILE FALLBACK) */}
      <picture>
        {activeBanner.mobileImageUrl && (
          <source media="(max-width: 768px)" srcSet={`http://localhost:3000${activeBanner.mobileImageUrl}`} />
        )}
        <img
          src={`http://localhost:3000${activeBanner.imageUrl}`}
          alt={activeBanner.title}
          className="w-full h-full object-cover transition-all duration-700 ease-in-out transform scale-105 group-hover:scale-100"
        />
      </picture>

      {/* OVERLAY CONTENT */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent flex flex-col justify-center p-6 md:p-12 text-white">
        <h2 className="text-2xl md:text-5xl font-bold tracking-tight mb-2">{activeBanner.title}</h2>
        {activeBanner.subtitle && (
          <p className="text-sm md:text-lg opacity-90 mb-4 max-w-md">{activeBanner.subtitle}</p>
        )}
        {activeBanner.linkUrl && (
          <a
            href={activeBanner.linkUrl}
            className="inline-block bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-full w-max text-sm transition-all transform hover:scale-105"
          >
            {activeBanner.linkLabel || 'Explore Now'}
          </a>
        )}
      </div>

      {/* CAROUSEL INDICATOR DOTS */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-3 h-3 rounded-full transition-all ${
                idx === currentIndex ? 'bg-white w-6' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
```
