import { Check, MapPin, Package, CreditCard } from 'lucide-react';

interface CheckoutStepperProps {
  currentStep: number;
}

const STEPS = [
  { number: 1, label: 'Delivery Address', icon: MapPin },
  { number: 2, label: 'Order Summary', icon: Package },
  { number: 3, label: 'Payment', icon: CreditCard },
];

export function CheckoutStepper({ currentStep }: CheckoutStepperProps) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-2.5 sm:p-6 shadow-sm mb-4 sm:mb-6">
      <div className="flex items-center justify-between relative">
        {/* Connector Line */}
        <div className="absolute top-4 sm:top-5 left-0 right-0 h-0.5 bg-gray-200 z-0 mx-4 sm:mx-8" />
        <div
          className="absolute top-4 sm:top-5 left-0 h-0.5 bg-brand-crimson z-0 transition-all duration-500"
          style={{
            width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%',
            marginLeft: '1rem',
            marginRight: '1rem',
          }}
        />

        {STEPS.map((step) => {
          const Icon = step.icon;
          const isComplete = currentStep > step.number;
          const isActive = currentStep === step.number;

          return (
            <div key={step.number} className="flex flex-col items-center z-10 flex-1 px-0.5">
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-extrabold text-[10px] sm:text-xs border-2 transition-all duration-300 ${
                  isComplete
                    ? 'bg-brand-crimson border-brand-crimson text-white'
                    : isActive
                    ? 'bg-white border-brand-crimson text-brand-crimson shadow-md shadow-brand-crimson/20'
                    : 'bg-white border-gray-300 text-slate-400'
                }`}
              >
                {isComplete ? <Check className="w-4 h-4 sm:w-5 sm:h-5" /> : <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
              </div>
              <span
                className={`mt-1 sm:mt-2 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-tight sm:tracking-wider text-center truncate max-w-[70px] sm:max-w-none ${
                  isActive ? 'text-brand-crimson' : isComplete ? 'text-brand-slate-dark' : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CheckoutStepper;
