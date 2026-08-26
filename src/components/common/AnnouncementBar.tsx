import { useState, useEffect } from 'react';
import { Tag, Truck, Sparkles, X, ChevronRight } from 'lucide-react';

const ANNOUNCEMENTS = [
  {
    id: 1,
    text: 'FLAT 50% OFF FESTIVE SALE | Use Code: FESTIVE50',
    icon: Tag,
    badge: 'Limited Time',
  },
  {
    id: 2,
    text: 'FREE EXPRESS SHIPPING on all orders over ₹999!',
    icon: Truck,
    badge: 'Free Shipping',
  },
  {
    id: 3,
    text: 'New Ethnic & Silk Saree Collection 2026 Live Now',
    icon: Sparkles,
    badge: 'Just Arrived',
  },
];

export function AnnouncementBar() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  if (!isVisible) return null;

  const current = ANNOUNCEMENTS[currentIndex];
  const IconComponent = current.icon;

  return (
    <div className="bg-gradient-to-r from-brand-slate-dark via-slate-900 to-brand-slate text-white text-xs py-2 px-4 relative overflow-hidden transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex-1 flex items-center justify-center space-x-2 text-center overflow-hidden">
          <span className="bg-brand-crimson text-white text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full flex items-center space-x-1 flex-shrink-0 animate-pulse">
            <IconComponent className="w-3 h-3 mr-0.5" />
            {current.badge}
          </span>
          <span className="font-medium tracking-wide truncate max-w-xs sm:max-w-md md:max-w-none">
            {current.text}
          </span>
          <a
            href="#sale"
            className="hidden sm:inline-flex items-center text-brand-gold hover:underline font-semibold ml-2 group"
          >
            Shop Now <ChevronRight className="w-3 h-3 ml-0.5 group-hover:translate-x-0.5 transition-transform" />
          </a>
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
