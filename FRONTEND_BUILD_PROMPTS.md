# Myntra-Style React + Tailwind CSS Frontend Master Generation Prompts

This document contains step-by-step prompts designed for AI Coding Assistants (such as Antigravity, Claude, ChatGPT, etc.) to build a modern **Myntra-style E-Commerce Frontend** tailored to integrate with the **NiaKylie Fashion Backend API**.

---

## Technical Stack & Architectural Guidelines

- **Core Framework**: React 18 (Vite or Next.js 14 App Router) + TypeScript
- **Styling**: Tailwind CSS (Custom color palette, glassmorphism, responsive utilities)
- **Icons**: Lucide React (`lucide-react`)
- **State Management**: Zustand or Redux Toolkit (Cart, Wishlist, User Auth, Guest Session)
- **Data Fetching & Caching**: TanStack Query v5 (React Query) + Axios
- **Animations**: Framer Motion
- **UI Components**: Radix UI / Headless UI / Shadcn UI
- **Charts (Admin)**: Recharts
- **Payment Integration**: Razorpay Checkout SDK (`Checkout.js`) & Stripe Elements

---

## 🚀 STEP-BY-STEP PROMPT ROADMAP

---

### PROMPT 1: Project Setup, Design Tokens & API Client Setup

```text
Act as a Principal Frontend Engineer. Initialize a modern React 18 TypeScript application (using Vite or Next.js 14) and configure Tailwind CSS to build an ultra-premium Myntra-style e-commerce frontend for "NiaKylie Fashion".

Key Deliverables:
1. Configure Tailwind CSS with a curated fashion color palette:
   - Primary: Deep Crimson (#E63946 / #FF3E6C)
   - Secondary: Slate Dark (#1D3557 / #282C3F)
   - Accent: Warm Gold (#D4AF37)
   - Background Light: #F5F5F6 & #FFFFFF
   - Typography: Inter or Outfit font family

2. Create an Axios API Client (`src/api/client.ts`) connected to  https://api.niakylie.com/api/v1:
   - Request Interceptor: Attach JWT `Authorization: Bearer <token>` from Auth Store if present, and attach `x-guest-id` header from Guest Store for unauthenticated sessions.
   - Response Interceptor: Automatically extract response `.data.data` matching standard API shape `{ success: true, statusCode: 200, message: 'Success', data: ... }`. Standardize 401 Unauthorized handling by triggering auth logout.

3. Setup State Management (Zustand):
   - `useAuthStore`: user, token, isAuthenticated, login(), logout()
   - `useGuestStore`: guestId (UUID generated and stored in localStorage)
   - `useCartStore`: cartItems, itemCount, cartTotals, fetchCart(), addToCart(), updateQuantity(), removeItem()
   - `useWishlistStore`: wishlistItems, toggleWishlist()

4. Export a fully typed API service layer for Authentication (`/auth/login`, `/auth/register`, `/auth/profile`).
```

---

### PROMPT 2: Header, Megamenu & Responsive Navigation

```text 
Build a Myntra-inspired navigation header and footer component system for NiaKylie Fashion using React, Tailwind CSS, and Lucide React icons.

Key Features & Layout Requirements:
1. Top Announcement Bar: Sliding promotional ticker ("Flat 50% Off Diwali Sale | Free Shipping on orders over ₹999 | Code: FESTIVE50").
2. Main Header (Sticky with blur backdrop `backdrop-blur-md`):
   - Logo: "NiaKylie" with elegant fashion typography.
   - Megamenu Navigation Links: WOMEN, ETHNIC WEAR, SAREES, DRESSES, BRANDS, SALE.
     - On hover: Open multi-column dropdown showing Subcategories with thumbnail images, trending collections, and featured brands.
   - Search Bar (Center): Instant predictive search input with search icon, auto-complete dropdown showing recent searches and matching products with prices.
   - Action Icons (Right):
     - Profile (Dropdown: Login/Register if guest; My Orders, Saved Addresses, Profile, Admin Dashboard link if admin, Logout).
     - Wishlist (Heart icon with dynamic count badge).
     - Bag / Cart (Shopping Bag icon with dynamic total count badge and slide-over preview trigger).
3. Mobile Drawer Navigation: Responsive hamburger menu button for mobile screens opening a smooth slide-out drawer with accordion subcategory list.
4. Myntra-style Footer:
   - Category columns, Customer policies (100% Original Products, 14-day returns, Free Delivery), Newsletter subscription form, Social media handles, Payment methods icons (Razorpay, Visa, Mastercard, UPI).
```

