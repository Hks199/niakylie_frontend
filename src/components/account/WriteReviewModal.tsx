import { useState } from 'react';
import { X, Star, Camera, Loader2 } from 'lucide-react';
import { reviewsApi } from '../../api/reviews';
import { useAuthStore } from '../../store/useAuthStore';

interface WriteReviewModalProps {
  isOpen: boolean;
  productId: string;
  productTitle?: string;
  onClose: () => void;
}

export function WriteReviewModal({ isOpen, productId, productTitle, onClose }: WriteReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const resetForm = () => {
    setRating(0);
    setHovered(0);
    setTitle('');
    setComment('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;
    setLoading(true);
    try {
      const user = useAuthStore.getState().user;
      const userId = user?.id || (user as any)?._id || (user as any)?._id?.toString();
      const userName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : undefined;

      await reviewsApi.createReview({
        productId,
        rating,
        title: title || 'Customer Review',
        comment: comment || 'Great product quality!',
        userId,
        userName,
      });
      setSubmitted(true);
      resetForm(); // Form inputs cleared to vacant state
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Failed to submit review:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={handleClose} />
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl z-50 border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
            <div>
              <h3 className="font-extrabold text-base text-brand-slate-dark">Rate & Review</h3>
              {productTitle && <p className="text-xs text-slate-400 truncate max-w-xs">{productTitle}</p>}
            </div>
            <button onClick={handleClose} className="p-1 rounded-full text-slate-400 hover:text-brand-slate-dark">
              <X className="w-5 h-5" />
            </button>
          </div>

          {submitted ? (
            <div className="py-8 text-center space-y-2">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                <Star className="w-6 h-6 text-emerald-600 fill-emerald-600" />
              </div>
              <p className="font-extrabold text-brand-slate-dark">Thank you for your review!</p>
              <p className="text-xs text-slate-400">Your feedback helps the NiaKylie community.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Star Rating Picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Your Rating *</label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHovered(star)}
                      onMouseLeave={() => setHovered(0)}
                      onClick={() => setRating(star)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 transition-all ${
                          star <= (hovered || rating)
                            ? 'text-amber-400 fill-amber-400 scale-110'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                  {rating > 0 && (
                    <span className="text-xs font-extrabold text-brand-slate-dark ml-2">
                      {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
                    </span>
                  )}
                </div>
              </div>

              {/* Review Title */}
              <div className="space-y-1">
                <label className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Review Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Sum up your experience in a line"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-medium outline-none focus:border-brand-crimson"
                />
              </div>

              {/* Review Comment */}
              <div className="space-y-1">
                <label className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Detailed Review</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  placeholder="Tell others what you liked or disliked about this product..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-medium outline-none focus:border-brand-crimson resize-none"
                />
              </div>

              {/* Photo Upload placeholder */}
              <div className="flex items-center space-x-2 border-2 border-dashed border-gray-200 rounded-xl p-3 hover:border-brand-crimson transition-colors cursor-pointer">
                <Camera className="w-5 h-5 text-slate-400" />
                <span className="text-xs text-slate-400 font-semibold">Add Photos (optional)</span>
              </div>

              <button
                type="submit"
                disabled={loading || rating === 0}
                className="w-full bg-brand-crimson hover:bg-brand-crimson-dark text-white font-extrabold text-xs py-3.5 rounded-xl uppercase tracking-wider disabled:opacity-50 flex items-center justify-center space-x-2 transition-all"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>SUBMIT REVIEW</span>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default WriteReviewModal;
