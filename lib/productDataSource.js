/**
 * Product Data Source
 *
 * This module provides product and category data from JSON files.
 * It can be used instead of Firestore for development/testing.
 */

import {
  getCategoriesFromJSON,
  getProductsFromJSON,
  getCategoryBySlug,
  getProductsByCategory,
  getProductsByCategoryAndSubcategory,
  getProductBySlug as getProductBySlugFromJSON,
  searchProducts as searchProductsFromJSON,
} from "./dataUtils";

/**
 * Get products with filters, sorting, and pagination
 * @param {Object} options - Filter options
 * @returns {Promise<Object>} Products data
 */
export async function getProducts({
  category = null,
  subcategory = null,
  priceRange = null,
  sortBy = "newest",
  pageSize = 20,
  page = 1,
  featured = null,
  inStock = null,
} = {}) {
  try {
    let products = getProductsFromJSON();

    // Filter by category
    if (category) {
      products = products.filter(
        (p) =>
          p.category.toLowerCase() === category.toLowerCase() ||
          p.category.toLowerCase().replace(/\s+/g, "-") ===
            category.toLowerCase()
      );
    }

    // Filter by subcategory
    if (subcategory) {
      products = products.filter((p) => {
        if (!p.subcategories || !Array.isArray(p.subcategories)) return false;
        return p.subcategories.some(
          (sub) =>
            sub.toLowerCase() === subcategory.toLowerCase() ||
            sub.toLowerCase().replace(/\s+/g, "-").replace(/&/g, "and") ===
              subcategory.toLowerCase()
        );
      });
    }

    // Filter by price range
    if (priceRange) {
      products = products.filter((p) => {
        const price = p.price || 0;
        const matchesMin = priceRange.min ? price >= priceRange.min : true;
        const matchesMax = priceRange.max ? price <= priceRange.max : true;
        return matchesMin && matchesMax;
      });
    }

    // Filter by featured
    if (featured !== null) {
      products = products.filter((p) => p.featured === featured);
    }

    // Filter by stock
    if (inStock === true) {
      products = products.filter((p) => p.inStock === true);
    }

    // Sorting
    switch (sortBy) {
      case "price-asc":
        products.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case "price-desc":
        products.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case "rating":
        products.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "name":
        products.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "newest":
      default:
        products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
    }

    // Pagination
    const total = products.length;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedProducts = products.slice(startIndex, endIndex);

    return {
      data: paginatedProducts,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      hasMore: endIndex < total,
      error: null,
    };
  } catch (error) {
    console.error("Error getting products:", error);
    return {
      data: [],
      total: 0,
      page: 1,
      pageSize,
      totalPages: 0,
      hasMore: false,
      error: error.message,
    };
  }
}

/**
 * Get product by slug
 * @param {string} slug - Product slug
 * @returns {Promise<Object>} Product data
 */
export async function getProductBySlug(slug) {
  try {
    const product = getProductBySlugFromJSON(slug);
    return {
      data: product,
      error: null,
    };
  } catch (error) {
    console.error("Error getting product by slug:", error);
    return {
      data: null,
      error: error.message,
    };
  }
}

/**
 * Search products
 * @param {string} searchQuery - Search query
 * @param {Object} filters - Additional filters
 * @returns {Promise<Object>} Search results
 */
export async function searchProducts(searchQuery, filters = {}) {
  try {
    let products = searchProductsFromJSON(searchQuery);

    // Apply additional filters
    if (filters.category) {
      products = products.filter(
        (p) => p.category.toLowerCase() === filters.category.toLowerCase()
      );
    }

    if (filters.priceRange) {
      products = products.filter((p) => {
        const price = p.price || 0;
        const matchesMin = filters.priceRange.min
          ? price >= filters.priceRange.min
          : true;
        const matchesMax = filters.priceRange.max
          ? price <= filters.priceRange.max
          : true;
        return matchesMin && matchesMax;
      });
    }

    return {
      data: products,
      total: products.length,
      hasMore: false,
      error: null,
    };
  } catch (error) {
    console.error("Error searching products:", error);
    return {
      data: [],
      total: 0,
      hasMore: false,
      error: error.message,
    };
  }
}

