import { useState, useEffect } from 'react';
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
  ChevronDown,
  ArrowUp,
  CheckCircle2,
  ExternalLink,
  Check,
  Shield,
  HelpCircle,
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

const privacyPolicyConfig = {
  lastUpdated: 'September 2, 2026',
  email: 'niakylieofficial@gmail.com',
  whatsapp: '+91 95899 28337',
  whatsappClean: '919589928337',
  address: 'Ward No. 39, Kabir Chaura, Bajar Chauk, Sarora, Gondwara Basti, Raipur, Chhattisgarh – 493221',
  instagram: '@niakylie_women_collection',
  facebook: 'NIAKYLIE Women Collection',
  website: 'niakylie.com',
};

const POLICY_NAV_ITEMS = [
  { id: 'information-we-collect', label: '1. Information We Collect' },
  { id: 'how-we-use-your-information', label: '2. How We Use Your Information' },
  { id: 'whatsapp-instagram-facebook', label: '3. Social Platforms & Messaging' },
  { id: 'orders-and-payments', label: '4. Orders and Payments' },
  { id: 'sharing-of-information', label: '5. Sharing of Information' },
  { id: 'cookies', label: '6. Cookies & Tracking' },
  { id: 'marketing-communications', label: '7. Marketing Communications' },
  { id: 'data-security', label: '8. Data Security' },
  { id: 'data-retention', label: '9. Data Retention' },
  { id: 'childrens-privacy', label: "10. Children's Privacy" },
  { id: 'third-party-websites', label: '11. Third-Party Links' },
  { id: 'your-privacy-rights', label: '12. Your Privacy Rights' },
  { id: 'changes-to-this-privacy-policy', label: '13. Policy Updates' },
];

