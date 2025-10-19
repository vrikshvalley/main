import { supabase } from "./supabaseClient";

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
 * Add or update a cart item in Supabase for logged-in users
 */
export const addToCartSupabase = async (userId, productId, quantity) => {
  try {
    // Check if item already exists in cart
    const { data: existingItem } = await supabase
      .from("cart_items")
      .select("*")
      .eq("user_id", userId)
      .eq("product_id", productId)
      .single();

    if (existingItem) {
      // Update existing item quantity
      const { error } = await supabase
        .from("cart_items")
        .update({
          quantity: existingItem.quantity + quantity,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingItem.id);

      if (error) throw error;
    } else {
      // Insert new item
      const { error } = await supabase.from("cart_items").insert({
        user_id: userId,
        product_id: productId,
        quantity: quantity,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;
    }

    return { success: true };
  } catch (error) {
    console.error("Error adding to cart in Supabase:", error);
    return { success: false, error };
  }
};

/**
 * Update cart item quantity in Supabase
 */
export const updateCartItemSupabase = async (userId, productId, quantity) => {
  try {
    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      return await removeFromCartSupabase(userId, productId);
    }

    const { error } = await supabase
      .from("cart_items")
      .update({
        quantity: quantity,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .eq("product_id", productId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error updating cart item in Supabase:", error);
    return { success: false, error };
  }
};

/**
 * Remove item from cart in Supabase
 */
export const removeFromCartSupabase = async (userId, productId) => {
  try {
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", userId)
      .eq("product_id", productId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error removing from cart in Supabase:", error);
    return { success: false, error };
  }
};

/**
 * Load cart from Supabase for logged-in users
 * Converts database rows to Redux cart format: { [productId]: { qty, ...productData } }
 */
export const loadCartFromSupabase = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("cart_items")
      .select("*")
      .eq("user_id", userId);

    if (error) throw error;

    // Convert array of cart items to object format for Redux
    const cartObject = {};
    if (data && data.length > 0) {
      data.forEach((item) => {
        cartObject[item.product_id] = {
          qty: item.quantity,
          id: item.product_id,
          // Add other product fields as needed
        };
      });
    }

    return cartObject;
  } catch (error) {
    console.error("Error loading cart from Supabase:", error);
    return {};
  }
};

/**
 * Clear all cart items for a user in Supabase
 */
export const clearCartFromSupabase = async (userId) => {
  try {
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", userId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error clearing cart from Supabase:", error);
    return { success: false, error };
  }
};

/**
 * Merge guest cart with user cart after login
 */
export const mergeAndSyncCart = async (userId, guestCart) => {
  try {
    // Get user's existing cart from database
    const userCart = await loadCartFromSupabase(userId);
    const mergedCart = { ...userCart };

    // Process each item from guest cart
    for (const productId of Object.keys(guestCart)) {
      const guestItem = guestCart[productId];
      const existing = mergedCart[productId];

      if (existing) {
        // Item exists in both carts - add quantities
        const newQuantity = existing.qty + guestItem.qty;
        await updateCartItemSupabase(userId, productId, newQuantity);
        mergedCart[productId] = { ...existing, qty: newQuantity };
      } else {
        // New item from guest cart
        await addToCartSupabase(userId, productId, guestItem.qty);
        mergedCart[productId] = guestItem;
      }
    }

    // Clear localStorage
    clearCartFromLocalStorage();

    return mergedCart;
  } catch (error) {
    console.error("Error merging and syncing cart:", error);
    return await loadCartFromSupabase(userId);
  }
};

/**
 * Sync entire cart state to Supabase (bulk operation)
 * Use this when you need to sync the entire Redux cart to database
 */
export const syncCartToSupabase = async (userId, cartItems) => {
  try {
    // Clear existing cart items
    await clearCartFromSupabase(userId);

    // Insert all items
    const itemsToInsert = Object.keys(cartItems).map((productId) => ({
      user_id: userId,
      product_id: productId,
      quantity: cartItems[productId].qty,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    if (itemsToInsert.length > 0) {
      const { error } = await supabase.from("cart_items").insert(itemsToInsert);

      if (error) throw error;
    }

    return { success: true };
  } catch (error) {
    console.error("Error syncing cart to Supabase:", error);
    return { success: false, error };
  }
};
