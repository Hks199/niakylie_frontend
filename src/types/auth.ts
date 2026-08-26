export type UserRole = 'CUSTOMER' | 'ADMIN';

// ── Address (matches backend embedded address schema) ──────────
export interface Address {
  _id: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

// ── Wallet ──────────────────────────────────────────────────────
export interface WalletTransaction {
  amount: number;
  type: 'credit' | 'debit';
  reason: string;
  createdAt: string;
}

export interface Wallet {
  balance: number;
  history: WalletTransaction[];
}

// ── Notification Preferences ───────────────────────────────────
export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
}

// ── Recently Viewed ────────────────────────────────────────────
export interface RecentlyViewedItem {
  productId: string;
  viewedAt: string;
}

// ── User Object (matches GET /users/profile response) ──────────
export interface User {
  id: string;
  _id?: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  roles: UserRole[];
  isEmailVerified: boolean;
  isActive: boolean;
  addresses: Address[];
  wishlist: string[];
  rewardPoints: number;
  wallet: Wallet;
  notificationPreferences: NotificationPreferences;
  recentlyViewed: RecentlyViewedItem[];
  createdAt: string;
  updatedAt: string;
}

// ── Auth Payloads ──────────────────────────────────────────────
export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface RegisterResponse {
  message: string;
  verificationToken: string; // dev only
  user: Pick<User, 'id' | 'email' | 'firstName' | 'lastName'>;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: Pick<User, 'id' | 'email' | 'firstName' | 'lastName' | 'roles'>;
}

// ── Profile Update ─────────────────────────────────────────────
export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
}

// ── Address Payload ────────────────────────────────────────────
export interface AddressPayload {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault?: boolean;
}

// Legacy compat – keep ProfileUpdatePayload alias
export type ProfileUpdatePayload = UpdateProfilePayload;
