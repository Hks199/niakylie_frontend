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
      // Return synthetic matching suggestions if backend search API is offline
      const mockItems: SearchAutocompleteSuggestion[] = [
        { text: 'Silk Saree with Zari Border', category: 'Sarees', price: 2999, originalPrice: 5999 },
        { text: 'Floral Printed Anarkali Kurta', category: 'Ethnic Wear', price: 1899, originalPrice: 3799 },
        { text: 'Embroidered Velvet Lehenga', category: 'Lehengas', price: 7999, originalPrice: 15999 },
        { text: 'Georgette Designer Gown', category: 'Dresses', price: 3499, originalPrice: 6999 },
        { text: 'Cotton Dailywear Kurti', category: 'Kurtas', price: 899, originalPrice: 1799 },
      ];
      return mockItems.filter((item) => item.text.toLowerCase().includes(query.toLowerCase()));
    }
  },

  /**
   * Full text search query for products
   */
  searchProducts: (query: string, params?: { page?: number; limit?: number }) => {
    return apiClient.get('/search', { params: { q: query, ...params } });
  },
};
