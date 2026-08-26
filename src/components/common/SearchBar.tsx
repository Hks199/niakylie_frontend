import { useState, useEffect, useRef } from 'react';
import { Search, X, History, TrendingUp, ChevronRight, Tag } from 'lucide-react';
import { searchApi, SearchAutocompleteSuggestion } from '../../api/search';

const TRENDING_SEARCHES = ['Silk Sarees', 'Anarkali Kurta', 'Velvet Lehenga', 'Indo-Western Dress', 'Banarasi Handloom'];

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchAutocompleteSuggestion[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recent_searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        // ignore parsing error
      }
    }
  }, []);

  // Handle outside click to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search query autocomplete fetch
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const results = await searchApi.autocomplete(query);
        setSuggestions(results);
      } catch (error) {
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSearchSubmit = (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    // Save to recent searches
    const updated = [searchTerm, ...recentSearches.filter((s) => s !== searchTerm)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recent_searches', JSON.stringify(updated));
    setIsOpen(false);
    // Navigate or trigger search
    window.location.href = `/search?q=${encodeURIComponent(searchTerm)}`;
  };

  const removeRecentSearch = (e: React.MouseEvent, term: string) => {
    e.stopPropagation();
    const updated = recentSearches.filter((s) => s !== term);
    setRecentSearches(updated);
    localStorage.setItem('recent_searches', JSON.stringify(updated));
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      {/* Search Input Container */}
      <div className="relative flex items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit(query)}
          placeholder="Search for Sarees, Kurtas, Lehengas, Brands & More..."
          className="w-full bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-xs sm:text-sm text-brand-slate placeholder:text-slate-400 pl-10 pr-9 py-2.5 rounded-full border border-transparent focus:border-brand-crimson/50 focus:ring-4 focus:ring-brand-crimson/10 outline-none transition-all duration-200"
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setSuggestions([]);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Predictive Autocomplete Dropdown Drawer */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl border border-gray-100 shadow-2xl rounded-2xl p-4 z-50 animate-in fade-in slide-in-from-top-1 duration-150 max-h-96 overflow-y-auto no-scrollbar">
          {/* Active Autocomplete Results */}
          {query.trim().length >= 2 ? (
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Matching Products & Categories</span>
                {isLoading && <span className="animate-spin text-brand-crimson">...</span>}
              </div>

              {suggestions.length > 0 ? (
                <div className="space-y-1.5">
                  {suggestions.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSearchSubmit(item.text)}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-brand-crimson/5 cursor-pointer group transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        {item.image ? (
                          <img src={item.image} alt={item.text} className="w-9 h-9 object-cover rounded-lg" />
                        ) : (
                          <div className="w-9 h-9 bg-brand-crimson/10 text-brand-crimson rounded-lg flex items-center justify-center">
                            <Tag className="w-4 h-4" />
                          </div>
                        )}
                        <div>
                          <p className="text-xs font-semibold text-brand-slate-dark group-hover:text-brand-crimson">
                            {item.text}
                          </p>
                          {item.category && <p className="text-[10px] text-slate-400">{item.category}</p>}
                        </div>
                      </div>

                      {item.price && (
                        <div className="text-right">
                          <span className="text-xs font-bold text-brand-slate-dark">₹{item.price.toLocaleString('en-IN')}</span>
                          {item.originalPrice && (
                            <span className="text-[10px] text-slate-400 line-through ml-1.5">
                              ₹{item.originalPrice.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : !isLoading ? (
                <p className="text-xs text-slate-500 py-3 text-center">No matching products found for "{query}"</p>
              ) : null}
            </div>
          ) : (
            /* Default View: Recent Searches & Trending Topics */
            <div className="space-y-4">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center">
                    <History className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    <span>Recent Searches</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {recentSearches.map((term, i) => (
                      <span
                        key={i}
                        onClick={() => handleSearchSubmit(term)}
                        className="inline-flex items-center text-xs bg-slate-100 hover:bg-slate-200 text-brand-slate px-2.5 py-1 rounded-full cursor-pointer transition-colors"
                      >
                        {term}
                        <button
                          onClick={(e) => removeRecentSearch(e, term)}
                          className="ml-1 text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Trending Searches */}
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center">
                  <TrendingUp className="w-3.5 h-3.5 mr-1 text-brand-crimson" />
                  <span>Trending Right Now</span>
                </div>
                <div className="space-y-1">
                  {TRENDING_SEARCHES.map((term, i) => (
                    <div
                      key={i}
                      onClick={() => handleSearchSubmit(term)}
                      className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-gray-50 text-xs font-medium text-slate-700 hover:text-brand-crimson cursor-pointer transition-colors group"
                    >
                      <span>{term}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-brand-crimson group-hover:translate-x-0.5 transition-all" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchBar;
