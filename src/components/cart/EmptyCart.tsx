import { ShoppingBag, ArrowRight } from 'lucide-react';

export function EmptyCart() {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center my-8 shadow-sm max-w-lg mx-auto">
      <div className="w-20 h-20 bg-brand-crimson/10 text-brand-crimson rounded-full flex items-center justify-center mx-auto mb-4">
        <ShoppingBag className="w-10 h-10" />
      </div>
      <h3 className="text-2xl font-extrabold text-brand-slate-dark font-display mb-2">
        Your Bag is Empty
      </h3>
      <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6 leading-relaxed">
        Looks like you haven't added any luxury silk sarees or designer ethnic couture to your bag yet.
      </p>
      <a
        href="/products"
        className="inline-flex items-center space-x-2 bg-brand-crimson hover:bg-brand-crimson-dark text-white font-extrabold text-xs px-8 py-4 rounded-2xl shadow-xl transition-all uppercase tracking-wider group"
      >
        <span>EXPLORE FESTIVE COLLECTIONS</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </a>
    </div>
  );
}

export default EmptyCart;
