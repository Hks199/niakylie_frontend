import { useState, useEffect } from 'react';
import { X, Sparkles, ArrowRight } from 'lucide-react';
import { Banner } from '../../types/banner';
import { formatImageUrl } from '../../utils/imageUtils';

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
    return formatImageUrl(path);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-300">
        {/* Close Button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white flex items-center justify-center transition-all focus:outline-none"
          aria-label="Close promotion modal"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Modal Banner Image */}
        {activePopup.imageUrl && (
          <div className="relative h-48 sm:h-72 w-full overflow-hidden">
            <img
              src={resolveBannerImg(activePopup.imageUrl)}
              alt={activePopup.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
          </div>
        )}

        {/* Modal Content */}
        <div className="p-4 sm:p-8 space-y-2.5 sm:space-y-3 text-center">
          <span className="inline-flex items-center space-x-1 text-[10px] sm:text-xs font-extrabold text-brand-crimson bg-brand-crimson/10 px-2.5 sm:px-3 py-1 rounded-full uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SPECIAL OFFER</span>
          </span>

          <h3 className="text-xl sm:text-3xl font-extrabold text-brand-slate-dark font-display leading-snug sm:leading-tight px-1">
            {activePopup.title}
          </h3>

          {activePopup.subtitle && (
            <p className="text-[11px] sm:text-sm text-slate-600 font-medium px-1">
              {activePopup.subtitle}
            </p>
          )}

          <div className="pt-2">
            <a
              href={activePopup.linkUrl || '/collections'}
              onClick={() => setIsOpen(false)}
              className="w-full inline-flex items-center justify-center space-x-2 bg-brand-crimson hover:bg-brand-crimson-dark text-white font-extrabold text-[10px] sm:text-sm py-3 sm:py-3.5 px-4 sm:px-6 rounded-xl sm:rounded-2xl shadow-xl transition-all uppercase tracking-wider"
            >
              <span className="truncate">{activePopup.linkLabel || 'EXPLORE OFFER NOW'}</span>
              <ArrowRight className="w-4 h-4 flex-shrink-0" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PopupBannerModal;
