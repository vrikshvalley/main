/**
 * Firebase Realtime Database Service
 *
 * This service provides helper functions to interact with Firebase Realtime Database
 * for storing and retrieving JSON data like products, categories, blog posts, etc.
 */

import { realtimeDb } from "@/lib/firebaseConfig";
import {
  ref,
  get,
  set,
  update,
  remove,
  push,
  onValue,
  off,
} from "firebase/database";

/**
 * Get data from a specific path
 * @param {string} path - Database path (e.g., 'products', 'categories/indoor')
 * @returns {Promise<any>} - Retrieved data
 */
export async function getData(path) {
  try {
    const dbRef = ref(realtimeDb, path);
    const snapshot = await get(dbRef);

    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      console.log(`No data available at path: ${path}`);
      return null;
    }
  } catch (error) {
    console.error(`Error getting data from ${path}:`, error);
    throw error;
  }
}

/**
 * Get all products
 * @returns {Promise<Object>} - Object containing all products
 */
export async function getAllProducts() {
  return await getData("products");
}

/**
 * Get a single product by ID
 * @param {string} productId - Product ID
 * @returns {Promise<Object>} - Product data
 */
export async function getProductById(productId) {
  return await getData(`products/${productId}`);
}

/**
 * Get products by category
 * @param {string} categorySlug - Category slug
 * @returns {Promise<Array>} - Array of products in the category
 */
export async function getProductsByCategory(categorySlug) {
  try {
    const allProducts = await getAllProducts();
    if (!allProducts) return [];

    return Object.values(allProducts).filter(
      (product) => product.category === categorySlug
    );
  } catch (error) {
    console.error("Error getting products by category:", error);
    throw error;
  }
}

/**
 * Get all categories
 * @returns {Promise<Object>} - Object containing all categories
 */
export async function getAllCategories() {
  return await getData("categories");
}

/**
 * Get all blog posts
 * @returns {Promise<Object>} - Object containing all blog posts
 */
export async function getAllBlogPosts() {
  return await getData("blog");
}

/**
 * Get a single blog post by ID
 * @param {string} postId - Blog post ID
 * @returns {Promise<Object>} - Blog post data
 */
export async function getBlogPostById(postId) {
  return await getData(`blog/${postId}`);
}

/**
 * Set data at a specific path (overwrites existing data)
 * @param {string} path - Database path
 * @param {any} data - Data to set
 * @returns {Promise<void>}
 */
export async function setData(path, data) {
  try {
    const dbRef = ref(realtimeDb, path);
    await set(dbRef, data);
    console.log(`Data successfully written to ${path}`);
  } catch (error) {
    console.error(`Error setting data at ${path}:`, error);
    throw error;
  }
}

/**
 * Update data at a specific path (merges with existing data)
 * @param {string} path - Database path
 * @param {Object} updates - Object containing fields to update
 * @returns {Promise<void>}
 */
export async function updateData(path, updates) {
  try {
    const dbRef = ref(realtimeDb, path);
    await update(dbRef, updates);
    console.log(`Data successfully updated at ${path}`);
  } catch (error) {
    console.error(`Error updating data at ${path}:`, error);
    throw error;
  }
}

/**
 * Delete data at a specific path
 * @param {string} path - Database path
 * @returns {Promise<void>}
 */
export async function deleteData(path) {
  try {
    const dbRef = ref(realtimeDb, path);
    await remove(dbRef);
    console.log(`Data successfully deleted at ${path}`);
  } catch (error) {
    console.error(`Error deleting data at ${path}:`, error);
    throw error;
  }
}

/**
 * Push new data to a list (generates unique key)
 * @param {string} path - Database path
 * @param {any} data - Data to push
 * @returns {Promise<string>} - Generated unique key
 */
export async function pushData(path, data) {
  try {
    const dbRef = ref(realtimeDb, path);
    const newRef = await push(dbRef, data);
    console.log(`Data successfully pushed to ${path} with key: ${newRef.key}`);
    return newRef.key;
  } catch (error) {
    console.error(`Error pushing data to ${path}:`, error);
    throw error;
  }
}

/**
 * Listen to real-time updates at a specific path
 * @param {string} path - Database path
 * @param {Function} callback - Callback function to handle data changes
 * @returns {Function} - Unsubscribe function
 */
export function listenToData(path, callback) {
  const dbRef = ref(realtimeDb, path);

  onValue(dbRef, (snapshot) => {
    const data = snapshot.exists() ? snapshot.val() : null;
    callback(data);
  });

  // Return unsubscribe function
  return () => off(dbRef);
}

/**
 * Get site configuration
 * @returns {Promise<Object>} - Site configuration data
 */
export async function getSiteConfig() {
  return await getData("config");
}

/**
 * Search products by name
 * @param {string} searchQuery - Search term
 * @returns {Promise<Array>} - Array of matching products
 */
export async function searchProducts(searchQuery) {
  try {
    const allProducts = await getAllProducts();
    if (!allProducts) return [];

    const query = searchQuery.toLowerCase();
    return Object.values(allProducts).filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query)
    );
  } catch (error) {
    console.error("Error searching products:", error);
    throw error;
  }
}

/**
 * Get featured products
 * @returns {Promise<Array>} - Array of featured products
 */
export async function getFeaturedProducts() {
  try {
    const allProducts = await getAllProducts();
    if (!allProducts) return [];

    return Object.values(allProducts).filter(
      (product) => product.featured === true
    );
  } catch (error) {
    console.error("Error getting featured products:", error);
    throw error;
  }
}

/**
 * Get products with stock available
 * @returns {Promise<Array>} - Array of in-stock products
 */
export async function getInStockProducts() {
  try {
    const allProducts = await getAllProducts();
    if (!allProducts) return [];

    return Object.values(allProducts).filter((product) => product.stock > 0);
  } catch (error) {
    console.error("Error getting in-stock products:", error);
    throw error;
  }
}