/**
 * Get search suggestions
 * @param {string} searchQuery - Search query
 * @param {number} limitCount - Max results
 * @returns {Promise<Object>} Suggestions
 */
export async function getSearchSuggestions(searchQuery, limitCount = 5) {
  try {
    const products = searchProductsFromJSON(searchQuery);
    const suggestions = products.slice(0, limitCount).map((p) => ({
      name: p.name,
      slug: p.slug,
      image: p.images[0] || "",
      price: p.price,
      category: p.category,
    }));

    return {
      data: suggestions,
      error: null,
    };
  } catch (error) {
    console.error("Error getting search suggestions:", error);
    return {
      data: [],
      error: error.message,
    };
  }
}

/**
 * Get featured products
 * @param {number} count - Number of products to fetch
 * @returns {Promise<Object>} Featured products
 */
export async function getFeaturedProducts(count = 8) {
  try {
    let products = getProductsFromJSON();

    // Get products with images and in stock
    products = products.filter(
      (p) => p.images && p.images.length > 0 && p.inStock
    );

    // Take first N products as featured
    const featured = products.slice(0, count);

    return {
      data: featured,
      error: null,
    };
  } catch (error) {
    console.error("Error getting featured products:", error);
    return {
      data: [],
      error: error.message,
    };
  }
}

/**
 * Get all categories with subcategories
 * @returns {Promise<Object>} Categories data
 */
export async function getCategories() {
  try {
    const categories = getCategoriesFromJSON();
    return {
      data: categories,
      error: null,
    };
  } catch (error) {
    console.error("Error getting categories:", error);
    return {
      data: [],
      error: error.message,
    };
  }
}

/**
 * Get related products by category
 * @param {string} category - Category name
 * @param {string} productId - Current product ID
 * @param {number} limitCount - Max results
 * @returns {Promise<Object>} Related products
 */
export async function getRelatedProducts(category, productId, limitCount = 6) {
  try {
    let products = getProductsByCategory(category);

    // Exclude current product
    products = products.filter((p) => p.id !== productId);

    // Filter products with images and in stock
    products = products.filter(
      (p) => p.images && p.images.length > 0 && p.inStock
    );

    // Limit results
    const related = products.slice(0, limitCount);

    return {
      data: related,
      error: null,
    };
  } catch (error) {
    console.error("Error getting related products:", error);
    return {
      data: [],
      error: error.message,
    };
  }
}

/**
 * Get price range for products
 * @param {string} category - Category name
 * @param {string} subcategory - Subcategory name
 * @returns {Promise<Object>} Price range
 */
export async function getPriceRange(category = null, subcategory = null) {
  try {
    let products = getProductsFromJSON();

    if (category) {
      products = products.filter(
        (p) =>
          p.category.toLowerCase() === category.toLowerCase() ||
          p.category.toLowerCase().replace(/\s+/g, "-") ===
            category.toLowerCase()
      );
    }

    if (subcategory) {
      products = products.filter((p) => {
        if (!p.subcategories || !Array.isArray(p.subcategories)) return false;
        return p.subcategories.some(
          (sub) =>
            sub.toLowerCase() === subcategory.toLowerCase() ||
            sub.toLowerCase().replace(/\s+/g, "-").replace(/&/g, "and") ===
              subcategory.toLowerCase()
        );
      });
    }

    const prices = products.map((p) => p.price || 0).filter((p) => p > 0);
    const min = prices.length > 0 ? Math.min(...prices) : 0;
    const max = prices.length > 0 ? Math.max(...prices) : 10000;

    return {
      data: { min, max },
      error: null,
    };
  } catch (error) {
    console.error("Error getting price range:", error);
    return {
      data: { min: 0, max: 10000 },
      error: error.message,
    };
  }
}

/**
 * Convert category slug to proper name
 * @param {string} slug - Category slug
 * @returns {string} Category name
 */
export function slugToCategoryName(slug) {
  if (!slug) return null;

  const categories = getCategoriesFromJSON();
  const category = categories.find((c) => c.slug === slug.toLowerCase());

  return category ? category.name : slug;
}
