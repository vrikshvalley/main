/**
 * Store-wide commerce settings.
 *
 * - Shipping is FREE: product prices already include delivery, so the front end
 *   never adds a shipping charge.
 * - Direct (online) payment is coming soon. Until it is switched on, orders are
 *   placed over WhatsApp as a temporary backup. To go live, set
 *   NEXT_PUBLIC_ONLINE_PAYMENTS=true (and the Razorpay keys) in the environment;
 *   the checkout / pay buttons appear automatically.
 */
export const FREE_SHIPPING = true;

export const ONLINE_PAYMENTS_ENABLED = process.env.NEXT_PUBLIC_ONLINE_PAYMENTS === 'true';

export const PAYMENTS_COMING_SOON = 'Direct online payment is coming soon. Until then, place your order on WhatsApp.';
