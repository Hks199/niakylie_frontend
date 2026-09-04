import { useQuery } from '@tanstack/react-query';
import { Sparkles, ArrowRight } from 'lucide-react';
import { brandsApi } from '../../api/brands';

const FALLBACK_BRANDS = [
  {
    name: 'NiaKylie Signature',
    filterBrandName: 'NiaKylie Signature',
    tagline: 'Pure Zari Handloom Heritage',
    discount: 'UP TO 50% OFF',
    imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80',
    slug: 'niakylie-signature',
  },
  {
    name: 'Biba Luxury Edit',
    filterBrandName: 'Biba',
    tagline: 'Contemporary Ethnic Suits',
    discount: 'MIN 40% OFF',
    imageUrl: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=400&q=80',
    slug: 'biba',
  },
  {
    name: 'Ritu Kumar Couture',
    filterBrandName: 'Ritu Kumar',
    tagline: 'Royal Bridal & Festives',
    discount: 'NEW SEASON',
    imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=400&q=80',
    slug: 'ritu-kumar',
  },
  {
    name: 'Anita Dongre Grassroot',
    filterBrandName: 'Anita Dongre',
    tagline: 'Sustainable Silk Artistry',
    discount: 'FLAT 30% OFF',
    imageUrl: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=400&q=80',
    slug: 'anita-dongre',
  },
];

export function BrandSpotlight() {
  const { data: brandsResponse } = useQuery({
    queryKey: ['brand-spotlight'],
    queryFn: () => brandsApi.getBrands({ limit: 4 }),
  });

  const apiBrands = brandsResponse?.data || [];
  const displayBrands = apiBrands.length > 0
    ? apiBrands.map((b, idx) => ({
        name: b.name,
        filterBrandName: b.name,
        tagline: b.description || 'Exclusive Handcrafted Couture',
        discount: 'DESIGNER EDIT',
        imageUrl: b.logo
          ? (b.logo.startsWith('http') ? b.logo : `http://localhost:3000${b.logo}`)
          : FALLBACK_BRANDS[idx % FALLBACK_BRANDS.length].imageUrl,
        slug: b.slug,
      }))
    : FALLBACK_BRANDS;

  return (
    <section className="bg-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs uppercase font-extrabold text-brand-gold tracking-widest flex items-center justify-center space-x-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>EXCLUSIVE PARTNERSHIPS</span>
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-display leading-tight mt-1 text-white">
            Brand Spotlight & Luxury Houses
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Curated ethnic couture from India's premier fashion designer houses and master weavers.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayBrands.map((brand, idx) => {
            const filterTarget = (brand as any).filterBrandName || brand.name;
            return (
              <a
                key={idx}
                href={`/products?brand=${encodeURIComponent(filterTarget)}`}
                className="group relative rounded-3xl overflow-hidden bg-slate-800 border border-slate-700/60 shadow-xl hover:border-brand-crimson/50 transition-all duration-300 block"
              >
                <div className="aspect-[4/5] w-full overflow-hidden">
                  <img
                    src={brand.imageUrl}
                    alt={brand.name}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                  />
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent p-5 flex flex-col justify-end">
                  <span className="bg-brand-crimson text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full w-max mb-1.5 shadow-sm">
                    {brand.discount}
                  </span>
                  <h3 className="font-extrabold text-base text-white group-hover:text-brand-gold transition-colors">
                    {brand.name}
                  </h3>
                  <p className="text-xs text-slate-300 mb-3">{brand.tagline}</p>
                  <div className="inline-flex items-center text-xs font-bold text-brand-gold group-hover:text-white transition-colors">
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
