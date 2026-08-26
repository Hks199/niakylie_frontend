# NiaKylie – Authentication & User Profile API Integration Guide

> **Purpose**: This file is the single source of truth for AI-assisted frontend integration of the Authentication and User Profile module.  
> **Base URL**: `http://localhost:3000/api/v1` (dev) | `https://api.niakylie.com/api/v1` (prod)  
> **Auth strategy**: JWT Bearer Token via `Authorization: Bearer <accessToken>` header  
> **Standard response envelope**: All successful responses are wrapped by `IApiResponse<T>`:
> ```json
> {
>   "success": true,
>   "statusCode": 200,
>   "message": "...",
>   "data": { ... },
>   "timestamp": "2026-08-19T10:00:00.000Z",
>   "path": "/api/v1/..."
> }
> ```
> The Axios client in `src/api/client.ts` automatically unwraps `response.data.data`, so the frontend receives the inner `data` object directly.

---

## Global Error Response Shape

All `4xx` / `5xx` errors return:
```ts
interface IApiErrorResponse {
  success: false;
  statusCode: number;
  message: string;           // e.g. "Validation failed"
  error?: string;            // HTTP error name e.g. "Bad Request"
  errors?: {                 // Only on validation failures (HTTP 400)
    [fieldName: string]: string[];
  };
  timestamp: string;
  path: string;
}
```

---

## TypeScript Type Definitions

Add or update `src/types/auth.ts` in the frontend:

```ts
// src/types/auth.ts

export type UserRole = 'CUSTOMER' | 'ADMIN';

// ── User Object ────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  roles: UserRole[];
  isEmailVerified: boolean;
  isActive: boolean;
  addresses: Address[];
  wishlist: string[];           // Array of product ObjectIDs
  rewardPoints: number;
  wallet: Wallet;
  notificationPreferences: NotificationPreferences;
  recentlyViewed: RecentlyViewedItem[];
  createdAt: string;
  updatedAt: string;
}

// ── Address ────────────────────────────────────────────────
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

// ── Wallet ────────────────────────────────────────────────
export interface Wallet {
  balance: number;
  history: WalletTransaction[];
}

export interface WalletTransaction {
  amount: number;
  type: 'credit' | 'debit';
  reason: string;
  createdAt: string;
}

// ── Notification Preferences ───────────────────────────────
export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
}

// ── Recently Viewed ────────────────────────────────────────
export interface RecentlyViewedItem {
  productId: string;
  viewedAt: string;
}

// ── Auth Payloads & Responses ─────────────────────────────
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

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: Pick<User, 'id' | 'email' | 'firstName' | 'lastName' | 'roles'>;
}

export interface RegisterResponse {
  message: string;
  verificationToken: string; // Dev only – use to verify email without mail server
  user: Pick<User, 'id' | 'email' | 'firstName' | 'lastName'>;
}

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
}

export interface AddressPayload {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault?: boolean;
}
```

---

## 1. POST /auth/register — Register New Customer

**Auth required**: ❌ No  
**Frontend callers**: `authApi.register` → `useAuthStore.register`

### Request Payload
```ts
// EXACT field names that match backend RegisterDto
{
  email: string;        // Required. Must be valid email format
  password: string;     // Required. Min 8 chars, max 128 chars
  firstName: string;    // Required. Non-empty string
  lastName: string;     // Required. Non-empty string
}
```

### Example Request
```ts
authApi.register({
  email: 'jane@example.com',
  password: 'SecurePass123!',
  firstName: 'Jane',
  lastName: 'Doe',
});
```

### Success Response — HTTP 201
```json
{
  "message": "Registration successful. Please verify your email.",
  "verificationToken": "abc123...",
  "user": {
    "id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "email": "jane@example.com",
    "firstName": "Jane",
    "lastName": "Doe"
  }
}
```

> ⚠️ **`verificationToken` is only returned in dev mode.** In production, it is emailed to the user. Store it and call `POST /auth/verify-email` with it before the user can log in.

