import { createSlice, createSelector } from "@reduxjs/toolkit";
import { lineKey } from "../cartItems.js";

/**
 * Cart state. Reducers are pure: persistence (localStorage for guests,
 * Firestore for signed-in users) lives in components/cart/CartSync.jsx, so a
 * cart change made anywhere (product page, card, drawer, checkout) is saved
 * the same way and can never be written twice.
 *
 * A cart line is a product plus its chosen options, keyed by lineKey() (see lib/cartItems.js).
 * Line shape: { key, id, slug, name, price, regularPrice, offerBadge, image, qty, quantity, variant, size, color }
 */
const MAX_LINE_QUANTITY = 50;

const initialState = {
  items: {}, // keyed by line key
  ready: false, // true once the right cart (guest or account) has been loaded
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItem: (state, action) => {
      const item = action.payload;
      const price = typeof item.price === "number" ? item.price : parseFloat(item.price) || 0;
      const incoming = Math.max(1, Math.floor(Number(item.qty ?? item.quantity ?? 1)) || 1);
      const key = item.key || lineKey(item);
      const existing = state.items[key];
      if (existing) {
        existing.qty = Math.min(existing.qty + incoming, MAX_LINE_QUANTITY);
        existing.quantity = existing.qty;
        // keep the latest price / offer the shopper saw
        existing.price = price;
        existing.regularPrice = item.regularPrice ?? null;
        existing.offerBadge = item.offerBadge ?? null;
      } else {
        const qty = Math.min(incoming, MAX_LINE_QUANTITY);
        state.items[key] = { ...item, key, price, qty, quantity: qty };
      }
    },
    decrementItem: (state, action) => {
      const existing = state.items[action.payload];
      if (!existing) return;
      existing.qty -= 1;
      existing.quantity = existing.qty;
      if (existing.qty <= 0) delete state.items[action.payload];
    },
    removeItem: (state, action) => {
      delete state.items[action.payload];
    },
    clearCart: (state) => {
      state.items = {};
    },
    /** Replaces the whole cart (login, logout, first load). */
    setCart: (state, action) => {
      state.items = action.payload || {};
    },
    loadCart: (state, action) => {
      state.items = action.payload || {};
    },
    /** Refreshes prices / names of lines that are still in the cart. */
    applyItemUpdates: (state, action) => {
      for (const [id, update] of Object.entries(action.payload || {})) {
        const item = state.items[id];
        if (!item) continue;
        item.name = update.name;
        item.slug = update.slug;
        item.image = update.image;
        item.price = update.price;
        item.regularPrice = update.regularPrice;
        item.offerBadge = update.offerBadge;
        delete item.stale;
      }
    },
    markCartReady: (state) => {
      state.ready = true;
    },
    markCartLoading: (state) => {
      state.ready = false;
    },
  },
});

export const { addItem, decrementItem, removeItem, clearCart, setCart, loadCart, applyItemUpdates, markCartReady, markCartLoading } =
  cartSlice.actions;

// Selectors
const selectCartState = (state) => state.cart;
export const selectItemsMap = createSelector([selectCartState], (cart) => cart.items);
export const selectItemsArray = createSelector([selectItemsMap], (items) => Object.values(items));
export const selectCount = createSelector([selectItemsArray], (arr) => arr.reduce((n, i) => n + i.qty, 0));
export const selectSubtotal = createSelector([selectItemsArray], (arr) =>
  arr.reduce((sum, i) => sum + (typeof i.price === "number" ? i.price : 0) * i.qty, 0)
);
export const selectCartReady = createSelector([selectCartState], (cart) => cart.ready);
export const selectCartLoading = createSelector([selectCartState], (cart) => !cart.ready);

export default cartSlice.reducer;
