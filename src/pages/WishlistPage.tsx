import { MyWishlistPage } from './account/MyWishlistPage';
import { useAuthStore } from '../store';
import { Heart, LogIn, ArrowRight } from 'lucide-react';

export function WishlistPage() {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-md mx-auto bg-white border border-gray-100 rounded-3xl p-8 shadow-card text-center space-y-6">
          <div className="w-16 h-16 mx-auto bg-rose-50 rounded-2xl flex items-center justify-center text-brand-crimson">
            <Heart className="w-8 h-8 fill-brand-crimson" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-extrabold text-brand-slate-dark font-display">
              Sign In to View Wishlist
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Your wishlist items are safely synced across all your devices once logged into your NiaKylie account.
            </p>
          </div>

          <button
            onClick={() => window.dispatchEvent(new CustomEvent('auth:require-login'))}
            className="w-full bg-brand-crimson hover:bg-brand-crimson-dark text-white font-extrabold text-xs py-3.5 px-6 rounded-xl transition-all shadow-md uppercase tracking-wider flex items-center justify-center space-x-2"
          >
            <LogIn className="w-4 h-4" />
            <span>SIGN IN TO MY ACCOUNT</span>
          </button>

          <div className="pt-2 border-t border-slate-100">
            <a
              href="/products"
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-brand-crimson transition-colors"
            >
              <span>CONTINUE SHOPPING</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
      <MyWishlistPage />
    </div>
  );
}

export default WishlistPage;
