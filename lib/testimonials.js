/**
 * Customer testimonials (real customers, supplied by the business).
 * Used by the homepage section and the /testimonials page.
 */
export const TESTIMONIALS = [
  {
    id: 1,
    name: 'Anindya Chakraborty',
    username: '',
    avatar: '/testimonials/AnindyaChakraborty.webp',
    text: "I am really impressed with the quality of the plants I received. They arrived healthy, well-packed, and settled beautifully into my space. Will definitely order again.",
    rating: 5,
  },
  {
    id: 2,
    name: 'Arka Jyoti Sanyal',
    username: '',
    avatar: '/testimonials/ArkaJyotiSanyal.webp',
    text: 'Highly satisfied with the services and products! Definitely a recommendation for all those people who are into plants and gardening!',
    rating: 5,
  },
  {
    id: 3,
    name: 'Debanko Chakraborty',
    username: '',
    avatar: '/testimonials/DebankoChakraborty.webp',
    text: 'It has a great community, providing diy ways to take care of plants. The plants are genuinely nurtured and taken care of, which pleased me a lot. Best wishes, and I hope it continues the same in the coming future.',
    rating: 5,
  },
  {
    id: 4,
    name: 'Dhiman Datta',
    username: '',
    avatar: '/testimonials/DhimanDatta.webp',
    text: 'Vriksh Valley seems to me a one-stop solution for gardening. The experience was smooth, from ordering till the delivery and post-delivery follow-ups. All thanks to the Vriksh Valley Team.',
    rating: 5,
  },
  {
    id: 5,
    name: 'Manish Kumar Shaw',
    username: '',
    avatar: '/testimonials/ManishKumarShaw.webp',
    text: 'The customer service is fantastic! They helped me choose the best indoor plants for my apartment. Highly recommended for plant lovers!.',
    rating: 5,
  },
  {
    id: 6,
    name: 'Nilanjan Hazarika',
    username: '',
    avatar: '/testimonials/NilanjanHazarika.webp',
    text: 'Picked up a plant from this store and it instantly became the freshest corner of my home. Healthy, well-packed, and clearly chosen with care. Loved the experience!',
    rating: 5,
  },
  {
    id: 7,
    name: 'Riza Ray',
    username: '',
    avatar: '/testimonials/RizaRay.webp',
    text: 'The products and the services provided by Vriksh Valley are commendable. It really brings out the love for your plants with the right product and guidance. Vrisk Valley is definitely the go-to website for my plants and for the gardener in me.',
    rating: 5,
  },
  {
    id: 8,
    name: 'Sarthak Bose',
    username: '',
    avatar: '/testimonials/SarthakBose.webp',
    text: 'Vriksh Valley offers exceptional quality and outstanding customer service. I loved their packaging. Their genuinely well-nurtured plants left me truly impressed.',
    rating: 5,
  },
  {
    id: 9,
    name: 'Sayan Manna',
    username: '',
    avatar: '/testimonials/SayanManna.webp',
    text: 'Loved the quality of the plants. The packaging was actually quite good. I didn\'t expect that from such a fresh business and such a great service. The plants arrived a day early, and I will be recommending you for sure',
    rating: 5,
  },
  {
    id: 10,
    name: 'Shakhya Halder',
    username: '',
    avatar: '/testimonials/ShakhyaHalder.webp',
    text: 'Absolutely love the plants I got! They came well-packaged with detailed care instructions.',
    rating: 5,
  },
  {
    id: 11,
    name: 'Shreya Mondal',
    username: '',
    avatar: '/testimonials/ShreyaMondal.webp',
    text: 'I have purchased from Vriksh Valley and would highly recommend them!! They are a lovely team and never disappoint!??',
    rating: 5,
  },
  {
    id: 12,
    name: 'Sourav Kundu',
    username: '',
    avatar: '/testimonials/SouravKundu.webp',
    text: 'A beautiful little nursery with such fresh, healthy plants! The owner guides you so well. Highly recommended!',
    rating: 5,
  },
  {
    id: 13,
    name: 'Sparsho Sengupta',
    username: '',
    avatar: '/testimonials/SparshoSengupta.webp',
    text: "Really appreciate the support and customer service! Highly recommended if you're looking to add some greenery to your home!!",
    rating: 5,
  },
  {
    id: 14,
    name: 'Suparna Dutta',
    username: '',
    avatar: '/testimonials/SuparnaDutta.webp',
    text: 'With a vast inventory featuring thousands of seedlings, cuttings, grafted varieties, and potted specimens, Vriksh Valley offers the highest quality and consistently delivers the best customer care.',
    rating: 5,
  },
  {
    id: 15,
    name: 'Suvangi Chakraborty',
    username: '',
    avatar: '/testimonials/SuvangiChakraborty.webp',
    text: 'Vriksh Valley has an amazing variety of high-quality plants. Highly recommended for anyone looking to enhance their home or garden. A growing nursery that truly deserves more recognition.',
    rating: 5,
  },
];

/** Summary computed from the list above, so the page never shows made-up numbers. */
export function testimonialStats(list = TESTIMONIALS) {
  const rated = list.filter((t) => typeof t.rating === 'number');
  const average = rated.length ? rated.reduce((s, t) => s + t.rating, 0) / rated.length : null;
  return { count: list.length, average, fiveStar: rated.filter((t) => t.rating === 5).length };
}
