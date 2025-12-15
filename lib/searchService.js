/**
 * Product Search Service
 *
 * Provides search functionality for products across the platform.
 * Integrated with Firestore for real product data.
 */

import {
  searchProducts as searchFirestoreProducts,
  getSearchSuggestions as getFirestoreSuggestions,
} from "./services/productService";

/**
 * Search products by query string
 * Searches across: name, description, tags, category, subcategory
 *
 * @param {string} query - Search query
 * @param {Object} filters - Optional filters (category, priceRange, inStock)
 * @returns {Promise<Array>} Matching products
 */
export const searchProducts = async (query, filters = {}) => {
  if (!query || query.trim().length === 0) {
    return [];
  }

  try {
    const { data, error } = await searchFirestoreProducts(query, filters);

    if (error) {
      console.error("Search error:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Search exception:", error);
    return [];
  }
};

/**
 * Get search suggestions based on partial query
 * Optimized to search based on product names directly
 *
 * @param {string} query - Partial search query
 * @param {number} limit - Maximum suggestions to return
 * @returns {Promise<Array>} Suggested search terms
 */
export const getSearchSuggestions = async (query, limit = 5) => {
  if (!query || query.trim().length < 1) {
    return [];
  }

  try {
    // First try to get suggestions from Firestore
    const { data: firestoreSuggestions, error } = await getFirestoreSuggestions(
      query,
      limit
    );

    if (!error && firestoreSuggestions && firestoreSuggestions.length > 0) {
      return firestoreSuggestions;
    }

    // Fallback: search products by name to generate suggestions
    const { data: matchedProducts } = await searchFirestoreProducts(query, {});

    if (matchedProducts && matchedProducts.length > 0) {
      // Extract unique product names and take first limit items
      const suggestions = matchedProducts
        .slice(0, limit)
        .map((product) => product.name)
        .filter(
          (name) => name && name.toLowerCase().includes(query.toLowerCase())
        );

      return suggestions.length > 0 ? suggestions : [];
    }

    return [];
  } catch (error) {
    console.error("Suggestions exception:", error);
    return [];
  }
};

/**
 * Get popular/trending search terms
 *
 * @returns {Array} Popular search terms
 */
export const getPopularSearches = () => {
  // TODO: Track actual search queries in Firebase and return top searches
  return [
    "Indoor Plants",
    "Succulents",
    "Flowering Plants",
    "Low Maintenance",
    "Air Purifying",
    "Seeds",
    "Pots",
    "Plant Food",
  ];
};

/**
 * FIREBASE INTEGRATION TEMPLATE
 *
 * Replace the functions above with Firebase queries when ready:
 */

/*
import { ref, query, orderByChild, get } from 'firebase/database';
import { realtimeDb } from './firebaseConfig';

export const searchProductsFirebase = async (searchQuery, filters = {}) => {
  try {
    const productsRef = ref(realtimeDb, 'products');
    const snapshot = await get(productsRef);
    
    if (!snapshot.exists()) {
      return [];
    }
    
    const products = [];
    const searchTerm = searchQuery.toLowerCase().trim();
    
    snapshot.forEach((childSnapshot) => {
      const product = childSnapshot.val();
      
      // Search logic
      const matchesQuery = 
        product.name?.toLowerCase().includes(searchTerm) ||
        product.description?.toLowerCase().includes(searchTerm) ||
        product.category?.toLowerCase().includes(searchTerm);
      
      if (matchesQuery) {
        products.push({
          id: childSnapshot.key,
          ...product
        });
      }
    });
    
    return products;
  } catch (error) {
    console.error('Firebase search error:', error);
    return [];
  }
};

// For advanced search, consider Algolia integration:
// https://www.algolia.com/doc/guides/getting-started/quick-start/tutorials/quick-start-with-the-api-client/javascript/
*/

/**
 * Save search query to history (localStorage for now)
 *
 * @param {string} query - Search query to save
 */
export const saveSearchHistory = (query) => {
  try {
    const history = getSearchHistory();
    const updated = [query, ...history.filter((q) => q !== query)].slice(0, 10);
    localStorage.setItem("search_history", JSON.stringify(updated));
  } catch (error) {
    console.error("Error saving search history:", error);
  }
};

/**
 * Get search history from localStorage
 *
 * @returns {Array} Recent search queries
 */
export const getSearchHistory = () => {
  try {
    const history = localStorage.getItem("search_history");
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error("Error loading search history:", error);
    return [];
  }
};

/**
 * Clear search history
 */
export const clearSearchHistory = () => {
  try {
    localStorage.removeItem("search_history");
  } catch (error) {
    console.error("Error clearing search history:", error);
  }
};
