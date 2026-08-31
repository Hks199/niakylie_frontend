export interface ProductVariant {
  id: string;
  _id?: string;
  sku: string;
  size: string;
  color: string;
  colorHex?: string;
  price: number;
  offerPrice?: number;
  mrp?: number;
  originalPrice?: number;
  stock: number;
  imageUrl?: string;
  images?: string[];
  isActive?: boolean;
}

export interface Product {
  id: string;
  _id?: string;
  name?: string;
  title: string;
  slug: string;
  sku?: string;
  brand?: string | { _id?: string; name?: string; slug?: string; logo?: string };
  category?: string | { _id?: string; name?: string; slug?: string };
  description?: string;
  shortDescription?: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  stockQuantity?: number;
  rating?: number;
  reviewCount?: number;
  thumbnail?: string;
  images?: string[];
  fabric?: string;
  material?: string;
  pattern?: string;
  season?: string;
  productCollection?: string;
  careInstructions?: string;
  sizes?: string[];
  colors?: string[];
  variants?: ProductVariant[];
  categoryId?: string | { _id?: string; name?: string; slug?: string };
  isFeatured?: boolean;
  isTrending?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  createdAt?: string;
}


export interface BlogPost {
  id: string;
  _id?: string;
  title: string;
  slug: string;
  summary: string;
  content?: string;
  coverImage: string;
  author: string;
  category: string;
  readingTime: string;
  publishedAt: string;
}

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  avatarUrl: string;
  rating: number;
  comment: string;
  productName?: string;
  verifiedBuyer: boolean;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  bannerUrl?: string;
  productCount?: number;
}
