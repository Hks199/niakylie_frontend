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
  id?: string;
  _id?: string;
  question: string;
  answer: string;
  category: 'General' | 'Orders' | 'Shipping' | 'Returns' | 'Payments' | string;
  displayOrder?: number;
  isActive?: boolean;
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
    title: 'About Niakylie Women Collection',
    lastUpdated: '2026-09-02',
    content: `
      <h2 id="celebrating-every-woman">Celebrating Every Woman, One Saree at a Time</h2>
      <p>Welcome to <strong>Niakylie Women Collection</strong> — a growing saree brand built with a simple vision: to make beautiful, stylish, and versatile sarees accessible to every woman.</p>
      <p>At NIAKYLIE, we believe a saree is more than just an outfit. It is a part of our culture, a reflection of individuality, and something that can make every occasion feel special. From traditional celebrations to everyday elegance, we bring together a variety of sarees to suit different styles, occasions, and personalities.</p>

      <h2 id="our-collection">Our Collection</h2>
      <p>Our primary focus is <strong>sarees of all varieties</strong>. We are continuously working to bring a diverse collection featuring different fabrics, designs, colors, patterns, and styles — whether you're looking for something traditional, festive, elegant, or contemporary.</p>
      <p>We carefully select our collection with the aim of offering <strong>quality, style, and value</strong> to our customers.</p>

      <h2 id="our-journey">Our Journey</h2>
      <p>Niakylie Women Collection started as a small startup with a big dream — to build a saree brand that customers can trust and return to.</p>
      <p>Along with our physical shop in <strong>Raipur, Chhattisgarh</strong>, we are also building our presence online so that customers can discover our latest collections and connect with us easily from anywhere.</p>
      <p>We are a growing brand, and every customer, order, message, and piece of feedback is an important part of our journey.</p>

      <h2 id="shop-with-us">Shop With Us</h2>
      <p>You can explore NIAKYLIE through our website and social media platforms, or visit us at our shop:</p>
      <p><strong>Niakylie Women Collection</strong><br />
      Ward No. 39, Kabir Chaura, Bajar Chauk,<br />
      Sarora, Gondwara Basti,<br />
      Raipur, Chhattisgarh – 493221</p>

      <h2 id="connect-with-niakylie">Connect With NIAKYLIE</h2>
      <p><strong>Website:</strong> niakylie.com<br />
      <strong>Instagram:</strong> @niakylie_women_collection<br />
      <strong>Facebook:</strong> NIAKYLIE Women Collection<br />
      <strong>WhatsApp:</strong> Business WhatsApp (+91 95899 28337)</p>

      <p>Whether you're looking for a saree for a special occasion or simply want to add something beautiful to your wardrobe, we would love to be a part of your journey.</p>
      <p><strong>Niakylie Women Collection — Wear Beauty, Feel Beauty.</strong></p>
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
    slug: 'how-to-style-saree-modern-look',
    title: 'How to Style a Saree for a Modern Look',
    excerpt: 'The saree never goes out of style — but the way we wear it keeps evolving. Discover simple ways to give your traditional saree a modern touch with the right blouse, drape, jewellery and accessories.',
    content: `
      <h2 id="evolution-of-saree">The Evolution of Modern Saree Draping</h2>
      <p>The saree is timeless, but modern styling has given it a brand-new avatar. Today's woman wants elegance without compromising on comfort. Whether you are dressing for a cocktail party, corporate event, or festival, here are simple ways to style your traditional saree for a contemporary look.</p>

      <h2 id="statement-blouse">1. Pair with a Statement Modern Blouse</h2>
      <p>Swap your standard blouse for a crop top, high-neck halter, corset, or structured blazer. A plain NIAKYLIE georgette or organza saree paired with an embroidered or sequined blouse instantly elevates the ensemble.</p>

      <h2 id="waist-belt">2. Accentuate Your Waist with a Belt</h2>
      <p>Adding a metallic waist belt (Kamarbandh) or a slim leather/fabric belt keeps the pallu in place and defines your silhouette with effortlessly chic flair.</p>

      <h2 id="draping-styles">3. Experiment with Draping Styles</h2>
      <p>Try the pant-style drape, neck-wrap drape, or dhoti drape. Pre-draped sarees from NIAKYLIE let you get ready in under two minutes without fussing with pleats.</p>

      <h2 id="jewellery-accessories">4. Contemporary Jewellery & Footwear</h2>
      <p>Ditch heavy traditional sets for geometric brass neckpieces, statement earrings, or oxidized silver chokers. Pair your saree with comfortable block heels or even classic sneakers for an edgy street-style look.</p>
    `,
    coverImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80',
    author: { name: 'NIAKYLIE Styling Team', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80', bio: 'Saree Styling Experts at NIAKYLIE' },
    publishedAt: '2026-09-01',
    category: 'Saree Styling',
    tags: ['Modern Saree', 'Styling Tips', 'Blouse Ideas', 'Belted Saree'],
    viewCount: 4890,
    readTime: '5 min read',
  },
  {
    id: 'b2',
    slug: '10-types-of-sarees-every-woman-should-know',
    title: '10 Types of Sarees Every Woman Should Know',
    excerpt: 'From elegant silks and traditional handlooms to lightweight everyday sarees, discover different saree varieties and what makes each one special.',
    content: `
      <h2 id="saree-varieties">The Rich Tapestry of Indian Sarees</h2>
      <p>Every region in India has its signature weave, fabric, and artistic pattern. Here are 10 iconic saree types every woman should have in her wardrobe collection:</p>

      <h2 id="banarasi-silk">1. Banarasi Silk Saree</h2>
      <p>Woven in Varanasi with intricate gold and silver zari work. Perfect for weddings and grand festive celebrations.</p>

      <h2 id="kanjivaram-silk">2. Kanjivaram (Kanchipuram) Silk</h2>
      <p>Hailing from Tamil Nadu, known for its thick pure silk base and contrasting temple motifs on borders.</p>

      <h2 id="organza-saree">3. Organza Saree</h2>
      <p>Sheer, lightweight, and crisp with subtle sheen. Extremely popular for day events and summer parties.</p>

      <h2 id="chanderi-saree">4. Chanderi Saree</h2>
      <p>A delicate blend of silk and cotton with zari borders from Madhya Pradesh.</p>

      <h2 id="georgette-saree">5. Georgette Saree</h2>
      <p>Bouncy, fluid, and figure-flattering. Great for party wear and daily celebrations.</p>

      <h2 id="linen-saree">6. Linen Saree</h2>
      <p>Breathable, eco-friendly, and effortlessly stylish for workwear and casual outings.</p>

      <h2 id="cotton-saree">7. Cotton Handloom Saree</h2>
      <p>Pure comfort with timeless artistic appeal, ideal for daily wear in warm Indian climates.</p>

      <h2 id="tissue-silk">8. Tissue Silk Saree</h2>
      <p>Glossy, metallic shimmer weave that reflects light beautifully for evening functions.</p>

      <h2 id="net-saree">9. Net & Lace Saree</h2>
      <p>Modern, sheer, and heavily embellished with sequins and zardozi for glamour.</p>

      <h2 id="tussar-silk">10. Tussar Silk Saree</h2>
      <p>Rich textured natural silk with deep earthy tones and traditional hand block prints.</p>
    `,
    coverImage: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=80',
    author: { name: 'Kavya Menon', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=100&q=80', bio: 'Textile Heritage Specialist' },
    publishedAt: '2026-08-28',
    category: 'Saree Guide',
    tags: ['Saree Types', 'Banarasi', 'Kanjivaram', 'Organza', 'Handloom'],
    viewCount: 6120,
    readTime: '7 min read',
  },
  {
    id: 'b3',
    slug: 'choose-perfect-saree-for-every-occasion',
    title: 'How to Choose the Perfect Saree for Every Occasion',
    excerpt: 'Wedding, festival, office, family function or a casual day out — the right saree can completely transform your look. Here is how to choose a saree based on the occasion.',
    content: `
      <h2 id="matching-saree">Matching Your Saree to the Event</h2>
      <p>Selecting the right saree depends on the dress code, time of day, and level of comfort needed. Here is NIAKYLIE's definitive occasion guide:</p>

      <h2 id="wedding-saree">1. Grand Weddings & Reception</h2>
      <p><strong>Recommended Sarees:</strong> Heavy Banarasi Silk, Kanjivaram, Zardozi Embroidered Silk.<br />Go for deep jewel tones like crimson red, royal blue, emerald green, and gold.</p>

      <h2 id="festive-saree">2. Festive Celebrations (Diwali, Navratri, Puja)</h2>
      <p><strong>Recommended Sarees:</strong> Tissue Silk, Bright Chanderi, Embroidered Organza.<br />Choose vibrant colors like yellow, magenta, mustard, and orange with festive zari borders.</p>

      <h2 id="office-saree">3. Office & Formal Corporate Wear</h2>
      <p><strong>Recommended Sarees:</strong> Linen, Soft Handloom Cotton, Linen-Silk blend.<br />Opt for pastels, beige, muted greys, and minimal prints that look polished and feel comfortable all day.</p>

      <h2 id="party-saree">4. Evening Parties & Cocktails</h2>
      <p><strong>Recommended Sarees:</strong> Fluid Georgette, Satin Silk, Sequined Net.<br />Style with contemporary blouses in dark shades like midnight black, plum, or metallic silver.</p>

      <h2 id="casual-saree">5. Everyday Casual Outings</h2>
      <p><strong>Recommended Sarees:</strong> Lightweight Mulmul Cotton, Printed Chiffon.<br />Easy to drape, quick to wash, and breezy for daily errands or coffee catch-ups.</p>
    `,
    coverImage: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=80',
    author: { name: 'Aisha Nair', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80', bio: 'Senior Fashion Editor' },
    publishedAt: '2026-08-25',
    category: 'Occasion Wear',
    tags: ['Occasion Wear', 'Weddings', 'Office Sarees', 'Party Wear'],
    viewCount: 3840,
    readTime: '6 min read',
  },
  {
    id: 'b4',
    slug: 'saree-fabric-guide-which-fabric-is-right-for-you',
    title: 'Saree Fabric Guide: Which Fabric Is Right for You?',
    excerpt: 'Confused between Organza, Georgette, Silk, and Cotton? Explore our ultimate saree fabric guide to choose the ideal fabric for your comfort and style.',
    content: `
      <h2 id="fabric-guide">Understanding Saree Fabrics & Drapes</h2>
      <p>The fabric of your saree dictates its drape, fall, volume, and suitability for different seasons. Here is a breakdown of popular saree fabrics available at NIAKYLIE:</p>

      <h2 id="cotton-fabric">Cotton</h2>
      <p>Natural, highly breathable, holds pleats crisp and firm. Ideal for hot weather and everyday wear.</p>

      <h2 id="silk-fabric">Pure Silk & Art Silk</h2>
      <p>Lustrous, regal, and durable. Perfect for heirloom collections, weddings, and formal rituals.</p>

      <h2 id="georgette-fabric">Georgette</h2>
      <p>Lightweight, slightly crinkled texture that hugs curves gracefully. Excellent for fluid drapes and slim silhouettes.</p>

      <h2 id="chiffon-fabric">Chiffon</h2>
      <p>Ultra-sheer, soft, and airy. Drapes like a dream with minimal bulk around the waist.</p>

      <h2 id="organza-fabric">Organza</h2>
      <p>Crisp, structured, and sheer with a subtle sheen. Adds regal volume and structure to your outfit.</p>

      <h2 id="linen-fabric">Linen</h2>
      <p>Eco-friendly, moisture-wicking, with a sophisticated textured weave that softens with every wash.</p>

      <h2 id="satin-fabric">Satin & Crepe</h2>
      <p>Smooth, glossy surface with a luxurious heavy fall. Perfect for evening partywear.</p>
    `,
    coverImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
    author: { name: 'NIAKYLIE Fabric Desk', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80', bio: 'Textile Specialists' },
    publishedAt: '2026-08-20',
    category: 'Saree Fabrics',
    tags: ['Fabric Guide', 'Organza', 'Georgette', 'Cotton', 'Silk'],
    viewCount: 5210,
    readTime: '5 min read',
  },
  {
    id: 'b5',
    slug: 'traditional-vs-modern-saree-styling',
    title: 'Traditional vs Modern Saree Styling',
    excerpt: 'Can a traditional saree look modern? Absolutely. Explore how the right blouse, jewellery, draping style and accessories can completely change the personality of a saree.',
    content: `
      <h2 id="fusion-styling">Merging Heritage Weaves with Contemporary Trends</h2>
      <p>You don't need to buy a new saree to get a fresh look. The magic lies in how you mix traditional craftsmanship with modern styling choices.</p>

      <h2 id="blouse-transform">1. Blouse Transformation</h2>
      <p>Traditional: Round neck elbow-sleeve silk blouse.<br />Modern: Off-shoulder corset top, denim jacket, or high-neck turtleneck knit sweater for winter.</p>

      <h2 id="draping-twist">2. Draping Twist</h2>
      <p>Traditional: Classic Nivi drape over left shoulder.<br />Modern: Belted drape with pleated pallu tucked neatly into a sleek leather or embroidered belt.</p>

      <h2 id="jewellery-pairing">3. Jewellery Pairing</h2>
      <p>Traditional: Temple gold sets and heavy kundan neckpieces.<br />Modern: Layered delicate chain necklaces, cuff bracelets, and minimalist geometric studs.</p>
    `,
    coverImage: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
    author: { name: 'NIAKYLIE Styling Team', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=100&q=80', bio: 'Style Consultants' },
    publishedAt: '2026-08-15',
    category: 'Saree Styling',
    tags: ['Fusion Fashion', 'Traditional', 'Modern Drape', 'Accessories'],
    viewCount: 2980,
    readTime: '4 min read',
  },
  {
    id: 'b6',
    slug: '7-saree-draping-styles-every-woman-should-try',
    title: '7 Saree Draping Styles Every Woman Should Try',
    excerpt: 'Transform your saree look with these 7 classic and modern draping styles — from Nivi and Gujarati to Pant-Style and Belted drapes.',
    content: `
      <h2 id="7-drapes">7 Unique Ways to Drape a Saree</h2>

      <h2 id="nivi-drape">1. Nivi Drape (The Classic)</h2>
      <p>The universal drape where pleats are tucked at the center and pallu draped over the left shoulder.</p>

      <h2 id="gujarati-drape">2. Gujarati / Seedha Pallu Drape</h2>
      <p>Pallu is brought from back to front over the right shoulder, highlighting rich pallu embroidery.</p>

      <h2 id="bengali-drape">3. Bengali Style Drape</h2>
      <p>Box pleats with pallu draped over left shoulder, then brought under right arm and pinned back over left shoulder with a key ring ornament.</p>

      <h2 id="nauvari-drape">4. Nauvari / Maharashtrian Drape</h2>
      <p>Draped through legs like a dhoti, offering freedom of movement without a petticoat.</p>

      <h2 id="pant-drape">5. Pant-Style Drape</h2>
      <p>Drape pleats around fitted pants or leggings instead of a petticoat for an ultra-chic runway look.</p>

      <h2 id="belted-drape">6. Belted Saree Drape</h2>
      <p>Pin pallu neatly and cinch the waist with a metallic or cloth belt for a structured silhouette.</p>

      <h2 id="lehenga-drape">7. Pre-Draped / Lehenga Drape</h2>
      <p>Pleat pallu into soft gathers like a skirt and drape around waist for a quick lehenga-like appearance.</p>
    `,
    coverImage: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
    author: { name: 'Kavya Menon', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=100&q=80', bio: 'Fashion Stylist' },
    publishedAt: '2026-08-10',
    category: 'Saree Styling',
    tags: ['Draping Guide', 'Nivi Drape', 'Pant Style', 'Gujarati Drape'],
    viewCount: 4430,
    readTime: '6 min read',
  },
  {
    id: 'b7',
    slug: 'how-to-choose-right-blouse-for-your-saree',
    title: 'How to Choose the Right Blouse for Your Saree',
    excerpt: 'A blouse can make or break your saree look. Learn how to pair statement blouses with plain sarees, contrast colors, necklines, and sleeve patterns.',
    content: `
      <h2 id="blouse-pairing">Mastering the Art of Blouse Pairing</h2>
      <p>The right blouse enhances the grace of a saree. Follow these NIAKYLIE rules for effortless pairing:</p>

      <h2 id="rule-1">Rule 1: Plain Saree → Statement Blouse</h2>
      <p>Pair solid chiffon or georgette sarees with heavily embroidered, sequined, or mirror-work blouses.</p>

      <h2 id="rule-2">Rule 2: Heavy Saree → Simple Elegant Blouse</h2>
      <p>Let a rich Banarasi silk saree shine by pairing it with a clean raw silk or satin blouse in a contrasting tone.</p>

      <h2 id="rule-3">Rule 3: Printed Saree → Solid Color Blouse</h2>
      <p>Pick the dominant accent shade from the printed saree pattern for your solid blouse.</p>

      <h2 id="rule-4">Rule 4: Play with Necklines & Sleeves</h2>
      <p>Sweetheart necklines for festive glam, boat necks for corporate sophistication, and deep V-backs for wedding receptions.</p>
    `,
    coverImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
    author: { name: 'NIAKYLIE Design Team', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80', bio: 'Couture Designers' },
    publishedAt: '2026-08-05',
    category: 'Saree Guide',
    tags: ['Blouse Guide', 'Necklines', 'Contrast Blouse', 'Saree Styling'],
    viewCount: 3710,
    readTime: '5 min read',
  },
  {
    id: 'b8',
    slug: 'saree-colours-how-to-choose-right-shade',
    title: 'Saree Colours: How to Choose the Right Shade',
    excerpt: 'Explore the magic of saree colors — from royal reds and festive golds to serene pastels and elegant blacks for every celebration.',
    content: `
      <h2 id="colour-mood">Choosing Saree Shades for Mood & Atmosphere</h2>
      <p>Color creates instant visual impact. Here is how to select the right shade for your next event:</p>

      <h2 id="red-maroon">Red & Maroon</h2>
      <p>Symbol of tradition, passion, and bridal radiance. Perfect for weddings and auspicious pujas.</p>

      <h2 id="yellow-mustard">Yellow & Mustard</h2>
      <p>Vibrant, joyful, and radiant. Ideal for Haldi ceremonies and daytime festive events.</p>

      <h2 id="pastels">Pastel Pink, Lavender & Peach</h2>
      <p>Soft, dreamy, and modern. Outstanding for summer outdoor events and baby showers.</p>

      <h2 id="green-blue">Emerald Green & Royal Blue</h2>
      <p>Regal, deep, and luxurious. Perfect for evening receptions and sangeet nights.</p>

      <h2 id="black-silver">Black & Metallic Silver</h2>
      <p>Sleek, glamorous, and contemporary for cocktail parties and evening galas.</p>
    `,
    coverImage: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
    author: { name: 'Aisha Nair', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80', bio: 'Trend Analyst' },
    publishedAt: '2026-08-01',
    category: 'Trending Sarees',
    tags: ['Saree Colors', 'Festive Shades', 'Pastels', 'Bridal Red'],
    viewCount: 2890,
    readTime: '4 min read',
  },
  {
    id: 'b9',
    slug: 'how-to-take-care-of-your-sarees',
    title: 'How to Take Care of Your Sarees',
    excerpt: 'Maintain the longevity, shine, and zari of your precious sarees with our expert care, folding, washing, and storage guide.',
    content: `
      <h2 id="saree-care">Preserving Your Saree Treasures for Years</h2>
      <p>Your sarees are investment pieces and family heirlooms. Protect them with these essential maintenance steps:</p>

      <h2 id="muslin-storage">1. Storage in Breathable Muslin Cloth</h2>
      <p>Never store silk sarees in plastic bags as trapped moisture causes fabric yellowing and mold. Wrap each silk saree in pure cotton or muslin cloth bags.</p>

      <h2 id="refolding">2. Periodic Refolding</h2>
      <p>Refold your stored silk and organza sarees every 3 months along different fold lines to prevent permanent crease wear or fiber breakage along zari borders.</p>

      <h2 id="washing-guide">3. Washing Guidelines</h2>
      <p>Dry-clean Banarasi, Kanjivaram, Organza, and silk sarees. Wash lightweight cottons and chiffons gently by hand in cold water with mild detergent.</p>

      <h2 id="zari-care">4. Zari Care</h2>
      <p>Keep perfumes, hairsprays, and alcohol-based deodorants away from zari work as chemical sprays cause real metallic threads to tarnish.</p>
    `,
    coverImage: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
    author: { name: 'NIAKYLIE Care Desk', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80', bio: 'Textile Preservation Team' },
    publishedAt: '2026-07-28',
    category: 'Saree Care',
    tags: ['Saree Care', 'Silk Storage', 'Zari Maintenance', 'Washing Tips'],
    viewCount: 5740,
    readTime: '5 min read',
  },
  {
    id: 'b10',
    slug: 'why-we-started-niakylie-women-collection',
    title: 'Why We Started NIAKYLIE Women Collection',
    excerpt: 'The story behind NIAKYLIE — built with a simple vision to bring high-quality, stylish sarees to every woman through our Raipur store and online platforms.',
    content: `
      <h2 id="niakylie-dream">The NIAKYLIE Dream</h2>
      <p>NIAKYLIE Women Collection started with a simple idea — to make beautiful, stylish, and versatile sarees accessible to every woman without compromising on quality or authentic craftsmanship.</p>

      <h2 id="raipur-store">Our Roots in Raipur, Chhattisgarh</h2>
      <p>We opened our physical boutique store in <strong>Sarora, Raipur, Chhattisgarh</strong> to connect directly with local saree lovers, offering curated collections that celebrate every occasion.</p>

      <h2 id="online-community">Building Our Online Community</h2>
      <p>To reach saree enthusiasts across India and globally, we built our digital storefront (niakylie.com) and active social media presence on Instagram, Facebook, and WhatsApp.</p>
      <p>We are a growing brand, and every customer, order, message, and piece of feedback is an important part of our journey. Thank you for making NIAKYLIE a part of your celebrations!</p>
    `,
    coverImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80',
    author: { name: 'NIAKYLIE Founder', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80', bio: 'Founder & Visionary' },
    publishedAt: '2026-07-15',
    category: 'NIAKYLIE Stories',
    tags: ['Brand Story', 'NIAKYLIE', 'Raipur Boutique', 'Our Journey'],
    viewCount: 6890,
    readTime: '4 min read',
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
      const res: any = await apiClient.get('/cms/faqs');
      let list: FaqItem[] = [];
      if (Array.isArray(res)) {
        list = res;
      } else if (res && typeof res === 'object') {
        Object.values(res).forEach((items: any) => {
          if (Array.isArray(items)) list.push(...items);
        });
      }
      if (list.length > 0) {
        return list.map((f: any) => ({
          ...f,
          id: f._id || f.id,
          displayOrder: f.displayOrder ?? 0,
          isActive: f.isActive !== false,
        }));
      }
      return MOCK_FAQS;
    } catch (error) {
      return MOCK_FAQS;
    }
  },

  getAdminFaqs: async (): Promise<FaqItem[]> => {
    try {
      const res: any = await apiClient.get('/cms/admin/faqs');
      let list: FaqItem[] = [];
      if (Array.isArray(res)) {
        list = res;
      } else if (res && typeof res === 'object') {
        Object.values(res).forEach((items: any) => {
          if (Array.isArray(items)) list.push(...items);
        });
      }
      return list.map((f: any) => ({
        ...f,
        id: f._id || f.id,
        displayOrder: f.displayOrder ?? 0,
        isActive: f.isActive !== false,
      }));
    } catch (error) {
      return MOCK_FAQS;
    }
  },

  createFaq: async (dto: Partial<FaqItem>): Promise<FaqItem> => {
    const res = await apiClient.post<FaqItem>('/cms/admin/faqs', dto);
    return { ...res, id: (res as any)._id || res.id };
  },

  updateFaq: async (id: string, dto: Partial<FaqItem>): Promise<FaqItem> => {
    const res = await apiClient.put<FaqItem>(`/cms/admin/faqs/${id}`, dto);
    return { ...res, id: (res as any)._id || res.id };
  },

  deleteFaq: async (id: string): Promise<void> => {
    await apiClient.delete(`/cms/admin/faqs/${id}`);
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

  subscribeNewsletter: async (payload: { email?: string; phone?: string; source?: string }): Promise<{ message: string }> => {
    return await apiClient.post('/cms/subscribe', payload);
  },
};
