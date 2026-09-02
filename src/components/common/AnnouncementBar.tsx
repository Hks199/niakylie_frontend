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
    <div className="bg-gradient-to-r from-brand-slate-dark via-slate-900 to-brand-slate text-white text-xs py-2 px-4 relative overflow-hidden transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex-1 flex items-center justify-center space-x-2 text-center overflow-hidden">
          <span className="bg-brand-crimson text-white text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full flex items-center space-x-1 flex-shrink-0 animate-pulse">
            {renderIcon(current.icon)}
            <span>{current.badge || 'Announcement'}</span>
          </span>
          <span className="font-medium tracking-wide truncate max-w-xs sm:max-w-md md:max-w-none">
            {current.text}
          </span>
          {current.link && (
            <a
              href={current.link}
              className="hidden sm:inline-flex items-center text-brand-gold hover:underline font-semibold ml-2 group"
            >
              Shop Now <ChevronRight className="w-3 h-3 ml-0.5 group-hover:translate-x-0.5 transition-transform" />
            </a>
          )}
        </div>

        <button
          onClick={() => setIsVisible(false)}
          className="text-slate-400 hover:text-white transition-colors ml-4 focus:outline-none"
          aria-label="Close Announcement"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default AnnouncementBar;
