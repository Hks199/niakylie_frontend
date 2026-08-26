import { CartProduct, ProductVariant } from './cart';

export interface WishlistItem {
  id: string;
  _id?: string;
  productId: string | CartProduct;
  variantId?: string | ProductVariant;
  product?: CartProduct;
  variant?: ProductVariant;
  addedAt: string;
}

export interface Wishlist {
  id: string;
  _id?: string;
  userId: string;
  items: WishlistItem[];
}
