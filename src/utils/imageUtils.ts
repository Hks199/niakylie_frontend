const DEFAULT_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80';

/**
 * Normalizes image paths by attaching host origin for backend uploads
 * and returning fallback images for invalid/empty paths.
 */
export function formatImageUrl(url?: string | null): string {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return DEFAULT_FALLBACK_IMAGE;
  }

  const cleanUrl = url.trim();

  // If already absolute URL or base64 data URI
  if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://') || cleanUrl.startsWith('data:') || cleanUrl.startsWith('blob:')) {
    return cleanUrl;
  }

  // Handle backend relative uploads path (e.g., '/uploads/products/123.jpg')
  const baseUrl = (import.meta.env.VITE_API_BASE_URL || ' https://api.niakylie.com/api/v1')
    .replace(/\/api\/v1\/?$/, '')
    .replace(/\/+$/, '');

  const normalizedPath = cleanUrl.startsWith('/') ? cleanUrl : `/${cleanUrl}`;
  return `${baseUrl}${normalizedPath}`;
}

export default formatImageUrl;
