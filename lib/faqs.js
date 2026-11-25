/**
 * Store FAQs (client-provided wording), grouped for the /faqs page and emitted
 * as FAQPage JSON-LD. `link` only adds a helpful next step in the UI.
 */
export const FAQ_GROUPS = [
  {
    id: 'ordering',
    title: 'Ordering & payment',
    items: [
      {
        q: "What payment methods do you accept?",
        a: "We accept all major credit/debit cards, UPI, net banking, and digital wallets. Payment is processed securely through our payment gateway.",
      },
      {
        q: "Can I cancel my order?",
        a: "Yes, you can cancel your order before it's dispatched. Once dispatched, you cannot cancel but you can refuse delivery and contact us for a return.",
      },
      {
        q: "Do you offer bulk orders for offices/events?",
        a: "Yes! We offer special pricing for bulk orders. Contact our sales team at bulk@vrikshvalley.com for customized quotes and arrangements.",
        link: { href: 'https://wa.me/919204745612?text=I%20am%20interested%20in%20bulk%20orders', label: 'Ask about corporate orders' },
      },
    ],
  },
  {
    id: 'delivery',
    title: 'Delivery & tracking',
    items: [
      {
        q: "What is your delivery timeframe?",
        a: "Delivery typically takes 3-7 business days depending on your location. Metro cities receive orders within 3-4 days, while remote areas may take up to 7 days.",
      },
      {
        q: "Do you offer free delivery?",
        a: "Yes! We offer free delivery on all orders. No minimum order value required.",
      },
      {
        q: "How do I track my order?",
        a: "Once your order is shipped, you'll receive a tracking number via email and SMS. You can use this to track your order on our Track Order page or directly on the courier's website.",
        link: { href: '/track-order', label: 'Track an order' },
      },
      {
        q: "What if my plant arrives damaged?",
        a: "We take great care in packaging, but if your plant arrives damaged, please contact us within 24 hours with photos. We'll arrange a replacement or full refund immediately.",
      },
    ],
  },
  {
    id: 'care',
    title: 'Plant care & advice',
    items: [
      {
        q: "Do you provide care instructions?",
        a: "Absolutely! Each plant comes with detailed care instructions including watering schedule, sunlight requirements, and maintenance tips.",
      },
      {
        q: "Do you offer plant consultation services?",
        a: "Yes! Our experts are available via phone, email, and WhatsApp to help you choose the right plants and provide ongoing care advice.",
        link: { href: '/plant-doctor', label: 'Open Plant Doctor' },
      },
      {
        q: "Are your plants pet-friendly?",
        a: "We have a special collection of pet-safe plants. Each product page indicates if a plant is toxic to pets. Contact us for personalized recommendations.",
      },
    ],
  },
];

export const ALL_FAQS = FAQ_GROUPS.flatMap((g) => g.items);
