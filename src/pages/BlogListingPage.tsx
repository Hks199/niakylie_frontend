import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Eye, Clock, Loader2, Sparkles, ArrowRight, BookOpen, Instagram, Facebook, Phone, Globe } from 'lucide-react';
import { cmsApi, BlogPost } from '../api/cms';

const CATEGORIES = [
  'All',
  'Saree Styling',
  'Saree Guide',
  'Saree Fabrics',
  'Occasion Wear',
  'Trending Sarees',
  'Traditional Sarees',
  'Saree Care',
  'NIAKYLIE Stories',
];

export function BlogListingPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const { data: blogs = [], isLoading } = useQuery({
    queryKey: ['blogs'],
    queryFn: () => cmsApi.getBlogs(),
  });

  const navigate = (slug: string) => {
    window.history.pushState(null, '', `/blogs/${slug}`);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-brand-crimson" />
      </div>
    );
  }

  const filteredBlogs = selectedCategory === 'All'
    ? blogs
    : blogs.filter((b) => b.category.toLowerCase() === selectedCategory.toLowerCase());

  const featured = filteredBlogs.length > 0 ? filteredBlogs[0] : null;
  const gridBlogs = filteredBlogs.length > 0 ? filteredBlogs.slice(1) : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 animate-in fade-in duration-300">
      {/* 1. Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-950 via-brand-slate-dark to-slate-900 text-white p-8 sm:p-14 shadow-2xl text-center border border-amber-500/20">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-brand-crimson/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-500/20 to-brand-crimson/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-amber-500/30 text-amber-300 text-xs font-extrabold uppercase tracking-widest">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>SAREE JOURNAL</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold font-display tracking-tight text-white leading-tight">
            Stories • Style • Tradition • You
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed pt-1">
            Discover the world of sarees with NIAKYLIE — from traditional weaves and timeless classics to modern styling ideas, occasion-ready looks, fabric guides, and everything you need to choose your perfect saree.
          </p>
        </div>
      </div>

      {/* 2. Category Filters Pills */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-brand-crimson" />
            <span>Filter Saree Topics:</span>
          </h2>
          <span className="text-xs font-bold text-slate-400">
            {filteredBlogs.length} {filteredBlogs.length === 1 ? 'Article' : 'Articles'}
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory.toLowerCase() === cat.toLowerCase();
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-extrabold transition-all duration-200 ${
                  isActive
                    ? 'bg-brand-crimson text-white shadow-md scale-105'
                    : 'bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50 hover:text-brand-crimson'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Featured Hero Saree Article */}
      {featured && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-brand-slate-dark font-display flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-crimson animate-ping" />
              <span>Featured Journal Story</span>
            </h2>
          </div>

          <button
            onClick={() => navigate(featured.slug)}
            className="w-full group text-left block focus:outline-none"
          >
            <div className="relative rounded-3xl overflow-hidden aspect-[16/8] sm:aspect-[16/7] bg-slate-900 shadow-xl border border-slate-200/60">
              <img
                src={featured.coverImage}
                alt={featured.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 space-y-3">
                <span className="inline-block bg-brand-crimson text-white text-[11px] font-extrabold uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow-md">
                  {featured.category}
                </span>

                <h3 className="text-2xl sm:text-4xl font-extrabold text-white font-display leading-tight max-w-3xl group-hover:text-amber-200 transition-colors">
                  {featured.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-200 max-w-2xl line-clamp-2 leading-relaxed hidden sm:block">
                  {featured.excerpt}
                </p>

                <div className="flex flex-wrap items-center justify-between text-xs text-slate-300 pt-2 border-t border-white/10 gap-2">
                  <div className="flex items-center space-x-3">
                    {featured.author.avatar && (
                      <img src={featured.author.avatar} alt={featured.author.name} className="w-7 h-7 rounded-full object-cover border border-amber-300/40" />
                    )}
                    <span className="font-bold text-white">{featured.author.name}</span>
                    <span>·</span>
                    <span>{new Date(featured.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>

                  <div className="inline-flex items-center space-x-1.5 text-amber-300 font-extrabold text-xs group-hover:translate-x-1 transition-transform">
                    <span>Read Article</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </button>
        </div>
      )}

      {/* 4. Saree Articles Grid */}
      <div className="space-y-6">
        <h2 className="text-xl font-extrabold text-brand-slate-dark font-display">
          {selectedCategory === 'All' ? 'All Saree Stories' : `${selectedCategory} Articles`}
        </h2>

        {gridBlogs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {gridBlogs.map((blog) => (
              <BlogCard key={blog.id} blog={blog} onClick={() => navigate(blog.slug)} />
            ))}
          </div>
        ) : (
          !featured && (
            <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center text-slate-400 space-y-2">
              <p className="font-extrabold text-base">No articles found in this category.</p>
              <p className="text-xs">Try selecting 'All' to view all available Saree Journal topics.</p>
            </div>
          )
        )}
      </div>

      {/* 5. Follow NIAKYLIE Social Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-brand-slate-dark to-slate-950 rounded-3xl p-8 sm:p-12 text-white shadow-2xl border border-slate-800 space-y-6 text-center">
        <div className="max-w-2xl mx-auto space-y-2">
          <p className="text-xs font-extrabold uppercase tracking-widest text-amber-300">FOLLOW NIAKYLIE</p>
          <h3 className="text-2xl sm:text-3xl font-extrabold font-display">Stay Connected with NIAKYLIE</h3>
          <p className="text-xs text-slate-300">Discover daily saree draping videos, new festive collection launches, and behind-the-scenes stories.</p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <a
            href="https://www.instagram.com/niakylie_women_collection"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 bg-pink-600/20 hover:bg-pink-600 text-pink-300 hover:text-white border border-pink-500/30 px-5 py-2.5 rounded-full text-xs font-extrabold transition-all"
          >
            <Instagram className="w-4 h-4" />
            <span>@niakylie_women_collection</span>
          </a>

          <a
            href="https://www.facebook.com/profile.php?id=61592438117379"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 px-5 py-2.5 rounded-full text-xs font-extrabold transition-all"
          >
            <Facebook className="w-4 h-4" />
            <span>NIAKYLIE Women Collection</span>
          </a>

          <a
            href="https://wa.me/919589928337"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 px-5 py-2.5 rounded-full text-xs font-extrabold transition-all"
          >
            <Phone className="w-4 h-4" />
            <span>WhatsApp Business</span>
          </a>

          <a
            href="/"
            className="inline-flex items-center space-x-2 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/30 px-5 py-2.5 rounded-full text-xs font-extrabold transition-all"
          >
            <Globe className="w-4 h-4" />
            <span>niakylie.com</span>
          </a>
        </div>
      </div>
    </div>
  );
}

function BlogCard({ blog, onClick }: { blog: BlogPost; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group text-left bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
    >
      <div>
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
          <img
            src={blog.coverImage}
            alt={blog.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-amber-300 text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full border border-amber-500/30 shadow-sm">
            {blog.category}
          </span>
        </div>

        <div className="p-6 space-y-3">
          <h3 className="font-extrabold text-base text-brand-slate-dark leading-snug group-hover:text-brand-crimson transition-colors line-clamp-2">
            {blog.title}
          </h3>
          <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">{blog.excerpt}</p>
        </div>
      </div>

      <div className="px-6 pb-6 pt-2 space-y-3 border-t border-gray-100/80">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center space-x-2">
            {blog.author.avatar && (
              <img src={blog.author.avatar} alt={blog.author.name} className="w-5 h-5 rounded-full object-cover" />
            )}
            <span className="font-semibold">{blog.author.name}</span>
          </div>

          <div className="flex items-center space-x-2">
            {blog.readTime && (
              <span className="flex items-center space-x-1"><Clock className="w-3 h-3 text-slate-400" /><span>{blog.readTime}</span></span>
            )}
            {blog.viewCount && (
              <span className="flex items-center space-x-1"><Eye className="w-3 h-3 text-slate-400" /><span>{blog.viewCount.toLocaleString()}</span></span>
            )}
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between text-xs font-extrabold text-brand-crimson group-hover:text-brand-crimson-dark">
          <span>Read Article</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </button>
  );
}

export default BlogListingPage;
