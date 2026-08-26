# Frontend Integration Guide for NiaKylie E-Commerce Backend

This guide details how to connect your React + Tailwind CSS frontend (or Next.js app) to the **NiaKylie Backend API**.

---

## 1. Backend Service URLs & Base Setup

| Environment | Base API URL | Swagger Documentation |
|---|---|---|
| **Local Development** | `http://localhost:3000/api/v1` | `http://localhost:3000/api/docs` |
| **Production** | `https://api.niakylie.com/api/v1` | `https://api.niakylie.com/api/docs` |

### Frontend Environment Variable (`.env.local`)
```env
# Vite
VITE_API_BASE_URL=http://localhost:3000/api/v1

# Next.js
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api/v1
```

---

## 2. Authentication & Session Strategy

The backend supports two types of sessions:

1. **Guest Sessions (Unauthenticated Users)**:
   - Generate a unique UUID on initial app load and store in `localStorage`:
     `const guestId = localStorage.getItem('guest_id') || crypto.randomUUID();`
   - Send `x-guest-id: <guestId>` in every HTTP request header.
   - This allows users to add items to their shopping cart before logging in.

2. **Customer & Admin Authentication**:
   - Send `POST /auth/login` with email and password.
   - Receive JWT `accessToken`.
   - Send `Authorization: Bearer <accessToken>` in request headers for protected endpoints.
   - When logging in, guest cart items automatically merge into the user cart via `POST /cart/merge-guest-cart`.

---

## 3. Production Axios API Client (`src/api/client.ts`)

Here is the exact Axios client configuration to include in your frontend codebase:

```typescript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

// Get or initialize guest session ID
const getGuestId = (): string => {
  let guestId = localStorage.getItem('guest_id');
  if (!guestId) {
    guestId = 'guest_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem('guest_id', guestId);
  }
  return guestId;
};

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── REQUEST INTERCEPTOR ──────────────────────────────────────────────────
apiClient.interceptors.request.use((config) => {
  // Attach JWT Token if user is logged in
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Always attach Guest ID for anonymous cart support
  config.headers['x-guest-id'] = getGuestId();

  return config;
});

// ─── RESPONSE INTERCEPTOR ─────────────────────────────────────────────────
apiClient.interceptors.response.use(
  (response) => {
    // Standard response format: { success: true, statusCode: 200, data: ..., timestamp: ... }
    return response.data.data !== undefined ? response.data.data : response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login on 401 Unauthorized
      localStorage.removeItem('access_token');
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    return Promise.reject(error.response?.data || error.message);
  }
);
```

---

## 4. Module-by-Module Integration Examples

### A. Authentication Module (`src/api/auth.ts`)
```typescript
import { apiClient } from './client';

export const authApi = {
  login: async (credentials: { email: string; pass: string }) => {
    const data = await apiClient.post('/auth/login', credentials);
    if (data.accessToken) {
      localStorage.setItem('access_token', data.accessToken);
    }
    return data;
  },

  register: (payload: { name: string; email: string; password: string }) =>
    apiClient.post('/auth/register', payload),

  getProfile: () => apiClient.get('/users/profile'),
};
```

---

### B. Product Catalog & Search (`src/api/products.ts`)
```typescript
import { apiClient } from './client';

export const productsApi = {
  // Fetch homepage banners
  getBanners: (type = 'HOMEPAGE') => apiClient.get(`/banners?type=${type}`),

  // Fetch product list with filters & sorting
  getProducts: (params: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    brandId?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: 'price_asc' | 'price_desc' | 'rating' | 'latest';
  }) => apiClient.get('/products', { params }),

  // Fetch product details by slug or ID
  getProductBySlug: (slug: string) => apiClient.get(`/products/${slug}`),
};
```

---

### C. Shopping Cart Integration (`src/api/cart.ts`)
```typescript
import { apiClient } from './client';

export const cartApi = {
  getCart: () => apiClient.get('/cart'),

  addToCart: (item: { productId: string; variantId: string; quantity: number }) =>
    apiClient.post('/cart/items', item),

  updateQuantity: (itemId: string, quantity: number) =>
    apiClient.put(`/cart/items/${itemId}`, { quantity }),

  applyCoupon: (code: string) => apiClient.post('/cart/coupon', { code }),

  removeCoupon: () => apiClient.delete('/cart/coupon'),
};
```

