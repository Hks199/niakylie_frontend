import { useQuery } from '@tanstack/react-query';
import { Eye, Clock, Loader2 } from 'lucide-react';
import { cmsApi, BlogPost } from '../api/cms';

export function BlogListingPage() {
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

  const [featured, ...rest] = blogs;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-in fade-in duration-300">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-slate-dark font-display mb-2">
          NiaKylie Fashion Journal
        </h1>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          Heritage stories, styling guides, trend reports, and artisan journeys from the world of ethnic couture.
        </p>
      </div>

      {/* Featured Hero Blog Post */}
      {featured && (
        <button
          onClick={() => navigate(featured.slug)}
          className="w-full group text-left mb-12 block"
        >
          <div className="relative rounded-3xl overflow-hidden aspect-[16/7] bg-slate-200 shadow-xl">
            <img
              src={featured.coverImage}
              alt={featured.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
              <span className="inline-block bg-brand-crimson text-white text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full mb-3">
                {featured.category}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display leading-tight mb-3 max-w-2xl">
                {featured.title}
              </h2>
              <p className="text-sm text-white/70 max-w-xl mb-4 hidden sm:block">{featured.excerpt}</p>
              <div className="flex items-center space-x-4 text-xs text-white/60">
                <div className="flex items-center space-x-1.5">
                  {featured.author.avatar && (
                    <img src={featured.author.avatar} alt={featured.author.name} className="w-6 h-6 rounded-full object-cover" />
                  )}
                  <span>{featured.author.name}</span>
                </div>
                <span>·</span>
                <span>{new Date(featured.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                {featured.viewCount && (
                  <>
                    <span>·</span>
                    <span className="flex items-center space-x-1"><Eye className="w-3 h-3" /><span>{featured.viewCount.toLocaleString()} views</span></span>
                  </>
                )}
              </div>
            </div>
          </div>
        </button>
      )}

      {/* Blog Grid */}
      <h2 className="text-xl font-extrabold text-brand-slate-dark font-display mb-6">More Stories</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {rest.map((blog) => (
          <BlogCard key={blog.id} blog={blog} onClick={() => navigate(blog.slug)} />
        ))}
      </div>
    </div>
  );
}

function BlogCard({ blog, onClick }: { blog: BlogPost; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group text-left bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <img
          src={blog.coverImage}
          alt={blog.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-brand-crimson text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
          {blog.category}
        </span>
      </div>

      <div className="p-5 space-y-3">
        <h3 className="font-extrabold text-sm text-brand-slate-dark leading-snug group-hover:text-brand-crimson transition-colors line-clamp-2">
          {blog.title}
        </h3>
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{blog.excerpt}</p>

        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            {blog.author.avatar && (
              <img src={blog.author.avatar} alt={blog.author.name} className="w-5 h-5 rounded-full object-cover" />
            )}
            <span className="font-semibold">{blog.author.name}</span>
          </div>
          <div className="flex items-center space-x-2">
            {blog.readTime && (
              <span className="flex items-center space-x-1"><Clock className="w-3 h-3" /><span>{blog.readTime}</span></span>
            )}
            {blog.viewCount && (
              <span className="flex items-center space-x-1"><Eye className="w-3 h-3" /><span>{blog.viewCount.toLocaleString()}</span></span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

export default BlogListingPage;
