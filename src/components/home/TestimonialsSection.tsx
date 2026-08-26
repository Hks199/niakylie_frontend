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
    <section className="bg-slate-50 py-16 px-4 sm:px-6 lg:px-8 border-y border-gray-100">
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center space-x-1.5 bg-brand-crimson/10 text-brand-crimson px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider mb-4">
          <Quote className="w-3.5 h-3.5" />
          <span>REAL CUSTOMER LOVE</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-slate-dark font-display tracking-tight mb-8">
          Over 50,000+ Happy Women Dressed
        </h2>

        {/* Testimonial Card Slider */}
        <div className="relative bg-white rounded-3xl p-8 sm:p-12 border border-gray-100 shadow-xl transition-all">
          <div className="flex flex-col items-center space-y-4">
            {/* Stars */}
            <div className="flex items-center space-x-1 text-amber-500">
              {[...Array(current.rating)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-amber-500" />
              ))}
            </div>

            {/* Comment */}
            <p className="text-sm sm:text-base text-slate-700 italic max-w-2xl font-serif leading-relaxed">
              "{current.comment}"
            </p>

            {/* Product Purchased Tag */}
            {current.productName && (
              <span className="text-xs bg-slate-100 text-slate-600 font-semibold px-3 py-1 rounded-full">
                Purchased: {current.productName}
              </span>
            )}

            {/* Buyer Profile */}
            <div className="flex items-center space-x-3 pt-4 border-t border-gray-100 w-full justify-center">
              <img
                src={current.avatarUrl}
                alt={current.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-brand-crimson"
              />
              <div className="text-left">
                <div className="flex items-center space-x-1.5">
                  <h4 className="font-extrabold text-sm text-brand-slate-dark">{current.name}</h4>
                  {current.verifiedBuyer && (
                    <span className="inline-flex items-center text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                      <ShieldCheck className="w-3 h-3 mr-0.5" />
                      Verified
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">{current.location}</p>
              </div>
            </div>
          </div>

          {/* Nav Controls */}
          <button
            onClick={handlePrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-100 hover:bg-brand-crimson hover:text-white text-slate-600 transition-colors focus:outline-none"
            aria-label="Previous Review"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-100 hover:bg-brand-crimson hover:text-white text-slate-600 transition-colors focus:outline-none"
            aria-label="Next Review"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}

export default TestimonialsSection;
