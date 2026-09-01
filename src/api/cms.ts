import { apiClient } from './client';

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content?: string;
  coverImage: string;
  author: { name: string; avatar?: string; bio?: string };
  publishedAt: string;
  category: string;
  tags?: string[];
  viewCount?: number;
  readTime?: string;
}

export interface CmsPage {
  slug: string;
  title: string;
  lastUpdated: string;
  content: string; // HTML string
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: 'General' | 'Orders' | 'Shipping' | 'Returns' | 'Payments';
}

const MOCK_PAGES: Record<string, CmsPage> = {
  'contact-us': {
    slug: 'contact-us',
    title: 'Contact Us - NiaKylie Official Support',
    lastUpdated: '2026-08-31',
    content: `
      <h2 id="get-in-touch">Get in Touch</h2>
      <p>Have a question about an order, custom measurements, or return requests? Our dedicated NiaKylie customer care team is here to assist you.</p>
      <h2 id="store-address">Store Address</h2>
      <p><strong>NiaKylie Women Collection</strong><br />Sarora, Raipur, Chhattisgarh 492001, India</p>
      <h2 id="phone-whatsapp">Phone & WhatsApp</h2>
      <p>Phone: <a href="tel:+919589928337">+91 95899 28337</a><br />WhatsApp: <a href="https://wa.me/919589928337" target="_blank">+91 95899 28337</a></p>
      <h2 id="email-social">Email & Social Media</h2>
      <p>Email: <a href="mailto:niakylieofficial@gmail.com">niakylieofficial@gmail.com</a><br />Instagram: <a href="https://www.instagram.com/niakylie_women_collection" target="_blank">@niakylie_women_collection</a></p>
    `,
  },
  'about-us': {
    slug: 'about-us',
    title: 'About NiaKylie Fashion',
    lastUpdated: '2026-07-01',
    content: `
      <h2 id="our-story">Our Story</h2>
      <p>NiaKylie Fashion was born out of a deep reverence for India's rich textile heritage and the desire to make handcrafted ethnic couture accessible to every modern woman. Founded in 2021, we partner directly with master weavers across Varanasi, Kanchipuram, and Lucknow to bring you sarees, salwar suits, and lehengas of unparalleled artistry.</p>
      <h2 id="our-mission">Our Mission</h2>
      <p>Our mission is to celebrate the timeless elegance of Indian handloom while empowering the artisans who create it. Every purchase you make directly sustains the livelihood of a skilled craftsperson and preserves a centuries-old tradition.</p>
      <h2 id="sustainability">Sustainability & Ethics</h2>
      <p>We are committed to ethical sourcing, fair trade practices, and sustainable packaging. Our sarees are wrapped in eco-friendly cloth bags instead of single-use plastic, and we offset our logistics carbon footprint through verified reforestation programs.</p>
      <h2 id="craftsmanship">Craftsmanship</h2>
      <p>Each NiaKylie garment carries a QR-coded Certificate of Authenticity, verifiable on our platform, guaranteeing genuine handloom or handcrafted origin. We do not sell machine-manufactured imitations.</p>
    `,
  },
  'privacy-policy': {
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    lastUpdated: '2026-06-15',
    content: `
      <h2 id="introduction">Introduction</h2>
      <p>Your privacy is of utmost importance to NiaKylie Fashion Private Limited ("NiaKylie", "we", "us"). This Privacy Policy explains how we collect, use, store, and share your personal information when you use our platform.</p>
      <h2 id="data-collection">Information We Collect</h2>
      <p>We collect information you provide directly to us including: Name, Email address, Delivery address, Phone number, Payment details (processed securely via Razorpay/Stripe — we never store card numbers), and Purchase history.</p>
      <h2 id="data-usage">How We Use Your Data</h2>
      <p>Your data is used to: Process and deliver orders, Provide customer support, Send order updates and promotional communications (with your consent), Improve our platform and product recommendations.</p>
      <h2 id="data-sharing">Data Sharing</h2>
      <p>We do not sell or rent your personal data. We share data only with trusted logistics partners (BlueDart, Delhivery), payment processors (Razorpay, Stripe), and cloud infrastructure providers under strict data processing agreements.</p>
      <h2 id="your-rights">Your Rights</h2>
      <p>You have the right to access, update, or delete your personal data at any time from your Account Settings page or by contacting privacy@niakylie.com.</p>
    `,
  },
  'terms-and-conditions': {
    slug: 'terms-and-conditions',
    title: 'Terms & Conditions',
    lastUpdated: '2026-06-15',
    content: `
      <h2 id="acceptance">Acceptance of Terms</h2>
      <p>By accessing or using the NiaKylie platform, you agree to be bound by these Terms & Conditions. If you do not agree, please discontinue use of the platform immediately.</p>
      <h2 id="eligibility">Eligibility</h2>
      <p>You must be at least 18 years of age to make a purchase. By placing an order, you confirm that you meet this requirement.</p>
      <h2 id="orders">Orders & Payments</h2>
      <p>All orders are subject to product availability. We reserve the right to cancel orders at our discretion in cases of pricing errors, fraud detection, or stock unavailability. You will receive a full refund within 7 business days in such cases.</p>
      <h2 id="intellectual-property">Intellectual Property</h2>
      <p>All content on the NiaKylie platform including product photographs, descriptions, brand identity, and software is the exclusive intellectual property of NiaKylie Fashion Private Limited. Unauthorized reproduction is prohibited.</p>
    `,
  },
  'refund-policy': {
    slug: 'refund-policy',
    title: 'Refund & Return Policy',
    lastUpdated: '2026-07-01',
    content: `
      <h2 id="return-window">7-Day Easy Return Window</h2>
      <p>We offer a hassle-free 7-day return policy for most products. To initiate a return, navigate to My Orders in your account dashboard and click "Return Item" within 7 days of delivery.</p>
      <h2 id="eligibility">Return Eligibility</h2>
      <p>Items must be returned in original, unworn condition with all tags intact. Products that have been altered, customized, or dry-cleaned are not eligible for returns. Sale items are final sale.</p>
      <h2 id="refund-timeline">Refund Timeline</h2>
      <p>Once your return is received and inspected, we will process your refund within 5-7 business days. Refunds are credited to your original payment method or NiaKylie Store Credit at your preference.</p>
      <h2 id="exchange">Exchange Policy</h2>
      <p>We offer free size and color exchanges subject to availability. To request an exchange, follow the same return process and select "Exchange" instead of "Refund".</p>
    `,
  },
  'shipping-policy': {
    slug: 'shipping-policy',
    title: 'Shipping Policy',
    lastUpdated: '2026-07-01',
    content: `
      <h2 id="shipping-partners">Our Logistics Partners</h2>
      <p>NiaKylie ships via BlueDart Express, Delhivery, and DTDC — India's most reliable courier networks — ensuring safe and timely delivery of your handcrafted garments.</p>
      <h2 id="delivery-timelines">Delivery Timelines</h2>
      <p>Standard Delivery: 5-7 business days (FREE above ₹999). Express Delivery: 1-2 business days (₹149 flat). Delivery timelines may vary during festive seasons.</p>
      <h2 id="tracking">Order Tracking</h2>
      <p>Once your order is dispatched, you will receive an SMS and email with your courier tracking number and a direct link to track your shipment in real-time.</p>
      <h2 id="international">International Shipping</h2>
      <p>We currently ship to India only. International shipping to the USA, UK, UAE, Canada, and Australia is planned for Q4 2026. Join our waitlist at international@niakylie.com.</p>
    `,
  },
};

