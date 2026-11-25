'use client';

import { useEffect } from 'react';
import { useDispatch, useStore } from 'react-redux';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebaseConfig';
import {
  clearCartFromLocalStorage,
  fetchRemoteCart,
  hydrateItems,
  loadCartFromLocalStorage,
  saveCartToLocalStorage,
  saveRemoteCart,
} from '@/lib/cartUtils';
import { mergeCartMaps, normalizeCart } from '@/lib/cartItems';
import { applyItemUpdates, markCartLoading, markCartReady, setCart } from '@/lib/slices/cartSlice';

const SAVE_DELAY_MS = 500;

// One sign-in = one merge, even if React runs the effect twice (strict mode)
// or auth fires twice: a second caller simply awaits the first one's promise.
const inflight = new Map();

async function loadForUser(uid) {
  const guest = normalizeCart(loadCartFromLocalStorage()); // items added before signing in
  const remote = await fetchRemoteCart(uid); // throws on failure: never mistaken for "empty"
  const merged = mergeCartMaps(remote, guest);
  const hadGuestItems = Object.keys(guest).length > 0;

  if (hadGuestItems) {
    // Persist the merged cart BEFORE clearing the guest copy, so nothing is lost if this is interrupted.
    await saveRemoteCart(uid, merged);
    clearCartFromLocalStorage();
  }
  return hydrateItems(merged, guest);
}

/**
 * The single owner of cart persistence (mount once, in app/providers.jsx).
 *
 *  - Guest:       cart lives in localStorage, loaded instantly.
 *  - Signing in:  the guest cart is merged into the account's saved cart (quantities add up), once.
 *  - Signed in:   every change is saved to Firestore (debounced); names and prices are re-read from the catalogue.
 *  - Signing out: the cart is emptied from the screen (the account keeps its saved cart).
 *
 * Buying never needs an account: checkout registers the customer by email
 * after payment, and signing in later with that email finds the same account.
 */
export default function CartSync() {
  const dispatch = useDispatch();
  const store = useStore();

  useEffect(() => {
    let uid = null;
    let ready = false;
    let last = store.getState().cart.items;
    let timer = null;
    let session = 0; // bumps on every auth change so stale async work is ignored

    const persistNow = () => {
      clearTimeout(timer);
      timer = null;
      const items = store.getState().cart.items;
      if (!ready) return;
      if (uid) saveRemoteCart(uid, items).catch((e) => console.error('Cart save failed:', e.message));
      else saveCartToLocalStorage(items);
    };

    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      const mine = ++session;
      clearTimeout(timer);
      ready = false;
      uid = user ? user.uid : null;
      dispatch(markCartLoading());

      try {
        if (user) {
          let promise = inflight.get(user.uid);
          if (!promise) {
            promise = loadForUser(user.uid).finally(() => inflight.delete(user.uid));
            inflight.set(user.uid, promise);
          }
          const items = await promise;
          if (mine !== session) return;
          dispatch(setCart(items));
        } else {
          const local = normalizeCart(loadCartFromLocalStorage());
          dispatch(setCart(local)); // show immediately
          dispatch(markCartReady());
          last = store.getState().cart.items;
          ready = true;

          // Then refresh names / prices / offers in the background, dropping deleted products.
          const fresh = await hydrateItems(local, local);
          if (mine !== session) return;
          const currentItems = store.getState().cart.items;
          const next = { ...fresh };
          for (const [key, item] of Object.entries(currentItems)) {
            if (!local[key] && !next[key]) next[key] = item; // added while hydrating
          }
          dispatch(setCart(next));
          last = store.getState().cart.items;
          persistNow();
          return;
        }
      } catch (e) {
        // Could not read the saved cart: keep the screen usable, but do NOT
        // write back (that would overwrite the saved cart with an empty one).
        console.error('Cart load failed:', e.message);
        if (mine !== session) return;
        dispatch(setCart({}));
        dispatch(markCartReady());
        last = store.getState().cart.items;
        ready = false;
        return;
      }

      dispatch(markCartReady());
      last = store.getState().cart.items;
      ready = true;
    });

    const unsubStore = store.subscribe(() => {
      const items = store.getState().cart.items;
      if (items === last) return;
      last = items;
      if (!ready) return;
      if (uid) {
        clearTimeout(timer);
        timer = setTimeout(persistNow, SAVE_DELAY_MS);
      } else {
        saveCartToLocalStorage(items);
      }
    });

    // Don't lose the last change if the tab is closed right after editing.
    const flush = () => timer && persistNow();
    const onVisibility = () => document.visibilityState === 'hidden' && flush();
    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      session++;
      clearTimeout(timer);
      unsubAuth();
      unsubStore();
      window.removeEventListener('pagehide', flush);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [dispatch, store]);

  return null;
}

