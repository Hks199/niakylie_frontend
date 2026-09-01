import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Star, ShieldCheck, ThumbsUp, MessageSquarePlus } from 'lucide-react';
import { reviewsApi } from '../../api/reviews';
import { WriteReviewModal } from '../account/WriteReviewModal';

interface ReviewsSectionProps {
  productId: string;
  productTitle?: string;
}

export function ReviewsSection({ productId, productTitle }: ReviewsSectionProps) {
  const [likesMap, setLikesMap] = useState<Record<string, number>>({});
  const [isWriteReviewOpen, setIsWriteReviewOpen] = useState(false);

  const { data, refetch, isLoading } = useQuery({
    queryKey: ['reviews', productId],
    queryFn: () => reviewsApi.getProductReviews(productId),
  });

  const handleLike = async (reviewId: string, currentLikes: number) => {
    try {
      setLikesMap((prev) => ({
        ...prev,
        [reviewId]: (prev[reviewId] || currentLikes) + 1,
      }));
    } catch (e) {
      console.error(e);
    }
  };

  // Extract clean metrics strictly from backend API response
  const summary = data?.summary || {};
  const averageRating = summary.averageRating ?? data?.averageRating ?? 0;
  const totalReviews = summary.reviewCount ?? data?.totalReviews ?? (data as any)?.total ?? (Array.isArray(data?.reviews) ? data.reviews.length : 0);

  const ratingBreakdown = summary.ratingBreakdown || data?.starsCount || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  const reviewsList: any[] = Array.isArray(data?.reviews) ? data.reviews : (Array.isArray(data) ? data : []);

  return (
    <section className="py-12 border-t border-gray-100 my-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-extrabold text-brand-slate-dark font-display">
            Ratings & Verified Reviews
          </h2>
          <p className="text-xs text-slate-400 mt-1">Real ratings submitted by verified customers</p>
        </div>

        <button
          onClick={() => setIsWriteReviewOpen(true)}
          className="bg-brand-crimson hover:bg-brand-crimson-dark text-white text-xs font-extrabold px-4 py-2.5 rounded-xl shadow-md flex items-center space-x-1.5 transition-all uppercase tracking-wider"
        >
          <MessageSquarePlus className="w-4 h-4" />
          <span>WRITE A REVIEW</span>
        </button>
      </div>

      {/* Ratings Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-slate-50 p-6 sm:p-8 rounded-3xl border border-gray-100 mb-10">
        {/* Average Score */}
        <div className="flex flex-col items-center justify-center text-center md:border-r border-gray-200 pr-4">
          <div className="text-5xl font-extrabold text-brand-slate-dark font-display mb-1 flex items-baseline">
            <span>{averageRating > 0 ? Number(averageRating).toFixed(1) : '0.0'}</span>
            <span className="text-xl text-slate-400 font-normal">/5</span>
          </div>
          <div className="flex items-center space-x-1 text-amber-500 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-5 h-5 ${
                  star <= Math.round(averageRating)
                    ? 'fill-amber-500 text-amber-500'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-xs font-bold text-slate-500">
            {totalReviews === 0
              ? 'No ratings yet'
              : `Based on ${totalReviews} ${totalReviews === 1 ? 'Rating' : 'Ratings'}`}
          </span>
        </div>

        {/* Star Progress Bars */}
        <div className="md:col-span-2 space-y-2 flex flex-col justify-center">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = (ratingBreakdown as Record<number, number>)[star] || 0;
            const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;

            return (
              <div key={star} className="flex items-center space-x-3 text-xs">
                <span className="w-8 font-bold text-slate-600">{star} ★</span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-crimson rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-10 text-right font-semibold text-slate-400">{percentage}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Customer Review List */}
      {isLoading ? (
        <div className="py-8 text-center text-xs text-slate-400">Loading verified reviews...</div>
      ) : reviewsList.length > 0 ? (
        <div className="space-y-6">
          {reviewsList.map((rev: any, index: number) => {
            const revId = rev._id || rev.id || String(index);
            const userName = rev.userName || (rev.userId && typeof rev.userId === 'object' ? `${rev.userId.firstName || ''} ${rev.userId.lastName || ''}`.trim() : 'Verified Buyer');
            const userAvatar = rev.userAvatar || rev.user?.avatar;
            const ratingVal = rev.rating || 5;
            const titleVal = rev.title || 'Product Review';
            const commentVal = rev.comment || '';
            const dateVal = rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : (rev.date || 'Recent Purchase');
            const isVerified = rev.isVerifiedPurchase !== false;

            return (
              <div key={revId} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {userAvatar ? (
                      <img src={userAvatar} alt={userName} className="w-9 h-9 rounded-full object-cover" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-brand-crimson text-white font-bold flex items-center justify-center text-xs uppercase">
                        {(userName || 'U')[0]}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-extrabold text-xs text-brand-slate-dark">{userName}</h4>
                        {isVerified && (
                          <span className="inline-flex items-center text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                            <ShieldCheck className="w-3 h-3 mr-0.5" /> Verified
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400">{dateVal}</span>
                    </div>
                  </div>

                  {/* Rating Star Badge */}
                  <div className="bg-emerald-600 text-white font-extrabold text-xs px-2.5 py-0.5 rounded-md flex items-center space-x-1">
                    <span>{ratingVal}</span>
                    <Star className="w-3.5 h-3.5 fill-white" />
                  </div>
                </div>

                {titleVal && <h5 className="font-extrabold text-xs text-slate-800">{titleVal}</h5>}
                <p className="text-xs text-slate-600 leading-relaxed">{commentVal}</p>

                {/* Review Photos if any */}
                {rev.images && rev.images.length > 0 && (
                  <div className="flex items-center space-x-2 pt-1">
                    {rev.images.map((img: string, idx: number) => (
                      <img
                        key={idx}
                        src={img}
                        alt="Customer Upload"
                        className="w-16 h-16 rounded-xl object-cover border border-gray-200 shadow-sm cursor-pointer hover:scale-105 transition-transform"
                      />
                    ))}
                  </div>
                )}

                {/* Helpful Like Button */}
                <div className="pt-2 flex items-center justify-end">
                  <button
                    onClick={() => handleLike(revId, rev.helpfulVotes || rev.likes || 0)}
                    className="flex items-center space-x-1 text-xs text-slate-400 hover:text-brand-crimson transition-colors"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>Helpful ({likesMap[revId] ?? (rev.helpfulVotes || rev.likes || 0)})</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-12 bg-white rounded-3xl border border-gray-100 text-center space-y-3">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <Star className="w-6 h-6" />
          </div>
          <h4 className="font-extrabold text-sm text-brand-slate-dark">No reviews yet</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Be the first customer to review this product and share your feedback!
          </p>
          <button
            onClick={() => setIsWriteReviewOpen(true)}
            className="inline-block bg-brand-crimson hover:bg-brand-crimson-dark text-white font-extrabold text-xs px-5 py-2.5 rounded-xl uppercase tracking-wider transition-all"
          >
            WRITE A REVIEW
          </button>
        </div>
      )}

      {/* Review Submission Modal */}
      <WriteReviewModal
        isOpen={isWriteReviewOpen}
        productId={productId}
        productTitle={productTitle}
        onClose={() => {
          setIsWriteReviewOpen(false);
          refetch();
        }}
      />
    </section>
  );
}

export default ReviewsSection;
