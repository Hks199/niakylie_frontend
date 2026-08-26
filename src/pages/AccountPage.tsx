import { useState } from 'react';
import { AccountSidebar } from '../components/account/AccountSidebar';
import { MyOrdersPage } from './account/MyOrdersPage';
import { OrderDetailsPage } from './account/OrderDetailsPage';
import { ProfilePage } from './account/ProfilePage';
import { AddressesPage } from './account/AddressesPage';

// Derive initial page from URL sub-path
function getInitialPage(pathname: string): string {
  if (pathname.includes('/account/orders')) return 'orders';
  if (pathname.includes('/account/profile')) return 'profile';
  if (pathname.includes('/account/addresses')) return 'addresses';
  if (pathname.includes('/account/wishlist')) return 'wishlist';
  return 'orders';
}

export function AccountPage() {
  const [activePage, setActivePage] = useState(getInitialPage(window.location.pathname));
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);

  const handleViewOrderDetails = (orderId: string) => {
    setActiveOrderId(orderId);
    setActivePage('order-detail');
  };

  const handleBackToOrders = () => {
    setActiveOrderId(null);
    setActivePage('orders');
  };

  const renderContent = () => {
    switch (activePage) {
      case 'order-detail':
        return activeOrderId ? (
          <OrderDetailsPage orderId={activeOrderId} onBack={handleBackToOrders} />
        ) : null;
      case 'orders':
        return <MyOrdersPage onViewDetails={handleViewOrderDetails} />;
      case 'profile':
        return <ProfilePage />;
      case 'addresses':
        return <AddressesPage />;
      case 'wishlist':
        window.location.href = '/wishlist';
        return null;
      case 'notifications':
        return (
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm text-center text-sm text-slate-400 py-12">
            <p className="font-bold text-brand-slate-dark mb-1">Notifications</p>
            <p>You have no new notifications right now.</p>
          </div>
        );
      default:
        return <MyOrdersPage onViewDetails={handleViewOrderDetails} />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-slate-dark font-display mb-6">
        My Account
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Sidebar (3 cols) */}
        <div className="lg:col-span-3 sticky top-24">
          <AccountSidebar activePage={activePage} onNavigate={setActivePage} />
        </div>

        {/* Content Area (9 cols) */}
        <div className="lg:col-span-9">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default AccountPage;
