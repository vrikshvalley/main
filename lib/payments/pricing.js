import { crossedOutPrice, getOfferForProduct } from "../offers.js";

/**
 * Server-side cart pricing. The browser only says WHICH products and how
 * many; prices, offers and totals are always worked out here from catalogue
 * data. All money is handled in integer paise to avoid rounding drift.
 *
 * `getProduct(id)` is injected (Firestore in production, a stub in tests) and
 * must resolve to the product object or null.
 */

export const MAX_LINE_QUANTITY = 50;
export const MAX_LINES = 50;

export class PricingError extends Error {
  constructor(message, code = "PRICING_ERROR") {
    super(message);
    this.code = code;
  }
}

const toPaise = (rupees) => Math.round(Number(rupees) * 100);

function variantPrice(product, label) {
  if (!label || !Array.isArray(product.variants)) return null;
  const match = product.variants.find((v) => v && (v.label === label || v.name === label || v.id === label));
  return match ? Number(match.price) : null;
}

/**
 * @param {Array<{id: string, quantity: number, variant?: string}>} items
 * @param {(id: string) => Promise<object|null>} getProduct
 * @param {{ now?: Date, freeShipping?: boolean }} [opts]
 */
export async function priceCart(items, getProduct, { now = new Date(), freeShipping = true } = {}) {
  if (!Array.isArray(items) || items.length === 0) throw new PricingError("Your cart is empty", "EMPTY_CART");
  if (items.length > MAX_LINES) throw new PricingError("Too many items in one order", "TOO_MANY_LINES");

  // Merge duplicate lines (same product + variant) so stock checks are per product.
  const merged = new Map();
  for (const raw of items) {
    const id = typeof raw?.id === "string" || typeof raw?.id === "number" ? String(raw.id) : "";
    const quantity = Number(raw?.quantity ?? raw?.qty);
    const variant = raw?.variant ? String(raw.variant).slice(0, 80) : null;
    const size = raw?.size ? String(raw.size).slice(0, 80) : null;
    const color = raw?.color ? String(raw.color).slice(0, 80) : null;
    if (!id || !Number.isInteger(quantity) || quantity < 1 || quantity > MAX_LINE_QUANTITY) {
      throw new PricingError("Invalid cart item", "INVALID_ITEM");
    }
    // A line is the product plus its chosen options (a Large and a Small are two lines).
    const key = `${id}::${variant || ""}::${size || ""}::${color || ""}`;
    const prev = merged.get(key);
    const nextQty = (prev?.quantity || 0) + quantity;
    if (nextQty > MAX_LINE_QUANTITY) {
      throw new PricingError("Too many of one item in an order", "TOO_MANY");
    }
    merged.set(key, { id, variant, size, color, quantity: nextQty });
  }

  const lines = [];
  const demandByProduct = new Map();

  for (const { id, variant, size, color, quantity } of merged.values()) {
    const product = await getProduct(id);
    if (!product) throw new PricingError("A product in your cart is no longer available", "NOT_FOUND");
    if (product.priceOnCustomization) {
      throw new PricingError(`${product.name} is priced on request; please order it on WhatsApp`, "PRICE_ON_REQUEST");
    }

    // Chosen size / colour must be one the product really offers (they don't change the price,
    // but the team packs from them). A value sent for a product with no such option is ignored.
    const pick = (value, list, label) => {
      const options = (Array.isArray(list) ? list : []).filter(Boolean).map(String);
      if (!value || options.length === 0) return null;
      if (!options.includes(value)) throw new PricingError(`${product.name}: that ${label} is not available`, "INVALID_OPTION");
      return value;
    };
    const chosenSize = pick(size, product.sizes, "size");
    const chosenColor = pick(color, product.colors, "colour");

    let chosenVariant = null;
    let regular = Number(product.price);
    if (variant && Array.isArray(product.variants) && product.variants.length > 0) {
      const vp = variantPrice(product, variant);
      if (vp === null) {
        throw new PricingError(`${product.name}: that variant is not available`, "INVALID_OPTION");
      }
      chosenVariant = variant;
      regular = vp;
    }
    const offer = getOfferForProduct(product, now, regular);
    const unit = regular;
    const crossedOut = crossedOutPrice(regular, offer);
    if (!Number.isFinite(unit) || unit <= 0) {
      throw new PricingError(`${product.name || "A product"} has no valid price`, "NO_PRICE");
    }

    demandByProduct.set(id, (demandByProduct.get(id) || 0) + quantity);
    const stock = Number(product.stock);
    if (Number.isFinite(stock) && demandByProduct.get(id) > stock) {
      throw new PricingError(
        stock > 0 ? `Only ${stock} of ${product.name} left in stock` : `${product.name} is out of stock`,
        "OUT_OF_STOCK"
      );
    }

    const unitPaise = toPaise(unit);
    lines.push({
      productId: id,
      name: String(product.name || "Product"),
      image: Array.isArray(product.images) ? product.images[0]?.url || product.images[0] || null : null,
      variant: chosenVariant,
      size: chosenSize,
      color: chosenColor,
      quantity,
      unitPaise,
      regularPaise: toPaise(crossedOut),
      lineTotalPaise: unitPaise * quantity,
      offerId: offer?.id || null,
      weightGrams: Number(product.weightGrams) > 0 ? Number(product.weightGrams) : null,
    });
  }

  const subtotalPaise = lines.reduce((s, l) => s + l.lineTotalPaise, 0);
  const savingsPaise = lines.reduce((s, l) => s + (l.regularPaise - l.unitPaise) * l.quantity, 0);
  // Free shipping: product prices already include delivery, so nothing is added.
  // (A paid-shipping mode would need a server-side courier quote here.)
  if (!freeShipping) throw new PricingError("Paid shipping is not supported", "SHIPPING_MODE");
  const shippingPaise = 0;
  const totalPaise = subtotalPaise + shippingPaise;

  if (totalPaise < 100) throw new PricingError("Order total is too low", "TOO_LOW"); // Razorpay minimum ₹1

  return { lines, subtotalPaise, savingsPaise, shippingPaise, totalPaise, currency: "INR" };
}

/** Price a fixed-price service (e.g. Plant Doctor) from the server price list. */
export function priceService(serviceId, servicePrices) {
  if (typeof serviceId !== "string" || !Object.hasOwn(servicePrices, serviceId)) {
    throw new PricingError("Unknown service", "UNKNOWN_SERVICE");
  }
  const unitPaise = toPaise(servicePrices[serviceId]);
  return {
    lines: [{ productId: serviceId, name: serviceId, image: null, variant: null, quantity: 1, unitPaise, regularPaise: unitPaise, lineTotalPaise: unitPaise, offerId: null, weightGrams: null }],
    subtotalPaise: unitPaise,
    savingsPaise: 0,
    shippingPaise: 0,
    totalPaise: unitPaise,
    currency: "INR",
  };
}
