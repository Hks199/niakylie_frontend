import { useState } from 'react';
import { Star, ShieldCheck, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { Testimonial } from '../../types';

const REVIEWS: Testimonial[] = [
  {
    id: 't1',
    name: 'Pooja Hegde',
    location: 'Mumbai, Maharashtra',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    comment:
      'The Crimson Banarasi Silk Saree I ordered for my sister’s wedding was absolutely breathtaking! Pure Zari craftsmanship and delivered within 48 hours.',
    productName: 'Crimson Red Banarasi Silk Saree',
    verifiedBuyer: true,
  },
  {
    id: 't2',
    name: 'Ritu Sen',
    location: 'Kolkata, West Bengal',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    comment:
      'NiaKylie ethnic dresses have top-notch fabric quality and exquisite embroidery. Fits like tailor-made perfection! Highly recommended.',
    productName: 'Royal Mustard Anarkali Suit Set',
    verifiedBuyer: true,
  },
  {
    id: 't3',
    name: 'Dr. Meera Nambiar',
    location: 'Bengaluru, Karnataka',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    comment:
      'Loved the seamless checkout and instant updates. The Organza saree arrived beautifully packed with a complimentary blouse stitching kit!',
    productName: 'Pastel Pink Organza Designer Saree',
    verifiedBuyer: true,
  },
  {
    id: 't4',
    name: 'Ananya Sharma',
    location: 'Delhi NCR',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    comment:
      'Stunning fit and rich velvet border details! I wore this for Diwali night and received endless compliments from friends & family.',
    productName: 'Emerald Green Chanderi Silk Lehenga',
    verifiedBuyer: true,
  },
  {
    id: 't5',
    name: 'Kavita Reddy',
    location: 'Hyderabad, Telangana',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    comment:
      'Authentic pure silk feel with genuine weave certifications included. NiaKylie has earned my trust for all future festive orders.',
    productName: 'Golden Handloom Kanjeevaram Saree',
    verifiedBuyer: true,
  },
  {
    id: 't6',
    name: 'Sneha Patel',
    location: 'Ahmedabad, Gujarat',
    avatarUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    comment:
      'Soft breathable fabric combined with delicate hand-stitched Chikankari. Ideal for long festive gatherings without compromising comfort.',
    productName: 'Chikankari Georgette Kurti Set',
    verifiedBuyer: true,
  },
  {
    id: 't7',
    name: 'Priya Deshmukh',
    location: 'Pune, Maharashtra',
    avatarUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    comment:
      'Prompt delivery and the vibrant color matches the product photos exactly! Beautiful packaging and zero color bleed after washing.',
    productName: 'Lavender Floral Organza Dupatta Set',
    verifiedBuyer: true,
  },
  {
    id: 't8',
    name: 'Divya Nair',
    location: 'Kochi, Kerala',
    avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    comment:
      'The Kasavu border weave was elegant and traditional for Onam celebrations. Great quality control and polite customer care support.',
    productName: 'Ivory Kasavu Bordered Festival Saree',
    verifiedBuyer: true,
  },
  {
    id: 't9',
    name: 'Simran Kaur',
    location: 'Chandigarh, Punjab',
    avatarUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    comment:
      'Heavy zardozi embroidery work with lightweight inner lining so it feels luxurious yet super light to carry around all evening!',
    productName: 'Velvet Embroidered Bridal Suit Set',
    verifiedBuyer: true,
  },
  {
    id: 't10',
    name: 'Aishwarya Roy',
    location: 'Jaipur, Rajasthan',
    avatarUrl: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    comment:
      'The Gota Patti detailing is intricate and royal! NiaKylie offers high fashion ethnic wear with true value for money.',
    productName: 'Gota Patti Designer Sharara Suit',
    verifiedBuyer: true,
  },
];

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % REVIEWS.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + REVIEWS.length) % REVIEWS.length);
  };

  const current = REVIEWS[currentIndex];

  return (
    <section className="bg-slate-50 py-12 sm:py-16 px-3.5 sm:px-6 lg:px-8 border-y border-gray-100 overflow-hidden">
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center space-x-1.5 bg-brand-crimson/10 text-brand-crimson px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider mb-4">
          <Quote className="w-3.5 h-3.5" />
          <span>REAL CUSTOMER LOVE</span>
        </div>

        <h2 className="text-2xl sm:text-4xl font-extrabold text-brand-slate-dark font-display tracking-tight mb-8">
          Over 5000+ Happy Women Dressed
        </h2>

        {/* Testimonial Card Slider */}
        <div className="relative bg-white rounded-3xl p-5 sm:p-12 border border-gray-100 shadow-xl transition-all">
          <div className="flex flex-col items-center space-y-4">
            {/* Stars */}
            <div className="flex items-center space-x-1 text-amber-500">
              {[...Array(current.rating)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-amber-500" />
              ))}
            </div>

            {/* Comment */}
            <p className="text-xs sm:text-base text-slate-700 italic max-w-2xl font-serif leading-relaxed px-2 sm:px-0">
              "{current.comment}"
            </p>

            {/* Product Purchased Tag */}
            {current.productName && (
              <span className="text-[11px] sm:text-xs bg-slate-100 text-slate-600 font-semibold px-3 py-1 rounded-full truncate max-w-[260px] sm:max-w-none">
                Purchased: {current.productName}
              </span>
            )}

            {/* Buyer Profile */}
            <div className="flex items-center space-x-3 pt-4 border-t border-gray-100 w-full justify-center">
              <img
                src={current.avatarUrl}
                alt={current.name}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-brand-crimson flex-shrink-0"
              />
              <div className="text-left">
                <div className="flex items-center space-x-1.5 flex-wrap">
                  <h4 className="font-extrabold text-xs sm:text-sm text-brand-slate-dark">{current.name}</h4>
                  {current.verifiedBuyer && (
                    <span className="inline-flex items-center text-[9px] sm:text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                      <ShieldCheck className="w-3 h-3 mr-0.5" />
                      Verified
                    </span>
                  )}
                </div>
                <p className="text-[11px] sm:text-xs text-slate-400">{current.location}</p>
              </div>
            </div>
          </div>

          {/* Nav Controls */}
          <button
            onClick={handlePrev}
            className="absolute left-1.5 sm:left-3 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 rounded-full bg-slate-100 hover:bg-brand-crimson hover:text-white text-slate-600 transition-colors focus:outline-none"
            aria-label="Previous Review"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-1.5 sm:right-3 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 rounded-full bg-slate-100 hover:bg-brand-crimson hover:text-white text-slate-600 transition-colors focus:outline-none"
            aria-label="Next Review"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* 10 Dots Navigation Indicator */}
        <div className="flex items-center justify-center space-x-1.5 sm:space-x-2 mt-6 flex-wrap max-w-full px-2 overflow-hidden">
          {REVIEWS.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'w-6 sm:w-7 bg-brand-crimson'
                  : 'w-2 sm:w-2.5 bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default TestimonialsSection;
