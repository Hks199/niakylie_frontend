import { apiClient } from './client';

export interface SearchAutocompleteSuggestion {
  text: string;
  category?: string;
  productId?: string;
  slug?: string;
  price?: number;
  originalPrice?: number;
  image?: string;
}

export interface SearchAutocompleteResponse {
  query: string;
  suggestions: SearchAutocompleteSuggestion[];
  recentPopular: string[];
}

export const searchApi = {
  /**
   * Autocomplete search suggestions
   */
  autocomplete: async (query: string): Promise<SearchAutocompleteSuggestion[]> => {
    if (!query || query.trim().length < 2) return [];
    try {
      const data = await apiClient.get<SearchAutocompleteSuggestion[] | SearchAutocompleteResponse>(
        '/search/autocomplete',
        { params: { q: query } }
      );
      if (Array.isArray(data)) return data;
      return (data as any)?.suggestions || [];
    } catch (error) {
      console.warn('Search autocomplete failed:', error);
      return [];
    }
  },

  /**
   * Full text search query for products
   */
  searchProducts: (query: string, params?: { page?: number; limit?: number }) => {
    return apiClient.get('/search', { params: { q: query, ...params } });
  },
};
