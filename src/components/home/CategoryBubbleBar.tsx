import { useCategories } from '../../hooks/useCategories';

export function CategoryBubbleBar() {
  const { allCategories, isLoading } = useCategories({ status: true });

  const activeCategories = allCategories.filter((c) => c.status !== false && !c.isDeleted && !c.deletedAt);

  if (isLoading) {
    return (
      <div className="bg-white border-b border-gray-100 py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex space-x-5 sm:space-x-6 overflow-x-auto scrollbar-none py-2 animate-pulse [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div key={idx} className="flex flex-col items-center flex-shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-200" />
              <div className="h-3 w-14 bg-slate-200 rounded mt-2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activeCategories.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border-b border-gray-100 py-4 sm:py-6 px-4 sm:px-6 lg:px-8 shadow-xs">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center space-x-5 sm:space-x-8 overflow-x-auto py-1.5 scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {activeCategories.map((item) => {
            const rawImg = (item as any).image || (item as any).banner;
            const imageUrl =
              rawImg && rawImg !== 'undefined' && rawImg !== 'null' && rawImg.trim() !== ''
                ? rawImg.startsWith('http')
                  ? rawImg
                  : `http://localhost:3000${rawImg}`
                : 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=250&q=80';

            return (
              <a
                key={item._id || item.slug}
                href={`/category/${item.slug}`}
                className="flex flex-col items-center flex-shrink-0 group focus:outline-none"
              >
                <div className="relative p-0.5 sm:p-1 rounded-full bg-gradient-to-tr from-brand-crimson via-rose-400 to-brand-gold group-hover:scale-105 transition-transform duration-300 shadow-sm">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-white bg-slate-100">
                    <img
                      src={imageUrl}
                      alt={item.name}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=250&q=80';
                      }}
                      className="w-full h-full object-cover group-hover:rotate-3 transition-transform duration-500"
                    />
                  </div>
                </div>
                <span className="text-[11px] sm:text-xs font-bold text-brand-slate-dark mt-2 group-hover:text-brand-crimson transition-colors tracking-tight text-center max-w-[72px] sm:max-w-none truncate">
                  {item.name}
                </span>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default CategoryBubbleBar;
