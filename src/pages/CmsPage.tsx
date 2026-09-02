import { useQuery } from '@tanstack/react-query';
import {
  ChevronRight,
  Clock,
  Loader2,
  Sparkles,
  Heart,
  Store,
  Globe,
  Instagram,
  Facebook,
  Phone,
  MapPin,
  Award,
  ShieldCheck,
  ArrowRight,
  ShoppingBag,
  Mail,
  MessageSquare,
  Lock,
  FileText,
  ShieldAlert,
} from 'lucide-react';
import { cmsApi } from '../api/cms';

interface CmsPageProps {
  slug: string;
}

const SLUG_LABELS: Record<string, string> = {
  'contact-us': 'Contact Us',
  'about-us': 'About Us',
  'privacy-policy': 'Privacy Policy',
  'terms-and-conditions': 'Terms & Conditions',
  'refund-policy': 'Refund & Return Policy',
  'shipping-policy': 'Shipping Policy',
};

// Extract headings from HTML string for table of contents
function extractHeadings(html: string): { id: string; label: string }[] {
  const matches = [...html.matchAll(/<h2[^>]*id="([^"]+)"[^>]*>([^<]+)<\/h2>/gi)];
  return matches.map(([, id, label]) => ({ id, label }));
}

function ContactUsView() {
  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* 1. Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-950 via-brand-slate-dark to-slate-900 text-white p-8 sm:p-14 shadow-2xl border border-amber-500/20 text-center">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-brand-crimson/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-500/20 to-brand-crimson/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-amber-500/30 text-amber-300 text-xs font-extrabold uppercase tracking-widest">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>WE'RE HERE TO HELP YOU</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold font-display tracking-tight text-white leading-tight">
            Get in Touch with <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-rose-300 to-amber-400">
              NIAKYLIE
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed pt-1">
            Whether you have questions about a saree order, custom draping advice, fabric inquiries, or visiting our Raipur flagship boutique — our dedicated customer care team is always here to assist you with warmth and care.
          </p>
        </div>
      </div>

      {/* 2. Quick Contact Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Phone Card */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 space-y-4 flex flex-col justify-between group">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-brand-crimson flex items-center justify-center group-hover:scale-110 transition-transform">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Call Support</span>
              <h3 className="font-extrabold text-base text-brand-slate-dark">+91 95899 28337</h3>
              <p className="text-xs text-slate-500 mt-1">Mon - Sat: 10:00 AM to 8:30 PM</p>
            </div>
          </div>
          <a
            href="tel:+919589928337"
            className="inline-flex items-center justify-center space-x-2 w-full bg-slate-50 hover:bg-brand-crimson hover:text-white border border-slate-200/80 text-brand-slate-dark text-xs font-extrabold py-2.5 rounded-2xl transition-all"
          >
            <span>Call Now</span>
            <ChevronRight className="w-4 h-4" />
          </a>
        </div>

        {/* WhatsApp Card */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 space-y-4 flex flex-col justify-between group">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">WhatsApp Chat</span>
              <h3 className="font-extrabold text-base text-brand-slate-dark">+91 95899 28337</h3>
              <p className="text-xs text-slate-500 mt-1">Instant photo & video order support</p>
            </div>
          </div>
          <a
            href="https://wa.me/919589928337"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center space-x-2 w-full bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 text-xs font-extrabold py-2.5 rounded-2xl transition-all"
          >
            <span>Chat on WhatsApp</span>
            <ChevronRight className="w-4 h-4" />
          </a>
        </div>

        {/* Email Card */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 space-y-4 flex flex-col justify-between group">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Email Care</span>
              <h3 className="font-extrabold text-xs sm:text-sm text-brand-slate-dark truncate">niakylieofficial@gmail.com</h3>
              <p className="text-xs text-slate-500 mt-1">Response within 24 hours</p>
            </div>
          </div>
          <a
            href="mailto:niakylieofficial@gmail.com"
            className="inline-flex items-center justify-center space-x-2 w-full bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200 text-xs font-extrabold py-2.5 rounded-2xl transition-all"
          >
            <span>Send Email</span>
            <ChevronRight className="w-4 h-4" />
          </a>
        </div>

        {/* Store Location Card */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 space-y-4 flex flex-col justify-between group">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Flagship Store</span>
              <h3 className="font-extrabold text-sm text-brand-slate-dark">Raipur, Chhattisgarh</h3>
              <p className="text-xs text-slate-500 mt-1">Ward No. 39, Sarora, Gondwara Basti</p>
            </div>
          </div>
          <a
            href="https://www.google.com/maps/dir/?api=1&destination=21.290281,81.611905"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center space-x-2 w-full bg-amber-50 hover:bg-amber-500 text-amber-800 hover:text-slate-950 border border-amber-200 text-xs font-extrabold py-2.5 rounded-2xl transition-all"
          >
            <span>Get Directions</span>
            <ChevronRight className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* 3. Store Hours & Full Address Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* Store Hours Card */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-950 text-white rounded-3xl p-8 shadow-xl space-y-5 border border-slate-800 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-extrabold">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg font-display">Niakylie Store Hours</h3>
                <p className="text-xs text-slate-400">Raipur Flagship Location</p>
              </div>
            </div>

            <div className="space-y-3 pt-2 text-xs border-t border-slate-800">
              <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400 font-semibold">Monday – Saturday</span>
                <span className="font-extrabold text-amber-300">10:00 AM – 8:30 PM</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400 font-semibold">Sunday</span>
                <span className="font-extrabold text-amber-300">11:00 AM – 6:00 PM</span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400 font-semibold">WhatsApp Support</span>
                <span className="font-extrabold text-emerald-400">24/7 Available</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs font-semibold flex items-center space-x-2 mt-4">
            <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>Personal saree trials & bridal drape consultations available at our shop!</span>
          </div>
        </div>

        {/* Complete Address Box */}
        <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-extrabold text-lg text-brand-slate-dark font-display flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-brand-crimson" />
              <span>Full Store Address</span>
            </h3>

            <div className="text-xs text-slate-600 space-y-1.5 font-semibold leading-relaxed">
              <p className="font-extrabold text-brand-slate-dark text-base">Niakylie Women Collection</p>
              <p>Ward No. 39, Kabir Chaura, Bajar Chauk,</p>
              <p>Sarora, Gondwara Basti,</p>
              <p>Raipur, Chhattisgarh – 493221, India</p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Customer Hotline:</span>
            <a href="tel:+919589928337" className="text-brand-crimson hover:underline font-extrabold">+91 95899 28337</a>
          </div>
        </div>
      </div>

      {/* 4. Interactive Google Map Location */}
      <div className="bg-white border border-gray-100 rounded-3xl p-8 sm:p-10 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-brand-slate-dark font-display flex items-center space-x-2">
              <MapPin className="w-6 h-6 text-brand-crimson" />
              <span>Find Our Store on Google Maps</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Visit us directly in Raipur, Chhattisgarh or get turn-by-turn directions:
            </p>
          </div>

          <a
            href="https://www.google.com/maps/dir/?api=1&destination=21.290281,81.611905"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center space-x-2 bg-brand-crimson hover:bg-brand-crimson-dark text-white font-extrabold text-xs px-5 py-3 rounded-2xl shadow-md transition-all hover:scale-105"
          >
            <span>Open in Google Maps</span>
            <ChevronRight className="w-4 h-4" />
          </a>
        </div>

        <div className="relative w-full h-[400px] rounded-3xl overflow-hidden border border-slate-200 shadow-md bg-slate-100">
          <iframe
            title="NiaKylie Store Location Map"
            src="https://maps.google.com/maps?q=21.290281,81.611905&t=&z=16&ie=UTF8&iwloc=&output=embed"
            className="w-full h-full border-0"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>

      {/* 5. Connect With NIAKYLIE Social Links */}
      <div className="bg-white border border-gray-100 rounded-3xl p-8 sm:p-10 shadow-sm space-y-6">
        <h2 className="text-2xl font-extrabold text-brand-slate-dark font-display">Connect With NIAKYLIE</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <a
            href="https://niakylie.com"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 hover:border-brand-crimson hover:bg-rose-50/30 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Globe className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold text-slate-400 uppercase">Website</div>
            <div className="text-sm font-extrabold text-brand-slate-dark group-hover:text-brand-crimson">niakylie.com</div>
          </a>

          <a
            href="https://www.instagram.com/niakylie_women_collection"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 hover:border-brand-crimson hover:bg-rose-50/30 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Instagram className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold text-slate-400 uppercase">Instagram</div>
            <div className="text-sm font-extrabold text-brand-slate-dark group-hover:text-brand-crimson">@niakylie_women_collection</div>
          </a>

          <a
            href="https://www.facebook.com/profile.php?id=61592438117379"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 hover:border-brand-crimson hover:bg-rose-50/30 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Facebook className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold text-slate-400 uppercase">Facebook</div>
            <div className="text-sm font-extrabold text-brand-slate-dark group-hover:text-brand-crimson">NIAKYLIE Women Collection</div>
          </a>

          <a
            href="https://wa.me/919589928337"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Phone className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold text-slate-400 uppercase">WhatsApp</div>
            <div className="text-sm font-extrabold text-brand-slate-dark group-hover:text-emerald-600">Business WhatsApp</div>
          </a>
        </div>
      </div>
    </div>
  );
}

function AboutUsView() {
  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* 1. Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-950 via-brand-slate-dark to-slate-900 text-white p-8 sm:p-14 shadow-2xl border border-amber-500/20">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-brand-crimson/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-500/20 to-brand-crimson/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-amber-500/30 text-amber-300 text-xs font-extrabold uppercase tracking-widest">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>WEAR BEAUTY, FEEL BEAUTY</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold font-display tracking-tight text-white leading-tight">
            About Niakylie <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-rose-300 to-amber-400">
              Women Collection
            </span>
          </h1>

          <p className="text-lg sm:text-xl font-bold text-amber-200 font-serif italic pt-1">
            "Celebrating Every Woman, One Saree at a Time"
          </p>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed pt-2">
            Welcome to <strong className="text-white font-extrabold">Niakylie Women Collection</strong> — a growing saree brand built with a simple vision: to make beautiful, stylish, and versatile sarees accessible to every woman.
          </p>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            At NIAKYLIE, we believe a saree is more than just an outfit. It is a part of our culture, a reflection of individuality, and something that can make every occasion feel special. From traditional celebrations to everyday elegance, we bring together a variety of sarees to suit different styles, occasions, and personalities.
          </p>
        </div>
      </div>

      {/* 2. Our Collection Section */}
      <div className="bg-white border border-gray-100 rounded-3xl p-8 sm:p-10 shadow-sm space-y-8">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-crimson/10 text-brand-crimson flex items-center justify-center font-extrabold">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-brand-slate-dark font-display">Our Collection</h2>
            <p className="text-xs text-slate-500 font-semibold">Diverse Sarees of All Varieties & Ethnic Elegance</p>
          </div>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed">
          Our primary focus is <strong className="text-brand-slate-dark font-extrabold">sarees of all varieties</strong>. We are continuously working to bring a diverse collection featuring different fabrics, designs, colors, patterns, and styles — whether you're looking for something traditional, festive, elegant, or contemporary.
        </p>

        {/* 3 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-6 hover:shadow-md transition-all group">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-brand-slate-dark mb-2">Uncompromising Quality</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              We carefully handpick each saree to ensure superior fabric feel, flawless weaving, and long-lasting elegance.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-6 hover:shadow-md transition-all group">
            <div className="w-12 h-12 rounded-xl bg-brand-crimson/10 text-brand-crimson flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-brand-slate-dark mb-2">Signature Style</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              From rich traditional Banarasi weaves to modern pastel georgettes, we cater to every aesthetic and celebration.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-6 hover:shadow-md transition-all group">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-brand-slate-dark mb-2">True Customer Value</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Offering premium ethnic fashion directly to you with transparent pricing and exceptional value for money.
            </p>
          </div>
        </div>

        {/* Variety Chips */}
        <div className="pt-2 border-t border-gray-100">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">Explore Varieties:</span>
          <div className="flex flex-wrap gap-2">
            {['Banarasi Silk Sarees', 'Kanjivaram Weaves', 'Organza & Tissue Sarees', 'Designer Kurta Sets', 'Bridal Lehengas', 'Indo-Western Fusion', 'Cotton & Daily Wear'].map((tag) => (
              <a
                key={tag}
                href="/products"
                className="text-xs font-bold px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-700 hover:bg-brand-crimson hover:text-white transition-all border border-slate-200/60"
              >
                {tag}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Our Journey Section */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-950 rounded-3xl p-8 sm:p-10 text-white shadow-xl space-y-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-extrabold">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold font-display">Our Journey</h2>
            <p className="text-xs text-slate-400 font-semibold">From a Small Startup to a Trusted Brand</p>
          </div>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed">
          <strong className="text-white font-extrabold">Niakylie Women Collection</strong> started as a small startup with a big dream — to build a saree brand that customers can trust and return to.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 space-y-2">
            <div className="flex items-center space-x-2 text-amber-400 font-extrabold text-sm">
              <Store className="w-4 h-4" />
              <span>Physical Boutique Flagship</span>
            </div>
            <p className="text-xs text-slate-300">
              Visit our physical store located in <strong>Raipur, Chhattisgarh</strong> for an immersive touch-and-feel saree shopping experience.
            </p>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 space-y-2">
            <div className="flex items-center space-x-2 text-rose-400 font-extrabold text-sm">
              <Globe className="w-4 h-4" />
              <span>24/7 Digital Storefront</span>
            </div>
            <p className="text-xs text-slate-300">
              Expanding nationwide online so saree lovers from anywhere can discover our newest arrivals and order with ease.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs font-semibold text-center italic">
          "We are a growing brand, and every customer, order, message, and piece of feedback is an important part of our journey."
        </div>
      </div>

      {/* 4. Shop With Us & Store Location */}
      <div className="bg-white border border-gray-100 rounded-3xl p-8 sm:p-10 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-brand-slate-dark font-display flex items-center space-x-2">
              <MapPin className="w-6 h-6 text-brand-crimson" />
              <span>Shop With Us & Store Location</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              You can explore NIAKYLIE through our website and social media platforms, or visit us at our shop:
            </p>
          </div>

          <a
            href="https://www.google.com/maps/dir/?api=1&destination=21.290281,81.611905"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center space-x-2 bg-brand-crimson hover:bg-brand-crimson-dark text-white font-extrabold text-xs px-5 py-3 rounded-xl shadow-md transition-all hover:scale-105"
          >
            <span>Get Map Directions</span>
            <ChevronRight className="w-4 h-4" />
          </a>
        </div>

        {/* Address & Embedded Map Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-2">
          <div className="lg:col-span-5 bg-slate-50 border border-slate-200/80 rounded-2xl p-6 space-y-4">
            <h3 className="font-extrabold text-base text-brand-slate-dark border-b border-slate-200 pb-2">
              Niakylie Women Collection
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-semibold">
              Ward No. 39, Kabir Chaura, Bajar Chauk,<br />
              Sarora, Gondwara Basti,<br />
              Raipur, Chhattisgarh – 493221
            </p>
            <div className="pt-2 text-xs space-y-2 text-slate-600">
              <div className="flex items-center space-x-2">
                <Phone className="w-3.5 h-3.5 text-brand-crimson" />
                <a href="tel:+919589928337" className="font-bold hover:text-brand-crimson">+91 95899 28337</a>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 h-[260px] rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
            <iframe
              title="Niakylie Store Location Map"
              src="https://maps.google.com/maps?q=21.290281,81.611905&t=&z=16&ie=UTF8&iwloc=&output=embed"
              className="w-full h-full border-0"
              allowFullScreen
              loading="lazy"
            />
          </div>
        </div>
      </div>

      {/* 5. Connect With NIAKYLIE (Social Buttons) */}
      <div className="bg-white border border-gray-100 rounded-3xl p-8 sm:p-10 shadow-sm space-y-6">
        <h2 className="text-2xl font-extrabold text-brand-slate-dark font-display">Connect With NIAKYLIE</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <a
            href="https://niakylie.com"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 hover:border-brand-crimson hover:bg-rose-50/30 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Globe className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold text-slate-400 uppercase">Website</div>
            <div className="text-sm font-extrabold text-brand-slate-dark group-hover:text-brand-crimson">niakylie.com</div>
          </a>

          <a
            href="https://www.instagram.com/niakylie_women_collection"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 hover:border-brand-crimson hover:bg-rose-50/30 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Instagram className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold text-slate-400 uppercase">Instagram</div>
            <div className="text-sm font-extrabold text-brand-slate-dark group-hover:text-brand-crimson">@niakylie_women_collection</div>
          </a>

          <a
            href="https://www.facebook.com/profile.php?id=61592438117379"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 hover:border-brand-crimson hover:bg-rose-50/30 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Facebook className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold text-slate-400 uppercase">Facebook</div>
            <div className="text-sm font-extrabold text-brand-slate-dark group-hover:text-brand-crimson">NIAKYLIE Women Collection</div>
          </a>

          <a
            href="https://wa.me/919589928337"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Phone className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold text-slate-400 uppercase">WhatsApp</div>
            <div className="text-sm font-extrabold text-brand-slate-dark group-hover:text-emerald-600">Business WhatsApp</div>
          </a>
        </div>
      </div>

      {/* 6. Closing Slogan Banner */}
      <div className="bg-gradient-to-r from-brand-crimson via-rose-700 to-brand-crimson-dark text-white rounded-3xl p-8 sm:p-10 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
        <div className="space-y-1">
          <p className="text-xs font-extrabold uppercase tracking-widest text-amber-300">NIAKYLIE WOMEN COLLECTION</p>
          <h3 className="text-2xl sm:text-3xl font-extrabold font-display">Wear Beauty, Feel Beauty.</h3>
          <p className="text-xs text-rose-100">Whether for a special occasion or everyday elegance, we are honored to be part of your journey.</p>
        </div>

        <a
          href="/products"
          className="inline-flex items-center space-x-2 bg-white text-brand-slate-dark hover:bg-amber-300 font-extrabold text-xs px-6 py-3.5 rounded-2xl shadow-lg transition-all hover:scale-105 uppercase tracking-wider flex-shrink-0"
        >
          <span>EXPLORE SAREES</span>
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}

function PrivacyPolicyView({ pageContent }: { pageContent?: string }) {
  const headings = [
    { id: 'information-we-collect', label: '1. Information We Collect' },
    { id: 'how-we-use-your-information', label: '2. How We Use Your Information' },
    { id: 'whatsapp-instagram-facebook', label: '3. Social Platforms & Messaging' },
    { id: 'orders-and-payments', label: '4. Orders and Payments' },
    { id: 'sharing-of-information', label: '5. Sharing of Information' },
    { id: 'cookies', label: '6. Cookies & Tracking' },
    { id: 'marketing-communications', label: '7. Marketing Communications' },
    { id: 'data-security', label: '8. Data Security' },
    { id: 'data-retention', label: '9. Data Retention' },
    { id: 'childrens-privacy', label: '10. Children\'s Privacy' },
    { id: 'third-party-websites', label: '11. Third-Party Links' },
    { id: 'your-privacy-rights', label: '12. Your Privacy Rights' },
    { id: 'changes-to-this-privacy-policy', label: '13. Policy Updates' },
    { id: 'contact-us', label: '14. Contact Us' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* 1. Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-950 via-brand-slate-dark to-slate-900 text-white p-8 sm:p-14 shadow-2xl border border-amber-500/20 text-center">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-brand-crimson/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-500/20 to-brand-crimson/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-amber-500/30 text-amber-300 text-xs font-extrabold uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>TRUST & TRANSPARENCY</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold font-display tracking-tight text-white leading-tight">
            Privacy Policy
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed pt-1">
            Welcome to <strong>NIAKYLIE Women Collection</strong>. We respect your privacy and are committed to protecting the personal information you share with us across <strong>niakylie.com</strong>.
          </p>

          <div className="pt-2 flex items-center justify-center space-x-2 text-[11px] font-bold text-amber-300">
            <Clock className="w-3.5 h-3.5" />
            <span>Last Updated: September 2, 2026</span>
          </div>
        </div>
      </div>

      {/* 2. Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-brand-crimson flex items-center justify-center font-extrabold">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-base text-brand-slate-dark font-display">Zero Data Selling</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            We never rent, sell, or trade your personal information to any third parties for marketing purposes.
          </p>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-extrabold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-base text-brand-slate-dark font-display">Secure Transactions</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Payment details are handled strictly by trusted encryption gateways. We do not store card credentials.
          </p>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-extrabold">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-base text-brand-slate-dark font-display">Full Rights & Control</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Easily request access, update, or remove your personal data anytime by contacting our support care.
          </p>
        </div>
      </div>

      {/* 3. Main Policy Layout (Sticky Sidebar + Styled Content) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sticky Table of Contents Sidebar */}
        <aside className="lg:col-span-4 sticky top-24 space-y-6 hidden lg:block">
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-gray-100">
              <Sparkles className="w-4 h-4 text-brand-crimson" />
              <h4 className="text-xs font-extrabold text-brand-slate-dark uppercase tracking-wider">Policy Navigation</h4>
            </div>

            <nav className="space-y-1 max-h-[460px] overflow-y-auto pr-1">
              {headings.map(({ id, label }) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className="block text-xs font-bold text-slate-600 hover:text-brand-crimson hover:bg-rose-50/50 rounded-xl px-3 py-2 transition-all border-l-2 border-transparent hover:border-brand-crimson"
                >
                  {label}
                </a>
              ))}
            </nav>
          </div>

          {/* Quick Privacy Support Box */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-6 shadow-xl space-y-4 border border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-extrabold">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-white">Privacy Concerns?</h4>
                <p className="text-[11px] text-slate-400">Our care team is here to assist</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Have questions regarding data handling or privacy rights? Reach out directly to our team.
            </p>

            <a
              href="https://wa.me/919589928337"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center space-x-2 w-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-extrabold py-3 rounded-2xl transition-all shadow-md"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp Privacy Care</span>
            </a>
          </div>
        </aside>

        {/* Policy Content Body */}
        <main className="lg:col-span-8 space-y-8">
          <div className="bg-white border border-gray-100 rounded-3xl p-8 sm:p-10 shadow-sm space-y-8">
            {pageContent ? (
              <div
                className="prose prose-sm max-w-none text-slate-600 leading-relaxed
                  [&_h2]:text-xl [&_h2]:font-extrabold [&_h2]:text-brand-slate-dark [&_h2]:font-display [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:pt-4 [&_h2]:border-t [&_h2]:border-slate-100 [&_h2]:scroll-mt-24
                  [&_h3]:text-sm [&_h3]:font-extrabold [&_h3]:text-brand-slate-dark [&_h3]:mt-6 [&_h3]:mb-2
                  [&_p]:mb-4 [&_p]:text-slate-600 [&_p]:text-xs sm:[&_p]:text-sm [&_p]:leading-relaxed
                  [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_ul]:mb-4 [&_ul]:text-xs sm:[&_ul]:text-sm
                  [&_strong]:font-extrabold [&_strong]:text-brand-slate-dark"
                dangerouslySetInnerHTML={{ __html: pageContent }}
              />
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}

export function CmsPage({ slug }: CmsPageProps) {
  const { data: page, isLoading } = useQuery({
    queryKey: ['cms-page', slug],
    queryFn: () => cmsApi.getPage(slug),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-brand-crimson" />
      </div>
    );
  }

  if (!page) return null;

  const headings = extractHeadings(page.content);
  const label = SLUG_LABELS[slug] || page.title;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-1.5 text-[11px] font-semibold text-slate-400 mb-6">
        <a href="/" className="hover:text-brand-crimson transition-colors">Home</a>
        <ChevronRight className="w-3 h-3" />
        <a href="/pages" className="hover:text-brand-crimson transition-colors">Brand & Policies</a>
        <ChevronRight className="w-3 h-3" />
        <span className="text-brand-slate-dark font-bold">{label}</span>
      </nav>

      {slug === 'about-us' ? (
        <AboutUsView />
      ) : slug === 'contact-us' ? (
        <ContactUsView />
      ) : slug === 'privacy-policy' ? (
        <PrivacyPolicyView pageContent={page.content} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Table of Contents Sidebar */}
          {headings.length > 0 && (
            <aside className="lg:col-span-3 sticky top-24 hidden lg:block">
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <p className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider mb-3">
                  Contents
                </p>
                <nav className="space-y-2">
                  {headings.map(({ id, label }) => (
                    <a
                      key={id}
                      href={`#${id}`}
                      className="block text-xs font-semibold text-slate-500 hover:text-brand-crimson transition-colors py-0.5 border-l-2 border-transparent hover:border-brand-crimson pl-3"
                    >
                      {label}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>
          )}

          {/* Main Content Area */}
          <article className={headings.length > 0 ? 'lg:col-span-9' : 'lg:col-span-12'}>
            <div className="bg-white border border-gray-100 rounded-3xl p-8 sm:p-10 shadow-sm">
              <h1 className="text-3xl font-extrabold text-brand-slate-dark font-display mb-2">
                {page.title}
              </h1>
              <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 font-semibold mb-8 pb-6 border-b border-gray-100">
                <Clock className="w-3.5 h-3.5" />
                <span>Last updated: {new Date(page.lastUpdated).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>

              {/* Rendered HTML Content */}
              <div
                className="prose prose-sm max-w-none text-slate-600 leading-relaxed
                  [&_h2]:text-lg [&_h2]:font-extrabold [&_h2]:text-brand-slate-dark [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:scroll-mt-24
                  [&_p]:mb-4 [&_p]:text-slate-600 [&_p]:text-sm [&_p]:leading-relaxed
                  [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1
                  [&_strong]:font-extrabold [&_strong]:text-brand-slate-dark"
                dangerouslySetInnerHTML={{ __html: page.content }}
              />
            </div>
          </article>
        </div>
      )}
    </div>
  );
}

export default CmsPage;
