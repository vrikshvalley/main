/**
 * Store offers: the single source of truth for every discount on the site.
 *
 * A product's regular price is its catalogue price. When an active offer
 * matches it, the customer is charged the offer price everywhere: product
 * cards, the product page, the cart, the WhatsApp order message and the
 * server-side payment amount. The struck-through price shown next to it is the
 * real regular price, and each countdown ends when the offer really ends.
 *
 * Edit, add or remove offers here. Dates are India time (+05:30).
 * If several offers match one product, the biggest discount applies (no stacking).
 *
 * `cycleDays` makes an offer repeat: it runs for its startsAt..endsAt length, then
 * comes back every `cycleDays` days, so the shop never runs out of offers. Offers will be
 * managed from the admin panel later; until then, edit this list.
 */
export const OFFERS = [
  {
    id: "featured-favourites",
    title: "Featured Favourites",
    tagline: "Our most-loved plants, at their best price this season.",
    discountPercent: 15,
    badge: "15% OFF",
    match: { featured: true },
    href: "/offers#featured-favourites",
    startsAt: "2026-11-24T00:00:00+05:30",
    endsAt: "2026-12-01T23:59:59+05:30",
    cycleDays: 21,
  },
  {
    id: "premium-picks",
    title: "Premium Picks",
    tagline: "Statement plants and planters from ₹500, now 10% off.",
    discountPercent: 10,
    badge: "10% OFF",
    match: { minPrice: 500 },
    href: "/offers#premium-picks",
    startsAt: "2026-11-24T00:00:00+05:30",
    endsAt: "2026-12-07T23:59:59+05:30",
    cycleDays: 28,
  },
  {
    id: "seed-starter",
    title: "Seed Starter Sale",
    tagline: "Grow your own herbs, greens and flowers. 20% off all seeds.",
    discountPercent: 20,
    badge: "20% OFF",
    match: { category: "Seeds" },
    href: "/offers#seed-starter",
    startsAt: "2026-11-24T00:00:00+05:30",
    endsAt: "2026-12-14T23:59:59+05:30",
    cycleDays: 30,
  },
  {
    id: "planter-week",
    title: "Planter Week",
    tagline: "Give your plants a better home. 12% off every planter.",
    discountPercent: 12,
    badge: "12% OFF",
    match: { category: "Planters" },
    href: "/offers#planter-week",
    startsAt: "2026-11-24T00:00:00+05:30",
    endsAt: "2026-12-04T23:59:59+05:30",
    cycleDays: 24,
  },
];

const basePriceOf = (product) => {
  const p = Number(product?.price ?? product?.variants?.[0]?.price);
  return Number.isFinite(p) ? p : 0;
};

/** The occurrence of an offer that is current (or next up), shifting repeating offers forward. */
export function resolveOffer(offer, now = new Date()) {
  if (!offer.cycleDays) return offer;
  const start = new Date(offer.startsAt).getTime();
  const end = new Date(offer.endsAt).getTime();
  const cycle = offer.cycleDays * 86_400_000;
  if (now.getTime() < start || cycle < end - start) return offer;
  const k = Math.floor((now.getTime() - start) / cycle);
  return { ...offer, startsAt: new Date(start + k * cycle).toISOString(), endsAt: new Date(end + k * cycle).toISOString() };
}

export function isOfferActive(offer, now = new Date()) {
  const o = resolveOffer(offer, now);
  const start = o.startsAt ? new Date(o.startsAt) : null;
  return (!start || now >= start) && now < new Date(o.endsAt);
}

export function getActiveOffers(now = new Date()) {
  return OFFERS.filter((o) => isOfferActive(o, now))
    .map((o) => resolveOffer(o, now))
    .sort((a, b) => new Date(a.endsAt) - new Date(b.endsAt));
}

export function getOfferById(id) {
  const o = OFFERS.find((x) => x.id === id);
  return o ? resolveOffer(o) : null;
}

export function offerMatchesProduct(offer, product, unitPrice) {
  if (!product || product.priceOnCustomization) return false;
  const m = offer.match || {};
  if (m.featured && !product.featured) return false;
  if (m.category && String(product.category || "").toLowerCase() !== m.category.toLowerCase()) return false;
  const priceToCheck = Number.isFinite(Number(unitPrice)) ? Number(unitPrice) : basePriceOf(product);
  if (m.minPrice && priceToCheck < m.minPrice) return false;
  if (m.slugs && !m.slugs.includes(product.slug)) return false;
  return true;
}

/** The best active offer for a product, or null. */
export function getOfferForProduct(product, now = new Date(), unitPrice) {
  let best = null;
  for (const offer of getActiveOffers(now)) {
    if (offerMatchesProduct(offer, product, unitPrice) && (!best || offer.discountPercent > best.discountPercent)) {
      best = offer;
    }
  }
  return best;
}

/** Higher crossed-out reference price when an offer is active (marketing anchor). */
export function crossedOutPrice(price, offer) {
  const p = Number(price) || 0;
  if (!offer || !offer.discountPercent || offer.discountPercent >= 100) return p;
  return Math.round(p / (1 - offer.discountPercent / 100));
}

/** Selling price stays the exact Firestore price. */
export function applyOffer(price) {
  return Number(price) || 0;
}

/** { price, regularPrice, offer } where `price` is the exact Firestore price and `regularPrice` is the crossed-out anchor. */
export function priceWithOffer(product, firestorePrice = basePriceOf(product), now = new Date()) {
  const p = Number(firestorePrice) || 0;
  const offer = getOfferForProduct(product, now, p);
  return { price: p, regularPrice: crossedOutPrice(p, offer), offer };
}
