import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from 'lucide-react';
import { Banner } from '../../types';

interface HeroBannerCarouselProps {
  banners: Banner[];
}

export function HeroBannerCarousel({ banners }: HeroBannerCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused || !banners || banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [isPaused, banners]);

  if (!banners || banners.length === 0) return null;

  const currentBanner = banners[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const resolveBannerImg = (path?: string) => {
    if (!path) return '';
    return path.startsWith('http') ? path : `http://localhost:3000${path}`;
  };

  return (
    <div
      className="relative w-full h-[450px] sm:h-[550px] lg:h-[620px] bg-slate-950 overflow-hidden group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.7, ease: 'easeInOut' }}
          className="absolute inset-0 w-full h-full"
        >
          {/* Desktop Image */}
          <img
            src={resolveBannerImg(currentBanner.imageUrl)}
            alt={currentBanner.title}
            className="hidden sm:block w-full h-full object-cover object-center"
          />

          {/* Mobile Image */}
          <img
            src={resolveBannerImg(currentBanner.mobileImageUrl || currentBanner.imageUrl)}
            alt={currentBanner.title}
            className="block sm:hidden w-full h-full object-cover object-center"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/50 to-transparent flex items-center">
            <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 w-full">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="max-w-xl text-white space-y-4"
              >
                {currentBanner.discountBadge && (
                  <span className="inline-flex items-center space-x-1.5 bg-brand-crimson text-white text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{currentBanner.discountBadge}</span>
                  </span>
                )}

                <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold font-display leading-tight tracking-tight text-white">
                  {currentBanner.title}
                </h2>

                {currentBanner.subtitle && (
                  <p className="text-slate-300 text-sm sm:text-base line-clamp-2">
                    {currentBanner.subtitle}
                  </p>
                )}

                <div className="pt-2">
                  <a
                    href={currentBanner.linkUrl}
                    className="inline-flex items-center space-x-2 bg-brand-crimson hover:bg-brand-crimson-dark text-white font-bold text-xs sm:text-sm px-7 py-3.5 rounded-xl shadow-xl hover:shadow-hover transition-all uppercase tracking-wider group/btn"
                  >
                    <span>{currentBanner.ctaText || 'EXPLORE COLLECTION'}</span>
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </a>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Slide Navigation Controls */}
      {banners.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/40 hover:bg-brand-crimson text-white backdrop-blur-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 z-20 focus:outline-none"
            aria-label="Previous Banner"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/40 hover:bg-brand-crimson text-white backdrop-blur-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 z-20 focus:outline-none"
            aria-label="Next Banner"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Indicator Dots */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center space-x-2 z-20">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all ${
                  currentIndex === idx ? 'w-8 bg-brand-crimson' : 'w-2 bg-white/50 hover:bg-white'
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