---

### PROMPT 3: Homepage & Dynamic Banner Carousel

```text
Build a dynamic, high-converting homepage for NiaKylie Fashion using React, Tailwind CSS, and Framer Motion.

Integrate with Backend APIs:
- Fetch Homepage Banners: `GET /api/v1/banners?type=HOMEPAGE` & `GET /api/v1/banners?type=OFFER`
- Fetch Categories: `GET /api/v1/categories`
- Fetch Featured & Trending Products: `GET /api/v1/products?isFeatured=true` and `GET /api/v1/products?isTrending=true`
- Fetch Active Policy/CMS Blogs: `GET /api/v1/cms/blogs`

Homepage Section Layout:
1. Hero Banner Carousel: Auto-playing full-width banner carousel displaying desktop (`imageUrl`) and mobile (`mobileImageUrl`) images, with CTAs linking to target collection pages (`linkUrl`).
2. Category Bubble Bar: Horizontal scrollable circle avatars featuring top categories (Sarees, Kurta Sets, Lehengas, Fusion Wear, Indo-Western).
3. Offer & Festival Banner Grid: 2x2 and 3x1 visual promo grid showcasing "Deal of the Day", "Festive Discounts", and "Limited Time Coupon Deals".
4. Trending Products Carousel: Product cards with image hover zoom, price tag, discount percentage badge, star ratings, and quick "Add to Bag" / Wishlist toggle.
5. Brand Spotlight: Grid of featured luxury fashion brands.
6. Customer Review Testimonials: Customer feedback slider with rating stars and verified buyer badges.
7. Fashion Journal / Blog Feed: Cards showing recent blog posts with cover image, category badge, and reading time.
```

---

### PROMPT 4: Product Listing Page (PLP) & Advanced Filtering

```text
Build a Myntra-style Product Listing Page (PLP) for NiaKylie Fashion with multi-facet sidebar filtering, sorting, and pagination.

Integrate with Backend APIs:
- `GET /api/v1/products` and `GET /api/v1/search`
- Query Params Supported: `page`, `limit`, `search`, `categoryId`, `brandId`, `minPrice`, `maxPrice`, `rating`, `isFeatured`, `isTrending`, `isBestSeller`, `sort` (price_asc, price_desc, rating, latest).

UI Requirements:
1. Breadcrumb Trail: Home > Women > Ethnic Wear > Sarees.
2. Top Bar: Total item count display ("Sarees - 1,248 items"), grid density switcher (3 columns / 4 columns view), and Sort By Dropdown (Recommended, Price: Low to High, Price: High to Low, Customer Rating, Newest Arrivals).
3. Left Filter Sidebar (Collapsible):
   - Categories (Checkboxes with count)
   - Brands (Searchable checkbox list)
   - Price Range (Dual-thumb slider & min/max inputs)
   - Discount Percentage (10% and above, 30% and above, 50% and above)
   - Customer Rating (4★ & above, 3★ & above)
   - Quick Filter Tags (Clear All Filters button)
4. Product Grid Card (Myntra Card Design):
   - Image Slider / Hover Image Swap on mouse enter.
   - Heart Wishlist Button (top right over image) that toggles active red fill.
   - Brand name in bold uppercase, product title, offer price, strikethrough MRP, and green discount percentage tag (e.g. "₹1,499  ~~₹2,999~~ (50% OFF)").
   - Average rating badge (e.g., "4.2 ★ | 1.2k").
   - Quick "Select Size & Add to Bag" overlay on hover.
5. Pagination Controls: Previous/Next buttons with page number buttons and "Load More"Infinite scroll option.
```

---

### PROMPT 5: Product Details Page (PDP) & Variant Selector