### Validation Errors — HTTP 400
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "errors": {
    "email":     ["Please enter a valid email address"],
    "password":  ["Password must be at least 8 characters long"],
    "firstName": ["First name is required"],
    "lastName":  ["Last name is required"]
  }
}
```

### Conflict Error — HTTP 409
```json
{
  "message": "A user with this email address already exists"
}
```

### Frontend Implementation in `src/api/auth.ts`
```ts
register: async (payload: RegisterPayload): Promise<RegisterResponse> => {
  // payload must have: { email, password, firstName, lastName }
  return apiClient.post('/auth/register', payload);
},
```

---

## 2. POST /auth/login — Login User

**Auth required**: ❌ No  
**Frontend callers**: `authApi.login` → `useAuthStore.login`

### Request Payload
```ts
{
  email: string;     // Required. Registered email address
  password: string;  // Required. Account password
}
```

### Example Request
```ts
authApi.login({ email: 'jane@example.com', password: 'SecurePass123!' });
```

### Success Response — HTTP 200
```json
{
  "accessToken": "eyJhbGci...short-lived (15m)",
  "refreshToken": "eyJhbGci...long-lived (7d)",
  "user": {
    "id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "email": "jane@example.com",
    "firstName": "Jane",
    "lastName": "Doe",
    "roles": ["CUSTOMER"]
  }
}
```

> Store `accessToken` in `localStorage` as `access_token`. The Axios client picks it up automatically via the request interceptor.

### Error Responses
| HTTP | Scenario |
|------|----------|
| 400  | Validation failed (missing/invalid fields) |
| 401  | Invalid email or password |
| 401  | Account deactivated |

### Frontend Implementation in `src/api/auth.ts`
```ts
login: async (credentials: LoginPayload): Promise<AuthResponse> => {
  // credentials must have: { email, password }
  const data = await apiClient.post<AuthResponse>('/auth/login', credentials);
  if (data.accessToken) {
    localStorage.setItem('access_token', data.accessToken);
  }
  return data;
},
```

---

## 3. POST /auth/verify-email — Verify Email Address

**Auth required**: ❌ No  
**When to call**: After registration, before first login

### Request Payload
```ts
{ token: string } // The verificationToken from register response
```

### Example Request
```ts
apiClient.post('/auth/verify-email', { token: 'abc123...' });
```

### Success Response — HTTP 200
```json
{ "message": "Email verified successfully. You can now log in." }
```

### Error — HTTP 400
```json
{ "message": "Verification token is invalid or has expired" }
```

---

## 4. POST /auth/refresh — Refresh Access Token

**Auth required**: 🔑 Refresh Token (via `Authorization: Bearer <refreshToken>`)  
**Frontend callers**: `authApi.refreshToken`  
**When to call**: When an API call returns 401 and you have a valid refresh token

### Request
```ts
// Pass the refresh token as the Bearer token in the Authorization header
// No body required — the JwtRefreshGuard extracts the token from the header
```

### Success Response — HTTP 200
```json
{
  "accessToken": "eyJhbGci...new access token",
  "refreshToken": "eyJhbGci...new refresh token (rotated)",
  "user": { "id": "...", "email": "...", "firstName": "...", "lastName": "...", "roles": ["CUSTOMER"] }
}
```

> ⚠️ **Token Rotation**: Each refresh invalidates the old refresh token and issues a new one. Update both tokens in storage.

### Frontend Implementation in `src/api/auth.ts`
```ts
refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
  // Temporarily set the refresh token as the Bearer token
  const data = await apiClient.post<AuthResponse>('/auth/refresh', {}, {
    headers: { Authorization: `Bearer ${refreshToken}` },
  });
  if (data.accessToken) {
    localStorage.setItem('access_token', data.accessToken);
  }
  return data;
},
```

---

## 5. POST /auth/forgot-password — Request Password Reset

**Auth required**: ❌ No

### Request Payload
```ts
{ email: string }
```

### Success Response — HTTP 200
```json
{
  "message": "If the email exists, a password reset link has been generated",
  "resetToken": "xyz789..."  // Dev only – omitted in production
}
```

> The response is identical whether the email exists or not (security best practice to prevent user enumeration).

---

## 6. POST /auth/reset-password — Reset Password with Token

**Auth required**: ❌ No

### Request Payload
```ts
{
  token: string;     // Required. The resetToken from forgot-password response
  password: string;  // Required. New password. Min 8, max 128 chars
}
```

### Success Response — HTTP 200
```json
{ "message": "Password has been reset successfully. You can now login." }
```

> All existing sessions are revoked when password is reset.

### Error — HTTP 400
```json
{ "message": "Password reset token is invalid or has expired" }
```

---

## 7. POST /auth/logout — Logout Current Session

**Auth required**: ✅ Yes (`Authorization: Bearer <accessToken>`)  
**Also requires**: Pass the refresh token as the Bearer token in the `Authorization` header

### Success Response — HTTP 200
```json
{ "message": "Logged out successfully" }
```

### Frontend Implementation
```ts
logout: async (): Promise<void> => {
  const refreshToken = localStorage.getItem('refresh_token') || '';
  await apiClient.post('/auth/logout', {}, {
    headers: { Authorization: `Bearer ${refreshToken}` },
  });
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
},
```

---

## 8. POST /auth/logout-all — Logout All Devices

**Auth required**: ✅ Yes (`Authorization: Bearer <accessToken>`)

### Success Response — HTTP 200
```json
{ "message": "Logged out from all devices successfully" }
```

---

## 9. GET /users/profile — Fetch Authenticated User Profile

**Auth required**: ✅ Yes  
**Frontend callers**: `authApi.getProfile` / `profileApi.getProfile`  
**Route**: `GET /users/profile`

### Success Response — HTTP 200
```json
{
  "id": "64f1a2b3c4d5e6f7a8b9c0d1",
  "email": "jane@example.com",
  "firstName": "Jane",
  "lastName": "Doe",
  "phone": "+12125550199",
  "avatar": "/uploads/avatars/jane.jpg",
  "roles": ["CUSTOMER"],
  "isEmailVerified": true,
  "isActive": true,
  "addresses": [],
  "wishlist": [],
  "rewardPoints": 0,
  "wallet": { "balance": 0, "history": [] },
  "notificationPreferences": { "email": true, "sms": true, "push": true },
  "recentlyViewed": [],
  "createdAt": "2026-08-19T10:00:00.000Z",
  "updatedAt": "2026-08-19T10:00:00.000Z"
}
```

> `password`, `refreshTokens`, `emailVerificationToken`, `passwordResetToken` are **never** returned by this endpoint (excluded at schema level via `select: false`).

### Frontend Implementation
```ts
getProfile: (): Promise<User> => apiClient.get('/users/profile'),
```

---

## 10. PATCH /users/profile — Update Profile Information

**Auth required**: ✅ Yes  
**Frontend callers**: `authApi.updateProfile` / `profileApi.updateProfile`  
**Route**: `PATCH /users/profile`

### Request Payload (all fields optional)
```ts
{
  firstName?: string;  // Optional. New first name
  lastName?: string;   // Optional. New last name
}
```

> ⚠️ **Note**: The backend `UpdateProfileDto` only supports `firstName` and `lastName`. Email, phone, and avatar updates use dedicated endpoints. Do not send extra fields.

### Example Request
```ts
profileApi.updateProfile({ firstName: 'Priya', lastName: 'Sharma' });
```

### Success Response — HTTP 200
Returns the full updated `User` object (same shape as `GET /users/profile`).

### Frontend Implementation
```ts
updateProfile: (payload: UpdateProfilePayload): Promise<User> =>
  apiClient.patch('/users/profile', payload),