---

### D. Razorpay Payment Integration Flow

To integrate Razorpay payment checkout on your frontend:

1. **Include Razorpay Checkout SDK Script** in `index.html`:
   `<script src="https://checkout.razorpay.com/v1/checkout.js"></script>`

2. **Execute Payment Flow**:
```typescript
import { apiClient } from './client';

export async function handleRazorpayCheckout(orderId: string, totalAmount: number) {
  // Step 1: Create payment transaction order on backend
  const paymentOrder = await apiClient.post('/payment/create-order', {
    orderId,
    provider: 'RAZORPAY',
    amount: totalAmount,
    currency: 'INR',
  });

  // Step 2: Open Razorpay Gateway Popup
  const options = {
    key: paymentOrder.keyId, // Razorpay Key ID
    amount: paymentOrder.amountInPaisa,
    currency: paymentOrder.currency,
    name: 'NiaKylie Fashion',
    description: `Payment for Order #${orderId}`,
    order_id: paymentOrder.providerOrderId, // Razorpay Order ID
    handler: async function (response: any) {
      // Step 3: Verify payment signature on backend
      try {
        const verifyRes = await apiClient.post('/payment/verify', {
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        });

        if (verifyRes.status === 'success') {
          window.location.href = `/order-success/${orderId}`;
        }
      } catch (err) {
        alert('Payment verification failed. Please contact support.');
      }
    },
    prefill: {
      name: 'Customer Name',
      email: 'customer@example.com',
      contact: '9876543210',
    },
    theme: {
      color: '#FF3E6C',
    },
  };

  const razorpay = new (window as any).Razorpay(options);
  razorpay.open();
}
```

---

### E. Admin Dashboard Analytics (`src/api/admin.ts`)
```typescript
import { apiClient } from './client';

export const adminApi = {
  getSummary: () => apiClient.get('/admin/dashboard/summary'),
  getRevenue: (period = 'monthly') => apiClient.get(`/admin/dashboard/revenue?period=${period}`),
  getOrderBreakdown: () => apiClient.get('/admin/dashboard/orders-breakdown'),
  getTopProducts: () => apiClient.get('/admin/dashboard/top-products'),
};
```

---

## 5. CORS Configuration

Ensure the backend `.env` allows your frontend domain.

In local development:
`CORS_ORIGIN=http://localhost:5173,http://localhost:3000`

In production:
`CORS_ORIGIN=https://niakylie.com,https://admin.niakylie.com`

---

### F. Wishlist Integration (`src/api/wishlist.ts`)
```typescript
import { apiClient } from './client';

export const wishlistApi = {
  // Get all wishlisted products (authenticated user only)
  getWishlist: () => apiClient.get('/users/wishlist'),

  // Toggle wishlist: adds if not present, removes if already wishlisted
  toggle: (productId: string, variantId?: string) =>
    apiClient.post('/users/wishlist/toggle', { productId, variantId }),

  // Move item from wishlist to cart
  moveToCart: (productId: string, variantId: string, quantity = 1) =>
    apiClient.post('/users/wishlist/move-to-cart', { productId, variantId, quantity }),
};
```

---

### G. Order Management (`src/api/orders.ts`)
```typescript
import { apiClient } from './client';

export const ordersApi = {
  // Get paginated list of user's orders
  getOrders: (params?: { page?: number; limit?: number; status?: string }) =>
    apiClient.get('/orders', { params }),

  // Get single order detail with full timeline
  getOrderById: (orderId: string) => apiClient.get(`/orders/${orderId}`),

  // Download invoice as PDF (returns a Blob URL for browser download)
  downloadInvoice: async (orderId: string) => {
    const response = await apiClient.get(`/orders/${orderId}/invoice`, {
      responseType: 'blob',
    });
    const url = URL.createObjectURL(new Blob([response], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `NiaKylie_Invoice_${orderId}.pdf`;
    link.click();
  },

  // Request order cancellation (valid only for PENDING / CONFIRMED status)
  cancelOrder: (orderId: string, reason: string) =>
    apiClient.post(`/orders/${orderId}/cancel`, { reason }),

  // Request return (valid only for DELIVERED orders within return window)
  requestReturn: (orderId: string, reason: string) =>
    apiClient.post(`/orders/${orderId}/return`, { reason }),
};
```

