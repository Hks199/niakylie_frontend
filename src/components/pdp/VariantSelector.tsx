import { useState } from 'react';
import { Ruler, AlertCircle } from 'lucide-react';
import { ProductVariant } from '../../types';
import { SizeGuideModal } from './SizeGuideModal';

interface VariantSelectorProps {
  variants?: ProductVariant[];
  selectedVariant?: ProductVariant;
  onSelectVariant: (variant: ProductVariant) => void;
}

const DEFAULT_SIZES = [
  { size: 'XS', stock: 5 },
  { size: 'S', stock: 12 },
  { size: 'M', stock: 2 },
  { size: 'L', stock: 8 },
  { size: 'XL', stock: 0 },
  { size: 'XXL', stock: 4 },
];

export function VariantSelector({
  variants,
  selectedVariant,
  onSelectVariant,
}: VariantSelectorProps) {
  const [selectedSize, setSelectedSize] = useState('M');
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  // Group variants by color
  const colorMap = new Map<string, ProductVariant>();
  variants?.forEach((v) => {
    if (v.color && !colorMap.has(v.color)) {
      colorMap.set(v.color, v);
    }
  });

  const availableColors = Array.from(colorMap.entries());

  return (
    <div className="space-y-6 pt-4 border-t border-gray-100">
      {/* Color Selection Swatches */}
      {availableColors.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">
              Color: <span className="text-brand-slate-dark capitalize">{selectedVariant?.color || 'Crimson Red'}</span>
            </span>
          </div>

          <div className="flex items-center space-x-3">
            {availableColors.map(([colorName, variant]) => {
              const isSelected = selectedVariant?.color === colorName;
              return (
                <button
                  key={colorName}
                  onClick={() => onSelectVariant(variant)}
                  className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all flex items-center space-x-2 ${
                    isSelected
                      ? 'border-brand-crimson bg-brand-crimson/5 text-brand-crimson ring-2 ring-brand-crimson/20'
                      : 'border-gray-200 text-slate-700 hover:border-gray-300'
                  }`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-gray-300 shadow-sm"
                    style={{ backgroundColor: variant.colorHex || '#E63946' }}
                  />
                  <span>{colorName}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Size Selection Pills */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">
            Select Size: <span className="text-brand-slate-dark">{selectedSize}</span>
          </span>
          <button
            onClick={() => setIsSizeGuideOpen(true)}
            className="inline-flex items-center space-x-1 text-xs font-extrabold text-brand-crimson hover:underline"
          >
            <Ruler className="w-3.5 h-3.5" />
            <span>SIZE GUIDE</span>
          </button>
        </div>

        {/* Size Pills Grid */}
        <div className="flex flex-wrap gap-2.5">
          {DEFAULT_SIZES.map(({ size, stock }) => {
            const isSelected = selectedSize === size;
            const isOutOfStock = stock === 0;
            const isLowStock = stock > 0 && stock <= 3;

            return (
              <button
                key={size}
                disabled={isOutOfStock}
                onClick={() => setSelectedSize(size)}
                className={`relative w-12 h-12 rounded-2xl font-extrabold text-xs transition-all flex flex-col items-center justify-center border ${
                  isOutOfStock
                    ? 'bg-slate-100 border-gray-200 text-slate-400 cursor-not-allowed line-through'
                    : isSelected
                    ? 'border-brand-crimson bg-brand-crimson text-white shadow-md scale-105'
                    : 'border-gray-200 text-brand-slate-dark hover:border-brand-crimson'
                }`}
              >
                <span>{size}</span>
                {isLowStock && !isSelected && (
                  <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white text-[8px] font-extrabold px-1 rounded-full animate-pulse">
                    {stock} left
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Stock Alert Badge */}
        {DEFAULT_SIZES.find((s) => s.size === selectedSize)?.stock! <= 3 && (
          <div className="flex items-center space-x-1.5 text-xs text-amber-700 font-bold bg-amber-50 px-3 py-2 rounded-xl w-max">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span>Hurry! Only {DEFAULT_SIZES.find((s) => s.size === selectedSize)?.stock} items left in stock.</span>
          </div>
        )}
      </div>

      {/* Size Guide Modal Popup */}
      <SizeGuideModal isOpen={isSizeGuideOpen} onClose={() => setIsSizeGuideOpen(false)} />
    </div>
  );
}

export default VariantSelector;