```text
Build a feature-rich Product Details Page (PDP) for NiaKylie Fashion matching Myntra's design.

Integrate with Backend APIs:
- `GET /api/v1/products/:idOrSlug`
- `GET /api/v1/reviews/product/:productId`
- `POST /api/v1/cart/items` (Add to Cart)

UI Requirements:
1. Product Gallery (Left Side):
   - 2x2 grid view on desktop / Main image viewer with thumbnail column.
   - Image magnification zoom preview on hover.
2. Product Info (Right Side):
   - Brand name, Product title, Rating & Review summary pill ("4.3 ★ | 85 Reviews").
   - Pricing section: Offer Price (large font), Original MRP (strikethrough), Discount % badge, Inclusive of all taxes notice.
   - Color Variant Selector: Swatches showing available colors with active selection border.
   - Size Variant Selector: Size buttons (S, M, L, XL, XXL) with stock indicator ("Only 2 left!"). Disabled state for out-of-stock sizes.
   - Size Chart Modal trigger button.
   - Primary Action Buttons:
     - "ADD TO BAG" (Primary Red CTA button with Shopping Bag icon).
     - "WISHLIST" (Secondary border button with Heart icon).
3. Delivery & Pincode Checker:
   - Pincode input box with "Check" button to display estimated delivery date (e.g. "Delivery by 15 Aug, Thursday").
4. Product Details Accordion:
   - Description, Material & Care, Specifications table (Fabric, Pattern, Weave Type, Occasion).
5. Customer Reviews & Ratings Section:
   - Overall rating distribution bar chart (5★ to 1★).
   - User reviews list showing rating stars, review title, comment text, uploaded user photos, verified purchase badge, and "Helpful (12)" vote button.
6. Similar / Recommended Products Slider.
```

---

### PROMPT 6: Shopping Cart Slide-Over & Full Cart Page

```text
Build a Myntra-style Shopping Cart (Bag) experience including a Slide-over Drawer and a full Cart Page (`/cart`).

Integrate with Backend APIs:
- `GET /api/v1/cart` (Fetches customer or guest cart)
- `POST /api/v1/cart/items` (Add item)
- `PUT /api/v1/cart/items/:itemId` (Update quantity)
- `DELETE /api/v1/cart/items/:itemId` (Remove item)
- `POST /api/v1/cart/coupon` (Apply coupon)
- `DELETE /api/v1/cart/coupon` (Remove coupon)
- `POST /api/v1/cart/items/:itemId/move-to-wishlist`

UI & Logic Requirements:
1. Left/Right Split Layout:
   - Left Side: List of cart items:
     - Item image, product title, brand, selected color/size, seller info.
     - Quantity dropdown selector (1 to 10).
     - Price breakdown per item.
     - Action Links: "Remove", "Move to Wishlist".
   - Right Side: Price Details Card:
     - Total MRP
     - Discount on MRP (Green text `-₹1,500`)
     - Coupon Discount (with "Apply Coupon" modal/drawer)
     - Convenience / Shipping Fee ("FREE" or `₹99`)
     - Estimated Tax
     - **Total Amount payable**
     - "PLACE ORDER" Primary CTA button.
2. Coupon Code Section:
   - Input box for promo code + "Apply" button.
   - List of available public coupons fetched from `GET /api/v1/coupons` with "APPLY" action.
3. Delivery Address Preview header at top of cart.
```

---

### PROMPT 7: Multi-Step Checkout & Payment Gateways

```text
Build a multi-step Checkout flow for NiaKylie Backend supporting Address Selection, Shipping Options, and Razorpay/Stripe Payment integration.

Integrate with Backend APIs:
- Address: `GET /api/v1/users/addresses`, `POST /api/v1/users/addresses`
- Shipping & Order Summary: `POST /api/v1/checkout/review`
- Payment Order Creation: `POST /api/v1/payment/create-order`
- Payment Verification: `POST /api/v1/payment/verify`

Checkout Flow Steps:
1. Step 1 - Shipping Address Selection:
   - Saved addresses cards with "Deliver Here" selection radio.
   - "Add New Address" modal form (Street, City, State, Postal Code, Country, Phone, Address Type: Home/Office).
2. Step 2 - Delivery & Order Summary Review:
   - Selected delivery speed (Standard Delivery / Express Delivery).
   - Order items summary list preview.
3. Step 3 - Payment Method Selection:
   - Payment Options:
     1. Razorpay (UPI, Credit/Debit Cards, NetBanking, Wallets)
     2. Stripe (International Credit Cards)
     3. Cash on Delivery (COD)
   - When Razorpay is selected: Initialize `new window.Razorpay(options)`, open official Razorpay popup overlay, handle success callback, and invoke `POST /api/v1/payment/verify`.
4. Order Success Receipt Page (`/order-success/:orderId`):
   - Confetti animation celebration, Order ID display, Estimated Delivery Date, Download Invoice button, and "Track Order" button.
```

