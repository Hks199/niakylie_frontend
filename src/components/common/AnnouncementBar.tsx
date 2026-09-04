import { useState, useEffect } from 'react';
import { Tag, Truck, Sparkles, Gift, Flame, X, ChevronRight } from 'lucide-react';
import { apiClient } from '../../api/client';

const DEFAULT_ANNOUNCEMENTS = [
  {
    _id: '1',
    text: 'FLAT 50% OFF FESTIVE SALE | Use Code: FESTIVE50',
    icon: 'Tag',
    badge: 'Limited Time',
    link: '#sale',
  },
  {
    _id: '2',
    text: 'FREE EXPRESS SHIPPING on all orders over ₹999!',
    icon: 'Truck',
    badge: 'Free Shipping',
    link: '#shipping',
  },
  {
    _id: '3',
    text: 'New Ethnic & Silk Saree Collection 2026 Live Now',
    icon: 'Sparkles',
    badge: 'Just Arrived',
    link: '#collection',
  },
];

export function AnnouncementBar() {
  const [announcements, setAnnouncements] = useState<any[]>(DEFAULT_ANNOUNCEMENTS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let isMounted = true;
    apiClient
      .get('/announcements/active')
      .then((res: any) => {
        if (!isMounted) return;
        const list = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.announcements)
          ? res.announcements
          : [];
        if (list.length > 0) {
          setAnnouncements(list);
        }
      })
      .catch((err) => {
        console.log('Announcements live fetch offline, using default list:', err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (announcements.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [announcements.length]);

  if (!isVisible || announcements.length === 0) return null;

  const current = announcements[currentIndex % announcements.length];

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Truck':
        return <Truck className="w-3 h-3 mr-0.5" />;
      case 'Sparkles':
        return <Sparkles className="w-3 h-3 mr-0.5 text-amber-300" />;
      case 'Gift':
        return <Gift className="w-3 h-3 mr-0.5 text-purple-300" />;
      case 'Flame':
        return <Flame className="w-3 h-3 mr-0.5 text-orange-300" />;
      default:
        return <Tag className="w-3 h-3 mr-0.5" />;
    }
  };

  return (
    <div className="bg-gradient-to-r from-brand-slate-dark via-slate-900 to-brand-slate text-white text-[10px] sm:text-xs py-1.5 sm:py-2 px-2 sm:px-4 relative overflow-hidden transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-1">
        {/* Mobile Continuous Scrolling Marquee Ticker (sm:hidden) */}
        <div className="flex-1 sm:hidden overflow-hidden relative">
          <div className="animate-marquee-continuous flex items-center space-x-6 whitespace-nowrap py-0.5">
            {[...announcements, ...announcements].map((item, idx) => (
              <div key={idx} className="flex items-center space-x-1.5 flex-shrink-0">
                <span className="bg-brand-crimson text-white text-[8px] uppercase font-extrabold px-1.5 py-0.5 rounded-full flex items-center space-x-0.5">
                  {renderIcon(item.icon)}
                  <span className="whitespace-nowrap">{item.badge || 'Announcement'}</span>
                </span>
                <span className="font-semibold text-[10px] tracking-tight">
                  {item.text}
                </span>
                {item.link && (
                  <a
                    href={item.link}
                    className="text-brand-gold hover:underline font-bold text-[9px] ml-1"
                  >
                    Shop Now →
                  </a>
                )}
                <span className="text-slate-500/80 mx-2 text-[10px]">•</span>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop Centered Rotator View (hidden sm:flex) */}
        <div className="hidden sm:flex flex-1 items-center justify-center space-x-2 text-center overflow-hidden">
          <span className="bg-brand-crimson text-white text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full flex items-center space-x-1 flex-shrink-0 animate-pulse">
            {renderIcon(current.icon)}
            <span className="whitespace-nowrap">{current.badge || 'Announcement'}</span>
          </span>
          <span className="font-semibold tracking-tight text-xs truncate max-w-md md:max-w-none">
            {current.text}
          </span>
          {current.link && (
            <a
              href={current.link}
              className="inline-flex items-center text-brand-gold hover:underline font-semibold ml-2 group"
            >
              Shop Now <ChevronRight className="w-3 h-3 ml-0.5 group-hover:translate-x-0.5 transition-transform" />
            </a>
          )}
        </div>

        <button
          onClick={() => setIsVisible(false)}
          className="text-slate-400 hover:text-white transition-colors ml-2 sm:ml-4 focus:outline-none flex-shrink-0 z-10 bg-slate-900/60 p-0.5 rounded"
          aria-label="Close Announcement"
        >
          <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </div>
    </div>
  );
}

export default AnnouncementBar;
