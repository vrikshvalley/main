import { db } from "./firebaseConfig";
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
} from "firebase/firestore";

const CART_STORAGE_KEY = "vriksh_cart";

/**
 * Save cart to localStorage for guest users
 */
export const saveCartToLocalStorage = (cartItems) => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  } catch (error) {
    console.error("Error saving cart to localStorage:", error);
  }
};

/**
 * Load cart from localStorage for guest users
 */
export const loadCartFromLocalStorage = () => {
  try {
    const cart = localStorage.getItem(CART_STORAGE_KEY);
    return cart ? JSON.parse(cart) : {};
  } catch (error) {
    console.error("Error loading cart from localStorage:", error);
    return {};
  }
};

/**
 * Clear cart from localStorage
 */
export const clearCartFromLocalStorage = () => {
  try {
    localStorage.removeItem(CART_STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing cart from localStorage:", error);
  }
};

/**
 * Add or update a cart item in Firebase for logged-in users
 */
export const addToCartFirebase = async (userId, productId, quantity) => {
  try {
    const cartDocRef = doc(db, "carts", userId);
    const cartDoc = await getDoc(cartDocRef);

    if (cartDoc.exists()) {
      const cartData = cartDoc.data();
      const items = cartData.items || {};

      if (items[productId]) {
        // Update existing item quantity
        items[productId].quantity += quantity;
      } else {
        // Add new item
        items[productId] = {
          product_id: productId,
          quantity: quantity,
          added_at: new Date().toISOString(),
        };
      }

      await updateDoc(cartDocRef, {
        items,
        updated_at: new Date().toISOString(),
      });
    } else {
      // Create new cart document
      await setDoc(cartDocRef, {
        user_id: userId,
        items: {
          [productId]: {
            product_id: productId,
            quantity: quantity,
            added_at: new Date().toISOString(),
          },
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error adding to cart in Firebase:", error);
    return { success: false, error };
  }
};

/**
 * Update cart item quantity in Firebase
 */
export const updateCartItemFirebase = async (userId, productId, quantity) => {
  try {
    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      return await removeFromCartFirebase(userId, productId);
    }

    const cartDocRef = doc(db, "carts", userId);
    const cartDoc = await getDoc(cartDocRef);

    if (cartDoc.exists()) {
      const cartData = cartDoc.data();
      const items = cartData.items || {};

      if (items[productId]) {
        items[productId].quantity = quantity;
        await updateDoc(cartDocRef, {
          items,
          updated_at: new Date().toISOString(),
        });
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating cart item in Firebase:", error);
    return { success: false, error };
  }
};

/**
 * Remove item from cart in Firebase
 */
export const removeFromCartFirebase = async (userId, productId) => {
  try {
    const cartDocRef = doc(db, "carts", userId);
    const cartDoc = await getDoc(cartDocRef);

    if (cartDoc.exists()) {
      const cartData = cartDoc.data();
      const items = cartData.items || {};

      delete items[productId];

      await updateDoc(cartDocRef, {
        items,
        updated_at: new Date().toISOString(),
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error removing from cart in Firebase:", error);
    return { success: false, error };
  }
};

/**
 * Load cart from Firebase for logged-in users
 * Converts database document to Redux cart format: { [productId]: { qty, ...productData } }
 */
export const loadCartFromFirebase = async (userId) => {
  try {
    const cartDocRef = doc(db, "carts", userId);
    const cartDoc = await getDoc(cartDocRef);

    if (cartDoc.exists()) {
      const cartData = cartDoc.data();
      const items = cartData.items || {};

      // Convert to Redux cart format
      const cartObject = {};
      Object.keys(items).forEach((productId) => {
        cartObject[productId] = {
          qty: items[productId].quantity,
          id: productId,
          // Add other product fields as needed
        };
      });

      return cartObject;
    }

    return {};
  } catch (error) {
    console.error("Error loading cart from Firebase:", error);
    return {};
  }
};

/**
 * Clear all cart items for a user in Firebase
 */
export const clearCartFromFirebase = async (userId) => {
  try {
    const cartDocRef = doc(db, "carts", userId);
    await deleteDoc(cartDocRef);
    return { success: true };
  } catch (error) {
    console.error("Error clearing cart from Firebase:", error);
    return { success: false, error };
  }
};

/**
 * Merge guest cart with user cart after login
 */
export const mergeAndSyncCart = async (userId, guestCart) => {
  try {
    // Get user's existing cart from database
    const userCart = await loadCartFromFirebase(userId);
    const mergedCart = { ...userCart };

    // Process each item from guest cart
    for (const productId of Object.keys(guestCart)) {
      const guestItem = guestCart[productId];
      const existing = mergedCart[productId];

      if (existing) {
        // Item exists in both carts - add quantities
        const newQuantity = existing.qty + guestItem.qty;
        await updateCartItemFirebase(userId, productId, newQuantity);
        mergedCart[productId] = { ...existing, qty: newQuantity };
      } else {
        // New item from guest cart
        await addToCartFirebase(userId, productId, guestItem.qty);
        mergedCart[productId] = guestItem;
      }
    }

    // Clear localStorage
    clearCartFromLocalStorage();

    return mergedCart;
  } catch (error) {
    console.error("Error merging and syncing cart:", error);
    return await loadCartFromFirebase(userId);
  }
};

/**
 * Sync entire cart state to Firebase (bulk operation)
 * Use this when you need to sync the entire Redux cart to database
 */
export const syncCartToFirebase = async (userId, cartItems) => {
  try {
    const cartDocRef = doc(db, "carts", userId);

    // Convert Redux cart format to Firebase format
    const items = {};
    Object.keys(cartItems).forEach((productId) => {
      items[productId] = {
        product_id: productId,
        quantity: cartItems[productId].qty,
        added_at: new Date().toISOString(),
      };
    });

    await setDoc(cartDocRef, {
      user_id: userId,
      items,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error syncing cart to Firebase:", error);
    return { success: false, error };
  }
};