---

### PROMPT 8: Customer Account, Orders & Interactive Tracking

```text
Build a Myntra-style Customer Profile & Order Tracking Portal (`/account/*`).

Integrate with Backend APIs:
- User Profile: `GET /api/v1/users/profile`, `PUT /api/v1/users/profile`
- Orders List: `GET /api/v1/orders`
- Order Details & Tracking: `GET /api/v1/orders/:id`
- Invoice: `GET /api/v1/orders/:id/invoice`

Page Components:
1. Customer Account Sidebar Navigation:
   - My Orders, My Wishlist, Saved Addresses, Profile Info, Notifications, Logout.
2. My Orders Page:
   - Order cards displaying Order Number, Date, Status Badge (`CONFIRMED`, `SHIPPED`, `DELIVERED`, `CANCELLED`), items thumbnail list, and total amount.
   - Action buttons: "View Order Details", "Download Invoice", "Cancel Order" (if status is PENDING/CONFIRMED).
3. Order Details & Stepper Tracking Timeline:
   - Visual progress stepper bar:
     `[Order Placed] ---- [Packed] ---- [Shipped] ---- [Out for Delivery] ---- [Delivered]`
   - Courier partner name & tracking number link.
   - Items list with price and "Write Review" button (opens Rating & Review Modal).
```

---

### PROMPT 9: CMS, FAQs & Fashion Blog Publishing System

```text
Build the CMS static pages, categorized FAQ accordions, and Blog publishing pages for NiaKylie.

Integrate with Backend APIs:
- Static Pages: `GET /api/v1/cms/pages/:slug` (`about-us`, `privacy-policy`, `terms-and-conditions`, `refund-policy`, `shipping-policy`)
- FAQs: `GET /api/v1/cms/faqs`
- Blogs: `GET /api/v1/cms/blogs` and `GET /api/v1/cms/blogs/:slug`

UI Requirements:
1. Static Policy Reader Page (`/pages/:slug`):
   - Clean, readable typography layout rendering policy content with breadcrumb and table of contents.
2. FAQ Page (`/faqs`):
   - Search bar ("Search questions e.g. return policy, shipping time").
   - Category Tabs (General, Orders, Shipping, Returns, Payments).
   - Accordion expand/collapse animation for question & answer pairs.
3. Blog Listing Page (`/blogs`):
   - Featured Hero Blog post banner.
   - Grid of blog post cards showing cover image, author, date, category tag, view count (`viewCount`), and summary.
4. Blog Details Reader (`/blogs/:slug`):
   - Cover image, title, author info, view counter, rich text HTML content rendering, tags list, social share buttons, and related blog posts.
```

---

### PROMPT 10: Admin Dashboard & Management Panel

```text
Build a comprehensive Admin Dashboard Panel (`/admin/*`) for NiaKylie Fashion using React, Tailwind CSS, and Recharts.

Integrate with Backend APIs:
- Summary KPIs: `GET /api/v1/admin/dashboard/summary`
- Revenue Analytics: `GET /api/v1/admin/dashboard/revenue`
- Order Status Breakdown: `GET /api/v1/admin/dashboard/orders-breakdown`
- Top Products: `GET /api/v1/admin/dashboard/top-products`
- Top Categories: `GET /api/v1/admin/dashboard/top-categories`
- Top Customers: `GET /api/v1/admin/dashboard/top-customers`
- Inventory Alerts: `GET /api/v1/admin/dashboard/inventory-alerts`

Admin UI Sections:
1. Top KPI Summary Grid: Total Revenue, Total Orders, Average Order Value (AOV), Total Customers, Low Stock Alerts.
2. Analytics Charts:
   - Line/Area Chart: Revenue trends over time (Daily, Weekly, Monthly, Yearly switcher).
   - Donut/Pie Chart: Order status breakdown (Delivered, Shipped, Cancelled).
   - Bar Chart: Top revenue-generating categories.
3. Data Tables:
   - Top Selling Products Table (Product image, title, SKU, quantity sold, total revenue).
   - Top Spending Customers Table (Customer name, email, order count, total spent).
   - Inventory Health Alerts Table (Items with 0 or low stock, with "Restock" action button).
```
