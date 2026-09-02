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
    lastUpdated: '2026-09-02',
    content: `
      <p class="text-sm text-slate-600 leading-relaxed mb-6">
        Welcome to <strong>NIAKYLIE Women Collection</strong>. We respect your privacy and are committed to protecting the personal information you share with us.
      </p>
      <p class="text-sm text-slate-600 leading-relaxed mb-6">
        This Privacy Policy explains how NIAKYLIE Women Collection ("NIAKYLIE", "we", "us", or "our") collects, uses, stores, and protects your information when you visit or use our website <strong>niakylie.com</strong>, contact us, or purchase our products.
      </p>

      <h2 id="information-we-collect">1. Information We Collect</h2>
      <p>Depending on how you interact with us, we may collect the following information:</p>

      <h3 class="text-base font-extrabold text-brand-slate-dark mt-4 mb-2">Personal Information</h3>
      <p>When you contact us, place an order, or make an enquiry, we may collect:</p>
      <ul class="list-disc pl-5 space-y-1 mb-4">
        <li>Full name</li>
        <li>Mobile/WhatsApp number</li>
        <li>Email address</li>
        <li>Delivery address</li>
        <li>Billing address, where applicable</li>
        <li>Order and purchase details</li>
        <li>Information you provide when contacting us</li>
      </ul>

      <h3 class="text-base font-extrabold text-brand-slate-dark mt-4 mb-2">Technical Information</h3>
      <p>When you visit our website, certain technical information may be collected automatically, such as:</p>
      <ul class="list-disc pl-5 space-y-1 mb-4">
        <li>IP address</li>
        <li>Browser type</li>
        <li>Device type</li>
        <li>Operating system</li>
        <li>Pages visited</li>
        <li>Date and time of your visit</li>
        <li>General website usage information</li>
      </ul>
      <p>This information helps us understand how visitors use our website and improve our services.</p>

      <h2 id="how-we-use-your-information">2. How We Use Your Information</h2>
      <p>We may use your information to:</p>
      <ul class="list-disc pl-5 space-y-1 mb-4">
        <li>Process and fulfill your orders</li>
        <li>Communicate with you about your orders or enquiries</li>
        <li>Respond to customer support requests</li>
        <li>Provide information about our sarees and collections</li>
        <li>Send promotional or marketing communications when permitted</li>
        <li>Improve our website, products, and customer experience</li>
        <li>Maintain website security</li>
        <li>Prevent fraud, misuse, or unauthorized activity</li>
        <li>Comply with applicable laws and legal requirements</li>
      </ul>
      <p>We will use your personal information only for legitimate business purposes and in accordance with applicable laws.</p>

      <h2 id="whatsapp-instagram-facebook">3. WhatsApp, Instagram and Facebook</h2>
      <p>Customers may contact NIAKYLIE through WhatsApp, Instagram, Facebook, or other communication platforms.</p>
      <p>When you contact us through these platforms, your information may also be processed according to the privacy policies of the respective platforms.</p>
      <p>Our official Instagram account is: <strong>@niakylie_women_collection</strong></p>
      <p>We may use information you voluntarily provide through these platforms to respond to enquiries, assist with orders, and provide customer service.</p>

      <h2 id="orders-and-payments">4. Orders and Payments</h2>
      <p>If you purchase products from NIAKYLIE, we may collect information necessary to process and fulfill your order.</p>
      <p>If payment is processed through a third-party payment provider, your payment information may be handled directly by that provider. We do not intend to store complete debit card, credit card, banking passwords, or similar sensitive payment credentials on our own systems.</p>
      <p>Third-party payment providers may have their own privacy policies and terms that apply to their services.</p>

      <h2 id="sharing-of-information">5. Sharing of Information</h2>
      <p>We do not sell or rent your personal information to third parties.</p>
      <p>We may share necessary information with trusted service providers when required to operate our business, such as:</p>
      <ul class="list-disc pl-5 space-y-1 mb-4">
        <li>Delivery and logistics partners</li>
        <li>Payment service providers</li>
        <li>Website hosting and technology providers</li>
        <li>Analytics or website service providers</li>
        <li>Customer communication services</li>
        <li>Professional advisers or legal authorities when required by law</li>
      </ul>
      <p>We only intend to share information that is reasonably necessary for the relevant purpose.</p>

      <h2 id="cookies">6. Cookies</h2>
      <p>Our website may use cookies and similar technologies to improve your browsing experience and understand website usage.</p>
      <p>Cookies may help us:</p>
      <ul class="list-disc pl-5 space-y-1 mb-4">
        <li>Keep the website functioning properly</li>
        <li>Remember certain preferences</li>
        <li>Understand website traffic</li>
        <li>Improve website performance</li>
        <li>Measure the effectiveness of marketing activities</li>
      </ul>
      <p>You can manage or disable cookies through your browser settings. However, disabling certain cookies may affect some website functionality.</p>

      <h2 id="marketing-communications">7. Marketing Communications</h2>
      <p>If you provide your contact information and consent to receive promotional communications, we may contact you about:</p>
      <ul class="list-disc pl-5 space-y-1 mb-4">
        <li>New saree collections</li>
        <li>Special offers</li>
        <li>Discounts</li>
        <li>Promotions</li>
        <li>Events</li>
        <li>Other NIAKYLIE updates</li>
      </ul>
      <p>You can request to stop receiving promotional communications at any time by contacting us or using the available unsubscribe option, where applicable.</p>

      <h2 id="data-security">8. Data Security</h2>
      <p>We take reasonable measures to protect your personal information from unauthorized access, misuse, alteration, disclosure, or destruction.</p>
      <p>However, no method of transmitting or storing information online can be guaranteed to be completely secure.</p>

      <h2 id="data-retention">9. Data Retention</h2>
      <p>We retain personal information only for as long as reasonably necessary for the purposes described in this Privacy Policy, including fulfilling orders, providing customer service, maintaining business records, resolving disputes, and complying with legal obligations.</p>
      <p>When information is no longer required, we may delete or securely dispose of it, subject to applicable legal requirements.</p>

      <h2 id="childrens-privacy">10. Children's Privacy</h2>
      <p>Our website and services are not intentionally directed toward children.</p>
      <p>We do not knowingly collect personal information from children without appropriate consent where such consent is required by applicable law.</p>

      <h2 id="third-party-websites">11. Third-Party Websites</h2>
      <p>Our website may contain links to third-party websites or platforms, including social media platforms such as Instagram, Facebook, and WhatsApp.</p>
      <p>We are not responsible for the privacy practices, content, or security of third-party websites. We recommend reviewing the privacy policies of those platforms before providing them with personal information.</p>

      <h2 id="your-privacy-rights">12. Your Privacy Rights</h2>
      <p>Depending on applicable law, you may have rights regarding your personal information, including the right to:</p>
      <ul class="list-disc pl-5 space-y-1 mb-4">
        <li>Request access to personal information we hold about you</li>
        <li>Request correction of inaccurate information</li>
        <li>Request deletion of information where legally applicable</li>
        <li>Withdraw consent where processing is based on consent</li>
        <li>Object to certain uses of your information</li>
        <li>Request information about how your personal information is used</li>
      </ul>
      <p>To make a privacy-related request, please contact us using the details below.</p>

      <h2 id="changes-to-this-privacy-policy">13. Changes to This Privacy Policy</h2>
      <p>We may update this Privacy Policy from time to time to reflect changes in our business, website, services, or applicable laws.</p>
      <p>Any updated version will be posted on this page with a revised "Last Updated" date.</p>

      <h2 id="contact-us">14. Contact Us</h2>
      <p>If you have any questions, concerns, or requests regarding this Privacy Policy or your personal information, please contact us.</p>

      <p class="mt-4"><strong>NIAKYLIE Women Collection</strong></p>
      <p><strong>Address:</strong><br />
      Ward No. 39, Kabir Chaura, Bajar Chauk,<br />
      Sarora, Gondwara Basti,<br />
      Raipur, Chhattisgarh – 493221</p>
      <p><strong>Website:</strong> <a href="https://niakylie.com" target="_blank" class="text-brand-crimson hover:underline">niakylie.com</a><br />
      <strong>Instagram:</strong> <a href="https://www.instagram.com/niakylie_women_collection" target="_blank" class="text-brand-crimson hover:underline">@niakylie_women_collection</a><br />
      <strong>Email:</strong> <a href="mailto:niakylieofficial@gmail.com" class="text-brand-crimson hover:underline">niakylieofficial@gmail.com</a><br />
      <strong>WhatsApp:</strong> <a href="https://wa.me/919589928337" target="_blank" class="text-emerald-600 font-bold hover:underline">+91 95899 28337</a></p>

      <p class="mt-6 pt-4 border-t border-slate-100 text-center font-extrabold text-brand-crimson font-serif text-base">NIAKYLIE Women Collection — Wear Beauty, Feel Beauty.</p>
    `,
  },
  'terms-and-conditions': {
    slug: 'terms-and-conditions',
    title: 'Terms & Conditions',
    lastUpdated: '2026-09-02',
    content: `
      <p class="lead text-base font-semibold text-slate-700 mb-6">
        Welcome to <strong>NIAKYLIE Women Collection</strong>. These Terms & Conditions govern your use of our website <strong>niakylie.com</strong>, your interactions with NIAKYLIE Women Collection, and purchases made through our website, WhatsApp, social media channels, or physical store.
      </p>

      <p class="mb-6">
        By accessing our website or purchasing our products, you agree to these Terms & Conditions. Please read them carefully before using our services.
      </p>

      <h2 id="about-niakylie">1. About NIAKYLIE Women Collection</h2>
      <p>NIAKYLIE Women Collection is a saree-focused fashion brand offering sarees in a variety of fabrics, designs, colors, patterns, and styles.</p>
      <p>Our products are available through our website, social media channels, WhatsApp Business, and physical store.</p>
      <p><strong>Store Address:</strong><br />
      Ward No. 39, Kabir Chaura, Bajar Chauk, Sarora, Gondwara Basti, Raipur, Chhattisgarh – 493221</p>

      <h2 id="use-of-our-website">2. Use of Our Website</h2>
      <p>By using our website, you agree to:</p>
      <ul class="list-disc pl-5 space-y-1 mb-4">
        <li>Use the website only for lawful purposes.</li>
        <li>Provide accurate information when placing an order or making an enquiry.</li>
        <li>Not misuse, damage, or attempt to disrupt the website.</li>
        <li>Not attempt to gain unauthorized access to our website, systems, or data.</li>
        <li>Not copy, reproduce, distribute, or commercially use our website content without permission.</li>
      </ul>
      <p>We reserve the right to restrict or terminate access to the website if we believe it is being misused or used in violation of these Terms.</p>

      <h2 id="product-information">3. Product Information</h2>
      <p>We make reasonable efforts to ensure that product descriptions, images, prices, colors, and other information displayed on our website are accurate.</p>
      <p>However, please note that:</p>
      <ul class="list-disc pl-5 space-y-1 mb-4">
        <li>Actual colors may vary slightly depending on your device's screen.</li>
        <li>Saree patterns, prints, embroidery, borders, or other details may vary slightly from product images.</li>
        <li>Minor variations may occur due to the nature of fabrics and manufacturing processes.</li>
        <li>Product availability may change without prior notice.</li>
      </ul>
      <p>We reserve the right to correct errors, update product information, or discontinue products at any time.</p>

      <h2 id="saree-availability">4. Saree Availability</h2>
      <p>All products are subject to availability.</p>
      <p>Adding a product to your cart, wishlist, or enquiry does not necessarily guarantee that the product will remain available.</p>
      <p>If a product becomes unavailable after you place an enquiry or order, we will contact you and provide the available options.</p>

      <h2 id="product-prices">5. Product Prices</h2>
      <p>Product prices displayed on our website are subject to change without prior notice.</p>
      <p>The final price applicable to your order will be the price confirmed by NIAKYLIE at the time the order is accepted.</p>
      <p>Additional charges such as delivery or applicable taxes, where relevant, may be communicated separately before order confirmation.</p>

      <h2 id="orders">6. Orders</h2>
      <p>Orders may be placed through:</p>
      <ul class="list-disc pl-5 space-y-1 mb-4">
        <li>NIAKYLIE website</li>
        <li>WhatsApp Business</li>
        <li>Instagram</li>
        <li>Facebook</li>
        <li>Physical store</li>
      </ul>
      <p>An order is considered confirmed only after NIAKYLIE confirms the order and any required payment or advance payment has been received.</p>
      <p>We reserve the right to refuse or cancel an order in circumstances including: product unavailability, incorrect pricing or product information, suspected fraudulent activity, incorrect customer information, delivery-related limitations, or other legitimate business reasons.</p>
      <p>If we cancel an order after payment has been received, we will communicate the applicable refund process to the customer.</p>

      <h2 id="payment">7. Payment</h2>
      <p>Depending on the order method, we may accept payment through available payment methods communicated by NIAKYLIE.</p>
      <p>Customers are responsible for providing accurate payment information.</p>
      <p>If a third-party payment provider is used, the payment may also be subject to that provider's terms and conditions.</p>
      <p>NIAKYLIE does not store complete debit card, credit card, banking passwords, or similar sensitive payment credentials on its own systems.</p>

      <h2 id="order-confirmation">8. Order Confirmation</h2>
      <p>After placing an order, you may receive confirmation through WhatsApp, phone, email, SMS, or another communication method provided by you.</p>
      <p>Please check your order details carefully, including product, quantity, price, delivery address, and contact number. If you notice an error, contact us as soon as possible. Once an order has been processed or dispatched, changes or cancellations may not be possible.</p>

      <h2 id="shipping-delivery">9. Shipping & Delivery</h2>
      <p>We aim to process and dispatch confirmed orders within the timeframe communicated at the time of purchase.</p>
      <p>Delivery times may vary depending on delivery location, courier availability, weather conditions, holidays, public events, or operational delays. A delivery estimate is not an absolute guarantee.</p>

      <h2 id="delivery-inspection">10. Delivery Inspection</h2>
      <p>Customers are encouraged to inspect the package and product carefully when received. If the package appears damaged, opened, or tampered with, please document the condition and contact NIAKYLIE as soon as possible.</p>

      <h2 id="returns-exchanges-refunds">11. Returns, Exchanges & Refunds</h2>
      <p>Returns, exchanges, cancellations, and refunds are subject to our separate <strong>Return & Refund Policy</strong>. Please do not send a product back without first contacting NIAKYLIE and receiving return instructions.</p>

      <h2 id="promotional-offers">12. Promotional Offers & Discounts</h2>
      <p>From time to time, NIAKYLIE may offer discounts, promotional campaigns, coupons, or special offers. Each promotion may have its own validity period, eligibility requirements, and limitations. Offers cannot be combined unless explicitly stated.</p>

      <h2 id="promotional-cards-coupons">13. Promotional Cards & Coupons</h2>
      <p>If NIAKYLIE issues a promotional card or coupon, printed terms apply. Promotional cards cannot be exchanged or transferred for cash and may carry expiry dates.</p>

      <h2 id="intellectual-property">14. Intellectual Property</h2>
      <p>All content appearing on the NIAKYLIE website (brand name, logo, photographs, videos, graphics, text, designs, layout, descriptions) is owned by or used by NIAKYLIE Women Collection and protected by applicable intellectual property laws.</p>

      <h2 id="user-generated-content">15. User-Generated Content</h2>
      <p>By submitting reviews, photos, testimonials, or comments, you grant NIAKYLIE permission to use them for legitimate business, marketing, promotional, or social media purposes where permitted by applicable law.</p>

      <h2 id="social-media-whatsapp">16. Social Media & WhatsApp</h2>
      <p>When communicating with us via WhatsApp, Instagram, Facebook, email, or phone, you are also subject to the terms of those third-party platforms.</p>

      <h2 id="third-party-links">17. Third-Party Links</h2>
      <p>Our website may contain links to third-party websites. We do not control third-party websites and are not responsible for their content, availability, security, or privacy practices.</p>

      <h2 id="website-availability">18. Website Availability</h2>
      <p>We make reasonable efforts to keep our website available, but we do not guarantee uninterrupted, error-free operation at all times.</p>

      <h2 id="limitation-of-liability">19. Limitation of Liability</h2>
      <p>To the extent permitted by applicable law, NIAKYLIE Women Collection will not be responsible for losses resulting from circumstances beyond our reasonable control.</p>

      <h2 id="force-majeure">20. Force Majeure</h2>
      <p>NIAKYLIE will not be responsible for delays or failures caused by natural disasters, severe weather, government restrictions, strikes, transport disruptions, internet failures, or unforeseen emergencies.</p>

      <h2 id="privacy">21. Privacy</h2>
      <p>Your use of our website and services is also subject to our <strong>Privacy Policy</strong>.</p>

      <h2 id="changes-to-these-terms">22. Changes to These Terms</h2>
      <p>NIAKYLIE may update these Terms & Conditions from time to time. Updated terms will be published with a revised "Last Updated" date.</p>

      <h2 id="governing-law">23. Governing Law</h2>
      <p>These Terms & Conditions shall be governed by and interpreted in accordance with the applicable laws of India, under the jurisdiction of the appropriate courts.</p>

      <h2 id="contact-us">24. Contact Us</h2>
      <p>If you have questions about these Terms & Conditions, an order, or our services, please contact us:</p>
      <p><strong>NIAKYLIE Women Collection</strong><br />
      Ward No. 39, Kabir Chaura, Bajar Chauk, Sarora, Gondwara Basti, Raipur, Chhattisgarh – 493221<br />
      <strong>Website:</strong> niakylie.com<br />
      <strong>Instagram:</strong> @niakylie_women_collection<br />
      <strong>Email:</strong> niakylieofficial@gmail.com<br />
      <strong>WhatsApp:</strong> +91 95899 28337</p>

      <p class="mt-6 pt-4 border-t border-slate-100 text-center font-extrabold text-brand-crimson font-serif text-base">NIAKYLIE Women Collection — Wear Beauty, Feel Beauty.</p>
    `,
  },
  'refund-policy': {
    slug: 'refund-policy',
    title: 'Refund & Cancellation Policy',
    lastUpdated: '2026-09-02',
    content: `
      <p class="lead text-base font-semibold text-slate-700 mb-6">
        At <strong>NIAKYLIE Women Collection</strong>, we want you to be happy with your purchase. If you receive a product that is eligible for return, you may request a return and refund in accordance with the terms below.
      </p>

      <p class="mb-6">
        This policy applies to purchases made through <strong>niakylie.com</strong>, WhatsApp, social media, or other applicable sales channels of NIAKYLIE Women Collection.
      </p>

      <h2 id="return-refund-eligibility">1. Return & Refund Eligibility</h2>
      <p>We accept returns and refunds within <strong>7 days of delivery</strong> for eligible items.</p>
      <p>To be eligible for a return:</p>
      <ul class="list-disc pl-5 space-y-1 mb-4">
        <li>The return request must be made within <strong>7 days from the date of delivery</strong>.</li>
        <li>The saree must be <strong>unused and unworn</strong>.</li>
        <li>The product must be in its <strong>original condition</strong>.</li>
        <li>The product must be returned in its <strong>original packaging</strong>, where applicable.</li>
        <li>All original tags, labels, accessories, and packaging should be intact.</li>
        <li>The product must not have stains, marks, odors, damage, alterations, or signs of use.</li>
      </ul>
      <p>Products that do not meet these conditions may not be eligible for return or refund.</p>

      <h2 id="products-not-eligible">2. Products Not Eligible for Return</h2>
      <p>Certain products may not be eligible for return or refund due to their nature. Unless otherwise stated by NIAKYLIE, the following may not be eligible:</p>
      <ul class="list-disc pl-5 space-y-1 mb-4">
        <li>Products that have been worn or used</li>
        <li>Products that have been washed or altered</li>
        <li>Products with removed or damaged tags</li>
        <li>Products with stains, makeup marks, perfume smell, or other signs of use</li>
        <li>Products damaged after delivery due to customer handling</li>
        <li>Customized or specially prepared products</li>
        <li>Products specifically identified as <strong>Final Sale / Non-Returnable</strong></li>
      </ul>

      <h2 id="how-to-request-a-return">3. How to Request a Return</h2>
      <p>To request a return, contact NIAKYLIE through our official WhatsApp, email, or customer-support channel within <strong>7 days of delivery</strong>.</p>
      <p>Please provide: Order number, Customer name, Mobile/WhatsApp number, Product name, Reason for return, Clear photographs/videos of the product.</p>
      <p><strong>Please do not send a product back without contacting us first.</strong></p>

      <h2 id="damaged-or-incorrect-product">4. Damaged or Incorrect Product</h2>
      <p>If you receive a damaged, defective, or wrong product, please contact us as soon as possible and preferably within <strong>48 hours of delivery</strong> with clear photos or video showing the product, issue, packaging, and shipping label.</p>
      <p>Resolutions may include: Replacement, Exchange, Refund, or another mutually agreed solution.</p>

      <h2 id="return-shipping">5. Return Shipping</h2>
      <p>For change of mind or personal preference returns, the customer is responsible for return shipping costs. For confirmed damaged, defective, or incorrectly supplied items, NIAKYLIE will arrange or bear the return shipping cost.</p>

      <h2 id="product-inspection">6. Product Inspection</h2>
      <p>All returned products are inspected upon receipt. A refund or replacement will be processed only after successful verification. Ineligible returns may be rejected and sent back at customer expense.</p>

      <h2 id="refund-process">7. Refund Process</h2>
      <p>Once approved and inspected, refunds will be initiated through the original payment method where technically possible. Processing timelines depend on your bank or payment provider.</p>

      <h2 id="shipping-charges">8. Shipping Charges</h2>
      <p>Original shipping charges are non-refundable for preference returns. Return shipping costs may be deducted from the refund where applicable.</p>

      <h2 id="cancellation-policy">9. Cancellation Policy</h2>
      <p>Cancellation requests should be made <strong>before the order is dispatched</strong>. Once dispatched, cancellation is no longer possible and return procedures apply.</p>

      <h2 id="cancellation-after-dispatch">10. Cancellation After Dispatch</h2>
      <p>Orders cannot be cancelled after dispatch. Delivery refusals are treated under standard return and shipping conditions.</p>

      <h2 id="refund-for-cancelled-orders">11. Refund for Cancelled Orders</h2>
      <p>Pre-dispatch cancellations with received payments will be refunded promptly upon cancellation confirmation.</p>

      <h2 id="promotional-discounted-orders">12. Promotional & Discounted Orders</h2>
      <p>Discounts may be adjusted upon refund calculation. Promotional cards or coupons are non-cashable.</p>

      <h2 id="exchange">13. Exchange</h2>
      <p>Exchanges are subject to eligibility and stock availability. Alternatives will be offered if requested replacement is out of stock.</p>

      <h2 id="store-purchases">14. Store Purchases</h2>
      <p>Physical store purchases in Raipur are subject to separate store conditions communicated at the time of purchase.</p>

      <h2 id="contact-us">15. Contact Us</h2>
      <p>For return, refund, exchange, or cancellation requests, contact NIAKYLIE Women Collection:<br />
      <strong>Address:</strong> Ward No. 39, Kabir Chaura, Bajar Chauk, Sarora, Gondwara Basti, Raipur, Chhattisgarh – 493221<br />
      <strong>Website:</strong> niakylie.com<br />
      <strong>Instagram:</strong> @niakylie_women_collection<br />
      <strong>Email:</strong> niakylieofficial@gmail.com<br />
      <strong>WhatsApp:</strong> +91 95899 28337</p>

      <h2 id="policy-updates">16. Policy Updates</h2>
      <p>We may update this policy periodically with a revised "Last Updated" date.</p>

      <p class="mt-6 pt-4 border-t border-slate-100 text-center font-extrabold text-brand-crimson font-serif text-base">NIAKYLIE Women Collection — Wear Beauty, Feel Beauty.</p>
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
