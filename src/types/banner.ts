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
  id?: string;
  title: string;
  subtitle?: string;
  type: BannerType | string;
  position?: BannerPosition | string;
  imageUrl: string;          // Desktop image URL path
  mobileImageUrl?: string;    // Mobile image URL path
  linkUrl?: string;          // CTA link path/URL
  linkLabel?: string;        // CTA button label text
  discountBadge?: string;    // Discount badge label
  ctaText?: string;          // Legacy CTA button text
  displayOrder?: number;
  isActive: boolean;
  startDate?: string;        // ISO Date String
  endDate?: string;          // ISO Date String
  metadata?: Record<string, any>;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ── Query Parameters for GET /banners ────────────────────
export interface QueryBannerParams {
  type?: BannerType | string;
  isActive?: boolean;
}

// ── Create Banner Payload ──────────────────────────────────
export interface CreateBannerInput {
  title: string;
  subtitle?: string;
  type: BannerType | string;
  position?: BannerPosition | string;
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
