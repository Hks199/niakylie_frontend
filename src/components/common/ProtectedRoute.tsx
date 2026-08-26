import { ReactNode } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { AdminLoginPage } from '../../pages/AdminLoginPage';
import { checkIsAdmin } from '../../utils/roleUtils';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'CUSTOMER' | 'ADMIN';
  onRequireAuth?: () => void;
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();

  const isAdmin = checkIsAdmin(user);

  // If role is ADMIN, render AdminLoginPage if not logged in as ADMIN
  if (requiredRole === 'ADMIN') {
    if (!isAuthenticated || !isAdmin) {
      return <AdminLoginPage />;
    }
  }

  // If customer protection is required and user is unauthenticated
  if (!isAuthenticated && requiredRole === 'CUSTOMER') {
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

  return <>{children}</>;
}

export default ProtectedRoute;
