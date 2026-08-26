import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Eye, Clock, Twitter, Linkedin, Share2, Link2, Loader2, Tag } from 'lucide-react';
import { cmsApi } from '../api/cms';

interface BlogDetailsPageProps {
  slug: string;
}

export function BlogDetailsPage({ slug }: BlogDetailsPageProps) {
  const [linkCopied, setLinkCopied] = useState(false);

  const { data: blog, isLoading } = useQuery({
    queryKey: ['blog', slug],
    queryFn: () => cmsApi.getBlogBySlug(slug),
    enabled: !!slug,
  });

  const { data: allBlogs = [] } = useQuery({
    queryKey: ['blogs'],
    queryFn: () => cmsApi.getBlogs(),
  });

  const navigate = (path: string) => {
    window.history.pushState(null, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-brand-crimson" />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="text-center py-24">
        <p className="font-bold text-brand-slate-dark">Blog post not found.</p>
        <button onClick={() => navigate('/blogs')} className="mt-4 text-brand-crimson text-sm font-bold hover:underline">← Back to Journal</button>
      </div>
    );
  }

  const relatedPosts = allBlogs
    .filter((b) => b.slug !== slug && b.category === blog.category)
    .slice(0, 3);

  const formattedDate = new Date(blog.publishedAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  const shareUrl = encodeURIComponent(window.location.href);
  const shareTitle = encodeURIComponent(blog.title);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
      {/* Back Button */}
      <button
        onClick={() => navigate('/blogs')}
        className="flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-brand-crimson mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Fashion Journal</span>
      </button>

      {/* Category Tag */}
      <span className="inline-block bg-brand-crimson/10 text-brand-crimson text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full mb-4">
        {blog.category}
      </span>

      {/* Title */}
      <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-slate-dark font-display leading-tight mb-5">
        {blog.title}
      </h1>

      {/* Author Row */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6 pb-6 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          {blog.author.avatar && (
            <img src={blog.author.avatar} alt={blog.author.name} className="w-10 h-10 rounded-full object-cover border-2 border-brand-crimson/20" />
          )}
          <div>
            <p className="text-xs font-extrabold text-brand-slate-dark">{blog.author.name}</p>
            {blog.author.bio && <p className="text-[10px] text-slate-400">{blog.author.bio}</p>}
          </div>
        </div>
        <div className="flex items-center space-x-4 text-[11px] text-slate-400 font-semibold">
          <span>{formattedDate}</span>
          {blog.readTime && (
            <span className="flex items-center space-x-1"><Clock className="w-3 h-3" /><span>{blog.readTime}</span></span>
          )}
          {blog.viewCount && (
            <span className="flex items-center space-x-1"><Eye className="w-3 h-3" /><span>{blog.viewCount.toLocaleString()} views</span></span>
          )}
        </div>
      </div>

      {/* Cover Image */}
      <div className="aspect-[16/7] rounded-3xl overflow-hidden bg-slate-100 mb-8 shadow-lg">
        <img src={blog.coverImage} alt={blog.title} className="w-full h-full object-cover" />
      </div>

      {/* Article Body */}
      <div
        className="prose prose-sm max-w-none
          [&_h2]:text-xl [&_h2]:font-extrabold [&_h2]:text-brand-slate-dark [&_h2]:mt-8 [&_h2]:mb-3
          [&_p]:text-slate-600 [&_p]:text-sm [&_p]:leading-relaxed [&_p]:mb-4
          [&_strong]:font-extrabold [&_strong]:text-brand-slate-dark
          [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_ul]:text-sm [&_ul]:text-slate-600"
        dangerouslySetInnerHTML={{ __html: blog.content || '<p>Content coming soon.</p>' }}
      />

      {/* Tags */}
      {blog.tags && blog.tags.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-100">
          <div className="flex items-center space-x-2 flex-wrap gap-2">
            <Tag className="w-4 h-4 text-slate-400 flex-shrink-0" />
            {blog.tags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] font-bold bg-slate-100 text-slate-600 hover:bg-brand-crimson/10 hover:text-brand-crimson px-3 py-1 rounded-full transition-colors cursor-default"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Social Share Buttons */}
      <div className="mt-6 pt-6 border-t border-gray-100">
        <p className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider mb-3">Share this story</p>
        <div className="flex items-center space-x-3">
          <a
            href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-700 text-white text-[11px] font-bold px-3.5 py-2 rounded-xl transition-all"
          >
            <Twitter className="w-3.5 h-3.5" />
            <span>Twitter / X</span>
          </a>
          <a
            href={`https://api.whatsapp.com/send?text=${shareTitle}%20${shareUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-3.5 py-2 rounded-xl transition-all"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </a>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold px-3.5 py-2 rounded-xl transition-all"
          >
            <Linkedin className="w-3.5 h-3.5" />
            <span>LinkedIn</span>
          </a>
          <button
            onClick={handleCopyLink}
            className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold px-3.5 py-2 rounded-xl transition-all"
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>{linkCopied ? 'Copied!' : 'Copy Link'}</span>
          </button>
        </div>
      </div>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <div className="mt-12 pt-8 border-t border-gray-100">
          <h2 className="text-xl font-extrabold text-brand-slate-dark font-display mb-6">Related Stories</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {relatedPosts.map((post) => (
              <button
                key={post.id}
                onClick={() => navigate(`/blogs/${post.slug}`)}
                className="group text-left bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="aspect-[4/3] overflow-hidden bg-slate-100">
                  <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-4">
                  <p className="text-xs font-extrabold text-brand-slate-dark leading-snug group-hover:text-brand-crimson transition-colors line-clamp-2">
                    {post.title}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">{post.author.name}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default BlogDetailsPage;