function PrivacyPolicyView(_props: { pageContent?: string }) {
  const [activeSection, setActiveSection] = useState<string>('information-we-collect');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [showBackToTop, setShowBackToTop] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);

      const sectionElements = POLICY_NAV_ITEMS.map((item) =>
        document.getElementById(item.id)
      );

      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const el = sectionElements[i];
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 140) {
            setActiveSection(POLICY_NAV_ITEMS[i].id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -100;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* 1. Page Header (Hero Section) */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-950 via-brand-slate-dark to-slate-900 text-white p-8 sm:p-14 shadow-2xl border border-amber-500/20 text-center">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-brand-crimson/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto space-y-4">
          <p className="text-[11px] font-extrabold uppercase tracking-widest text-amber-300">
            NIAKYLIE WOMEN COLLECTION
          </p>

          <h1 className="text-3xl sm:text-5xl font-extrabold font-display tracking-tight text-white leading-tight">
            Privacy Policy
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed pt-1 font-sans">
            Your privacy matters to us. This Privacy Policy explains how NIAKYLIE Women Collection collects, uses, protects, and manages your information when you interact with our website, products, and services.
          </p>

          <div className="pt-2 flex items-center justify-center space-x-2 text-[11px] font-bold text-amber-300">
            <Clock className="w-3.5 h-3.5" />
            <span>Last Updated: {privacyPolicyConfig.lastUpdated}</span>
          </div>
        </div>
      </div>

      {/* 2. Breadcrumb */}
      <nav className="flex items-center space-x-2 text-xs font-semibold text-slate-400 py-1">
        <a href="/" className="hover:text-brand-crimson transition-colors">
          Home
        </a>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <span className="text-brand-slate-dark font-bold">Privacy Policy</span>
      </nav>

      {/* 3. Mobile Collapsible Navigation Dropdown */}
      <div className="lg:hidden">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="w-full bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex items-center justify-between font-extrabold text-sm text-brand-slate-dark transition-all hover:bg-slate-50"
        >
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-brand-crimson" />
            <span>Policy Navigation</span>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${
              mobileMenuOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {mobileMenuOpen && (
          <div className="mt-2 bg-white border border-gray-200 rounded-2xl p-4 shadow-lg space-y-1 animate-in fade-in slide-in-from-top-2 duration-200">
            {POLICY_NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`w-full text-left text-xs font-bold px-3 py-2.5 rounded-xl transition-all ${
                  activeSection === item.id
                    ? 'bg-rose-50 text-brand-crimson font-extrabold border-l-4 border-brand-crimson'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 4. Desktop Main Layout (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Sticky Navigation Sidebar (~260px) */}
        <aside className="lg:col-span-4 sticky top-24 space-y-6 hidden lg:block">
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-gray-100">
              <Sparkles className="w-4 h-4 text-brand-crimson" />
              <h4 className="text-xs font-extrabold text-brand-slate-dark uppercase tracking-wider">
                Policy Navigation
              </h4>
            </div>

            <nav className="space-y-1 max-h-[520px] overflow-y-auto pr-1">
              {POLICY_NAV_ITEMS.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`w-full text-left text-xs font-bold px-3 py-2 rounded-xl transition-all duration-200 flex items-center justify-between ${
                      isActive
                        ? 'bg-rose-50 text-brand-crimson font-extrabold border-l-4 border-brand-crimson shadow-xs'
                        : 'text-slate-600 hover:text-brand-crimson hover:bg-slate-50'
                    }`}
                  >
                    <span>{item.label}</span>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-brand-crimson" />}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Quick Contact Support */}
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
              href={`https://wa.me/${privacyPolicyConfig.whatsappClean}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center space-x-2 w-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-extrabold py-3 rounded-2xl transition-all shadow-md"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp Privacy Care</span>
            </a>
          </div>
        </aside>

        {/* Right Column: Main Privacy Policy Content (Max width 750px - 850px) */}
        <main className="lg:col-span-8 space-y-8 max-w-3xl">
          {/* Introduction Card */}
          <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-4">
            <div className="inline-flex items-center space-x-2 text-rose-600 bg-rose-50 px-3 py-1 rounded-full text-xs font-bold">
              <Heart className="w-3.5 h-3.5" />
              <span>Your Privacy Matters</span>
            </div>
            <h2 className="text-2xl font-extrabold text-brand-slate-dark font-display">
              Your Privacy Matters
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Welcome to <strong>NIAKYLIE Women Collection</strong>. We respect your privacy and are committed to protecting the personal information you share with us.
            </p>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              This Privacy Policy explains how NIAKYLIE Women Collection ("NIAKYLIE", "we", "us", or "our") collects, uses, stores, and protects your information when you visit or use our website <strong>niakylie.com</strong>, contact us, or purchase our products.
            </p>
          </div>

          {/* Section 1: Information We Collect */}
          <section id="information-we-collect" className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-6 scroll-mt-28">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-xl font-extrabold text-brand-slate-dark font-display">
                1. Information We Collect
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Depending on how you interact with us, we may collect certain information necessary to provide our products and services.
              </p>
            </div>

            {/* Subsection 1.1: Personal Information */}
            <div className="space-y-3">
              <h3 className="text-sm font-extrabold text-brand-slate-dark flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-brand-crimson" />
                <span>Personal Information</span>
              </h3>
              <p className="text-xs text-slate-600">
                When you contact us, place an order, make an enquiry, or otherwise interact with NIAKYLIE, we may collect information such as:
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                {[
                  'Full name',
                  'Mobile or WhatsApp number',
                  'Email address',
                  'Delivery address',
                  'Billing address, where applicable',
                  'Order and purchase details',
                  'Information voluntarily provided when contacting us',
                ].map((item, index) => (
                  <li key={index} className="flex items-center space-x-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-crimson flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Subsection 1.2: Technical Information */}
            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-extrabold text-brand-slate-dark flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-brand-crimson" />
                <span>Technical Information</span>
              </h3>
              <p className="text-xs text-slate-600">
                When you visit our website, certain technical information may be collected automatically:
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                {[
                  'IP address',
                  'Browser type',
                  'Device type',
                  'Operating system',
                  'Pages visited',
                  'Date and time of your visit',
                  'General website usage information',
                ].map((item, index) => (
                  <li key={index} className="flex items-center space-x-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Highlight Box */}
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-5 text-amber-900 text-xs space-y-1">
              <div className="font-extrabold flex items-center space-x-1.5 text-amber-950">
                <HelpCircle className="w-4 h-4 text-amber-600" />
                <span>Why do we collect this information?</span>
              </div>
              <p className="leading-relaxed text-amber-900/90 pl-5">
                This information helps us operate our website, understand how visitors use it, improve performance, and provide a better customer experience.
              </p>
            </div>
          </section>

          {/* Section 2: How We Use Your Information */}
          <section id="how-we-use-your-information" className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-6 scroll-mt-28">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-xl font-extrabold text-brand-slate-dark font-display">
                2. How We Use Your Information
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                We may use the information we collect for legitimate business and customer-service purposes, including:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                'Processing and fulfilling orders',
                'Communicating with you about your orders',
                'Responding to enquiries and customer support requests',
                'Providing information about our sarees and collections',
                'Sending promotional communications where permitted',
                'Improving our website and customer experience',
                'Maintaining website security',
                'Preventing fraud, misuse, or unauthorized activity',
                'Complying with applicable laws and legal requirements',
              ].map((purpose, index) => (
                <div key={index} className="bg-slate-50/80 border border-slate-100 rounded-2xl p-3.5 flex items-start space-x-3 hover:border-rose-200 transition-colors">
                  <div className="w-6 h-6 rounded-lg bg-rose-100 text-brand-crimson flex items-center justify-center font-extrabold text-xs flex-shrink-0 mt-0.5">
                    {index + 1}
                  </div>
                  <span className="text-xs font-semibold text-slate-700 leading-snug">{purpose}</span>
                </div>
              ))}
            </div>

            <p className="text-xs font-semibold text-slate-500 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
              We use your personal information only for legitimate business purposes and in accordance with applicable laws.
            </p>
          </section>

          {/* Section 3: Social Platforms & Messaging */}
          <section id="whatsapp-instagram-facebook" className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-6 scroll-mt-28">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-xl font-extrabold text-brand-slate-dark font-display">
                3. Social Platforms & Messaging
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Customers may contact NIAKYLIE through WhatsApp, Instagram, Facebook, or other communication platforms.
              </p>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              When you communicate with us through these services, your information may also be processed according to the privacy policies and terms of those platforms.
            </p>

            <div className="space-y-3">
              <h3 className="text-xs font-extrabold text-brand-slate-dark uppercase tracking-wider">
                Our Social Presence
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <a
                  href="https://www.instagram.com/niakylie_women_collection"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-rose-50/50 border border-rose-100 rounded-2xl p-4 hover:bg-rose-100/50 transition-all group"
                >
                  <Instagram className="w-5 h-5 text-brand-crimson mb-2 group-hover:scale-110 transition-transform" />
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Instagram</div>
                  <div className="text-xs font-extrabold text-brand-slate-dark group-hover:text-brand-crimson">
                    {privacyPolicyConfig.instagram}
                  </div>
                </a>

                <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4">
                  <Facebook className="w-5 h-5 text-blue-600 mb-2" />
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Facebook</div>
                  <div className="text-xs font-extrabold text-brand-slate-dark">
                    {privacyPolicyConfig.facebook}
                  </div>
                </div>

                <a
                  href={`https://wa.me/${privacyPolicyConfig.whatsappClean}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 hover:bg-emerald-100/50 transition-all group"
                >
                  <Phone className="w-5 h-5 text-emerald-600 mb-2 group-hover:scale-110 transition-transform" />
                  <div className="text-[10px] font-bold text-slate-400 uppercase">WhatsApp</div>
                  <div className="text-xs font-extrabold text-brand-slate-dark group-hover:text-emerald-600">
                    NIAKYLIE Business WhatsApp
                  </div>
                </a>
              </div>
            </div>

            <p className="text-xs text-slate-500 italic bg-slate-50 p-4 rounded-2xl border border-slate-100">
              We may use information you voluntarily provide through these platforms to respond to enquiries, assist with orders, and provide customer service.
            </p>
          </section>

          {/* Section 4: Orders and Payments */}
          <section id="orders-and-payments" className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-6 scroll-mt-28">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-xl font-extrabold text-brand-slate-dark font-display">
                4. Orders and Payments
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                If you purchase products from NIAKYLIE, we may collect information necessary to process and fulfill your order.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 font-semibold">Customer / Order details</div>
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 font-semibold">Delivery information</div>
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 font-semibold">Billing information where applicable</div>
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 font-semibold">Payment-related status verification</div>
            </div>

            {/* Important Payment Security Box */}
            <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-2 border border-slate-800">
              <div className="flex items-center space-x-2 text-amber-400 font-extrabold text-xs">
                <Lock className="w-4 h-4" />
                <span>Important Payment Security Note</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                If payment is processed through a third-party payment provider, your payment information may be handled directly by that provider. We do not store complete debit card, credit card, banking passwords, or similar sensitive payment credentials on our own systems.
              </p>
            </div>

            <p className="text-xs text-slate-500">
              Third-party payment providers may have their own privacy policies and terms that apply to their services.
            </p>
          </section>

          {/* Section 5: Sharing of Information */}
          <section id="sharing-of-information" className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-6 scroll-mt-28">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-xl font-extrabold text-brand-slate-dark font-display">
                5. Sharing of Information
              </h2>
            </div>

            {/* Prominent Statement */}
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 text-center text-brand-crimson font-extrabold text-sm sm:text-base">
              We do not sell or rent your personal information to third parties.
            </div>

            <p className="text-xs text-slate-600">
              We may share necessary information with trusted service providers when required to operate our business, such as:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {[
                'Delivery and logistics partners',
                'Payment service providers',
                'Website hosting and technology providers',
                'Analytics or website service providers',
                'Customer communication services',
                'Professional advisers',
                'Legal or regulatory authorities where required by law',
              ].map((provider, index) => (
                <div key={index} className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center space-x-2 font-semibold text-slate-700">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{provider}</span>
                </div>
              ))}
            </div>

            <p className="text-xs text-slate-500 italic">
              We only intend to share information that is reasonably necessary for the relevant purpose.
            </p>
          </section>

          {/* Section 6: Cookies & Tracking */}
          <section id="cookies" className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-6 scroll-mt-28">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-xl font-extrabold text-brand-slate-dark font-display">
                6. Cookies & Tracking
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Our website may use cookies and similar technologies to improve your browsing experience and understand website usage.
              </p>
            </div>

            <div className="space-y-2 text-xs text-slate-700">
              <p className="font-bold text-slate-800">Cookies may help us:</p>
              <ul className="space-y-2">
                {[
                  'Keep the website functioning properly',
                  'Remember certain preferences',
                  'Understand website traffic',
                  'Improve website performance',
                  'Measure the effectiveness of marketing activities',
                ].map((item, index) => (
                  <li key={index} className="flex items-center space-x-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <Check className="w-3.5 h-3.5 text-brand-crimson flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Managing Cookies Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-1 text-xs">
              <div className="font-extrabold text-brand-slate-dark flex items-center space-x-2">
                <FileText className="w-4 h-4 text-brand-crimson" />
                <span>Managing Cookies</span>
              </div>
              <p className="text-slate-600 leading-relaxed pl-6">
                You can manage or disable cookies through your browser settings. However, disabling certain cookies may affect some website functionality.
              </p>
            </div>
          </section>

          {/* Section 7: Marketing Communications */}
          <section id="marketing-communications" className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-6 scroll-mt-28">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-xl font-extrabold text-brand-slate-dark font-display">
                7. Marketing Communications
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                If you provide your contact information and consent to receive promotional communications, we may contact you about NIAKYLIE products, collections, offers, and updates.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-center font-bold text-slate-700">
              {[
                'New saree collections',
                'Special offers',
                'Discounts',
                'Promotions',
                'Events',
                'NIAKYLIE updates',
              ].map((item, index) => (
                <div key={index} className="bg-rose-50/60 border border-rose-100 p-3.5 rounded-2xl text-brand-crimson">
                  {item}
                </div>
              ))}
            </div>

            <p className="text-xs text-slate-500 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
              You can request to stop receiving promotional communications at any time by contacting us or using the available unsubscribe option, where applicable.
            </p>
          </section>

          {/* Section 8: Data Security */}
          <section id="data-security" className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-6 scroll-mt-28">
            <div className="border-b border-gray-100 pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-brand-slate-dark font-display">
                  8. Data Security
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Safeguards for your personal information
                </p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-extrabold">
                <Shield className="w-5 h-5" />
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              We take reasonable measures to protect your personal information from unauthorized access, misuse, alteration, disclosure, or destruction.
            </p>

            {/* Security Warning Box */}
            <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-5 text-xs text-amber-900 space-y-1">
              <div className="font-extrabold text-amber-950 flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>Please note:</span>
              </div>
              <p className="pl-6 leading-relaxed">
                No method of transmitting or storing information online can be guaranteed to be completely secure. While we take reasonable precautions to protect your information, we cannot guarantee absolute security.
              </p>
            </div>
          </section>

          {/* Section 9: Data Retention */}
          <section id="data-retention" className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-6 scroll-mt-28">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-xl font-extrabold text-brand-slate-dark font-display">
                9. Data Retention
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                We retain personal information only for as long as reasonably necessary for the purposes described in this Privacy Policy.
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <p className="font-bold text-slate-800">Information retention purposes include:</p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  'Fulfilling orders',
                  'Providing customer service',
                  'Maintaining business records',
                  'Resolving disputes',
                  'Complying with legal obligations',
                ].map((item, index) => (
                  <li key={index} className="bg-slate-50 p-3 rounded-xl border border-slate-100 font-semibold text-slate-700 flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-crimson flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-xs text-slate-500">
              When information is no longer required, we may delete or securely dispose of it, subject to applicable legal requirements.
            </p>
          </section>

          {/* Section 10: Children's Privacy */}
          <section id="childrens-privacy" className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-4 scroll-mt-28">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-xl font-extrabold text-brand-slate-dark font-display">
                10. Children's Privacy
              </h2>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Our website and services are not intentionally directed toward children.
            </p>
            <p className="text-xs text-slate-600 leading-relaxed">
              We do not knowingly collect personal information from children without appropriate consent where such consent is required by applicable law.
            </p>
          </section>

          {/* Section 11: Third-Party Links */}
          <section id="third-party-websites" className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-4 scroll-mt-28">
            <div className="border-b border-gray-100 pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-brand-slate-dark font-display">
                  11. Third-Party Links
                </h2>
              </div>
              <ExternalLink className="w-5 h-5 text-slate-400" />
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Our website may contain links to third-party websites or platforms, including social media platforms such as Instagram, Facebook, and WhatsApp.
            </p>
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
              We are not responsible for the privacy practices, content, or security of third-party websites. We recommend reviewing the privacy policies of those platforms before providing them with personal information.
            </p>
          </section>

          {/* Section 12: Your Privacy Rights */}
          <section id="your-privacy-rights" className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-6 scroll-mt-28">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-xl font-extrabold text-brand-slate-dark font-display">
                12. Your Privacy Rights
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Depending on applicable law, you may have certain rights regarding your personal information.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-4 space-y-1">
                <h3 className="font-extrabold text-xs text-brand-slate-dark uppercase tracking-wider">Access</h3>
                <p className="text-xs text-slate-500">Request access to personal information we hold about you.</p>
              </div>

              <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-4 space-y-1">
                <h3 className="font-extrabold text-xs text-brand-slate-dark uppercase tracking-wider">Correction</h3>
                <p className="text-xs text-slate-500">Request correction of inaccurate or incomplete information.</p>
              </div>

              <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-4 space-y-1">
                <h3 className="font-extrabold text-xs text-brand-slate-dark uppercase tracking-wider">Deletion</h3>
                <p className="text-xs text-slate-500">Request deletion of information where legally applicable.</p>
              </div>

              <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-4 space-y-1">
                <h3 className="font-extrabold text-xs text-brand-slate-dark uppercase tracking-wider">Withdraw Consent</h3>
                <p className="text-xs text-slate-500">Withdraw consent where processing is based on consent.</p>
              </div>

              <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-4 space-y-1">
                <h3 className="font-extrabold text-xs text-brand-slate-dark uppercase tracking-wider">Object</h3>
                <p className="text-xs text-slate-500">Object to certain uses of your information where applicable.</p>
              </div>

              <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-4 space-y-1">
                <h3 className="font-extrabold text-xs text-brand-slate-dark uppercase tracking-wider">Information</h3>
                <p className="text-xs text-slate-500">Request information about how your personal information is used.</p>
              </div>
            </div>

            <p className="text-xs text-slate-500 italic">
              To make a privacy-related request, please contact us using the details provided below.
            </p>
          </section>

          {/* Section 13: Policy Updates */}
          <section id="changes-to-this-privacy-policy" className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-4 scroll-mt-28">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-xl font-extrabold text-brand-slate-dark font-display">
                13. Policy Updates
              </h2>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              We may update this Privacy Policy from time to time to reflect changes in our business, website, services, or applicable laws.
            </p>
            <p className="text-xs text-slate-600 leading-relaxed">
              Any updated version will be posted on this page with a revised "Last Updated" date.
            </p>

            <div className="inline-flex items-center space-x-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold mt-2">
              <Clock className="w-3.5 h-3.5 text-brand-crimson" />
              <span>Last Updated: {privacyPolicyConfig.lastUpdated}</span>
            </div>
          </section>

          {/* Contact Us Card Section */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-brand-slate-dark to-slate-950 text-white p-8 sm:p-10 shadow-2xl border border-amber-500/20 space-y-6">
            <div className="space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400">
                GET IN TOUCH
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-display">
                Questions About Your Privacy?
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                If you have any questions, concerns, or requests regarding this Privacy Policy or your personal information, please contact NIAKYLIE Women Collection.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-slate-800 text-xs">
              <div className="space-y-2">
                <p className="font-extrabold text-white uppercase text-[11px] tracking-wider text-amber-300">
                  NIAKYLIE Women Collection
                </p>
                <div className="flex items-start space-x-2 text-slate-300 leading-relaxed">
                  <MapPin className="w-4 h-4 text-brand-crimson flex-shrink-0 mt-0.5" />
                  <span>{privacyPolicyConfig.address}</span>
                </div>
              </div>

              <div className="space-y-2 text-slate-300">
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>{privacyPolicyConfig.website}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Instagram className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span>{privacyPolicyConfig.instagram}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <a href={`mailto:${privacyPolicyConfig.email}`} className="hover:text-amber-300 transition-colors">
                    {privacyPolicyConfig.email}
                  </a>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <a href={`https://wa.me/${privacyPolicyConfig.whatsappClean}`} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-300 transition-colors">
                    {privacyPolicyConfig.whatsapp}
                  </a>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-slate-800">
              <a
                href="/pages/contact-us"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-brand-crimson hover:bg-rose-700 text-white text-xs font-extrabold px-6 py-3 rounded-2xl shadow-lg transition-all"
              >
                <Mail className="w-4 h-4" />
                <span>Contact Us</span>
              </a>

              <a
                href={`https://wa.me/${privacyPolicyConfig.whatsappClean}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-extrabold px-6 py-3 rounded-2xl shadow-lg transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp Us</span>
              </a>
            </div>
          </div>
        </main>
      </div>

      {/* Floating Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          aria-label="Back to top"
          className="fixed bottom-6 right-6 z-50 bg-slate-900 hover:bg-brand-crimson text-white p-3 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 border border-slate-800 animate-in fade-in"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}

const termsConfig = {
  lastUpdated: 'September 2, 2026',
  email: 'niakylieofficial@gmail.com',
  whatsapp: '+91 95899 28337',
  whatsappClean: '919589928337',
  address: 'Ward No. 39, Kabir Chaura, Bajar Chauk, Sarora, Gondwara Basti, Raipur, Chhattisgarh – 493221',
  instagram: '@niakylie_women_collection',
  facebook: 'NIAKYLIE Women Collection',
  website: 'niakylie.com',
};

const TERMS_NAV_ITEMS = [
  { id: 'about-niakylie', label: '1. About NIAKYLIE' },
  { id: 'use-of-our-website', label: '2. Use of Our Website' },
  { id: 'product-information', label: '3. Product Information' },
  { id: 'saree-availability', label: '4. Saree Availability' },
  { id: 'product-prices', label: '5. Product Prices' },
  { id: 'orders', label: '6. Orders' },
  { id: 'payment', label: '7. Payment' },
  { id: 'order-confirmation', label: '8. Order Confirmation' },
  { id: 'shipping-delivery', label: '9. Shipping & Delivery' },
  { id: 'delivery-inspection', label: '10. Delivery Inspection' },
  { id: 'returns-exchanges-refunds', label: '11. Returns & Refunds' },
  { id: 'promotional-offers', label: '12. Promotional Offers' },
  { id: 'promotional-cards-coupons', label: '13. Coupons & Vouchers' },
  { id: 'intellectual-property', label: '14. Intellectual Property' },
  { id: 'user-generated-content', label: '15. User Content' },
  { id: 'social-media-whatsapp', label: '16. Social & WhatsApp' },
  { id: 'third-party-links', label: '17. Third-Party Links' },
  { id: 'website-availability', label: '18. Website Availability' },
  { id: 'limitation-of-liability', label: '19. Limitation of Liability' },
  { id: 'force-majeure', label: '20. Force Majeure' },
  { id: 'privacy', label: '21. Privacy' },
  { id: 'changes-to-these-terms', label: '22. Changes to Terms' },
  { id: 'governing-law', label: '23. Governing Law' },
  { id: 'contact-us', label: '24. Contact Us' },
];

function TermsAndConditionsView(_props: { pageContent?: string }) {
  const [activeSection, setActiveSection] = useState<string>('about-niakylie');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [showBackToTop, setShowBackToTop] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);

      const sectionElements = TERMS_NAV_ITEMS.map((item) =>
        document.getElementById(item.id)
      );

      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const el = sectionElements[i];
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 140) {
            setActiveSection(TERMS_NAV_ITEMS[i].id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -100;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* 1. Hero Header */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-950 via-brand-slate-dark to-slate-900 text-white p-8 sm:p-14 shadow-2xl border border-amber-500/20 text-center">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-brand-crimson/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto space-y-4">
          <p className="text-[11px] font-extrabold uppercase tracking-widest text-amber-300">
            NIAKYLIE WOMEN COLLECTION
          </p>

          <h1 className="text-3xl sm:text-5xl font-extrabold font-display tracking-tight text-white leading-tight">
            Terms & Conditions
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed pt-1 font-sans">
            Welcome to <strong>NIAKYLIE Women Collection</strong>. These Terms & Conditions govern your use of our website <strong>niakylie.com</strong>, your interactions with NIAKYLIE Women Collection, and purchases made through our website, WhatsApp, social media channels, or physical store.
          </p>

          <div className="pt-2 flex items-center justify-center space-x-2 text-[11px] font-bold text-amber-300">
            <Clock className="w-3.5 h-3.5" />
            <span>Last Updated: {termsConfig.lastUpdated}</span>
          </div>
        </div>
      </div>

      {/* 2. Breadcrumb */}
      <nav className="flex items-center space-x-2 text-xs font-semibold text-slate-400 py-1">
        <a href="/" className="hover:text-brand-crimson transition-colors">
          Home
        </a>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <span className="text-brand-slate-dark font-bold">Terms & Conditions</span>
      </nav>

      {/* 3. Mobile Collapsible Navigation Dropdown */}
      <div className="lg:hidden">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="w-full bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex items-center justify-between font-extrabold text-sm text-brand-slate-dark transition-all hover:bg-slate-50"
        >
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-brand-crimson" />
            <span>Terms Navigation ({TERMS_NAV_ITEMS.length} Sections)</span>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${
              mobileMenuOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {mobileMenuOpen && (
          <div className="mt-2 bg-white border border-gray-200 rounded-2xl p-4 shadow-lg space-y-1 animate-in fade-in slide-in-from-top-2 duration-200 max-h-80 overflow-y-auto">
            {TERMS_NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`w-full text-left text-xs font-bold px-3 py-2.5 rounded-xl transition-all ${
                  activeSection === item.id
                    ? 'bg-rose-50 text-brand-crimson font-extrabold border-l-4 border-brand-crimson'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 4. Desktop Main Layout (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Sticky Navigation Sidebar */}
        <aside className="lg:col-span-4 sticky top-24 space-y-6 hidden lg:block">
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-gray-100">
              <Sparkles className="w-4 h-4 text-brand-crimson" />
              <h4 className="text-xs font-extrabold text-brand-slate-dark uppercase tracking-wider">
                Terms Navigation
              </h4>
            </div>

            <nav className="space-y-1 max-h-[540px] overflow-y-auto pr-1">
              {TERMS_NAV_ITEMS.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`w-full text-left text-xs font-bold px-3 py-2 rounded-xl transition-all duration-200 flex items-center justify-between ${
                      isActive
                        ? 'bg-rose-50 text-brand-crimson font-extrabold border-l-4 border-brand-crimson shadow-xs'
                        : 'text-slate-600 hover:text-brand-crimson hover:bg-slate-50'
                    }`}
                  >
                    <span>{item.label}</span>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-brand-crimson" />}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Support Box */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-6 shadow-xl space-y-4 border border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-extrabold">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-white">Need Assistance?</h4>
                <p className="text-[11px] text-slate-400">NIAKYLIE Customer Support</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Have questions regarding our terms, order policies, or services? Speak directly with our team.
            </p>

            <a
              href={`https://wa.me/${termsConfig.whatsappClean}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center space-x-2 w-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-extrabold py-3 rounded-2xl transition-all shadow-md"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp Support</span>
            </a>
          </div>
        </aside>

        {/* Right Column: Main Terms Content */}
        <main className="lg:col-span-8 space-y-8 max-w-3xl">
          {/* Welcome Notice */}
          <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-4">
            <div className="inline-flex items-center space-x-2 text-brand-crimson bg-rose-50 px-3 py-1 rounded-full text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Customer Agreement</span>
            </div>
            <h2 className="text-2xl font-extrabold text-brand-slate-dark font-display">
              Welcome to NIAKYLIE Women Collection
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              By accessing our website or purchasing our products through <strong>niakylie.com</strong>, WhatsApp, social media, or our physical store, you agree to these Terms & Conditions. Please read them carefully before using our services.
            </p>
          </div>

          {/* Section 1: About NIAKYLIE */}
          <section id="about-niakylie" className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-4 scroll-mt-28">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-xl font-extrabold text-brand-slate-dark font-display">
                1. About NIAKYLIE Women Collection
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              NIAKYLIE Women Collection is a saree-focused fashion brand offering sarees in a variety of fabrics, designs, colors, patterns, and styles.
            </p>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Our products are available through our website, social media channels, WhatsApp Business, and physical store.
            </p>
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-2 text-xs">
              <div className="font-extrabold text-brand-slate-dark flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-brand-crimson" />
                <span>Physical Store Address</span>
              </div>
              <p className="text-slate-700 leading-relaxed font-semibold pl-6">
                {termsConfig.address}
              </p>
            </div>
          </section>

          {/* Section 2: Use of Our Website */}
          <section id="use-of-our-website" className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-6 scroll-mt-28">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-xl font-extrabold text-brand-slate-dark font-display">
                2. Use of Our Website
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                By using our website, you agree to adhere to the following usage guidelines:
              </p>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-700">
              {[
                'Use the website only for lawful purposes.',
                'Provide accurate information when placing an order or making an enquiry.',
                'Not misuse, damage, or attempt to disrupt the website.',
                'Not attempt to gain unauthorized access to our website, systems, or data.',
                'Not copy, reproduce, distribute, or commercially use our website content without permission.',
              ].map((item, index) => (
                <li key={index} className="flex items-start space-x-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <CheckCircle2 className="w-4 h-4 text-brand-crimson flex-shrink-0 mt-0.5" />
                  <span className="font-semibold">{item}</span>
                </li>
              ))}
            </ul>

            <p className="text-xs text-slate-500 bg-amber-50/70 border border-amber-200/80 p-4 rounded-2xl text-amber-900 leading-relaxed">
              We reserve the right to restrict or terminate access to the website if we believe it is being misused or used in violation of these Terms.
            </p>
          </section>

          {/* Section 3: Product Information */}
          <section id="product-information" className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-6 scroll-mt-28">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-xl font-extrabold text-brand-slate-dark font-display">
                3. Product Information
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                We make reasonable efforts to ensure product descriptions, images, prices, colors, and details are accurate.
              </p>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <p className="font-bold text-slate-800">Please note the following regarding saree products:</p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <li className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1">
                  <span className="font-extrabold text-brand-slate-dark block">Display Colors</span>
                  <span>Actual colors may vary slightly depending on your device's screen settings.</span>
                </li>
                <li className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1">
                  <span className="font-extrabold text-brand-slate-dark block">Weave & Detail Variations</span>
                  <span>Patterns, prints, embroidery, or borders may vary slightly from product photographs.</span>
                </li>
                <li className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1">
                  <span className="font-extrabold text-brand-slate-dark block">Handcrafted Fabric Nature</span>
                  <span>Minor variations may occur due to the nature of traditional saree fabrics & weaving.</span>
                </li>
                <li className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1">
                  <span className="font-extrabold text-brand-slate-dark block">Stock Availability</span>
                  <span>Product availability and pricing may change without prior notice.</span>
                </li>
              </ul>
            </div>

            <p className="text-xs text-slate-500">
              We reserve the right to correct errors, update product information, or discontinue products at any time.
            </p>
          </section>

          {/* Section 4: Saree Availability */}
          <section id="saree-availability" className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-4 scroll-mt-28">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-xl font-extrabold text-brand-slate-dark font-display">
                4. Saree Availability
              </h2>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              All products are subject to availability. Adding a saree to your cart, wishlist, or enquiry does not guarantee that the product will remain available.
            </p>
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
              If a product becomes unavailable after you place an enquiry or order, we will contact you immediately and provide available alternatives or options.
            </p>
          </section>

          {/* Section 5: Product Prices */}
          <section id="product-prices" className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-4 scroll-mt-28">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-xl font-extrabold text-brand-slate-dark font-display">
                5. Product Prices
              </h2>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Product prices displayed on our website are subject to change without prior notice. The final price applicable to your order will be the price confirmed by NIAKYLIE at the time the order is accepted.
            </p>
            <p className="text-xs text-slate-500 italic">
              Additional charges such as delivery or applicable taxes, where relevant, will be communicated clearly before order confirmation.
            </p>
          </section>

          {/* Section 6: Orders */}
          <section id="orders" className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-6 scroll-mt-28">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-xl font-extrabold text-brand-slate-dark font-display">
                6. Orders
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Channels for placing orders with NIAKYLIE Women Collection:
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-center font-bold text-slate-700">
              <div className="bg-rose-50/60 border border-rose-100 p-3 rounded-2xl text-brand-crimson">NIAKYLIE Website</div>
              <div className="bg-emerald-50/60 border border-emerald-100 p-3 rounded-2xl text-emerald-700">WhatsApp Business</div>
              <div className="bg-purple-50/60 border border-purple-100 p-3 rounded-2xl text-purple-700">Instagram</div>
              <div className="bg-blue-50/60 border border-blue-100 p-3 rounded-2xl text-blue-700">Facebook</div>
              <div className="bg-amber-50/60 border border-amber-100 p-3 rounded-2xl text-amber-800 sm:col-span-2">Physical Store in Raipur</div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              An order is considered confirmed only after NIAKYLIE confirms the order and any required payment or advance payment has been received.
            </p>

            <div className="space-y-2 text-xs text-slate-600">
              <p className="font-bold text-slate-800">We reserve the right to refuse or cancel an order for reasons including:</p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  'Product unavailability',
                  'Incorrect pricing or product info',
                  'Suspected fraudulent activity',
                  'Incorrect customer information',
                  'Delivery-related limitations',
                  'Other legitimate business reasons',
                ].map((reason, index) => (
                  <li key={index} className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-semibold text-slate-700 flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-crimson" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-xs text-slate-500 italic bg-slate-50 p-4 rounded-2xl border border-slate-100">
              If we cancel an order after payment has been received, we will communicate the applicable refund process immediately.
            </p>
          </section>

          {/* Section 7: Payment */}
          <section id="payment" className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-6 scroll-mt-28">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-xl font-extrabold text-brand-slate-dark font-display">
                7. Payment
              </h2>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Depending on the order method, we accept payment through available methods communicated by NIAKYLIE. Customers are responsible for providing accurate payment information.
            </p>

            {/* Payment Security Warning */}
            <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-2 border border-slate-800">
              <div className="flex items-center space-x-2 text-amber-400 font-extrabold text-xs">
                <Lock className="w-4 h-4" />
                <span>Sensitive Credentials Protection</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                NIAKYLIE does not store complete debit card, credit card, banking passwords, or similar sensitive payment credentials on its own systems. All online transactions are processed through encrypted payment providers.
              </p>
            </div>
          </section>

          {/* Section 8: Order Confirmation */}
          <section id="order-confirmation" className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-6 scroll-mt-28">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-xl font-extrabold text-brand-slate-dark font-display">
                8. Order Confirmation
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Confirmations are issued via WhatsApp, phone, email, or SMS.
              </p>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-2 text-xs">
              <p className="font-extrabold text-brand-slate-dark">Please verify your order confirmation details carefully:</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-semibold text-slate-700">
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-center">Product Details</div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-center">Quantity</div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-center">Confirmed Price</div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-center">Delivery Address</div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-center">Contact Number</div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-center">Special Notes</div>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              If you notice an error, contact us as soon as possible. Once an order has been processed or dispatched, changes or cancellations may not be possible.
            </p>
          </section>

          {/* Section 9: Shipping & Delivery */}
          <section id="shipping-delivery" className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-6 scroll-mt-28">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-xl font-extrabold text-brand-slate-dark font-display">
                9. Shipping & Delivery
              </h2>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              We aim to process and dispatch confirmed orders within the timeframe communicated at purchase.
            </p>

            <div className="space-y-2 text-xs">
              <p className="font-bold text-slate-800">Delivery times may vary based on external factors:</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-semibold text-slate-700">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center">Location</div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center">Courier availability</div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center">Weather conditions</div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center">Holidays</div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center">Public events</div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center">Operational delays</div>
              </div>
            </div>

            <p className="text-xs text-slate-500 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              A delivery estimate is not an absolute guarantee. Customers are responsible for providing complete address and contact details.
            </p>
          </section>

          {/* Section 10: Delivery Inspection */}
          <section id="delivery-inspection" className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-4 scroll-mt-28">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-xl font-extrabold text-brand-slate-dark font-display">
                10. Delivery Inspection
              </h2>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Customers are encouraged to inspect the package and product carefully upon receipt. If the package appears damaged, opened, or tampered with, please document the condition (take photos/videos) and contact NIAKYLIE as soon as possible.
            </p>
            <p className="text-xs text-slate-600 leading-relaxed">
              For damaged, incorrect, or defective products, please contact us within the period specified in our <strong>Return & Refund Policy</strong>.
            </p>
          </section>

          {/* Section 11: Returns, Exchanges & Refunds */}
          <section id="returns-exchanges-refunds" className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-4 scroll-mt-28">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-xl font-extrabold text-brand-slate-dark font-display">
                11. Returns, Exchanges & Refunds
              </h2>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Returns, exchanges, cancellations, and refunds are subject to our separate <a href="/pages/refund-policy" className="text-brand-crimson font-bold hover:underline">Return & Refund Policy</a>. Please review that policy carefully before purchasing.
            </p>
            <div className="bg-rose-50/80 border border-rose-200 rounded-2xl p-4 text-xs text-brand-crimson font-bold">
              Please do not send a product back without first contacting NIAKYLIE and receiving return authorization and instructions.
            </div>
          </section>

          {/* Section 12: Promotional Offers & Discounts */}
          <section id="promotional-offers" className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-4 scroll-mt-28">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-xl font-extrabold text-brand-slate-dark font-display">
                12. Promotional Offers & Discounts
              </h2>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              NIAKYLIE may offer periodic discounts, campaigns, coupons, or special offers. Each offer has its own validity period, eligibility rules, and usage limitations.
            </p>
            <p className="text-xs text-slate-500">
              Promotional offers cannot be combined unless explicitly stated. NIAKYLIE reserves the right to modify or discontinue promotional offers where legally permitted.
            </p>
          </section>

          {/* Section 13: Promotional Cards & Coupons */}
          <section id="promotional-cards-coupons" className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-4 scroll-mt-28">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-xl font-extrabold text-brand-slate-dark font-display">
                13. Promotional Cards & Coupons
              </h2>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
              {[
                'Promotional cards cannot be exchanged for cash.',
                'Discounts cannot be transferred for cash value.',
                'Promotional cards carry specific expiry dates.',
                'Only one promotional offer per purchase unless specified.',
              ].map((rule, idx) => (
                <li key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-100 font-semibold flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-crimson flex-shrink-0" />
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Section 14: Intellectual Property */}
          <section id="intellectual-property" className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-4 scroll-mt-28">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-xl font-extrabold text-brand-slate-dark font-display">
                14. Intellectual Property
              </h2>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              All content on the NIAKYLIE website—including brand name, logo, product photographs, videos, graphics, text, designs, website layout, and marketing materials—is owned by or licensed to NIAKYLIE Women Collection and protected by applicable intellectual property laws.
            </p>
            <p className="text-xs font-bold text-slate-800 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
              You may not copy, reproduce, modify, publish, distribute, sell, or commercially use our content without prior written permission.
            </p>
          </section>

          {/* Section 15: User-Generated Content */}
          <section id="user-generated-content" className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-4 scroll-mt-28">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-xl font-extrabold text-brand-slate-dark font-display">
                15. User-Generated Content
              </h2>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              If you voluntarily submit reviews, photographs, testimonials, or comments, you grant NIAKYLIE permission to use them for legitimate marketing, business, or social media purposes where permitted by law.
            </p>
          </section>

          {/* Section 16: Social Media & WhatsApp */}
          <section id="social-media-whatsapp" className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-4 scroll-mt-28">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-xl font-extrabold text-brand-slate-dark font-display">
                16. Social Media & WhatsApp
              </h2>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              When communicating with us through WhatsApp, Instagram, Facebook, email, or phone, you are also subject to the privacy terms and policies of those platforms.
            </p>
          </section>

          {/* Section 17: Third-Party Links */}
          <section id="third-party-links" className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-4 scroll-mt-28">
            <div className="border-b border-gray-100 pb-4 flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-brand-slate-dark font-display">
                17. Third-Party Links
              </h2>
              <ExternalLink className="w-5 h-5 text-slate-400" />
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Our website may contain links to third-party services (payment gateways, delivery partners, social platforms). We do not control third-party websites and are not responsible for their content or privacy practices.
            </p>
          </section>

          {/* Section 18: Website Availability */}
          <section id="website-availability" className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-4 scroll-mt-28">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-xl font-extrabold text-brand-slate-dark font-display">
                18. Website Availability
              </h2>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              While we make reasonable efforts to keep our website available, we do not guarantee uninterrupted or error-free operation. Temporary downtime may occur for maintenance, upgrades, or technical issues.
            </p>
          </section>

          {/* Section 19: Limitation of Liability */}
          <section id="limitation-of-liability" className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-4 scroll-mt-28">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-xl font-extrabold text-brand-slate-dark font-display">
                19. Limitation of Liability
              </h2>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              To the extent permitted by applicable law, NIAKYLIE Women Collection will not be responsible for losses resulting from circumstances beyond our reasonable control, such as third-party service failures or courier delays.
            </p>
          </section>

          {/* Section 20: Force Majeure */}
          <section id="force-majeure" className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-4 scroll-mt-28">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-xl font-extrabold text-brand-slate-dark font-display">
                20. Force Majeure
              </h2>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              NIAKYLIE will not be responsible for delays or failure to perform obligations caused by natural disasters, severe weather, government restrictions, strikes, transport disruptions, internet failures, or unforeseen public emergencies.
            </p>
          </section>

          {/* Section 21: Privacy */}
          <section id="privacy" className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-4 scroll-mt-28">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-xl font-extrabold text-brand-slate-dark font-display">
                21. Privacy Policy
              </h2>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Your use of our website is also governed by our <a href="/pages/privacy-policy" className="text-brand-crimson font-bold hover:underline">Privacy Policy</a>, which details how we collect, use, and protect your personal information.
            </p>
          </section>

          {/* Section 22: Changes to These Terms */}
          <section id="changes-to-these-terms" className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-4 scroll-mt-28">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-xl font-extrabold text-brand-slate-dark font-display">
                22. Changes to These Terms
              </h2>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              NIAKYLIE may update these Terms & Conditions periodically. Updated versions will be published on this page with a revised "Last Updated" date.
            </p>
          </section>

          {/* Section 23: Governing Law */}
          <section id="governing-law" className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-4 scroll-mt-28">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-xl font-extrabold text-brand-slate-dark font-display">
                23. Governing Law
              </h2>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              These Terms & Conditions shall be governed by and interpreted in accordance with the applicable laws of India. Any disputes shall be subject to the jurisdiction of the appropriate courts having jurisdiction over Raipur, Chhattisgarh.
            </p>
          </section>

          {/* Section 24: Contact Us & Quick Links Footer */}
          <section id="contact-us" className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-brand-slate-dark to-slate-950 text-white p-8 sm:p-10 shadow-2xl border border-amber-500/20 space-y-6 scroll-mt-28">
            <div className="space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400">
                SECTION 24
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-display">
                24. Contact Us
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                If you have questions about these Terms & Conditions, an order, or our services, please contact NIAKYLIE Women Collection.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-slate-800 text-xs">
              <div className="space-y-2">
                <p className="font-extrabold text-white uppercase text-[11px] tracking-wider text-amber-300">
                  NIAKYLIE Women Collection
                </p>
                <div className="flex items-start space-x-2 text-slate-300 leading-relaxed">
                  <MapPin className="w-4 h-4 text-brand-crimson flex-shrink-0 mt-0.5" />
                  <span>{termsConfig.address}</span>
                </div>
              </div>

              <div className="space-y-2 text-slate-300">
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>{termsConfig.website}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Instagram className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span>{termsConfig.instagram}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <a href={`mailto:${termsConfig.email}`} className="hover:text-amber-300 transition-colors">
                    {termsConfig.email}
                  </a>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <a href={`https://wa.me/${termsConfig.whatsappClean}`} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-300 transition-colors">
                    {termsConfig.whatsapp}
                  </a>
                </div>
              </div>
            </div>

            {/* Quick Links Section */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400">
                Quick Links
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-300 font-semibold">
                <a href="/pages/privacy-policy" className="bg-slate-800/60 hover:bg-brand-crimson hover:text-white p-2.5 rounded-xl text-center transition-all">
                  Privacy Policy
                </a>
                <a href="/pages/refund-policy" className="bg-slate-800/60 hover:bg-brand-crimson hover:text-white p-2.5 rounded-xl text-center transition-all">
                  Return & Refund Policy
                </a>
                <a href="/pages/shipping-policy" className="bg-slate-800/60 hover:bg-brand-crimson hover:text-white p-2.5 rounded-xl text-center transition-all">
                  Shipping Policy
                </a>
                <a href="/pages/contact-us" className="bg-slate-800/60 hover:bg-brand-crimson hover:text-white p-2.5 rounded-xl text-center transition-all">
                  Contact Us
                </a>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 text-center space-y-1">
              <p className="text-xs font-bold text-amber-300 font-serif italic">
                NIAKYLIE Women Collection — Wear Beauty, Feel Beauty.
              </p>
              <p className="text-[11px] text-slate-400">
                © 2026 NIAKYLIE Women Collection. All rights reserved.
              </p>
            </div>
          </section>
        </main>
      </div>

      {/* Floating Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          aria-label="Back to top"
          className="fixed bottom-6 right-6 z-50 bg-slate-900 hover:bg-brand-crimson text-white p-3 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 border border-slate-800 animate-in fade-in"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
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
      ) : slug === 'terms-and-conditions' || slug === 'terms' ? (
        <TermsAndConditionsView pageContent={page.content} />
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