```

---

## 11. PATCH /users/profile/avatar — Upload Avatar Image

**Auth required**: ✅ Yes  
**Content-Type**: `multipart/form-data`  
**Field name**: `avatar`  
**Constraints**: Max 5MB, types: `jpg`, `jpeg`, `png`, `webp`

### Example Request
```ts
const formData = new FormData();
formData.append('avatar', file); // file is a File object
await apiClient.patch('/users/profile/avatar', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
```

### Success Response — HTTP 200
Returns updated `User` object with new `avatar` path (e.g. `/uploads/avatars/filename.jpg`).

---

## 12. GET /users/profile/addresses — Fetch Saved Addresses

**Auth required**: ✅ Yes  
**Frontend callers**: `addressesApi.getAddresses`  
**Route**: `GET /users/profile/addresses`

### Success Response — HTTP 200
```json
[
  {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d2",
    "street": "123 Fashion Blvd, Apt 4B",
    "city": "New York",
    "state": "NY",
    "postalCode": "10001",
    "country": "United States",
    "phone": "+12125550199",
    "isDefault": true
  }
]
```

### Frontend Implementation
```ts
getAddresses: (): Promise<Address[]> => apiClient.get('/users/profile/addresses'),
```

---

## 13. POST /users/profile/addresses — Add New Address

**Auth required**: ✅ Yes  
**Frontend callers**: `addressesApi.createAddress`  
**Route**: `POST /users/profile/addresses`

### Request Payload
```ts
{
  street: string;      // Required. Street name and number
  city: string;        // Required. City name
  state: string;       // Required. State or region
  postalCode: string;  // Required. Postal/ZIP code
  country: string;     // Required. Country name
  phone: string;       // Required. Delivery contact phone
  isDefault?: boolean; // Optional. Mark as default address (auto-true for first address)
}
```

### Example Request
```ts
addressesApi.createAddress({
  street: '123 Fashion Blvd, Apt 4B',
  city: 'New York',
  state: 'NY',
  postalCode: '10001',
  country: 'United States',
  phone: '+12125550199',
  isDefault: true,
});
```

### Success Response — HTTP 201
Returns the full updated `User` object (containing the updated `addresses` array).

> **Auto-default rule**: The first address added is automatically set as default regardless of the `isDefault` flag.

### Frontend Implementation
```ts
createAddress: (payload: AddressPayload): Promise<User> =>
  apiClient.post('/users/profile/addresses', payload),
```

---

## 14. PUT /users/profile/addresses/:addressId — Update Address

**Auth required**: ✅ Yes  
**Route**: `PUT /users/profile/addresses/:addressId`

### URL Params
| Param | Type | Description |
|-------|------|-------------|
| `addressId` | string | MongoDB ObjectID `_id` of the address |

### Request Payload
Same shape as `POST /users/profile/addresses` (all fields required).

### Success Response — HTTP 200
Returns full updated `User` object.

### Error — HTTP 404
```json
{ "message": "Address with ID <id> not found" }
```

### Frontend Implementation
```ts
updateAddress: (addressId: string, payload: AddressPayload): Promise<User> =>
  apiClient.put(`/users/profile/addresses/${addressId}`, payload),
```

---

## 15. DELETE /users/profile/addresses/:addressId — Delete Address

**Auth required**: ✅ Yes  
**Frontend callers**: `addressesApi.deleteAddress`  
**Route**: `DELETE /users/profile/addresses/:addressId`

### URL Params
| Param | Type | Description |
|-------|------|-------------|
| `addressId` | string | MongoDB ObjectID `_id` of the address |

### Success Response — HTTP 200
Returns updated `User` object.

> **Auto-reassign default rule**: If the deleted address was the default, the next available address is automatically set as default.

### Error — HTTP 404
```json
{ "message": "Address with ID <id> not found" }
```

### Frontend Implementation
```ts
deleteAddress: (addressId: string): Promise<User> =>
  apiClient.delete(`/users/profile/addresses/${addressId}`),
```

---

## 16. GET /users/profile/wishlist — Fetch Wishlist

**Auth required**: ✅ Yes  
**Frontend callers**: `useWishlistStore.fetchWishlist`  
**Route**: `GET /users/profile/wishlist`

### Success Response — HTTP 200
```json
[
  "64f1a2b3c4d5e6f7a8b9c0d3",
  "64f1a2b3c4d5e6f7a8b9c0d4"
]
```
Returns an array of product MongoDB ObjectIDs. Resolve them to full products using `GET /products/:id`.

### Frontend Implementation
```ts
getWishlist: (): Promise<string[]> => apiClient.get('/users/profile/wishlist'),
```

---

## 17. POST /users/profile/wishlist/:productId — Add to Wishlist

**Auth required**: ✅ Yes  
**Frontend callers**: `useWishlistStore.toggleWishlist` (add branch)  
**Route**: `POST /users/profile/wishlist/:productId`

### URL Params
| Param | Type | Description |
|-------|------|-------------|
| `productId` | string | MongoDB ObjectID of the product |

### Example Request
```ts
apiClient.post(`/users/profile/wishlist/${productId}`);
```

### Success Response — HTTP 201
Returns updated `User` object.

### Frontend Implementation
```ts
addToWishlist: (productId: string): Promise<User> =>
  apiClient.post(`/users/profile/wishlist/${productId}`),
```

---

## 18. DELETE /users/profile/wishlist/:productId — Remove from Wishlist

**Auth required**: ✅ Yes  
**Frontend callers**: `useWishlistStore.toggleWishlist` (remove branch)  
**Route**: `DELETE /users/profile/wishlist/:productId`

### URL Params
| Param | Type | Description |
|-------|------|-------------|
| `productId` | string | MongoDB ObjectID of the product |

### Success Response — HTTP 200
Returns updated `User` object.

### Frontend Implementation
```ts
removeFromWishlist: (productId: string): Promise<User> =>
  apiClient.delete(`/users/profile/wishlist/${productId}`),
```

---

## Complete Frontend API Service Files

### `src/api/auth.ts` — Full Reference Implementation
```ts
import { apiClient } from './client';
import { AuthResponse, RegisterResponse, LoginPayload, RegisterPayload } from '../types/auth';

export const authApi = {
  /** Register new customer — payload: { email, password, firstName, lastName } */
  register: (payload: RegisterPayload): Promise<RegisterResponse> =>
    apiClient.post('/auth/register', payload),

  /** Login — payload: { email, password } */
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const data = await apiClient.post<AuthResponse>('/auth/login', payload);
    if (data.accessToken) {
      localStorage.setItem('access_token', data.accessToken);
      localStorage.setItem('refresh_token', data.refreshToken);
    }
    return data;
  },

  /** Verify email with token from register response */
  verifyEmail: (token: string) =>
    apiClient.post('/auth/verify-email', { token }),

  /** Request password reset email */
  forgotPassword: (email: string) =>
    apiClient.post('/auth/forgot-password', { email }),

  /** Reset password using reset token */
  resetPassword: (token: string, password: string) =>
    apiClient.post('/auth/reset-password', { token, password }),

  /** Refresh access token — pass refreshToken in Authorization header */
  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const data = await apiClient.post<AuthResponse>('/auth/refresh', {}, {
      headers: { Authorization: `Bearer ${refreshToken}` },
    });
    if (data.accessToken) {
      localStorage.setItem('access_token', data.accessToken);
      localStorage.setItem('refresh_token', data.refreshToken);
    }
    return data;
  },

  /** Get current user profile */
  getProfile: () => apiClient.get('/users/profile'),

  /** Update profile (firstName and/or lastName) */
  updateProfile: (payload: { firstName?: string; lastName?: string }) =>
    apiClient.patch('/users/profile', payload),

  /** Logout current session */
  logout: async () => {
    const refreshToken = localStorage.getItem('refresh_token') || '';
    await apiClient.post('/auth/logout', {}, {
      headers: { Authorization: `Bearer ${refreshToken}` },
    }).catch(() => {});
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },

  /** Logout all device sessions */
  logoutAll: () => apiClient.post('/auth/logout-all'),
};
```

### `src/api/addresses.ts` — Full Reference Implementation
```ts
import { apiClient } from './client';
import { Address, AddressPayload, User } from '../types/auth';

