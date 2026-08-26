import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, ChevronDown, Loader2, HelpCircle } from 'lucide-react';
import { cmsApi } from '../api/cms';

const CATEGORIES = ['All', 'General', 'Orders', 'Shipping', 'Returns', 'Payments'] as const;
type Category = typeof CATEGORIES[number];

export function FaqPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [openId, setOpenId] = useState<string | null>(null);

  const { data: faqs = [], isLoading } = useQuery({
    queryKey: ['faqs'],
    queryFn: () => cmsApi.getFaqs(),
  });

  const filtered = useMemo(() => {
    return faqs.filter((faq) => {
      const matchesCategory = activeCategory === 'All' || faq.category === activeCategory;
      const matchesSearch =
        !searchQuery ||
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [faqs, activeCategory, searchQuery]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="text-center mb-10 space-y-3">
        <div className="w-14 h-14 bg-brand-crimson/10 text-brand-crimson rounded-full flex items-center justify-center mx-auto">
          <HelpCircle className="w-7 h-7" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-slate-dark font-display">
          Frequently Asked Questions
        </h1>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          Can't find what you're looking for? Email us at <span className="text-brand-crimson font-bold">support@niakylie.com</span>
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search questions e.g. return policy, shipping time..."
          className="w-full bg-white border border-gray-200 rounded-2xl pl-11 pr-4 py-3.5 text-sm font-medium text-slate-700 outline-none focus:border-brand-crimson shadow-sm transition-colors"
        />
      </div>

      {/* Category Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-2 mb-8">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`flex-shrink-0 text-[11px] font-extrabold uppercase tracking-wider px-4 py-2 rounded-xl transition-all ${
              activeCategory === cat
                ? 'bg-brand-crimson text-white shadow-md'
                : 'bg-white border border-gray-200 text-slate-600 hover:border-brand-crimson hover:text-brand-crimson'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* FAQ Accordion */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-7 h-7 animate-spin text-brand-crimson" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <p className="font-bold text-brand-slate-dark">No results found</p>
          <p className="text-xs mt-1">Try a different search term or category.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className={`bg-white border rounded-2xl overflow-hidden shadow-sm transition-all ${isOpen ? 'border-brand-crimson/30' : 'border-gray-100'}`}
              >
                <button
                  onClick={() => setOpenId(isOpen ? null : faq.id)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className={`text-sm font-extrabold pr-4 leading-snug ${isOpen ? 'text-brand-crimson' : 'text-brand-slate-dark'}`}>
                    {faq.question}
                  </span>
                  <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all ${isOpen ? 'bg-brand-crimson text-white rotate-180' : 'bg-slate-100 text-slate-500'}`}>
                    <ChevronDown className="w-4 h-4 transition-transform" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 text-sm text-slate-600 leading-relaxed border-t border-gray-100 pt-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default FaqPage;
