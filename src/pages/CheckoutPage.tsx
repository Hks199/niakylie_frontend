import { useState, useEffect } from 'react';
import { CheckoutStepper } from '../components/checkout/CheckoutStepper';
import { AddressStep } from '../components/checkout/AddressStep';
import { OrderSummaryStep } from '../components/checkout/OrderSummaryStep';
import { PaymentStep } from '../components/checkout/PaymentStep';
import { CheckoutSidebar } from '../components/checkout/CheckoutSidebar';
import { useCartStore } from '../store/useCartStore';
import { useShippingConfig } from '../hooks/useShippingConfig';

const ADDRESS_STORAGE_KEY = 'niakylie_checkout_address';
const SHIPPING_STORAGE_KEY = 'niakylie_checkout_shipping';

function getStepFromUrl(): number {
  const step = Number(new URLSearchParams(window.location.search).get('step') || '1');
  return step >= 1 && step <= 3 ? step : 1;
}

function writeCheckoutUrl(step: number) {
  const url = new URL(window.location.href);
  if (step <= 1) url.searchParams.delete('step');
  else url.searchParams.set('step', String(step));
  const next = url.pathname + url.search;
  if (window.location.pathname + window.location.search !== next) {
    window.history.pushState({}, '', next);
    window.dispatchEvent(new Event('popstate'));
  }
}

export function CheckoutPage() {
  const [currentStep, setCurrentStep] = useState(() => getStepFromUrl());
  const [selectedAddressId, setSelectedAddressId] = useState(
    () => sessionStorage.getItem(ADDRESS_STORAGE_KEY) || ''
  );
  const [shippingType, setShippingType] = useState<'standard' | 'express'>(
    () => (sessionStorage.getItem(SHIPPING_STORAGE_KEY) as 'standard' | 'express') || 'standard'
  );
  const shippingConfig = useShippingConfig();
  const { cartTotals, appliedCoupon } = useCartStore();

  // Keep step in sync with browser back/forward
  useEffect(() => {
    const syncFromUrl = () => {
      let step = getStepFromUrl();
      const addressId = sessionStorage.getItem(ADDRESS_STORAGE_KEY) || '';
      // Steps 2–3 require an address; otherwise fall back to step 1
      if (step > 1 && !addressId) {
        step = 1;
        writeCheckoutUrl(1);
      }
      setCurrentStep(step);
      setSelectedAddressId(addressId);
      const shipping = sessionStorage.getItem(SHIPPING_STORAGE_KEY) as 'standard' | 'express' | null;
      if (shipping) setShippingType(shipping);
    };
    window.addEventListener('popstate', syncFromUrl);
    syncFromUrl();
    return () => window.removeEventListener('popstate', syncFromUrl);
  }, []);

  const goToStep = (step: number) => {
    const next = step >= 1 && step <= 3 ? step : 1;
    setCurrentStep(next);
    writeCheckoutUrl(next);
  };

  const handleSelectAddress = (id: string) => {
    setSelectedAddressId(id);
    sessionStorage.setItem(ADDRESS_STORAGE_KEY, id);
  };

  const handleShippingChange = (type: 'standard' | 'express') => {
    setShippingType(type);
    sessionStorage.setItem(SHIPPING_STORAGE_KEY, type);
  };

  const handleOrderSuccess = (orderId: string) => {
    sessionStorage.removeItem(ADDRESS_STORAGE_KEY);
    sessionStorage.removeItem(SHIPPING_STORAGE_KEY);
    window.location.href = `/order-success/${orderId}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 py-4 sm:py-8 animate-in fade-in duration-300">
      <h1 className="text-lg sm:text-2xl md:text-3xl font-extrabold text-brand-slate-dark font-display mb-3 sm:mb-6">
        Secure Checkout
      </h1>

      <CheckoutStepper currentStep={currentStep} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-start">
        <div className="lg:col-span-8 bg-white border border-gray-100 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 shadow-sm min-w-0">
          {currentStep === 1 && (
            <AddressStep
              selectedAddressId={selectedAddressId}
              onSelectAddress={handleSelectAddress}
              onNext={() => goToStep(2)}
            />
          )}
          {currentStep === 2 && (
            <OrderSummaryStep
              shippingType={shippingType}
              shippingConfig={shippingConfig}
              onShippingChange={handleShippingChange}
              onNext={() => goToStep(3)}
              onBack={() => goToStep(1)}
            />
          )}
          {currentStep === 3 && (
            <PaymentStep
              selectedAddressId={selectedAddressId}
              shippingType={shippingType}
              shippingConfig={shippingConfig}
              onSuccess={handleOrderSuccess}
              onBack={() => goToStep(2)}
            />
          )}
        </div>

        <div className="lg:col-span-4">
          <CheckoutSidebar
            totals={cartTotals}
            appliedCoupon={appliedCoupon}
            shippingType={shippingType}
            shippingConfig={shippingConfig}
          />
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;
