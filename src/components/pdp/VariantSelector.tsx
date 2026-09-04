import { useState } from 'react';
import { Ruler, AlertCircle } from 'lucide-react';
import { ProductVariant } from '../../types';
import { SizeGuideModal } from './SizeGuideModal';

interface VariantSelectorProps {
  variants?: ProductVariant[];
  selectedVariant?: ProductVariant;
  onSelectVariant: (variant: ProductVariant) => void;
  hideSizeGuide?: boolean;
}

export function VariantSelector({
  variants,
  selectedVariant,
  onSelectVariant,
  hideSizeGuide = false,
}: VariantSelectorProps) {
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  // Group variants by color
  const colorMap = new Map<string, ProductVariant>();
  variants?.forEach((v) => {
    if (v.color && !colorMap.has(v.color)) {
      colorMap.set(v.color, v);
    }
  });

  const availableColors = Array.from(colorMap.entries());

  // Extract all available sizes from variants or fallback list
  const sizeList = Array.from(
    new Set(
      variants && variants.length > 0
        ? variants.map((v) => v.size || 'Free Size')
        : ['Free Size', 'S', 'M', 'L', 'XL']
    )
  );

  const currentSize = selectedVariant?.size || sizeList[0] || 'Free Size';
  const currentColor = selectedVariant?.color || availableColors[0]?.[0] || 'Crimson Red';

  const handleColorChange = (colorName: string) => {
    // Find variant with matching color and current size, or any variant with matching color
    const match =
      variants?.find((v) => v.color === colorName && v.size === currentSize) ||
      variants?.find((v) => v.color === colorName);
    if (match) {
      onSelectVariant(match);
    }
  };

  const handleSizeChange = (sizeName: string) => {
    // Find variant with matching current color and new size, or any variant with new size
    const match =
      variants?.find((v) => v.color === currentColor && v.size === sizeName) ||
      variants?.find((v) => v.size === sizeName);
    if (match) {
      onSelectVariant(match);
    }
  };

  const currentStock = selectedVariant?.stock !== undefined ? selectedVariant.stock : 10;
  const isOutOfStock = currentStock === 0;
  const isLowStock = currentStock > 0 && currentStock <= 3;

  const isFreeSizeOnly = sizeList.length === 1 && (sizeList[0] === 'Free Size' || sizeList[0] === 'Unstitched' || sizeList[0] === 'One Size');
  const shouldShowSizeGuide = !hideSizeGuide && !isFreeSizeOnly;

  return (
    <div className="space-y-4 sm:space-y-6 pt-3 sm:pt-4 border-t border-gray-100">
      {/* SKU & Stock Header */}
      {selectedVariant?.sku && (
        <div className="flex items-center justify-between text-[10px] sm:text-xs text-slate-500 font-medium">
          <span>
            SKU: <strong className="text-slate-800 font-mono">{selectedVariant.sku}</strong>
          </span>
          {isOutOfStock ? (
            <span className="text-rose-600 font-extrabold bg-rose-50 px-2 sm:px-2.5 py-0.5 rounded-md">
              OUT OF STOCK
            </span>
          ) : (
            <span className="text-emerald-700 font-extrabold bg-emerald-50 px-2 sm:px-2.5 py-0.5 rounded-md">
              IN STOCK ({currentStock} available)
            </span>
          )}
        </div>
      )}

      {/* Color Selection Swatches */}
      {availableColors.length > 0 && (
        <div className="space-y-1.5 sm:space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-extrabold uppercase text-slate-400 tracking-wider">
              Color: <span className="text-brand-slate-dark capitalize">{currentColor}</span>
            </span>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3 flex-wrap gap-y-1.5">
            {availableColors.map(([colorName, variant]) => {
              const isSelected = currentColor === colorName;
              return (
                <button
                  key={colorName}
                  onClick={() => handleColorChange(colorName)}
                  className={`px-2.5 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold rounded-lg sm:rounded-xl border transition-all flex items-center space-x-1.5 sm:space-x-2 ${
                    isSelected
                      ? 'border-brand-crimson bg-brand-crimson/5 text-brand-crimson ring-2 ring-brand-crimson/20 shadow-sm'
                      : 'border-gray-200 text-slate-700 hover:border-gray-300'
                  }`}
                >
                  <span
                    className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border border-gray-300 shadow-sm"
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
      <div className="space-y-2 sm:space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] sm:text-xs font-extrabold uppercase text-slate-400 tracking-wider">
            Select Size: <span className="text-brand-slate-dark font-bold">{currentSize}</span>
          </span>
          {shouldShowSizeGuide && (
            <button
              onClick={() => setIsSizeGuideOpen(true)}
              className="inline-flex items-center space-x-1 text-[10px] sm:text-xs font-extrabold text-brand-crimson hover:underline"
            >
              <Ruler className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>SIZE GUIDE</span>
            </button>
          )}
        </div>

        {/* Size Pills Grid */}
        <div className="flex flex-wrap gap-2 sm:gap-2.5">
          {sizeList.map((sizeName) => {
            const isSelected = currentSize === sizeName;
            const sizeVariant = variants?.find(
              (v) => (v.color === currentColor || !currentColor) && v.size === sizeName
            );
            const sizeStock = sizeVariant?.stock !== undefined ? sizeVariant.stock : 10;
            const sizeOut = sizeStock === 0;

            return (
              <button
                key={sizeName}
                disabled={sizeOut}
                onClick={() => handleSizeChange(sizeName)}
                className={`relative px-3 sm:px-4 h-9 sm:h-11 rounded-xl sm:rounded-2xl font-extrabold text-[11px] sm:text-xs transition-all flex items-center justify-center border ${
                  sizeOut
                    ? 'bg-slate-100 border-gray-200 text-slate-400 cursor-not-allowed line-through'
                    : isSelected
                    ? 'border-brand-crimson bg-brand-crimson text-white shadow-md scale-105'
                    : 'border-gray-200 text-brand-slate-dark hover:border-brand-crimson'
                }`}
              >
                <span>{sizeName}</span>
              </button>
            );
          })}
        </div>

        {/* Low Stock Warning Alert */}
        {isLowStock && (
          <div className="flex items-center space-x-1.5 text-[10px] sm:text-xs text-amber-700 font-bold bg-amber-50 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl w-max">
            <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600" />
            <span>Hurry! Only {currentStock} items left in stock for this variant.</span>
          </div>
        )}
      </div>

      {/* Size Guide Modal Popup */}
      <SizeGuideModal isOpen={isSizeGuideOpen} onClose={() => setIsSizeGuideOpen(false)} />
    </div>
  );
}

export default VariantSelector;
