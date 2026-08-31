import { useEffect, useState } from 'react';
import { Header } from './components/layout/Header';
import { Footer } from './components/common/Footer';
import { HomePage } from './pages/HomePage';
import { ProductListingPage } from './pages/ProductListingPage';
import { ProductDetailsPage } from './pages/ProductDetailsPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderSuccessPage } from './pages/OrderSuccessPage';
import { AccountPage } from './pages/AccountPage';
import { CmsPage } from './pages/CmsPage';
import { FaqPage } from './pages/FaqPage';
import { BlogListingPage } from './pages/BlogListingPage';
import { BlogDetailsPage } from './pages/BlogDetailsPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { useAuthStore, useCartStore, useWishlistStore } from './store';
import { checkIsAdmin } from './utils/roleUtils';

export function App() {
  const { isAuthenticated, user } = useAuthStore();
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const isAdminUser = checkIsAdmin(user);

    if (!isAdminUser) {
      useCartStore.getState().fetchCart();
      if (isAuthenticated) {
        useWishlistStore.getState().fetchWishlist();
      }
    }

    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, [isAuthenticated, user]);

  const isAdminLogin = currentPath === '/admin/login';
  const isAdminRoute = currentPath === '/admin' || currentPath.startsWith('/admin/');

  // Resolve admin status from the current Zustand state
  const isAdmin = isAuthenticated && checkIsAdmin(user);

  const isOrderSuccess = currentPath.startsWith('/order-success/');
  const isCheckout = currentPath === '/checkout';
  const isCart = currentPath === '/cart';
  const isAccount = currentPath.startsWith('/account');
  const isBlogDetail = currentPath.startsWith('/blogs/');
  const isBlogList = currentPath === '/blogs';
  const isFaqs = currentPath === '/faqs';
  const isCmsPage = currentPath.startsWith('/pages/');
  const isPDP = currentPath.startsWith('/product/');
  const isPLP =
    currentPath.startsWith('/products') ||
    currentPath.startsWith('/category') ||
    currentPath.startsWith('/search');

  const slug = isPDP ? currentPath.replace('/product/', '') : undefined;
  const orderId = isOrderSuccess ? currentPath.replace('/order-success/', '') : undefined;
  const blogSlug = isBlogDetail ? currentPath.replace('/blogs/', '') : undefined;
  const cmsSlug = isCmsPage ? currentPath.replace('/pages/', '') : undefined;

  const isHideStoreNav = isAdminLogin || isAdminRoute;

  const renderContent = () => {
    // Admin login page
    if (isAdminLogin) {
      return <AdminLoginPage />;
    }

    // Admin dashboard — check role inline without ProtectedRoute wrapper
    if (isAdminRoute) {
      if (!isAuthenticated || !isAdmin) {
        return <AdminLoginPage />;
      }
      return <AdminDashboardPage />;
    }

    if (isOrderSuccess) return <OrderSuccessPage orderId={orderId} />;
    if (isCheckout) return <CheckoutPage />;
    if (isCart) return <CartPage />;

    if (isAccount) {
      if (!isAuthenticated) {
        return (
          <div className="max-w-md mx-auto my-16 p-8 bg-white border border-gray-100 rounded-3xl shadow-lg text-center space-y-4">
            <h2 className="text-xl font-extrabold text-brand-slate-dark font-display">Authentication Required</h2>
            <p className="text-xs text-slate-500">Please sign in to access your orders, account profile, or checkout.</p>
            <a
              href="/"
              className="inline-block bg-brand-crimson hover:bg-brand-crimson-dark text-white font-extrabold text-xs px-6 py-3 rounded-xl transition-all shadow-md uppercase tracking-wider"
            >
              RETURN TO HOME & SIGN IN
            </a>
          </div>
        );
      }
      return <AccountPage />;
    }

    if (isBlogDetail) return <BlogDetailsPage slug={blogSlug!} />;
    if (isBlogList) return <BlogListingPage />;
    if (isFaqs) return <FaqPage />;
    if (isCmsPage) return <CmsPage slug={cmsSlug!} />;
    if (isPDP) return <ProductDetailsPage slug={slug} />;
    if (isPLP) return <ProductListingPage />;

    return <HomePage />;
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col justify-between">
      {!isHideStoreNav && <Header />}

      <main className="flex-grow w-full">
        {renderContent()}
      </main>

      {!isHideStoreNav && <Footer />}
    </div>
  );
}

export default App;
