import { BookOpen, Clock, ArrowRight } from 'lucide-react';
import { BlogPost } from '../../types';

interface FashionBlogFeedProps {
  blogs: BlogPost[];
}

export function FashionBlogFeed({ blogs }: FashionBlogFeedProps) {
  // Defensive array fallback to prevent runtime TypeError if non-array payload is passed
  const blogList = Array.isArray(blogs)
    ? blogs
    : (blogs as any)?.blogs || (blogs as any)?.items || (blogs as any)?.data || [];

  if (!blogList || blogList.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-10 sm:py-16">
      <div className="flex items-center justify-between mb-5 sm:mb-8 gap-2">
        <div className="min-w-0">
          <span className="text-[10px] sm:text-xs uppercase font-extrabold text-brand-crimson tracking-wider sm:tracking-widest flex items-center space-x-1">
            <BookOpen className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">NIAKYLIE FASHION JOURNAL</span>
          </span>
          <h2 className="text-xl sm:text-3xl font-extrabold text-brand-slate-dark font-display tracking-tight mt-1 leading-snug">
            Style Trends & Artisan Heritage
          </h2>
        </div>

        <a
          href="/blogs"
          className="hidden sm:inline-flex items-center space-x-1 text-xs font-extrabold text-brand-crimson hover:underline flex-shrink-0"
        >
          <span>READ ALL ARTICLES</span>
          <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-6">
        {blogList.slice(0, 3).map((blog: any) => (
          <article
            key={blog.id || blog._id}
            className="group bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-gray-100 shadow-card hover:shadow-hover transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="aspect-[16/10] w-full overflow-hidden bg-slate-100 relative">
                <img
                  src={blog.coverImage}
                  alt={blog.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-brand-slate-dark text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-sm max-w-[70%] truncate">
                  {blog.category}
                </span>
              </div>

              <div className="p-4 sm:p-5 space-y-2">
                <div className="flex items-center space-x-2 sm:space-x-3 text-[10px] sm:text-[11px] text-slate-400 flex-wrap">
                  <span>{blog.publishedAt}</span>
                  <span>•</span>
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{blog.readingTime}</span>
                  </span>
                </div>

                <a href={`/blogs/${blog.slug}`} className="block">
                  <h3 className="font-extrabold text-sm sm:text-base text-brand-slate-dark group-hover:text-brand-crimson transition-colors line-clamp-2 leading-snug">
                    {blog.title}
                  </h3>
                </a>

                <p className="text-[11px] sm:text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {blog.summary}
                </p>
              </div>
            </div>

            <div className="p-4 sm:p-5 pt-0">
              <a
                href={`/blogs/${blog.slug}`}
                className="inline-flex items-center text-[11px] sm:text-xs font-extrabold text-brand-crimson group-hover:text-brand-crimson-dark transition-colors"
              >
                <span>Read Full Article</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default FashionBlogFeed;
