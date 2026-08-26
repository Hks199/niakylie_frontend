import { useState } from 'react';
import { ChevronDown, Sparkles, Shield, RefreshCw } from 'lucide-react';
import { Product } from '../../types';

interface ProductAccordionProps {
  product: Product;
}

export function ProductAccordion({ product }: ProductAccordionProps) {
  const [openSection, setOpenSection] = useState<'desc' | 'specs' | 'returns' | null>('desc');

  const toggle = (section: 'desc' | 'specs' | 'returns') => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <div className="space-y-3 pt-6 border-t border-gray-100">
      {/* 1. Product Details & Description */}
      <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
        <button
          onClick={() => toggle('desc')}
          className="w-full p-4 text-xs font-extrabold uppercase text-brand-slate-dark flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors"
        >
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-brand-crimson" />
            <span>PRODUCT DETAILS & DESCRIPTION</span>
          </div>
          <ChevronDown className={`w-4 h-4 transition-transform ${openSection === 'desc' ? 'rotate-180' : ''}`} />
        </button>

        {openSection === 'desc' && (
          <div className="p-4 text-xs text-slate-600 space-y-2 leading-relaxed border-t border-gray-100">
            <p>
              {product.description ||
                'Immerse yourself in timeless Indian royalty with this handcrafted NiaKylie creation. Woven by skilled artisans using traditional techniques, this piece blends rich heritage aesthetics with modern drape elegance.'}
            </p>
            <div className="pt-2 font-bold text-slate-700 space-y-1">
              <p>• <strong>Fabric:</strong> 100% Pure Banarasi Silk</p>
              <p>• <strong>Weave Type:</strong> Zari Brocade Handloom</p>
              <p>• <strong>Care:</strong> Dry Clean Only</p>
            </div>
          </div>
        )}
      </div>

      {/* 2. Complete Specifications Table */}
      <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
        <button
          onClick={() => toggle('specs')}
          className="w-full p-4 text-xs font-extrabold uppercase text-brand-slate-dark flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors"
        >
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-brand-crimson" />
            <span>SPECIFICATIONS & CRAFT</span>
          </div>
          <ChevronDown className={`w-4 h-4 transition-transform ${openSection === 'specs' ? 'rotate-180' : ''}`} />
        </button>

        {openSection === 'specs' && (
          <div className="p-4 text-xs text-slate-600 border-t border-gray-100 grid grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Occasion</span>
              <span className="font-bold text-slate-800">Wedding / Festive</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Border</span>
              <span className="font-bold text-slate-800">Zari Embellished</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Pattern</span>
              <span className="font-bold text-slate-800">Ethnic Floral Motif</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Country of Origin</span>
              <span className="font-bold text-slate-800">India</span>
            </div>
          </div>
        )}
      </div>

      {/* 3. Easy 14-Day Returns & Guarantee */}
      <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
        <button
          onClick={() => toggle('returns')}
          className="w-full p-4 text-xs font-extrabold uppercase text-brand-slate-dark flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors"
        >
          <div className="flex items-center space-x-2">
            <RefreshCw className="w-4 h-4 text-brand-crimson" />
            <span>14-DAY EASY RETURN & EXCHANGE</span>
          </div>
          <ChevronDown className={`w-4 h-4 transition-transform ${openSection === 'returns' ? 'rotate-180' : ''}`} />
        </button>

        {openSection === 'returns' && (
          <div className="p-4 text-xs text-slate-600 leading-relaxed border-t border-gray-100 space-y-2">
            <p>
              Easy 14 days return and exchange. Return policies may vary for customized items.
            </p>
            <p className="font-bold text-emerald-700">✓ 100% Genuine Certified Handloom Product Guarantee</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductAccordion;
