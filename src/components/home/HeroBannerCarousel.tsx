import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from 'lucide-react';
import { Banner } from '../../types';
import { formatImageUrl } from '../../utils/imageUtils';

interface HeroBannerCarouselProps {
  banners?: Banner[];
}

export function HeroBannerCarousel({ banners }: HeroBannerCarouselProps) {
  const displayBanners = useMemo(() => banners ?? [], [banners]);

  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % displayBanners.length);
  }, [displayBanners.length]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + displayBanners.length) % displayBanners.length);
  }, [displayBanners.length]);

  // Unconditional 3-second auto-slide timer (3000ms)
  useEffect(() => {
    if (displayBanners.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayBanners.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [displayBanners.length]);

  // Reset index if displayBanners length changes
  useEffect(() => {
    if (currentIndex >= displayBanners.length) {
      setCurrentIndex(0);
    }
  }, [displayBanners.length, currentIndex]);

  const currentBanner = displayBanners[currentIndex] || displayBanners[0];

  if (!currentBanner) return null;

  const resolveBannerImg = (path?: string) => {
    if (!path || path === 'undefined' || path === 'null' || path.trim() === '') return '';
    return formatImageUrl(path);
  };

  const desktopImg =
    resolveBannerImg(currentBanner.imageUrl) ||
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1600&q=80';
  const mobileImg = resolveBannerImg(currentBanner.mobileImageUrl) || desktopImg;

  return (
    <div className="relative w-full h-[300px] sm:h-[550px] lg:h-[620px] bg-slate-950 overflow-hidden group select-none">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.03 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className="absolute inset-0 w-full h-full"
        >
          {/* Desktop Image */}
          <img
            src={desktopImg}
            alt={currentBanner.title}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1600&q=80';
            }}
            className="hidden sm:block w-full h-full object-cover object-center"
          />

          {/* Mobile Image */}
          <img
            src={mobileImg}
            alt={currentBanner.title}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80';
            }}
            className="block sm:hidden w-full h-full object-cover object-center"
          />

          {/* Gradient Overlay & Content */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/60 to-transparent flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-12 lg:px-16 w-full pb-8 sm:pb-0">
              <motion.div
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.4 }}
                className="max-w-xl text-white space-y-2 sm:space-y-4 pr-2 sm:pr-4"
              >
                {currentBanner.discountBadge && (
                  <span className="inline-flex max-w-full items-center space-x-1 sm:space-x-1.5 bg-brand-crimson text-white text-[9px] sm:text-xs font-extrabold px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full uppercase tracking-wide sm:tracking-wider shadow-lg">
                    <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                    <span className="truncate">{currentBanner.discountBadge}</span>
                  </span>
                )}

                <h2 className="text-xl sm:text-5xl lg:text-6xl font-extrabold font-display leading-snug sm:leading-tight tracking-tight text-white line-clamp-2">
                  {currentBanner.title}
                </h2>

                {currentBanner.subtitle && (
                  <p className="text-slate-300 text-[11px] sm:text-base line-clamp-2 leading-relaxed">
                    {currentBanner.subtitle}
                  </p>
                )}

                <div className="pt-1 sm:pt-2">
                  <a
                    href={currentBanner.linkUrl || '/collections'}
                    className="inline-flex max-w-full items-center space-x-1.5 sm:space-x-2 bg-brand-crimson hover:bg-brand-crimson-dark text-white font-bold text-[10px] sm:text-sm px-4 sm:px-7 py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl shadow-xl hover:shadow-hover transition-all uppercase tracking-wide sm:tracking-wider group/btn"
                  >
                    <span className="truncate">{currentBanner.ctaText || currentBanner.linkLabel || 'EXPLORE COLLECTION'}</span>
                    <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 group-hover/btn:translate-x-1 transition-transform" />
                  </a>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Slide Navigation Controls — always visible on touch; hover-reveal on desktop */}
      {displayBanners.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-brand-crimson text-white backdrop-blur-md flex items-center justify-center transition-all opacity-70 sm:opacity-0 sm:group-hover:opacity-100 z-20 focus:outline-none"
            aria-label="Previous Banner"
          >
            <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-brand-crimson text-white backdrop-blur-md flex items-center justify-center transition-all opacity-70 sm:opacity-0 sm:group-hover:opacity-100 z-20 focus:outline-none"
            aria-label="Next Banner"
          >
            <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6" />
          </button>

          {/* Indicator Dots */}
          <div className="absolute bottom-2.5 sm:bottom-6 left-1/2 -translate-x-1/2 flex items-center space-x-1.5 z-20 max-w-[90%] overflow-hidden">
            {displayBanners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-1.5 sm:h-2 rounded-full transition-all flex-shrink-0 ${
                  currentIndex === idx ? 'w-5 sm:w-8 bg-brand-crimson' : 'w-1.5 sm:w-2 bg-white/50 hover:bg-white'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default HeroBannerCarousel;
