import { useState } from 'react';
import { ShieldCheck, RefreshCw, Truck, Send, Instagram, Facebook, Twitter, Youtube, Shield, MapPin, Phone, Mail, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { checkIsAdmin } from '../../utils/roleUtils';
import { cmsApi } from '../../api/cms';
import { useCategories } from '../../hooks/useCategories';

export function Footer() {
  const { user } = useAuthStore();
  const isAdmin = checkIsAdmin(user);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch active categories dynamically
  const { allCategories, isLoading: isCategoriesLoading } = useCategories({ status: true, limit: 500 });

  // Extract subcategories (categories with valid parentId)
  const subCategories = allCategories.filter((c) => {
    if (c.status === false || c.isDeleted || c.deletedAt) return false;
    const pId = typeof c.parentId === 'object' && c.parentId ? (c.parentId as any)._id || (c.parentId as any).id : c.parentId;
    return pId && pId !== 'null' && pId !== 'undefined';
  });

  // Fallback to all active categories if subcategories array is empty
  const categoriesToDisplay = subCategories.length > 0 ? subCategories : allCategories;

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim();
    const cleanPhone = phone.trim();

    if (!cleanEmail && !cleanPhone) {
      setErrorMessage('Please enter an email address or mobile number.');
      return;
    }

    if (cleanPhone && !/^[6-9]\d{9}$/.test(cleanPhone.replace(/[\s\-\+]/g, '').slice(-10))) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    try {
      const res = await cmsApi.subscribeNewsletter({
        email: cleanEmail || undefined,
        phone: cleanPhone || undefined,
        source: 'FOOTER',
      });
      setSuccessMessage(res.message || 'Thank you for subscribing! We will send exclusive offers.');
      setEmail('');
      setPhone('');
      setTimeout(() => setSuccessMessage(null), 6000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Subscription failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-white border-t border-gray-200 text-slate-600 font-sans">
      {/* 1. Value Proposition Guarantees Bar */}
      <div className="border-b border-gray-100 bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-crimson/10 text-brand-crimson flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-brand-slate-dark">100% Original Products</h4>
              <p className="text-xs text-slate-500">Guaranteed authentic handcrafted ethnic wear</p>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-crimson/10 text-brand-crimson flex items-center justify-center flex-shrink-0">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-brand-slate-dark">7 Days Easy Return</h4>
              <p className="text-xs text-slate-500">Hassle-free return & exchange policy</p>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-crimson/10 text-brand-crimson flex items-center justify-center flex-shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-brand-slate-dark">Free Express Shipping</h4>
              <p className="text-xs text-slate-500">On all prepaid orders over ₹999 across India</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Footer Links & Newsletter */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Column 1: Dynamic Subcategories */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase font-extrabold tracking-wider text-brand-slate-dark">
              ONLINE SHOPPING
            </h4>
            <ul className="space-y-2 text-xs">
              {isCategoriesLoading ? (
                <>
                  <li className="h-3.5 w-24 bg-slate-100 rounded animate-pulse"></li>
                  <li className="h-3.5 w-28 bg-slate-100 rounded animate-pulse"></li>
                  <li className="h-3.5 w-20 bg-slate-100 rounded animate-pulse"></li>
                </>
              ) : categoriesToDisplay.length > 0 ? (
                categoriesToDisplay.map((cat) => (
                  <li key={cat._id || cat.slug}>
                    <a
                      href={`/category/${cat.slug}`}
                      className="hover:text-brand-crimson transition-colors"
                    >
                      {cat.name}
                    </a>
                  </li>
                ))
              ) : (
                <>
                  <li><a href="/category/women" className="hover:text-brand-crimson transition-colors">Women Ethnic Wear</a></li>
                  <li><a href="/category/sarees" className="hover:text-brand-crimson transition-colors">Banarasi & Silk Sarees</a></li>
                  <li><a href="/category/kurta-sets" className="hover:text-brand-crimson transition-colors">Designer Kurta Sets</a></li>
                  <li><a href="/category/lehengas" className="hover:text-brand-crimson transition-colors">Bridal Lehengas</a></li>
                </>
              )}
            </ul>
          </div>

          {/* Column 2: Customer Policies */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase font-extrabold tracking-wider text-brand-slate-dark">
              CUSTOMER POLICIES
            </h4>
            <ul className="space-y-2 text-xs">
              <li><a href="/pages/contact-us" className="hover:text-brand-crimson transition-colors">Contact Us</a></li>
              <li><a href="/faqs" className="hover:text-brand-crimson transition-colors">Frequently Asked Questions</a></li>
              <li><a href="/pages/terms-and-conditions" className="hover:text-brand-crimson transition-colors">Terms of Use</a></li>
              <li><a href="/pages/refund-policy" className="hover:text-brand-crimson transition-colors">Returns & Refunds</a></li>
              <li><a href="/pages/shipping-policy" className="hover:text-brand-crimson transition-colors">Shipping Policy</a></li>
              <li><a href="/account/orders" className="hover:text-brand-crimson transition-colors font-bold text-slate-700">Track Order Status</a></li>
            </ul>
          </div>

          {/* Column 3: About NiaKylie */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase font-extrabold tracking-wider text-brand-slate-dark">
              THE BRAND
            </h4>
            <ul className="space-y-2 text-xs">
              <li><a href="/pages/about-us" className="hover:text-brand-crimson transition-colors">About NiaKylie</a></li>
              <li><a href="/blogs" className="hover:text-brand-crimson font-semibold transition-colors">Saree Journal</a></li>
              <li>
                <a
                  href="/admin"
                  className="text-amber-600 font-extrabold hover:underline flex items-center space-x-1"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>{isAdmin ? 'Admin Dashboard' : 'Admin Access / Portal'}</span>
                </a>
              </li>
              <li><a href="/pages/artisans" className="hover:text-brand-crimson transition-colors">Artisan Weaver Network</a></li>
              <li><a href="/pages/careers" className="hover:text-brand-crimson transition-colors">Careers & Internships</a></li>
              <li><a href="/pages/press" className="hover:text-brand-crimson transition-colors">Press & Media</a></li>
            </ul>
          </div>

          {/* Column 4 & 5: Newsletter & Social (Span 2) */}
          <div className="col-span-2 space-y-4">
            <h4 className="text-xs uppercase font-extrabold tracking-wider text-brand-slate-dark">
              STAY IN TOUCH & EXCLUSIVE OFFERS
            </h4>
            <p className="text-xs text-slate-500">
              Provide your email address and mobile number to receive instant SMS updates, exclusive promo codes, and festive sale alerts.
            </p>

            <form onSubmit={handleSubscribe} className="space-y-2.5 max-w-md">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email Address"
                    className="w-full bg-slate-100 text-xs text-brand-slate pl-9 pr-3 py-2.5 rounded-xl border border-slate-200/60 focus:border-brand-crimson focus:bg-white outline-none transition-colors"
                  />
                </div>

                <div className="relative">
                  <span className="text-xs font-bold text-slate-500 absolute left-3 top-2.5">+91</span>
                  <input
                    type="tel"
                    value={phone}
                    maxLength={10}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="Mobile Number"
                    className="w-full bg-slate-100 text-xs text-brand-slate pl-11 pr-3 py-2.5 rounded-xl border border-slate-200/60 focus:border-brand-crimson focus:bg-white outline-none transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-crimson hover:bg-brand-crimson-dark disabled:bg-brand-crimson/60 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center space-x-2 transition-colors shadow-sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving details...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Subscribe for Offers</span>
                  </>
                )}
              </button>
            </form>

            {successMessage && (
              <div className="flex items-center space-x-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-medium">
                <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {errorMessage && (
              <div className="flex items-center space-x-2 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Store & Contact Info */}
            <div className="pt-2 space-y-2.5 text-xs text-slate-600">
              <h5 className="text-[11px] font-extrabold uppercase tracking-wider text-brand-slate-dark">Store Address & Contact</h5>
              <div className="flex items-start space-x-2">
                <MapPin className="w-3.5 h-3.5 text-brand-crimson flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-700">Sarora, Raipur, Chhattisgarh 492001, India</span>
                </div>
              </div>

              {/* Embedded Google Map Preview */}
              <div className="relative w-full h-36 rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100 group">
                <iframe
                  title="NiaKylie Store Google Map Location"
                  src="https://maps.google.com/maps?q=21.290281,81.611905&t=&z=16&ie=UTF8&iwloc=&output=embed"
                  className="w-full h-full border-0 group-hover:scale-105 transition-transform duration-300"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <a
                  href="https://www.google.com/maps/dir/?api=1&destination=21.290281,81.611905"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-md hover:bg-brand-crimson hover:text-white text-brand-slate-dark text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-sm border border-slate-200/80 transition-all flex items-center space-x-1"
                >
                  <span>Get Directions</span>
                  <span>↗</span>
                </a>
              </div>

              <div className="flex items-center space-x-2">
                <Phone className="w-3.5 h-3.5 text-brand-crimson flex-shrink-0" />
                <a href="tel:+919589928337" className="hover:text-brand-crimson font-bold transition-colors">+91 95899 28337</a>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-3.5 h-3.5 text-brand-crimson flex-shrink-0" />
                <a href="mailto:niakylieofficial@gmail.com" className="hover:text-brand-crimson font-bold transition-colors">niakylieofficial@gmail.com</a>
              </div>
            </div>

            {/* Social & Contact Links */}
            <div className="pt-2">
              <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Follow & Chat With Us</h5>
              <div className="flex space-x-3 text-slate-600">
                <a
                  href="https://www.instagram.com/niakylie_women_collection"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-brand-crimson hover:text-white flex items-center justify-center transition-colors"
                  title="Follow us on Instagram (@niakylie_women_collection)"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href="https://wa.me/919589928337"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-emerald-600 hover:text-white flex items-center justify-center transition-colors"
                  title="Chat with us on WhatsApp (+91 95899 28337)"
                >
                  <svg className="w-4 h-4 fill-current text-slate-600 hover:text-white" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                  </svg>
                </a>
                <a
                  href="https://www.facebook.com/profile.php?id=61592438117379"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-colors"
                  title="Follow us on Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
                <a href="#twitter" className="w-8 h-8 rounded-full bg-slate-100 hover:bg-sky-500 hover:text-white flex items-center justify-center transition-colors">
                  <Twitter className="w-4 h-4" />
                </a>
                <a href="#youtube" className="w-8 h-8 rounded-full bg-slate-100 hover:bg-red-600 hover:text-white flex items-center justify-center transition-colors">
                  <Youtube className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Bottom Bar: Payment Logos & Copyright */}
        <div className="mt-12 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center space-x-3">
            <img
              src="/asset/niakylie_logo.png"
              alt="NiaKylie Fashion"
              className="h-8 w-auto object-contain rounded-lg"
            />
            <span>© 2026 NiaKylie Women Collection. All rights reserved.</span>
            <span className="text-slate-300">|</span>
            <a href="/admin" className="text-slate-500 hover:text-brand-crimson font-semibold flex items-center space-x-1">
              <Shield className="w-3 h-3 text-amber-500" />
              <span>Admin Login</span>
            </a>
          </div>

          {/* Payment Method Badges */}
          <div className="flex items-center space-x-2 text-[10px] font-bold text-slate-400">
            <span className="bg-slate-100 px-2 py-1 rounded text-slate-700">Razorpay</span>
            <span className="bg-slate-100 px-2 py-1 rounded text-slate-700">VISA</span>
            <span className="bg-slate-100 px-2 py-1 rounded text-slate-700">Mastercard</span>
            <span className="bg-slate-100 px-2 py-1 rounded text-slate-700">UPI</span>
            <span className="bg-slate-100 px-2 py-1 rounded text-slate-700">NetBanking</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
