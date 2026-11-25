/**
 * Customer reviews, keyed by product slug.
 *
 * Add reviews from real customers (including in-store customers) here. Each
 * entry shows on the product page, and the average rating and count show on
 * product cards (Featured, Premium, New Arrivals, shop grids) and in Google's
 * product data. Products with no entries show no stars.
 *
 * Fields:
 *   name    Customer's name as they agreed to have it shown (e.g. "Riya S.")
 *   rating  1 to 5
 *   text    Their comment, in their words (optional: star-only reviews are fine)
 *   date    "YYYY-MM-DD"
 *   source  "In-store" or "Online"
 *
 * Example:
 *   "snake-plant": [
 *     { name: "Riya S.", rating: 5, text: "Thriving in my bedroom corner.", date: "2026-10-12", source: "In-store" },
 *     { name: "Arjun M.", rating: 4, date: "2026-11-02", source: "In-store" },
 *   ],
 */
export const REVIEWS = {};

export function getReviews(slug) {
  return (REVIEWS[slug] || []).filter((r) => r && r.rating >= 1 && r.rating <= 5);
}

/** { average, count } or null when the product has no reviews. */
export function getReviewSummary(slug) {
  const list = getReviews(slug);
  if (list.length === 0) return null;
  const average = list.reduce((sum, r) => sum + Number(r.rating), 0) / list.length;
  return { average: Math.round(average * 10) / 10, count: list.length };
}
