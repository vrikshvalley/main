import { db } from "./firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getProductById } from "./services/productService";
import { buildCartItem, fromRemoteDoc, toRemoteLines } from "./cartItems";

/**
 * Cart storage. One place decides where a cart lives (see CartSync):
 *   guests        → localStorage  ("vriksh_cart", full items)
 *   signed-in     → Firestore     (carts/{uid}, minimal items)
 * Pages and buttons only dispatch Redux actions; they never write storage.
 */

const CART_STORAGE_KEY = "vriksh_cart";

export const saveCartToLocalStorage = (items) => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error("Error saving cart to localStorage:", error);
  }
};

export const loadCartFromLocalStorage = () => {
  try {
    const cart = localStorage.getItem(CART_STORAGE_KEY);
    const parsed = cart ? JSON.parse(cart) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

export const clearCartFromLocalStorage = () => {
  try {
    localStorage.removeItem(CART_STORAGE_KEY);
  } catch {
    /* storage unavailable */
  }
};

/** Signed-in user's saved cart, as minimal items. Throws on failure (callers must not treat that as "empty"). */
export async function fetchRemoteCart(userId) {
  const snap = await getDoc(doc(db, "carts", userId));
  return snap.exists() ? fromRemoteDoc(snap.data()) : {};
}

export async function saveRemoteCart(userId, items) {
  await setDoc(doc(db, "carts", userId), {
    user_id: userId,
    lines: toRemoteLines(items),
    updated_at: new Date().toISOString(),
  });
}

/**
 * Turns minimal / possibly stale cart items into full ones from the live
 * catalogue (current names, images, prices and offers). Products that no
 * longer exist are dropped; a temporary read failure keeps the item as it was
 * (`fallback` has the last full copy) so nothing is lost by a flaky network.
 */
export async function hydrateItems(minimal, fallback = {}) {
  // One catalogue read per product, even when several lines share it.
  const productIds = [...new Set(Object.values(minimal).map((m) => String(m.id)))];
  const results = new Map(
    await Promise.all(
      productIds.map(async (id) => {
        const { data, error } = await getProductById(id);
        return [id, { data, error }];
      })
    )
  );

  const out = {};
  for (const [key, m] of Object.entries(minimal)) {
    const { data, error } = results.get(String(m.id)) || {};
    if (data) {
      const item = buildCartItem(data, { qty: m.qty ?? m.quantity, variant: m.variant, size: m.size, color: m.color });
      out[item.key] = item;
    } else if (error?.message === "Product not found") {
      continue; // removed from the catalogue
    } else if (fallback[key]) {
      out[key] = { ...fallback[key], ...m };
    }
  }
  return out;
}
