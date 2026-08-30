import { useState, useEffect } from 'react';
import { X, Sparkles, ArrowRight } from 'lucide-react';
import { Banner } from '../../types/banner';

interface PopupBannerModalProps {
  banners: Banner[];
}

export function PopupBannerModal({ banners }: PopupBannerModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activePopup, setActivePopup] = useState<Banner | null>(null);

  useEffect(() => {
    const popup = banners.find((b) => b.type === 'POPUP' && b.isActive);
    if (popup) {
      setActivePopup(popup);
      // Automatically open modal after a slight delay
      const timer = setTimeout(() => setIsOpen(true), 1200);
      return () => clearTimeout(timer);
    }
  }, [banners]);

  if (!isOpen || !activePopup) return null;

  const resolveBannerImg = (path?: string) => {
    if (!path) return '';
    return path.startsWith('http') ? path : `http://localhost:3000${path}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-300">
        {/* Close Button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white flex items-center justify-center transition-all focus:outline-none"
          aria-label="Close promotion modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Banner Image */}
        {activePopup.imageUrl && (
          <div className="relative h-64 sm:h-72 w-full overflow-hidden">
            <img
              src={resolveBannerImg(activePopup.imageUrl)}
              alt={activePopup.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
          </div>
        )}

        {/* Modal Content */}
        <div className="p-6 sm:p-8 space-y-3 text-center">
          <span className="inline-flex items-center space-x-1 text-xs font-extrabold text-brand-crimson bg-brand-crimson/10 px-3 py-1 rounded-full uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SPECIAL OFFER</span>
          </span>

          <h3 className="text-2xl sm:text-3xl font-extrabold text-brand-slate-dark font-display leading-tight">
            {activePopup.title}
          </h3>

          {activePopup.subtitle && (
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              {activePopup.subtitle}
            </p>
          )}

          <div className="pt-2">
            <a
              href={activePopup.linkUrl || '/collections'}
              onClick={() => setIsOpen(false)}
              className="w-full inline-flex items-center justify-center space-x-2 bg-brand-crimson hover:bg-brand-crimson-dark text-white font-extrabold text-xs sm:text-sm py-3.5 px-6 rounded-2xl shadow-xl transition-all uppercase tracking-wider"
            >
              <span>{activePopup.linkLabel || 'EXPLORE OFFER NOW'}</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PopupBannerModal;
