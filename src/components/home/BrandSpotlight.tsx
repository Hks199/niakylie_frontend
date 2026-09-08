import { useQuery } from '@tanstack/react-query';
import { Sparkles, ArrowRight } from 'lucide-react';
import { brandsApi } from '../../api/brands';
import { formatImageUrl } from '../../utils/imageUtils';

export function BrandSpotlight() {
  const { data: brandsResponse } = useQuery({
    queryKey: ['brand-spotlight'],
    queryFn: () => brandsApi.getBrands({ limit: 4 }),
  });

  const apiBrands = brandsResponse?.data || [];
  const displayBrands = apiBrands.map((b) => ({
        name: b.name,
        filterBrandName: b.name,
        tagline: b.description || 'Exclusive Handcrafted Couture',
        discount: 'DESIGNER EDIT',
        imageUrl: b.logo
          ? formatImageUrl(b.logo)
          : '',
        slug: b.slug,
      }));

  return (
    <section className="bg-slate-900 text-white py-10 sm:py-16 px-3.5 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-7 sm:mb-12">
          <span className="text-[10px] sm:text-xs uppercase font-extrabold text-brand-gold tracking-wider sm:tracking-widest flex items-center justify-center space-x-1">
            <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
            <span>EXCLUSIVE PARTNERSHIPS</span>
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold font-display leading-snug sm:leading-tight mt-1 text-white px-1">
            Brand Spotlight & Luxury Houses
          </h2>
          <p className="text-[11px] sm:text-sm text-slate-400 mt-2 px-1">
            Curated ethnic couture from India's premier fashion designer houses and master weavers.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
          {displayBrands.map((brand, idx) => {
            const filterTarget = (brand as any).filterBrandName || brand.name;
            return (
              <a
                key={idx}
                href={`/products?brand=${encodeURIComponent(filterTarget)}`}
                className="group relative rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-800 border border-slate-700/60 shadow-xl hover:border-brand-crimson/50 transition-all duration-300 block"
              >
                <div className="aspect-[4/5] w-full overflow-hidden">
                  <img
                    src={brand.imageUrl}
                    alt={brand.name}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                  />
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent p-4 sm:p-5 flex flex-col justify-end">
                  <span className="bg-brand-crimson text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full w-max max-w-full truncate mb-1.5 shadow-sm">
                    {brand.discount}
                  </span>
                  <h3 className="font-extrabold text-sm sm:text-base text-white group-hover:text-brand-gold transition-colors line-clamp-1">
                    {brand.name}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-300 mb-2 sm:mb-3 line-clamp-2">{brand.tagline}</p>
                  <div className="inline-flex items-center text-[11px] sm:text-xs font-bold text-brand-gold group-hover:text-white transition-colors">
                    <span>EXPLORE BRAND</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default BrandSpotlight;
