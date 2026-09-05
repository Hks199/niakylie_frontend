import { useState, useEffect } from 'react';
import { Sparkles, Clock, ArrowRight, Tag } from 'lucide-react';
import { Banner } from '../../types/banner';
import { apiClient } from '../../api/client';

interface OfferBannerGridProps {
  banners?: Banner[];
}

export function OfferBannerGrid({ banners = [] }: OfferBannerGridProps) {
  const [activeCouponCode, setActiveCouponCode] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    apiClient
      .get('/coupons/active')
      .then((res: any) => {
        if (!isMounted) return;
        const list = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.coupons)
          ? res.coupons
          : [];
        if (list.length > 0 && list[0]?.code) {
          setActiveCouponCode(list[0].code);
        }
      })
      .catch((err) => {
        console.log('Active coupons fetch for banner grid offline:', err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const resolveBannerImg = (path?: string) => {
    if (!path) return 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80';
    return path.startsWith('http') ? path : `http://localhost:3000${path}`;
  };

  const hasDynamicBanners = banners && banners.length > 0;
  const mainBanner = hasDynamicBanners ? banners[0] : null;
  const secondaryBanner = hasDynamicBanners && banners.length > 1 ? banners[1] : null;
  const extraBanners = hasDynamicBanners && banners.length > 2 ? banners.slice(2) : [];

  // Determine promo code dynamically from banner metadata, coupon code, or fallback
  const mainPromoCode =
    mainBanner?.metadata?.promoCode ||
    mainBanner?.metadata?.code ||
    mainBanner?.discountBadge ||
    activeCouponCode ||
    'FESTIVE50';

  return (
    <section className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="flex items-center justify-between mb-5 sm:mb-8 gap-2">
        <div className="min-w-0">
          <span className="text-[10px] sm:text-xs uppercase font-extrabold text-brand-crimson tracking-wider sm:tracking-widest flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">EXCLUSIVES & SAVINGS</span>
          </span>
          <h2 className="text-xl sm:text-3xl font-extrabold text-brand-slate-dark font-display tracking-tight mt-1 leading-snug">
            Festive Offers & Daily Steals
          </h2>
        </div>
        <div className="hidden sm:flex items-center space-x-2 text-xs font-bold text-slate-500 bg-slate-100 px-3.5 py-1.5 rounded-full flex-shrink-0">
          <Clock className="w-4 h-4 text-brand-crimson animate-pulse" />
          <span>Deals Refresh Midnight</span>
        </div>
      </div>

      {/* 2x2 & 3x1 Promo Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-6">
        {/* Deal 1: Large Banner (Span 2) */}
        <div className="md:col-span-2 relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-card group min-h-[220px] sm:min-h-[320px]">
          <img
            src={mainBanner ? resolveBannerImg(mainBanner.imageUrl) : "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80"}
            alt={mainBanner?.title || "Deal of the Day"}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-900/60 to-transparent p-4 sm:p-10 flex flex-col justify-between text-white">
            <div className="space-y-1.5 sm:space-y-2 min-w-0">
              <span className="bg-brand-crimson text-white text-[10px] sm:text-xs font-extrabold px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full inline-block max-w-full truncate shadow-md uppercase tracking-wider">
                {mainBanner?.discountBadge || mainBanner?.type || 'DEAL OF THE DAY'}
              </span>
              <h3 className="text-lg sm:text-4xl font-extrabold font-display leading-snug sm:leading-tight">
                <span className="line-clamp-2">{mainBanner?.title || 'Banarasi Silk Sarees'}</span>
                <span className="block text-brand-gold line-clamp-1 mt-0.5">{mainBanner?.subtitle || 'FLAT 50% OFF'}</span>
              </h3>
            </div>

            <div className="pt-3 sm:pt-4 flex items-center justify-between flex-wrap gap-2 sm:gap-3">
              <div className="flex items-center space-x-1.5 sm:space-x-2 bg-white/10 backdrop-blur-md px-2.5 sm:px-3 py-1.5 rounded-lg border border-white/20 max-w-full min-w-0">
                <Tag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-gold flex-shrink-0" />
                <span className="text-[10px] sm:text-xs font-bold uppercase truncate">Use Code: {mainPromoCode}</span>
              </div>
              <a
                href={mainBanner?.linkUrl || "/category/sarees"}
                className="bg-white text-brand-slate-dark hover:bg-brand-crimson hover:text-white text-[10px] sm:text-xs font-extrabold px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl shadow-lg transition-all flex items-center space-x-1 sm:space-x-1.5 uppercase tracking-wider"
              >
                <span>{mainBanner?.linkLabel || 'CLAIM DEAL'}</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Deal 2: Vertical Card (Span 1) */}
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-card group min-h-[220px] sm:min-h-[320px]">
          <img
            src={secondaryBanner ? resolveBannerImg(secondaryBanner.imageUrl) : "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=80"}
            alt={secondaryBanner?.title || "Kurta Sets Offer"}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/40 to-transparent p-4 sm:p-6 flex flex-col justify-end text-white">
            <span className="bg-emerald-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full inline-block max-w-full truncate mb-2 uppercase tracking-wider">
              {secondaryBanner?.discountBadge || secondaryBanner?.type || 'BUY 1 GET 1 FREE'}
            </span>
            <h4 className="text-base sm:text-2xl font-extrabold font-display leading-snug sm:leading-tight mb-1 line-clamp-2">
              {secondaryBanner?.title || 'Anarkali & Sharara Suits'}
            </h4>
            {secondaryBanner?.subtitle && (
              <p className="text-[11px] sm:text-xs text-slate-300 mb-3 line-clamp-2">{secondaryBanner.subtitle}</p>
            )}

            <a
              href={secondaryBanner?.linkUrl || "/category/kurta-sets"}
              className="bg-brand-crimson hover:bg-brand-crimson-dark text-white text-[10px] sm:text-xs font-extrabold px-3 sm:px-4 py-2.5 rounded-lg sm:rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5 uppercase tracking-wider w-full"
            >
              <span className="truncate">{secondaryBanner?.linkLabel || 'SHOP BOGO SALE'}</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
            </a>
          </div>
        </div>
      </div>

      {/* Additional Dynamic Offer Banners (If 3 or more offer banners exist) */}
      {extraBanners.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-6 mt-3.5 sm:mt-6">
          {extraBanners.map((banner) => (
            <div
              key={banner._id || banner.id}
              className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-card group min-h-[200px] sm:min-h-[220px]"
            >
              <img
                src={resolveBannerImg(banner.imageUrl)}
                alt={banner.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/40 to-transparent p-4 sm:p-6 flex flex-col justify-end text-white">
                <span className="bg-purple-600 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full inline-block max-w-full truncate mb-2 uppercase tracking-wider">
                  {banner.discountBadge || banner.type || 'SPECIAL OFFER'}
                </span>
                <h4 className="text-base sm:text-lg font-extrabold font-display leading-snug mb-1 line-clamp-2">
                  {banner.title}
                </h4>
                {banner.subtitle && (
                  <p className="text-[11px] sm:text-xs text-slate-300 mb-3 line-clamp-2">{banner.subtitle}</p>
                )}
                <a
                  href={banner.linkUrl || "/collection"}
                  className="bg-white text-brand-slate-dark hover:bg-brand-crimson hover:text-white text-[10px] sm:text-xs font-extrabold px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl transition-all flex items-center justify-center space-x-1 uppercase tracking-wider"
                >
                  <span className="truncate">{banner.linkLabel || 'EXPLORE NOW'}</span>
                  <ArrowRight className="w-3.5 h-3.5 flex-shrink-0" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default OfferBannerGrid;
