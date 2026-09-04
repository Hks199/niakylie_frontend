import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, ChevronDown, Loader2, HelpCircle, MessageSquare, ThumbsUp, ThumbsDown, Mail, Phone, ArrowRight } from 'lucide-react';
import { cmsApi, FaqItem } from '../api/cms';

const CATEGORIES = ['All', 'General', 'Orders', 'Shipping', 'Returns', 'Payments'] as const;
type Category = typeof CATEGORIES[number];

export function FaqPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [openId, setOpenId] = useState<string | null>(null);
  const [feedbackState, setFeedbackState] = useState<Record<string, 'yes' | 'no'>>({});

  const { data: faqs = [], isLoading } = useQuery({
    queryKey: ['faqs'],
    queryFn: () => cmsApi.getFaqs(),
  });

  const filtered = useMemo(() => {
    return faqs.filter((faq: FaqItem) => {
      const matchesCategory = activeCategory === 'All' || faq.category.toLowerCase() === activeCategory.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [faqs, activeCategory, searchQuery]);

  const handleFeedback = (faqId: string, val: 'yes' | 'no') => {
    setFeedbackState((prev) => ({ ...prev, [faqId]: val }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-rose-50/20 py-10 sm:py-16 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-300">
      <div className="max-w-5xl mx-auto space-y-10 sm:space-y-14">
        
        {/* Hero Banner Header */}
        <div className="relative overflow-hidden bg-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-2xl border border-slate-800 text-center space-y-4">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-brand-crimson/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand-crimson/20 border border-brand-crimson/40 text-rose-300 text-xs font-bold uppercase tracking-widest">
              <HelpCircle className="w-3.5 h-3.5 text-brand-crimson" />
              <span>NiaKylie Help Center</span>
            </div>
            
            <h1 className="text-3xl sm:text-5xl font-extrabold font-display tracking-tight text-white leading-tight">
              Frequently Asked Questions
            </h1>
            
            <p className="text-sm sm:text-base text-slate-300 font-medium">
              Everything you need to know about our handcrafted sarees, custom measurements, order delivery, and return policies.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative z-10 max-w-xl mx-auto pt-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search e.g. return policy, shipping time, banarasi saree care..."
                className="w-full bg-white/95 text-slate-800 placeholder-slate-400 rounded-2xl pl-12 pr-4 py-4 text-sm font-medium outline-none border-2 border-transparent focus:border-brand-crimson shadow-xl transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full w-5 h-5 flex items-center justify-center"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Category Pills & Controls */}
        <div className="space-y-6">
          <div className="flex items-center justify-center flex-wrap gap-2 sm:gap-3">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold uppercase tracking-wider transition-all duration-200 ${
                    isActive
                      ? 'bg-brand-crimson text-white shadow-lg shadow-brand-crimson/25 scale-105'
                      : 'bg-white text-slate-600 border border-gray-200 hover:border-brand-crimson hover:text-brand-crimson shadow-sm'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Result Count Info */}
          <div className="flex items-center justify-between text-xs text-slate-400 px-2 font-medium">
            <span>Showing {filtered.length} {filtered.length === 1 ? 'question' : 'questions'}</span>
            {searchQuery && (
              <span>Filter: "<strong className="text-brand-slate-dark">{searchQuery}</strong>"</span>
            )}
          </div>
        </div>

        {/* FAQ Accordion List */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-brand-crimson" />
            <p className="text-xs font-semibold text-slate-500">Loading help articles...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center space-y-4 shadow-card">
            <div className="w-16 h-16 bg-rose-50 text-brand-crimson rounded-full flex items-center justify-center mx-auto">
              <MessageSquare className="w-8 h-8" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="text-lg font-extrabold text-brand-slate-dark font-display">No questions found</h3>
              <p className="text-xs text-slate-500">
                We couldn't find any questions matching your query. Try resetting filters or reach out directly to customer support.
              </p>
            </div>
            <button
              onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}
              className="inline-flex items-center space-x-2 bg-brand-crimson text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md hover:bg-brand-crimson-dark transition-colors uppercase tracking-wider"
            >
              Reset Search & Filters
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((faq: FaqItem, idx: number) => {
              const faqId = faq.id || faq._id || `faq-${idx}`;
              const isOpen = openId === faqId;
              const feedback = feedbackState[faqId];

              return (
                <div
                  key={faqId}
                  className={`bg-white border rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-300 ${
                    isOpen
                      ? 'border-brand-crimson/40 shadow-lg ring-1 ring-brand-crimson/20'
                      : 'border-gray-100 hover:border-gray-200 shadow-sm'
                  }`}
                >
                  <button
                    onClick={() => setOpenId(isOpen ? null : faqId)}
                    className="w-full flex items-center justify-between p-5 sm:p-6 text-left group"
                  >
                    <div className="flex items-center space-x-3 pr-4">
                      <span className="flex-shrink-0 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-500 text-[10px] font-extrabold uppercase tracking-wider group-hover:bg-rose-50 group-hover:text-brand-crimson transition-colors">
                        {faq.category}
                      </span>
                      <span className={`text-sm sm:text-base font-extrabold leading-snug transition-colors ${
                        isOpen ? 'text-brand-crimson' : 'text-brand-slate-dark group-hover:text-brand-crimson'
                      }`}>
                        {faq.question}
                      </span>
                    </div>

                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      isOpen ? 'bg-brand-crimson text-white rotate-180' : 'bg-slate-100 text-slate-600 group-hover:bg-rose-100 group-hover:text-brand-crimson'
                    }`}>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-6 pt-4 border-t border-gray-100 space-y-4 animate-in fade-in duration-200">
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal whitespace-pre-line">
                        {faq.answer}
                      </p>

                      {/* Helpful Feedback Prompt */}
                      <div className="flex items-center justify-between pt-3 border-t border-slate-50 text-xs text-slate-400">
                        <span className="font-semibold">Was this answer helpful?</span>
                        
                        {feedback ? (
                          <span className="font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-[11px]">
                            Thank you for your feedback! ✨
                          </span>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleFeedback(faqId, 'yes')}
                              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700 font-bold transition-all"
                            >
                              <ThumbsUp className="w-3.5 h-3.5" />
                              <span>Yes</span>
                            </button>
                            <button
                              onClick={() => handleFeedback(faqId, 'no')}
                              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl border border-gray-200 hover:border-rose-500 hover:bg-rose-50 hover:text-rose-700 font-bold transition-all"
                            >
                              <ThumbsDown className="w-3.5 h-3.5" />
                              <span>No</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Contact Support CTA Box */}
        <div className="bg-gradient-to-r from-rose-50 via-white to-amber-50/50 border border-rose-100 rounded-3xl p-6 sm:p-10 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-lg sm:text-xl font-extrabold text-brand-slate-dark font-display">
              Still have questions? We're here to help!
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-lg">
              Our dedicated customer care team is available Monday to Saturday, 10:00 AM – 7:00 PM IST to assist with orders and custom designs.
            </p>
          </div>

          <div className="flex items-center flex-wrap justify-center gap-3">
            <a
              href="https://wa.me/919589928337"
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-5 py-3 rounded-2xl shadow-md transition-all uppercase tracking-wider"
            >
              <Phone className="w-4 h-4" />
              <span>WhatsApp Us</span>
            </a>

            <a
              href="/pages/contact-us"
              className="flex items-center space-x-2 bg-brand-crimson hover:bg-brand-crimson-dark text-white font-extrabold text-xs px-5 py-3 rounded-2xl shadow-md transition-all uppercase tracking-wider group"
            >
              <Mail className="w-4 h-4" />
              <span>Contact Page</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}

export default FaqPage;