export const addressesApi = {
  /** Fetch all saved delivery addresses */
  getAddresses: (): Promise<Address[]> =>
    apiClient.get('/users/profile/addresses'),

  /** Add new address — all fields required except isDefault */
  createAddress: (payload: AddressPayload): Promise<User> =>
    apiClient.post('/users/profile/addresses', payload),

  /** Update address by ID — all fields required */
  updateAddress: (addressId: string, payload: AddressPayload): Promise<User> =>
    apiClient.put(`/users/profile/addresses/${addressId}`, payload),

  /** Delete address by ID */
  deleteAddress: (addressId: string): Promise<User> =>
    apiClient.delete(`/users/profile/addresses/${addressId}`),
};
```

### `src/api/wishlist.ts` — Full Reference Implementation
```ts
import { apiClient } from './client';
import { User } from '../types/auth';

export const wishlistApi = {
  /** Get array of wishlist product IDs */
  getWishlist: (): Promise<string[]> =>
    apiClient.get('/users/profile/wishlist'),

  /** Add product to wishlist */
  addToWishlist: (productId: string): Promise<User> =>
    apiClient.post(`/users/profile/wishlist/${productId}`),

  /** Remove product from wishlist */
  removeFromWishlist: (productId: string): Promise<User> =>
    apiClient.delete(`/users/profile/wishlist/${productId}`),
};
```

---

## Common Integration Mistakes to Avoid

| ❌ Wrong | ✅ Correct | Why |
|----------|------------|-----|
| `{ name: 'Jane Doe' }` to `/auth/register` | `{ firstName: 'Jane', lastName: 'Doe' }` | Backend `RegisterDto` has no `name` field |
| `{ pass: 'secret' }` to `/auth/login` | `{ password: 'secret' }` | Backend `LoginDto` uses `password` not `pass` |
| `PUT /users/profile` | `PATCH /users/profile` | Profile update uses PATCH, not PUT |
| Sending extra fields (e.g. `phone`, `email`) to PATCH profile | Only `firstName`, `lastName` | `UpdateProfileDto` only allows these two fields |
| `/users/addresses/:id` | `/users/profile/addresses/:id` | All user sub-resources are under `/users/profile/...` |
| `/users/wishlist/toggle` | `POST /users/profile/wishlist/:productId` or `DELETE .../:productId` | No toggle endpoint; use add and remove separately |
| Sending body to refresh | No body — pass refresh token as Bearer header | `JwtRefreshGuard` reads token from Authorization header |

---

## Quick Reference Table

| Method | Endpoint | Auth | Payload / Params | Response |
|--------|----------|------|-----------------|----------|
| POST | `/auth/register` | ❌ | `{ email, password, firstName, lastName }` | `{ message, verificationToken, user }` |
| POST | `/auth/verify-email` | ❌ | `{ token }` | `{ message }` |
| POST | `/auth/login` | ❌ | `{ email, password }` | `{ accessToken, refreshToken, user }` |
| POST | `/auth/refresh` | 🔑 RefreshToken | No body | `{ accessToken, refreshToken, user }` |
| POST | `/auth/forgot-password` | ❌ | `{ email }` | `{ message, resetToken? }` |
| POST | `/auth/reset-password` | ❌ | `{ token, password }` | `{ message }` |
| POST | `/auth/logout` | ✅ JWT | No body (pass refresh token in header) | `{ message }` |
| POST | `/auth/logout-all` | ✅ JWT | No body | `{ message }` |
| GET | `/users/profile` | ✅ JWT | — | Full `User` object |
| PATCH | `/users/profile` | ✅ JWT | `{ firstName?, lastName? }` | Full `User` object |
| PATCH | `/users/profile/avatar` | ✅ JWT | `FormData { avatar: File }` | Full `User` object |
| GET | `/users/profile/addresses` | ✅ JWT | — | `Address[]` |
| POST | `/users/profile/addresses` | ✅ JWT | `{ street, city, state, postalCode, country, phone, isDefault? }` | Full `User` object |
| PUT | `/users/profile/addresses/:addressId` | ✅ JWT | Same as POST | Full `User` object |
| DELETE | `/users/profile/addresses/:addressId` | ✅ JWT | — | Full `User` object |
| GET | `/users/profile/wishlist` | ✅ JWT | — | `string[]` (product IDs) |
| POST | `/users/profile/wishlist/:productId` | ✅ JWT | — | Full `User` object |
| DELETE | `/users/profile/wishlist/:productId` | ✅ JWT | — | Full `User` object |
