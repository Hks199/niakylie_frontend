import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Star, CheckCircle2, XCircle, Trash2, RefreshCw, MessageSquare, Filter } from 'lucide-react';
import { adminApi } from '../../api/admin';

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-800',
  APPROVED: 'bg-emerald-100 text-emerald-800',
  REJECTED: 'bg-rose-100 text-rose-800',
};

export function AdminReviewsPanel() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');
  const [actionId, setActionId] = useState<string | null>(null);

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['admin-reviews', statusFilter],
    queryFn: () =>
      adminApi.getAllReviews({
        status: statusFilter || undefined,
        limit: 25,
      }),
  });

  const reviews = data?.reviews || [];

  const handleModerate = async (reviewId: string, status: 'APPROVED' | 'REJECTED') => {
    setActionId(reviewId);
    try {
      await adminApi.moderateReview(reviewId, status);
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      await refetch();
    } catch (err) {
      console.error('Failed to moderate review', err);
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review permanently?')) return;
    setActionId(reviewId);
    try {
      await adminApi.deleteReview(reviewId);
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      await refetch();
    } catch (err) {
      console.error('Failed to delete review', err);
    } finally {
      setActionId(null);
    }
  };

  const renderStars = (rating: number) =>
    Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
      />
    ));

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-5 h-5 text-brand-crimson" />
          <div>
            <h2 className="text-lg font-extrabold text-brand-slate-dark">Review Moderation</h2>
            <p className="text-xs text-slate-400">Approve, reject or remove customer product reviews</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
              refetch();
            }}
            disabled={isRefetching}
            className="p-2 rounded-xl border border-gray-200 text-slate-600 hover:text-brand-crimson hover:border-brand-crimson transition-colors disabled:opacity-50"
            title="Refresh Reviews List"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? 'animate-spin text-brand-crimson' : ''}`} />
          </button>

          <div className="flex items-center space-x-2 bg-slate-50 border border-gray-200 rounded-xl px-3 py-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs font-medium outline-none cursor-pointer"
            >
              <option value="">All Reviews</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pending Review', value: reviews.filter(r => r.status === 'PENDING').length, color: 'bg-amber-500' },
          { label: 'Approved', value: reviews.filter(r => r.status === 'APPROVED').length, color: 'bg-emerald-500' },
          { label: 'Rejected', value: reviews.filter(r => r.status === 'REJECTED').length, color: 'bg-rose-500' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-center space-x-3">
            <div className={`w-2 h-8 rounded-full ${stat.color}`} />
            <div>
              <p className="text-xl font-extrabold text-brand-slate-dark">{stat.value}</p>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Reviews List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="bg-white border border-gray-100 rounded-3xl p-16 flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin text-slate-300" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-3xl p-16 text-center text-slate-400 text-xs font-semibold">
            No reviews found for the selected filter.
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review._id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-3 hover:shadow-md transition-shadow">
              {/* Top Row */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start space-x-3">
                  {/* Product Image */}
                  {review.product?.images?.[0] ? (
                    <img
                      src={review.product.images[0]}
                      alt={review.product.title}
                      className="w-12 h-14 rounded-xl object-cover border border-gray-100 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-14 rounded-xl bg-slate-100 border border-gray-100 flex items-center justify-center text-slate-400 flex-shrink-0 text-xs font-bold">NK</div>
                  )}

                  <div>
                    <p className="text-xs font-extrabold text-brand-slate-dark line-clamp-1">{review.product?.title || 'Product'}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      by <span className="font-semibold text-slate-600">{review.user?.firstName} {review.user?.lastName}</span>
                      {' · '}{review.user?.email}
                    </p>
                    <div className="flex items-center space-x-0.5 mt-1">{renderStars(review.rating)}</div>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <span className={`text-[9px] font-extrabold uppercase px-2.5 py-1 rounded-full ${STATUS_STYLES[review.status] || 'bg-gray-100 text-gray-700'}`}>
                    {review.status}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(review.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  </span>
                </div>
              </div>

              {/* Review Text */}
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 rounded-xl p-3 border border-gray-100">
                "{review.comment}"
              </p>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-2">
                {review.status !== 'APPROVED' && (
                  <button
                    onClick={() => handleModerate(review._id, 'APPROVED')}
                    disabled={actionId === review._id}
                    className="inline-flex items-center space-x-1 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-extrabold px-3 py-1.5 rounded-xl transition-all disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    <span>APPROVE</span>
                  </button>
                )}
                {review.status !== 'REJECTED' && (
                  <button
                    onClick={() => handleModerate(review._id, 'REJECTED')}
                    disabled={actionId === review._id}
                    className="inline-flex items-center space-x-1 bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-extrabold px-3 py-1.5 rounded-xl transition-all disabled:opacity-50"
                  >
                    <XCircle className="w-3 h-3" />
                    <span>REJECT</span>
                  </button>
                )}
                <button
                  onClick={() => handleDelete(review._id)}
                  disabled={actionId === review._id}
                  className="inline-flex items-center space-x-1 bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-extrabold px-3 py-1.5 rounded-xl transition-all disabled:opacity-50"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>DELETE</span>
                </button>
                {actionId === review._id && <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-400" />}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AdminReviewsPanel;
