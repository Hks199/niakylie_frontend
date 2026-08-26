const BUBBLE_CATEGORIES = [
  {
    id: 1,
    name: 'Silk Sarees',
    slug: 'sarees',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=250&q=80',
    badge: 'Trending',
  },
  {
    id: 2,
    name: 'Kurta Sets',
    slug: 'kurta-sets',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=250&q=80',
    badge: 'Popular',
  },
  {
    id: 3,
    name: 'Lehengas',
    slug: 'lehengas',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=250&q=80',
    badge: 'Bridal',
  },
  {
    id: 4,
    name: 'Fusion Wear',
    slug: 'dresses',
    image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=250&q=80',
  },
  {
    id: 5,
    name: 'Anarkalis',
    slug: 'anarkalis',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=250&q=80',
  },
  {
    id: 6,
    name: 'Sharara Sets',
    slug: 'shararas',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=250&q=80',
  },
  {
    id: 7,
    name: 'Dupattas',
    slug: 'dupattas',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=250&q=80',
  },
];

export function CategoryBubbleBar() {
  return (
    <div className="bg-white border-b border-gray-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center space-x-6 sm:space-x-8 overflow-x-auto no-scrollbar py-2">
          {BUBBLE_CATEGORIES.map((item) => (
            <a
              key={item.id}
              href={`/category/${item.slug}`}
              className="flex flex-col items-center flex-shrink-0 group focus:outline-none"
            >
              <div className="relative p-1 rounded-full bg-gradient-to-tr from-brand-crimson via-rose-400 to-brand-gold group-hover:scale-110 transition-transform duration-300 shadow-sm">
                <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-white bg-slate-100">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:rotate-3 transition-transform duration-500"
                  />
                </div>
                {item.badge && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[9px] font-extrabold uppercase bg-brand-crimson text-white px-2 py-0.5 rounded-full shadow-sm whitespace-nowrap">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-xs font-bold text-brand-slate-dark mt-2.5 group-hover:text-brand-crimson transition-colors tracking-tight">
                {item.name}
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CategoryBubbleBar;
