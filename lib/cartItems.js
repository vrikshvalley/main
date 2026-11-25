import { priceWithOffer } from "./offers.js";

/**
 * Pure cart helpers (no browser / Firebase imports, so they are unit-tested).
 *
 * A cart LINE is a product plus the options the shopper chose, so a Large and a
 * Small of the same pot are two lines:
 *   key = id                                  (no options)
 *   key = id::variant::size::color            (any option set)
 *
 * Cart line (Redux + guest localStorage):
 *   { key, id, slug, name, price, regularPrice, offerBadge, image, qty, quantity, variant, size, color }
 * Saved for signed-in users in Firestore (carts/{uid}.lines), deliberately minimal:
 *   [{ product_id, quantity, variant, size, color, added_at }]
 * Names, images and prices are re-read from the catalogue when the cart loads,
 * so a signed-in cart never shows a stale price or an expired offer.
 */

export const MAX_LINE_QUANTITY = 50;

export const imageSrc = (img) => (!img ? "" : typeof img === "string" ? img : img.src || img.url || "");

const clean = (v) => (v === undefined || v === null || v === "" ? null : String(v));

/** Stable identity of a cart line. */
export function lineKey({ id, variant, size, color }) {
  const v = clean(variant);
  const s = clean(size);
  const c = clean(color);
  return !v && !s && !c ? String(id) : `${id}::${v || ""}::${s || ""}::${c || ""}`;
}

function variantPrice(product, label) {
  if (!label || !Array.isArray(product.variants)) return null;
  const m = product.variants.find((v) => v && (v.label === label || v.name === label || v.id === label));
  return m ? Number(m.price) : null;
}

/** A full cart line built from the live catalogue record (current price + offer). */
export function buildCartItem(product, { qty = 1, variant = null, size = null, color = null } = {}) {
  const regular = variantPrice(product, variant) ?? (Number(product.price) || 0);
  const { price, regularPrice, offer } = priceWithOffer(product, regular);
  const quantity = Math.min(Math.max(Math.floor(Number(qty)) || 1, 1), MAX_LINE_QUANTITY);
  const options = { variant: clean(variant), size: clean(size), color: clean(color) };
  return {
    key: lineKey({ id: product.id, ...options }),
    id: String(product.id),
    slug: product.slug || null,
    name: product.name || "Product",
    price,
    regularPrice: offer ? regularPrice : null,
    offerBadge: offer ? offer.badge : null,
    image: imageSrc(product.images?.[0]) || null,
    qty: quantity,
    quantity,
    ...options,
  };
}

const qtyOf = (i) => Number(i?.qty ?? i?.quantity) || 0;

/** Re-keys a cart (e.g. an older one stored by product id) so every line has a `key`. */
export function normalizeCart(items = {}) {
  const out = {};
  for (const item of Object.values(items)) {
    if (!item || item.id === undefined) continue;
    const key = lineKey(item);
    const prev = out[key];
    const quantity = Math.min((prev ? qtyOf(prev) : 0) + qtyOf(item), MAX_LINE_QUANTITY);
    if (quantity < 1) continue;
    out[key] = { ...(prev || item), key, qty: quantity, quantity };
  }
  return out;
}

/** Combines two carts, adding quantities for the same line (capped per line). */
export function mergeCartMaps(primary = {}, secondary = {}) {
  const out = { ...primary };
  for (const [key, item] of Object.entries(secondary)) {
    if (!item) continue;
    const have = out[key];
    if (have) {
      const total = Math.min(qtyOf(have) + qtyOf(item), MAX_LINE_QUANTITY);
      out[key] = { ...have, qty: total, quantity: total };
    } else {
      out[key] = item;
    }
  }
  return out;
}

/** Redux cart → the minimal Firestore shape (an array of lines). */
export function toRemoteLines(items = {}, now = new Date().toISOString()) {
  return Object.values(items)
    .filter((item) => item && qtyOf(item) >= 1)
    .map((item) => ({
      product_id: String(item.id),
      quantity: Math.min(qtyOf(item), MAX_LINE_QUANTITY),
      variant: clean(item.variant),
      size: clean(item.size),
      color: clean(item.color),
      added_at: item.added_at || now,
    }));
}

/**
 * Firestore cart doc → minimal lines keyed by line key. Reads the current
 * `lines` array and the older `items` map ({ [productId]: { quantity } }).
 */
export function fromRemoteDoc(data = {}) {
  const rows = Array.isArray(data.lines)
    ? data.lines
    : Object.entries(data.items || {}).map(([id, r]) => ({ product_id: r?.product_id || id, ...r }));
  const out = {};
  for (const r of rows) {
    const quantity = Number(r?.quantity ?? r?.qty) || 0;
    if (!r?.product_id || quantity < 1) continue;
    const line = { id: String(r.product_id), variant: clean(r.variant), size: clean(r.size), color: clean(r.color) };
    const key = lineKey(line);
    out[key] = { key, ...line, qty: quantity, quantity, added_at: r.added_at };
  }
  return out;
}

/** True when two carts hold the same lines and quantities. */
export function sameCart(a = {}, b = {}) {
  const ka = Object.keys(a);
  if (ka.length !== Object.keys(b).length) return false;
  return ka.every((k) => b[k] && qtyOf(a[k]) === qtyOf(b[k]));
}

const isPlaceholderLabel = (label) => !label || /^(option|default)$/i.test(String(label).trim());

/**
 * The options a product is added with when the shopper has not chosen any
 * (the card's quick-add). Mirrors the product page's initial selection, so adding
 * the same plant from a card and from its page lands on the same cart line.
 */
export function defaultOptions(product) {
  const variants = (product?.variants || []).filter((v) => !/^default$/i.test(v.label || v.name || ""));
  const first = variants[0];
  const label = first ? first.label || first.name : null;
  return {
    variant: label && !isPlaceholderLabel(label) ? String(label) : null,
    size: (product?.sizes || []).filter(Boolean)[0] || null,
    color: (product?.colors || []).filter(Boolean)[0] || null,
  };
}