const MOCK_FAQS: FaqItem[] = [
  { id: 'f1', category: 'General', question: 'What makes NiaKylie sarees authentic?', answer: 'Every NiaKylie garment carries a QR-coded Certificate of Authenticity, verifiable on our platform, guaranteeing genuine handloom or handcrafted origin from registered GI-tagged weavers.' },
  { id: 'f2', category: 'General', question: 'How do I find my correct size?', answer: 'Visit our Size Guide (available on every product page) for detailed measurement charts. We recommend measuring your bust, waist, and hip and comparing against our chart for the best fit.' },
  { id: 'f3', category: 'Orders', question: 'Can I modify or cancel my order?', answer: 'Orders can be cancelled or modified within 2 hours of placement. Visit My Account → My Orders and click "Cancel Order". After 2 hours, the order enters processing and cannot be modified.' },
  { id: 'f4', category: 'Orders', question: 'Where can I track my order status?', answer: 'Log in to your account, go to My Orders, and click "View Details" on any order to see the real-time tracking timeline and courier partner information.' },
  { id: 'f5', category: 'Shipping', question: 'How long does standard delivery take?', answer: 'Standard delivery takes 5-7 business days across India. Express delivery (1-2 business days) is available at ₹149. Free standard shipping on orders above ₹999.' },
  { id: 'f6', category: 'Shipping', question: 'Do you ship internationally?', answer: 'We currently ship within India only. International shipping to USA, UK, UAE, Canada, and Australia is planned for Q4 2026. Join our international waitlist at international@niakylie.com.' },
  { id: 'f7', category: 'Returns', question: 'What is your return policy?', answer: 'We offer 7-day hassle-free returns for all unworn, unaltered products with original tags. Initiate a return from My Account → My Orders. Refunds are processed within 5-7 business days.' },
  { id: 'f8', category: 'Returns', question: 'Are customized or sale items returnable?', answer: 'Customized items (altered measurements or embroidery) and sale/clearance items are marked as final sale and are not eligible for returns or exchanges.' },
  { id: 'f9', category: 'Payments', question: 'What payment methods do you accept?', answer: 'We accept UPI, Google Pay, PhonePe (via Razorpay), Credit/Debit Cards (Visa, Mastercard, AmEx via Stripe), NetBanking, and Cash on Delivery (COD) for orders up to ₹10,000.' },
  { id: 'f10', category: 'Payments', question: 'Is my payment information secure?', answer: 'Absolutely. NiaKylie does not store any card or UPI credentials. All payments are processed via Razorpay and Stripe, which are PCI-DSS Level 1 certified payment gateways with 256-bit SSL encryption.' },
];

