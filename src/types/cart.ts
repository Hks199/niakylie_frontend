import type { ProductVariant } from './product';
export type { ProductVariant };

export interface CartProduct {
  id: string;
  _id?: string;
  title: string;
  slug: string;
  brand?: string;
  thumbnail?: string;
  images?: string[];
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
}

export interface CartItem {
  id: string;
  _id?: string;
  productId: string | CartProduct;
  variantId?: string | ProductVariant;
  quantity: number;
  price: number;
  originalPrice?: number;
  discount?: number;
  subtotal?: number;
  product?: CartProduct;
  variant?: ProductVariant;
  name?: string;
  title?: string;
  brand?: string;
  image?: string;
  color?: string;
  size?: string;
  sku?: string;
}

export interface CartTotals {
  subtotal: number;
  discount: number;
  couponDiscount: number;
  shippingFee: number;
  tax: number;
  total: number;
}

export interface Cart {
  id: string;
  _id?: string;
  userId?: string;
  guestId?: string;
  items: CartItem[];
  itemCount: number;
  totals: CartTotals;
  appliedCoupon?: string | null;
  updatedAt?: string;
}

export interface AddToCartPayload {
  productId: string;
  variantId?: string;
  quantity: number;
}

export interface UpdateQuantityPayload {
  quantity: number;
}