---

### H. Reviews & Ratings (`src/api/reviews.ts`)
```typescript
import { apiClient } from './client';

export const reviewsApi = {
  // Fetch paginated reviews for a product (public)
  getProductReviews: (productId: string, params?: { page?: number; limit?: number; sort?: string }) =>
    apiClient.get(`/reviews/product/${productId}`, { params }),

  // Submit a review (requires verified purchase)
  submitReview: (payload: {
    productId: string;
    orderId: string;
    rating: number;
    title?: string;
    comment?: string;
  }) => apiClient.post('/reviews', payload),

  // Upload review images/videos (multipart/form-data)
  uploadReviewMedia: (reviewId: string, files: File[]) => {
    const formData = new FormData();
    files.forEach((f) => formData.append('files', f));
    return apiClient.post(`/reviews/${reviewId}/media`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Mark a review as helpful
  markHelpful: (reviewId: string) =>
    apiClient.post(`/reviews/${reviewId}/helpful`),
};
```

---

### I. Notifications (`src/api/notifications.ts`)
```typescript
import { apiClient } from './client';

export const notificationsApi = {
  // Get user notifications (Order Updates, Offers, Coupons)
  getNotifications: (params?: { page?: number; limit?: number; isRead?: boolean }) =>
    apiClient.get('/notifications', { params }),

  // Mark a single notification as read
  markAsRead: (notificationId: string) =>
    apiClient.patch(`/notifications/${notificationId}/read`),

  // Mark all unread notifications as read
  markAllAsRead: () => apiClient.patch('/notifications/read-all'),

  // Get unread count (for badge display in header)
  getUnreadCount: () => apiClient.get('/notifications/unread-count'),

  // Update notification preferences (Email, Order Updates, Offers, Coupons)
  updatePreferences: (preferences: {
    emailOrderUpdates?: boolean;
    emailOffers?: boolean;
    emailCoupons?: boolean;
  }) => apiClient.put('/notifications/preferences', preferences),
};
```

---

### J. CMS, FAQs & Blog (`src/api/cms.ts`)
```typescript
import { apiClient } from './client';

export const cmsApi = {
  // Get a static policy page by slug: 'about-us' | 'privacy-policy' | 'terms-and-conditions' | 'refund-policy' | 'shipping-policy'
  getPage: (slug: string) => apiClient.get(`/cms/pages/${slug}`),

  // Get all FAQs (grouped by category)
  getFaqs: () => apiClient.get('/cms/faqs'),

  // Get paginated blog list
  getBlogs: (params?: { page?: number; limit?: number; search?: string; tag?: string }) =>
    apiClient.get('/cms/blogs', { params }),

  // Get a single blog post by slug
  getBlogBySlug: (slug: string) => apiClient.get(`/cms/blogs/${slug}`),
};
```

---

### K. Global Search (`src/api/search.ts`)
```typescript
import { apiClient } from './client';

export const searchApi = {
  // Text search across products (full-text MongoDB index)
  searchProducts: (query: string, params?: { page?: number; limit?: number }) =>
    apiClient.get('/search', { params: { q: query, ...params } }),

  // Autocomplete suggestion endpoint for predictive search bar
  autocomplete: (query: string) =>
    apiClient.get('/search/autocomplete', { params: { q: query } }),
};
```

---

### L. User Address Management (`src/api/addresses.ts`)
```typescript
import { apiClient } from './client';

export const addressApi = {
  getAddresses: () => apiClient.get('/users/addresses'),

  addAddress: (address: {
    label?: string;
    type: 'HOME' | 'OFFICE' | 'OTHER';
    firstName: string;
    lastName: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isDefault?: boolean;
  }) => apiClient.post('/users/addresses', address),

  updateAddress: (addressId: string, address: Partial<Parameters<typeof addressApi.addAddress>[0]>) =>
    apiClient.put(`/users/addresses/${addressId}`, address),

  deleteAddress: (addressId: string) =>
    apiClient.delete(`/users/addresses/${addressId}`),
};
```

