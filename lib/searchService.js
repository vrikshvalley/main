/**
 * Product Search Service
 *
 * Provides search functionality for products across the platform.
 * Currently uses sample data, ready to be connected to Firebase Realtime DB.
 *
 * FUTURE INTEGRATION:
 * 1. Replace sampleProducts with Firebase query to /products
 * 2. Add Algolia/ElasticSearch for advanced search (optional)
 * 3. Implement search history and suggestions
 */

import { sampleProducts } from "./sampleProducts";

/**
 * Search products by query string
 * Searches across: name, description, tags, category, subcategory
 *
 * @param {string} query - Search query
 * @param {Object} filters - Optional filters (category, priceRange, inStock)
 * @returns {Array} Matching products
 */
export const searchProducts = (query, filters = {}) => {
  if (!query || query.trim().length === 0) {
    return [];
  }

  const searchTerm = query.toLowerCase().trim();
  const { category, priceRange, inStock } = filters;

  let results = sampleProducts.filter((product) => {
    // Text search
    const matchesQuery =
      product.name.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm) ||
      product.subcategory.toLowerCase().includes(searchTerm) ||
      (product.tags &&
        product.tags.some((tag) => tag.toLowerCase().includes(searchTerm)));

    if (!matchesQuery) return false;

    // Category filter
    if (category && product.category !== category) {
      return false;
    }

    // Price range filter
    if (priceRange) {
      const price = product.salePrice || product.price;
      if (price < priceRange.min || price > priceRange.max) {
        return false;
      }
    }

    // Stock filter
    if (inStock && !product.inStock) {
      return false;
    }

    return true;
  });

  // Sort by relevance (exact matches first, then partial matches)
  results.sort((a, b) => {
    const aNameMatch = a.name.toLowerCase() === searchTerm;
    const bNameMatch = b.name.toLowerCase() === searchTerm;

    if (aNameMatch && !bNameMatch) return -1;
    if (!aNameMatch && bNameMatch) return 1;

    return 0;
  });

  return results;
};

/**
 * Get search suggestions based on partial query
 *
 * @param {string} query - Partial search query
 * @param {number} limit - Maximum suggestions to return
 * @returns {Array} Suggested search terms
 */
export const getSearchSuggestions = (query, limit = 5) => {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const searchTerm = query.toLowerCase().trim();
  const suggestions = new Set();

  sampleProducts.forEach((product) => {
    // Add matching product names
    if (product.name.toLowerCase().includes(searchTerm)) {
      suggestions.add(product.name);
    }

    // Add matching categories
    if (product.category.toLowerCase().includes(searchTerm)) {
      suggestions.add(product.category);
    }

    // Add matching subcategories
    if (product.subcategory.toLowerCase().includes(searchTerm)) {
      suggestions.add(product.subcategory);
    }

    // Add matching tags
    if (product.tags) {
      product.tags.forEach((tag) => {
        if (tag.toLowerCase().includes(searchTerm)) {
          suggestions.add(tag);
        }
      });
    }
  });

  return Array.from(suggestions).slice(0, limit);
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
