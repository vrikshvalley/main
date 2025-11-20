import { sampleProducts } from "./sampleProducts";

/**
 * Fetch all products with optional filters
 * @param {Object} options - Filter options
 * @returns {Promise<Array>} Array of products
 */
export async function getProducts(options = {}) {
  const {
    category = null,
    subcategory = null,
    minPrice = null,
    maxPrice = null,
    inStock = null,
    sortBy = "created_at",
    sortOrder = "desc",
    page = 1,
    limit = 12,
    featured = null,
  } = options;

  return getProductsFromSample(options);
}

/**
 * Helper function to get products from sample data
 * @param {Object} options - Filter options
 * @returns {Object} Filtered products
 */
function getProductsFromSample(options) {
  const {
    category = null,
    subcategory = null,
    minPrice = null,
    maxPrice = null,
    inStock = null,
    sortBy = "created_at",
    sortOrder = "desc",
    page = 1,
    limit = 12,
    featured = null,
  } = options;

  let filtered = [...sampleProducts];

  // Apply filters
  if (category) {
    filtered = filtered.filter((p) => p.category === category);
  }

  if (subcategory) {
    filtered = filtered.filter((p) => p.subcategory === subcategory);
  }

  if (minPrice !== null) {
    filtered = filtered.filter((p) => p.price >= minPrice);
  }

  if (maxPrice !== null) {
    filtered = filtered.filter((p) => p.price <= maxPrice);
  }

  if (inStock === true) {
    filtered = filtered.filter((p) => p.stock > 0);
  } else if (inStock === false) {
    filtered = filtered.filter((p) => p.stock === 0);
  }

  if (featured !== null) {
    filtered = filtered.filter((p) => p.featured === featured);
  }

  // Apply sorting
  filtered.sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];

    // Handle name sorting
    if (sortBy === "name") {
      return sortOrder === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }

    // Handle numeric sorting
    if (sortOrder === "asc") {
      return aVal - bVal;
    } else {
      return bVal - aVal;
    }
  });

  // Apply pagination
  const total = filtered.length;
  const from = (page - 1) * limit;
  const to = from + limit;
  const paginatedProducts = filtered.slice(from, to);

  return {
    products: paginatedProducts,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Fetch a single product by slug
 * @param {string} slug - Product slug
 * @returns {Promise<Object|null>} Product object or null
 */
export async function getProductBySlug(slug) {
  return sampleProducts.find((p) => p.slug === slug) || null;
}

/**
 * Fetch related products by category
 * @param {string} category - Product category
 * @param {number} productId - Current product ID to exclude
 * @param {number} limit - Number of products to fetch
 * @returns {Promise<Array>} Array of related products
 */
export async function getRelatedProducts(category, productId, limit = 6) {
  return sampleProducts
    .filter((p) => p.category === category && p.id !== productId && p.stock > 0)
    .slice(0, limit);
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
  // Return null for now (reviews disabled without Supabase)
  console.log("Review submission disabled without Supabase");
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

  const searchLower = searchTerm.toLowerCase();
  let filtered = sampleProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(searchLower) ||
      p.description.toLowerCase().includes(searchLower)
  );

  if (category) {
    filtered = filtered.filter((p) => p.category === category);
  }

  const total = filtered.length;
  const from = (page - 1) * limit;
  const to = from + limit;
  const paginatedProducts = filtered.slice(from, to);

  return {
    products: paginatedProducts,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get price range for products (optionally filtered by category and subcategory)
 * @param {string|null} category - Optional category filter
 * @param {string|null} subcategory - Optional subcategory filter
 * @returns {Promise<Object>} Min and max prices
 */
export async function getPriceRange(category = null, subcategory = null) {
  let filtered = sampleProducts;
  if (category) {
    filtered = sampleProducts.filter((p) => p.category === category);
  }
  if (subcategory) {
    filtered = filtered.filter((p) => p.subcategory === subcategory);
  }

  if (filtered.length === 0) {
    return { min: 0, max: 0 };
  }

  const prices = filtered.map((p) => p.price);
  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
  };
}