---

## 6. TanStack Query (React Query) Patterns

Use TanStack Query v5 to cache and auto-refetch backend data. Install:
```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
```

### Example: Product Listing Query Hook (`src/hooks/useProducts.ts`)
```typescript
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { productsApi } from '../api/products';

export function useProducts(filters: { page?: number; categoryId?: string; sort?: string }) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => productsApi.getProducts(filters),
    placeholderData: keepPreviousData, // Smooth pagination (no loading flicker)
    staleTime: 1000 * 60 * 5,          // Cache for 5 minutes (matches backend Redis TTL)
  });
}
```

### Example: Cart Query Hook (`src/hooks/useCart.ts`)
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartApi } from '../api/cart';

export function useCart() {
  const queryClient = useQueryClient();

  const cartQuery = useQuery({
    queryKey: ['cart'],
    queryFn: () => cartApi.getCart(),
    staleTime: 0, // Always fresh
  });

  const addToCartMutation = useMutation({
    mutationFn: cartApi.addToCart,
    onSuccess: () => {
      // Auto-refetch cart to show updated item count
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  return { cart: cartQuery.data, addToCart: addToCartMutation.mutate, isLoading: cartQuery.isLoading };
}
```

---

## 7. Zustand Store Setup (`src/store/`)

### Auth Store (`src/store/useAuthStore.ts`)
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../api/auth';

interface AuthState {
  user: any | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const data = await authApi.login({ email, pass: password });
        localStorage.setItem('access_token', data.accessToken);
        set({ user: data.user, token: data.accessToken, isAuthenticated: true });
      },

      logout: () => {
        localStorage.removeItem('access_token');
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    { name: 'niakylie-auth' }
  )
);
```

---

## 8. Protected Route Wrapper (`src/components/ProtectedRoute.tsx`)

```typescript
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export function ProtectedRoute({ requiredRole }: { requiredRole?: 'CUSTOMER' | 'ADMIN' }) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

// Usage in App.tsx router config:
// <Route element={<ProtectedRoute />}>
//   <Route path="/account" element={<AccountPage />} />
//   <Route path="/checkout" element={<CheckoutPage />} />
// </Route>
// <Route element={<ProtectedRoute requiredRole="ADMIN" />}>
//   <Route path="/admin/*" element={<AdminDashboard />} />
// </Route>
```

---

## 9. Standard API Response Shape Reference

All backend API responses follow this unified format:

```typescript
// ✅ Success Response
{
  "success": true,
  "statusCode": 200,
  "message": "Success",
  "data": { /* actual payload */ },
  "meta": {           // present only on paginated list responses
    "page": 1,
    "limit": 20,
    "total": 1248,
    "totalPages": 63,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "timestamp": "2026-08-12T10:00:00.000Z",
  "path": "/api/v1/products"
}

// ❌ Error Response
{
  "success": false,
  "statusCode": 404,
  "message": "Product not found",
  "error": "Not Found",
  "errors": {                   // field-level errors from class-validator
    "email": ["must be a valid email address"],
    "password": ["must be at least 8 characters"]
  },
  "timestamp": "2026-08-12T10:00:00.000Z",
  "path": "/api/v1/users/login"
}
```

---

## 10. Complete API Endpoint Reference

### Public Routes (No Authentication Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | App info |
| `GET` | `/health` | Health check |
| `POST` | `/auth/register` | Register new customer |
| `POST` | `/auth/login` | Customer / Admin login |
| `POST` | `/auth/refresh` | Refresh JWT token |
| `GET` | `/categories` | List all categories |
| `GET` | `/categories/:idOrSlug` | Category detail |
| `GET` | `/brands` | List all brands |
| `GET` | `/products` | Paginated product listing |
| `GET` | `/products/:idOrSlug` | Product detail |
| `GET` | `/search` | Full-text product search |
| `GET` | `/search/autocomplete` | Predictive search suggestions |
| `GET` | `/banners` | Active banners by type |
| `GET` | `/reviews/product/:productId` | Product reviews list |
| `GET` | `/cms/pages/:slug` | Static CMS page content |
| `GET` | `/cms/faqs` | All FAQs grouped by category |
| `GET` | `/cms/blogs` | Paginated blog list |
| `GET` | `/cms/blogs/:slug` | Blog post detail |
| `GET` | `/coupons` | Available public coupons |

### Customer Routes (JWT Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/users/profile` | Get authenticated user profile |
| `PUT` | `/users/profile` | Update profile (name, phone, avatar) |
| `GET` | `/users/addresses` | List saved delivery addresses |
| `POST` | `/users/addresses` | Add new delivery address |
| `PUT` | `/users/addresses/:id` | Update delivery address |
| `DELETE` | `/users/addresses/:id` | Delete delivery address |
| `GET` | `/users/wishlist` | Get wishlist items |
| `POST` | `/users/wishlist/toggle` | Add/Remove from wishlist |
| `POST` | `/users/wishlist/move-to-cart` | Move wishlist item to cart |
| `GET` | `/cart` | Get active cart (guest or user) |
| `POST` | `/cart/items` | Add product variant to cart |
| `PUT` | `/cart/items/:itemId` | Update cart item quantity |
| `DELETE` | `/cart/items/:itemId` | Remove item from cart |
| `POST` | `/cart/coupon` | Apply coupon code to cart |
| `DELETE` | `/cart/coupon` | Remove applied coupon from cart |
| `POST` | `/cart/merge-guest-cart` | Merge guest cart on login |
| `POST` | `/checkout/review` | Checkout order preview & totals |
| `POST` | `/checkout/place-order` | Place order |
| `POST` | `/payment/create-order` | Create Razorpay/Stripe transaction |
| `POST` | `/payment/verify` | Verify payment signature |
| `GET` | `/orders` | List user's orders |
| `GET` | `/orders/:id` | Order detail with timeline |
| `GET` | `/orders/:id/invoice` | Download invoice PDF |
| `POST` | `/orders/:id/cancel` | Cancel order |
| `POST` | `/orders/:id/return` | Initiate return request |
| `GET` | `/reviews` | Get user's submitted reviews |
| `POST` | `/reviews` | Submit a product review |
| `POST` | `/reviews/:id/helpful` | Mark review as helpful |
| `GET` | `/notifications` | Get user notifications |
| `PATCH` | `/notifications/:id/read` | Mark notification as read |
| `PATCH` | `/notifications/read-all` | Mark all notifications as read |

### Admin Routes (JWT + ADMIN Role Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/admin/dashboard/summary` | KPI summary metrics |
| `GET` | `/admin/dashboard/revenue` | Revenue analytics timeline |
| `GET` | `/admin/dashboard/orders-breakdown` | Order status distribution |
| `GET` | `/admin/dashboard/top-products` | Top selling products |
| `GET` | `/admin/dashboard/top-categories` | Top revenue categories |
| `GET` | `/admin/dashboard/top-customers` | High value customers |
| `GET` | `/admin/dashboard/inventory-alerts` | Low/out-of-stock items |
| `DELETE` | `/admin/dashboard/cache` | Flush dashboard cache |
| `POST` | `/categories` | Create category |
| `PUT` | `/categories/:id` | Update category |
| `DELETE` | `/categories/:id` | Delete category |
| `POST` | `/products` | Create product |
| `PUT` | `/products/:id` | Update product |
| `DELETE` | `/products/:id` | Delete product |
| `POST` | `/banners` | Create banner |
| `PUT` | `/banners/:id` | Update banner |
| `DELETE` | `/banners/:id` | Delete banner |
| `GET` | `/admin/orders` | All orders (admin view) |
| `PUT` | `/admin/orders/:id/status` | Update order status |
| `GET` | `/admin/reviews` | All reviews (moderation) |
| `DELETE` | `/admin/reviews/:id` | Delete inappropriate review |
