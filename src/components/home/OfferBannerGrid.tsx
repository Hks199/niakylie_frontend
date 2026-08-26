import { Sparkles, Clock, ArrowRight, Tag } from 'lucide-react';

export function OfferBannerGrid() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <span className="text-xs uppercase font-extrabold text-brand-crimson tracking-widest flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>EXCLUSIVES & SAVINGS</span>
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-slate-dark font-display tracking-tight mt-1">
            Festive Offers & Daily Steals
          </h2>
        </div>
        <div className="hidden sm:flex items-center space-x-2 text-xs font-bold text-slate-500 bg-slate-100 px-3.5 py-1.5 rounded-full">
          <Clock className="w-4 h-4 text-brand-crimson animate-pulse" />
          <span>Deals Refresh Midnight</span>
        </div>
      </div>

      {/* 2x2 & 3x1 Promo Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Deal 1: Large Banner (Span 2) */}
        <div className="md:col-span-2 relative rounded-3xl overflow-hidden shadow-card group min-h-[260px] sm:min-h-[320px]">
          <img
            src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80"
            alt="Deal of the Day"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-900/60 to-transparent p-6 sm:p-10 flex flex-col justify-between text-white">
            <div className="space-y-2">
              <span className="bg-brand-crimson text-white text-xs font-extrabold px-3 py-1 rounded-full inline-block shadow-md uppercase tracking-wider">
                DEAL OF THE DAY
              </span>
              <h3 className="text-2xl sm:text-4xl font-extrabold font-display leading-tight">
                Banarasi Silk Sarees <br />
                <span className="text-brand-gold">FLAT 50% OFF</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md">
                Handcrafted Zari drapes from Varanasi weavers with free matching blouse piece.
              </p>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20">
                <Tag className="w-4 h-4 text-brand-gold" />
                <span className="text-xs font-bold">Use Code: FESTIVE50</span>
              </div>
              <a
                href="/category/sarees"
                className="bg-white text-brand-slate-dark hover:bg-brand-crimson hover:text-white text-xs font-extrabold px-5 py-2.5 rounded-xl shadow-lg transition-all flex items-center space-x-1.5 uppercase tracking-wider"
              >
                <span>CLAIM DEAL</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Deal 2: Vertical Card (Span 1) */}
        <div className="relative rounded-3xl overflow-hidden shadow-card group min-h-[260px] sm:min-h-[320px]">
          <img
            src="https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=80"
            alt="Kurta Sets Offer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/40 to-transparent p-6 flex flex-col justify-end text-white">
            <span className="bg-emerald-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full inline-block w-max mb-2 uppercase tracking-wider">
              BUY 1 GET 1 FREE
            </span>
            <h4 className="text-xl sm:text-2xl font-extrabold font-display leading-tight mb-1">
              Anarkali & Sharara Suits
            </h4>
            <p className="text-xs text-slate-300 mb-4">Under ₹1,999 Special Store</p>

            <a
              href="/category/kurta-sets"
              className="bg-brand-crimson hover:bg-brand-crimson-dark text-white text-xs font-extrabold px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5 uppercase tracking-wider w-full"
            >
              <span>SHOP BOGO SALE</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default OfferBannerGrid;
