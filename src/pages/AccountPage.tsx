import { useState, useEffect } from 'react';
import { AccountSidebar } from '../components/account/AccountSidebar';
import { MyOrdersPage } from './account/MyOrdersPage';
import { OrderDetailsPage } from './account/OrderDetailsPage';
import { ProfilePage } from './account/ProfilePage';
import { AddressesPage } from './account/AddressesPage';
import { MyWishlistPage } from './account/MyWishlistPage';
import { NotificationsPage } from './account/NotificationsPage';

const ACCOUNT_SECTIONS = ['orders', 'profile', 'addresses', 'wishlist', 'notifications'] as const;

type AccountSection = (typeof ACCOUNT_SECTIONS)[number] | 'order-detail';

function parseAccountLocation(pathname: string): { page: AccountSection; orderId: string | null } {
  const normalized = pathname.replace(/\/+$/, '') || '/account';
  const segments = normalized.split('/').filter(Boolean);
  // ["account"] | ["account","orders"] | ["account","orders","id"] | ["account","profile"]
  if (segments.length < 2) return { page: 'orders', orderId: null };

  const section = segments[1];
  if (section === 'orders') {
    const orderId = segments[2] || null;
    return orderId
      ? { page: 'order-detail', orderId }
      : { page: 'orders', orderId: null };
  }

  if ((ACCOUNT_SECTIONS as readonly string[]).includes(section) && section !== 'orders') {
    return { page: section as AccountSection, orderId: null };
  }

  return { page: 'orders', orderId: null };
}

function pathForAccount(page: AccountSection, orderId?: string | null): string {
  if (page === 'order-detail' && orderId) return `/account/orders/${orderId}`;
  if (page === 'orders' || page === 'order-detail') return '/account/orders';
  return `/account/${page}`;
}

export function AccountPage() {
  const initial = parseAccountLocation(window.location.pathname);
  const [activePage, setActivePage] = useState<AccountSection>(initial.page);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(initial.orderId);

  const syncFromUrl = () => {
    const next = parseAccountLocation(window.location.pathname);
    setActivePage(next.page);
    setActiveOrderId(next.orderId);
  };

  useEffect(() => {
    // Canonicalize bare /account → /account/orders so reload keeps a real section URL
    const path = window.location.pathname.replace(/\/+$/, '') || '/account';
    if (path === '/account') {
      window.history.replaceState({}, '', '/account/orders');
    }
    window.addEventListener('popstate', syncFromUrl);
    return () => window.removeEventListener('popstate', syncFromUrl);
  }, []);

  const navigateTo = (page: AccountSection, orderId: string | null = null) => {
    setActivePage(page);
    setActiveOrderId(orderId);
    const nextPath = pathForAccount(page, orderId);
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, '', nextPath);
      window.dispatchEvent(new Event('popstate'));
    }
  };

  const handleNavigate = (page: string) => {
    navigateTo(page as AccountSection, null);
  };

  const handleViewOrderDetails = (orderId: string) => {
    navigateTo('order-detail', orderId);
  };

  const handleBackToOrders = () => {
    navigateTo('orders', null);
  };

  const renderContent = () => {
    switch (activePage) {
      case 'order-detail':
        return activeOrderId ? (
          <OrderDetailsPage orderId={activeOrderId} onBack={handleBackToOrders} />
        ) : (
          <MyOrdersPage onViewDetails={handleViewOrderDetails} />
        );
      case 'orders':
        return <MyOrdersPage onViewDetails={handleViewOrderDetails} />;
      case 'profile':
        return <ProfilePage />;
      case 'addresses':
        return <AddressesPage />;
      case 'wishlist':
        return <MyWishlistPage />;
      case 'notifications':
        return <NotificationsPage />;
      default:
        return <MyOrdersPage onViewDetails={handleViewOrderDetails} />;
    }
  };

  // Highlight Orders in the sidebar while viewing a single order
  const sidebarPage = activePage === 'order-detail' ? 'orders' : activePage;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 animate-in fade-in duration-300">
      <h1 className="text-xl sm:text-3xl font-extrabold text-brand-slate-dark font-display mb-3 sm:mb-6">
        My Account
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
        <div className="lg:col-span-3 lg:sticky lg:top-24 z-10 min-w-0">
          <AccountSidebar activePage={sidebarPage} onNavigate={handleNavigate} />
        </div>

        <div className="lg:col-span-9 min-w-0">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default AccountPage;
