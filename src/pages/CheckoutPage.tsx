import { useState } from 'react';
import { CheckoutStepper } from '../components/checkout/CheckoutStepper';
import { AddressStep } from '../components/checkout/AddressStep';
import { OrderSummaryStep } from '../components/checkout/OrderSummaryStep';
import { PaymentStep } from '../components/checkout/PaymentStep';
import { CheckoutSidebar } from '../components/checkout/CheckoutSidebar';
import { useCartStore } from '../store/useCartStore';

export function CheckoutPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [shippingType, setShippingType] = useState<'standard' | 'express'>('standard');
  const { cartTotals, appliedCoupon } = useCartStore();

  const handleOrderSuccess = (orderId: string) => {
    window.location.href = `/order-success/${orderId}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-slate-dark font-display mb-6">
        Secure Checkout
      </h1>

      {/* Stepper Progress Bar */}
      <CheckoutStepper currentStep={currentStep} />

      {/* 2-Column Checkout Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Step Content (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
          {currentStep === 1 && (
            <AddressStep
              selectedAddressId={selectedAddressId}
              onSelectAddress={setSelectedAddressId}
              onNext={() => setCurrentStep(2)}
            />
          )}
          {currentStep === 2 && (
            <OrderSummaryStep
              shippingType={shippingType}
              onShippingChange={setShippingType}
              onNext={() => setCurrentStep(3)}
              onBack={() => setCurrentStep(1)}
            />
          )}
          {currentStep === 3 && (
            <PaymentStep
              selectedAddressId={selectedAddressId}
              shippingType={shippingType}
              onSuccess={handleOrderSuccess}
              onBack={() => setCurrentStep(2)}
            />
          )}
        </div>

        {/* Right: Price Summary Sidebar (4 cols) */}
        <div className="lg:col-span-4">
          <CheckoutSidebar
            totals={cartTotals}
            appliedCoupon={appliedCoupon}
            shippingType={shippingType}
          />
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;
