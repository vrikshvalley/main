// Import from Firestore service
import {
  getProducts as getProductsFromDataSource,
  getProductBySlug as getProductBySlugFromDataSource,
  getRelatedProducts as getRelatedProductsFromDataSource,
  searchProducts as searchProductsFromDataSource,
  getPriceRange as getPriceRangeFromDataSource,
  slugToCategoryName,
} from "./services/productService";

// Alternative: Import from JSON data source (comment out the above and uncomment below to use JSON)
// import {
//   getProducts as getProductsFromDataSource,
//   getProductBySlug as getProductBySlugFromDataSource,
//   getRelatedProducts as getRelatedProductsFromDataSource,
//   searchProducts as searchProductsFromDataSource,
//   getPriceRange as getPriceRangeFromDataSource,
//   slugToCategoryName,
// } from "./productDataSource";

/**
 * Fetch all products with optional filters
 * @param {Object} options - Filter options
 * @returns {Promise<Object>} Products data with pagination
 */
export async function getProducts(options = {}) {
  const {
    category = null,
    subcategory = null,
    minPrice = null,
    maxPrice = null,
    inStock = null,
    sortBy = "newest",
    sortOrder = "desc",
    page = 1,
    limit = 12,
    featured = null,
  } = options;

  // Map old sortBy values to new ones
  const sortByMapping = {
    created_at: "newest",
    price: sortOrder === "asc" ? "price-asc" : "price-desc",
    rating: "rating",
    name: "newest",
  };

  const mappedSortBy = sortByMapping[sortBy] || sortBy;

  // Convert category slug to name (e.g., "plants" -> "Plants")
  const categoryName = category ? slugToCategoryName(category) : null;

  // Build price range if min/max specified
  const priceRange =
    minPrice !== null || maxPrice !== null
      ? { min: minPrice, max: maxPrice }
      : null;

  const result = await getProductsFromDataSource({
    category: categoryName,
    subcategory,
    priceRange,
    sortBy: mappedSortBy,
    page,
    pageSize: limit,
    featured,
    inStock: inStock === null ? true : inStock,
  });

  // Calculate proper pagination
  const totalProducts = result.total || result.data?.length || 0;
  const totalPages = Math.ceil(totalProducts / limit);

  // Return in the format expected by existing code
  return {
    products: result.data || [],
    total: totalProducts,
    page,
    limit,
    totalPages: totalPages || 1,
  };
}

/**
 * Fetch a single product by slug
 * @param {string} slug - Product slug
 * @returns {Promise<Object|null>} Product object or null
 */
export async function getProductBySlug(slug) {
  const result = await getProductBySlugFromDataSource(slug);
  return result.data || null;
}

/**
 * Fetch related products by category
 * @param {string} category - Product category
 * @param {string} productId - Current product ID to exclude
 * @param {number} limit - Number of products to fetch
 * @returns {Promise<Array>} Array of related products
 */
export async function getRelatedProducts(category, productId, limit = 6) {
  const result = await getRelatedProductsFromDataSource(
    category,
    productId,
    limit
  );
  return result.data || [];
}

/**
 * Fetch reviews for a product
 * @param {number} productId - Product ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Reviews data with pagination
 */
export async function getProductReviews(productId, options = {}) {
  // Return empty reviews for now
  return {
    reviews: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  };
}

/**
 * Submit a product review
 * @param {Object} reviewData - Review data
 * @returns {Promise<Object|null>} Created review or null
 */
export async function submitReview(reviewData) {
  // Return null for now (reviews will be enabled with Firebase integration)
  console.log("Review submission will be enabled with Firebase integration");
  return null;
}

/**
 * Get average rating breakdown for a product
 * @param {number} productId - Product ID
 * @returns {Promise<Object>} Rating breakdown
 */
export async function getRatingBreakdown(productId) {
  // Return empty breakdown for now
  return { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
}

/**
 * Search products by name or description
 * @param {string} searchTerm - Search term
 * @param {Object} options - Additional filter options
 * @returns {Promise<Object>} Search results
 */
export async function searchProducts(searchTerm, options = {}) {
  const { category = null, page = 1, limit = 12 } = options;

  const result = await searchProductsFromDataSource(searchTerm, {
    category,
    pageSize: limit,
  });

  return {
    products: result.data || [],
    total: result.data?.length || 0,
    page,
    limit,
    totalPages: result.hasMore ? page + 1 : page,
  };
}

/**
 * Get price range for products (optionally filtered by category and subcategory)
 * @param {string|null} category - Optional category filter (slug or name)
 * @param {string|null} subcategory - Optional subcategory filter
 * @returns {Promise<Object>} Min and max prices
 */
export async function getPriceRange(category = null, subcategory = null) {
  // Convert category slug to name if provided
  const categoryName = category ? slugToCategoryName(category) : null;
  const result = await getPriceRangeFromDataSource(categoryName, subcategory);
  return result.data || { min: 0, max: 10000 };
}