const MOCK_BLOGS: BlogPost[] = [
  {
    id: 'b1',
    slug: 'art-of-banarasi-silk',
    title: 'The Timeless Art of Banarasi Silk Weaving',
    excerpt: 'A deep dive into the 600-year-old Banarasi silk weaving tradition — the golden threads, the intricate motifs, and the master weavers who keep it alive.',
    content: `
      <p>Banarasi silk has adorned Indian brides and royals for over six centuries. Woven in the holy city of Varanasi on the banks of the Ganges, these magnificent textiles are defined by their fine silk, gold and silver zari work, and intricate floral and paisley motifs inspired by Mughal artistry.</p>
      <h2>The Weaving Process</h2>
      <p>Each saree takes between 15 days to 6 months to create depending on the intricacy of the design. The weaver uses a traditional handloom called a "khaddi" — a wooden frame that requires the coordinated skill of both hands and feet simultaneously. The gold zari thread (made from a core of silk wound with thin strips of real or imitation gold) is carefully interlaced to create the distinctive shimmer.</p>
      <h2>GI Tag Recognition</h2>
      <p>In 2009, Banarasi silk sarees received Geographical Indication (GI) tag status from the Government of India, protecting the craft from imitation and ensuring only authentic Varanasi-produced textiles can carry the Banarasi name.</p>
      <h2>Caring for Your Banarasi</h2>
      <p>Always dry-clean Banarasi silk. Store wrapped in soft muslin cloth away from direct sunlight. Air periodically and avoid contact with perfumes or deodorants as alcohol can damage the zari work.</p>
    `,
    coverImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80',
    author: { name: 'Priya Sharma', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80', bio: 'Fashion Editor & Textile Heritage Journalist' },
    publishedAt: '2026-08-01',
    category: 'Heritage & Craft',
    tags: ['Banarasi Silk', 'Handloom', 'Indian Heritage', 'Sarees'],
    viewCount: 4280,
    readTime: '6 min read',
  },
  {
    id: 'b2',
    slug: 'styling-lehenga-choli',
    title: 'How to Style a Lehenga Choli for Every Occasion',
    excerpt: 'From intimate mehendi ceremonies to grand sangeet nights — our complete guide to accessorizing and styling your lehenga choli like a fashion icon.',
    content: `<p>The lehenga choli is the crown jewel of Indian festive fashion. With the right styling, it can take you from an intimate family gathering to a grand ballroom celebration with effortless grace.</p><h2>Mehendi & Haldi Ceremonies</h2><p>For daytime events, opt for bright yellows, greens, and corals in lightweight georgette or cotton lehengas. Keep jewellery minimal — floral jewellery is trending heavily.</p><h2>Sangeet Nights</h2><p>Go bold with heavily embroidered velvet or raw silk lehengas in deep jewel tones — emerald, cobalt blue, or magenta. Statement chandbali earrings and a maang tikka complete the look.</p>`,
    coverImage: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=80',
    author: { name: 'Kavya Menon', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=100&q=80', bio: 'Celebrity Stylist & Fashion Consultant' },
    publishedAt: '2026-07-20',
    category: 'Style Guide',
    tags: ['Lehenga', 'Styling', 'Wedding Fashion', 'Festive Looks'],
    viewCount: 3150,
    readTime: '5 min read',
  },
  {
    id: 'b3',
    slug: 'festive-2026-trends',
    title: 'Festive 2026: The Top Ethnic Fashion Trends You Need to Know',
    excerpt: 'Our fashion forecasters break down the biggest ethnic wear trends for Navratri, Diwali, and wedding season 2026 — from resurgent handlooms to sustainable couture.',
    content: `<p>Festive 2026 is shaping up to be a landmark season for ethnic fashion. After years of minimalism, Indian couture is returning to its maximalist roots — rich embroideries, bold colours, and heritage textiles are all making a triumphant comeback.</p><h2>Top Trends</h2><p><strong>1. Ombre Kanjivarams</strong> — Gradient silk sarees moving from ivory to deep crimson are the must-have of the season.</p><p><strong>2. Contemporary Kurta Sets</strong> — Sharara and palazzo-paired asymmetric kurtas in handblock print cotton are bridging traditional and modern aesthetics beautifully.</p>`,
    coverImage: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=80',
    author: { name: 'Aisha Nair', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80', bio: 'Senior Fashion Editor, NiaKylie' },
    publishedAt: '2026-07-10',
    category: 'Trend Report',
    tags: ['Festive Fashion', '2026 Trends', 'Ethnic Wear', 'Diwali'],
    viewCount: 5890,
    readTime: '7 min read',
  },
];

export const cmsApi = {
  getPage: async (slug: string): Promise<CmsPage> => {
    try {
      return await apiClient.get<CmsPage>(`/cms/pages/${slug}`);
    } catch (error) {
      const page = MOCK_PAGES[slug];
      if (page) return page;
      return {
        slug,
        title: slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        lastUpdated: '2026-01-01',
        content: '<p>Content coming soon. Please check back later.</p>',
      };
    }
  },

  getFaqs: async (): Promise<FaqItem[]> => {
    try {
      return await apiClient.get<FaqItem[]>('/cms/faqs');
    } catch (error) {
      return MOCK_FAQS;
    }
  },

  getBlogs: async (): Promise<BlogPost[]> => {
    try {
      const res: any = await apiClient.get('/cms/blogs');
      if (Array.isArray(res)) return res;
      if (res && Array.isArray(res.blogs)) return res.blogs;
      if (res && Array.isArray(res.items)) return res.items;
      if (res && Array.isArray(res.data)) return res.data;
      return MOCK_BLOGS;
    } catch (error) {
      return MOCK_BLOGS;
    }
  },

  getBlogBySlug: async (slug: string): Promise<BlogPost | null> => {
    try {
      return await apiClient.get<BlogPost>(`/cms/blogs/${slug}`);
    } catch (error) {
      return MOCK_BLOGS.find((b) => b.slug === slug) || null;
    }
  },

  getTestimonials: async () => {
    try {
      return await apiClient.get('/cms/testimonials');
    } catch (error) {
      return [];
    }
  },
};
