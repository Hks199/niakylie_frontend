import { useQuery } from '@tanstack/react-query';
import { ChevronRight, Clock, Loader2 } from 'lucide-react';
import { cmsApi } from '../api/cms';

interface CmsPageProps {
  slug: string;
}

const SLUG_LABELS: Record<string, string> = {
  'contact-us': 'Contact Us',
  'about-us': 'About Us',
  'privacy-policy': 'Privacy Policy',
  'terms-and-conditions': 'Terms & Conditions',
  'refund-policy': 'Refund & Return Policy',
  'shipping-policy': 'Shipping Policy',
};

// Extract headings from HTML string for table of contents
function extractHeadings(html: string): { id: string; label: string }[] {
  const matches = [...html.matchAll(/<h2[^>]*id="([^"]+)"[^>]*>([^<]+)<\/h2>/gi)];
  return matches.map(([, id, label]) => ({ id, label }));
}

export function CmsPage({ slug }: CmsPageProps) {
  const { data: page, isLoading } = useQuery({
    queryKey: ['cms-page', slug],
    queryFn: () => cmsApi.getPage(slug),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-brand-crimson" />
      </div>
    );
  }

  if (!page) return null;

  const headings = extractHeadings(page.content);
  const label = SLUG_LABELS[slug] || page.title;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-1.5 text-[11px] font-semibold text-slate-400 mb-6">
        <a href="/" className="hover:text-brand-crimson transition-colors">Home</a>
        <ChevronRight className="w-3 h-3" />
        <a href="/pages" className="hover:text-brand-crimson transition-colors">Legal & Policies</a>
        <ChevronRight className="w-3 h-3" />
        <span className="text-brand-slate-dark font-bold">{label}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Table of Contents Sidebar */}
        {headings.length > 0 && (
          <aside className="lg:col-span-3 sticky top-24 hidden lg:block">
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <p className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider mb-3">
                Contents
              </p>
              <nav className="space-y-2">
                {headings.map(({ id, label }) => (
                  <a
                    key={id}
                    href={`#${id}`}
                    className="block text-xs font-semibold text-slate-500 hover:text-brand-crimson transition-colors py-0.5 border-l-2 border-transparent hover:border-brand-crimson pl-3"
                  >
                    {label}
                  </a>
                ))}
              </nav>
            </div>
          </aside>
        )}

        {/* Main Content Area */}
        <article className={headings.length > 0 ? 'lg:col-span-9' : 'lg:col-span-12'}>
          <div className="bg-white border border-gray-100 rounded-3xl p-8 sm:p-10 shadow-sm">
            <h1 className="text-3xl font-extrabold text-brand-slate-dark font-display mb-2">
              {page.title}
            </h1>
            <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 font-semibold mb-8 pb-6 border-b border-gray-100">
              <Clock className="w-3.5 h-3.5" />
              <span>Last updated: {new Date(page.lastUpdated).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>

            {/* Rendered HTML Content */}
            <div
              className="prose prose-sm max-w-none text-slate-600 leading-relaxed
                [&_h2]:text-lg [&_h2]:font-extrabold [&_h2]:text-brand-slate-dark [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:scroll-mt-24
                [&_p]:mb-4 [&_p]:text-slate-600 [&_p]:text-sm [&_p]:leading-relaxed
                [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1
                [&_strong]:font-extrabold [&_strong]:text-brand-slate-dark"
              dangerouslySetInnerHTML={{ __html: page.content }}
            />

            {/* Dedicated Interactive Google Map for Contact Us page */}
            {slug === 'contact-us' && (
              <div className="mt-10 pt-8 border-t border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-lg font-extrabold text-brand-slate-dark flex items-center space-x-2">
                      <span className="text-brand-crimson">📍</span>
                      <span>Store Location Map</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Sarora, Raipur, Chhattisgarh, India
                    </p>
                  </div>
                  <a
                    href="https://www.google.com/maps/dir/?api=1&destination=21.290281,81.611905"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center space-x-2 bg-brand-crimson hover:bg-brand-crimson-dark text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-all hover:scale-105 active:scale-95"
                  >
                    <span>Get Directions</span>
                    <ChevronRight className="w-4 h-4" />
                  </a>
                </div>

                {/* Google Maps Responsive Frame */}
                <div className="relative w-full h-[380px] rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-slate-100">
                  <iframe
                    title="NiaKylie Store Google Map Location"
                    src="https://maps.google.com/maps?q=21.290281,81.611905&t=&z=16&ie=UTF8&iwloc=&output=embed"
                    className="w-full h-full border-0"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>
            )}
          </div>
        </article>
      </div>
    </div>
  );
}

export default CmsPage;
