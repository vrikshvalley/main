/**
 * Firestore Product Service
 *
 * Handles all product-related operations with Firestore including:
 * - Fetching products with filters, sorting, pagination
 * - Search functionality
 * - Product reviews
 * - Featured products
 */

import { db } from "../firebaseConfig";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  addDoc,
  updateDoc,
  arrayUnion,
  Timestamp,
} from "firebase/firestore";

/**
 * Get products with filters, sorting, and pagination
 */
export async function getProducts({
  category = null,
  subcategory = null,
  priceRange = null,
  sortBy = "newest", // newest, price-asc, price-desc, rating, featured
  pageSize = 20,
  lastDoc = null,
  featured = null,
  inStock = true,
} = {}) {
  try {
    let q = collection(db, "products");
    const constraints = [];

    // SIMPLIFIED: Only add ONE filter to avoid complex index requirements
    // Filter by category if provided (most common use case)
    if (category) {
      constraints.push(where("category", "==", category));
    }

    // Add simple limit
    constraints.push(limit(pageSize * 3)); // Fetch more to filter client-side

    if (lastDoc) {
      constraints.push(startAfter(lastDoc));
    }

    q = query(q, ...constraints);
    const snapshot = await getDocs(q);

    // Get all products and filter client-side to avoid complex indexes
    let products = snapshot.docs.map((doc) => {
      const rawData = doc.data();
      return {
        id: doc.id,
        ...rawData,
        // Ensure images is always an array
        images: rawData.images || (rawData.image ? [rawData.image] : []),
        // Ensure price is properly set
        price: rawData.price || rawData.priceValue || 0,
        // Ensure stock/quantity is set
        stock:
          rawData.stock !== undefined ? rawData.stock : rawData.quantity || 0,
      };
    });

    // Client-side filtering
    if (subcategory) {
      products = products.filter(
        (p) => p.subcategories && p.subcategories.includes(subcategory)
      );
    }

    if (featured !== null) {
      products = products.filter((p) => p.featured === featured);
    }

    if (inStock) {
      products = products.filter((p) => p.stock_status === "in_stock");
    }

    if (priceRange) {
      products = products.filter((p) => {
        const price = p.price || p.priceValue || 0;
        if (priceRange.min !== undefined && price < priceRange.min)
          return false;
        if (priceRange.max !== undefined && price > priceRange.max)
          return false;
        return true;
      });
    }

    // Client-side sorting
    products.sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return (
            (a.price || a.priceValue || 0) - (b.price || b.priceValue || 0)
          );
        case "price-desc":
          return (
            (b.price || b.priceValue || 0) - (a.price || a.priceValue || 0)
          );
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        case "featured":
          if (b.featured !== a.featured) return b.featured ? 1 : -1;
          return (b.rating || 0) - (a.rating || 0);
        case "newest":
        default:
          const aTime = a.createdAt?.toMillis?.() || a.created_at || 0;
          const bTime = b.createdAt?.toMillis?.() || b.created_at || 0;
          return bTime - aTime;
      }
    });

    // Apply pagination limit
    const paginatedProducts = products.slice(0, pageSize);
    const totalCount = products.length;

    return {
      data: paginatedProducts,
      total: totalCount,
      lastDoc: snapshot.docs[snapshot.docs.length - 1],
      hasMore: totalCount > pageSize,
      error: null,
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    return { data: [], lastDoc: null, hasMore: false, error };
  }
}

/**
 * Get single product by ID
 */
export async function getProductById(productId) {
  try {
    const docRef = doc(db, "products", productId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const rawData = docSnap.data();

      // Normalize product data to ensure consistent structure
      const productData = {
        id: docSnap.id,
        ...rawData,
        // Ensure images is always an array
        images: rawData.images || (rawData.image ? [rawData.image] : []),
        // Ensure price is properly set
        price: rawData.price || rawData.priceValue || 0,
        // Ensure stock/quantity is set
        stock:
          rawData.stock !== undefined ? rawData.stock : rawData.quantity || 0,
      };

      return {
        data: productData,
        error: null,
      };
    } else {
      return { data: null, error: new Error("Product not found") };
    }
  } catch (error) {
    console.error("Error fetching product:", error);
    return { data: null, error };
  }
}

/**
 * Get product by slug
 */
export async function getProductBySlug(slug) {
  try {
    console.log("Fetching product with slug:", slug);
    const q = query(
      collection(db, "products"),
      where("slug", "==", slug),
      limit(1)
    );
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      const rawData = doc.data();

      // Normalize product data to ensure consistent structure
      const productData = {
        id: doc.id,
        ...rawData,
        // Ensure images is always an array
        images: rawData.images || (rawData.image ? [rawData.image] : []),
        // Ensure price is properly set
        price: rawData.price || rawData.priceValue || 0,
        // Ensure stock/quantity is set
        stock:
          rawData.stock !== undefined ? rawData.stock : rawData.quantity || 0,
      };

      console.log("Product found and normalized:", productData);
      return {
        data: productData,
        error: null,
      };
    } else {
      console.log("No product found with slug:", slug);
      return { data: null, error: new Error("Product not found") };
    }
  } catch (error) {
    console.error("Error fetching product by slug:", error);
    return { data: null, error };
  }
}

/**
 * Search products by query
 * Uses searchKeywords array for matching
 */
export async function searchProducts(searchQuery, filters = {}) {
  try {
    if (!searchQuery || searchQuery.trim().length < 2) {
      return { data: [], error: null };
    }

    const searchTerm = searchQuery.toLowerCase().trim();

    // Get all products (we'll filter client-side due to Firestore limitations)
    // For production, use Algolia or Typesense for better search
    let q = collection(db, "products");
    const constraints = [];

    // Apply filters if provided
    if (filters.category) {
      constraints.push(where("category", "==", filters.category));
    }

    if (filters.inStock) {
      constraints.push(where("stock_status", "==", "in_stock"));
    }

    if (constraints.length > 0) {
      q = query(q, ...constraints);
    }

    const snapshot = await getDocs(q);

    // Client-side search through searchKeywords array
    const allProducts = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const results = allProducts.filter((product) => {
      // Check if search term matches any keyword
      const matchesKeyword = product.searchKeywords?.some((keyword) =>
        keyword.includes(searchTerm)
      );

      // Also check name and description directly
      const matchesName = product.name?.toLowerCase().includes(searchTerm);
      const matchesDesc = product.description
        ?.toLowerCase()
        .includes(searchTerm);

      return matchesKeyword || matchesName || matchesDesc;
    });

    // Sort by relevance (exact name matches first)
    results.sort((a, b) => {
      const aExactMatch = a.name.toLowerCase() === searchTerm;
      const bExactMatch = b.name.toLowerCase() === searchTerm;

      if (aExactMatch && !bExactMatch) return -1;
      if (!aExactMatch && bExactMatch) return 1;

      // Then by rating
      return (b.rating || 0) - (a.rating || 0);
    });

    return { data: results, error: null };
  } catch (error) {
    console.error("Error searching products:", error);
    return { data: [], error };
  }
}

/**
 * Get search suggestions
 */
export async function getSearchSuggestions(searchQuery, limit = 5) {
  try {
    if (!searchQuery || searchQuery.trim().length < 2) {
      return { data: [], error: null };
    }

    const searchTerm = searchQuery.toLowerCase().trim();

    // Get products that might match
    const snapshot = await getDocs(
      query(collection(db, "products"), limit(50))
    );

    const suggestions = new Set();

    snapshot.docs.forEach((doc) => {
      const data = doc.data();

      // Add matching product names
      if (data.name?.toLowerCase().includes(searchTerm)) {
        suggestions.add(data.name);
      }

      // Add matching categories
      if (data.category?.toLowerCase().includes(searchTerm)) {
        suggestions.add(data.category);
      }

      // Add matching tags
      data.tags?.forEach((tag) => {
        if (tag.toLowerCase().includes(searchTerm)) {
          suggestions.add(tag);
        }
      });
    });

    return {
      data: Array.from(suggestions).slice(0, limit),
      error: null,
    };
  } catch (error) {
    console.error("Error getting suggestions:", error);
    return { data: [], error };
  }
}

/**
 * Get featured products
 */
export async function getFeaturedProducts(count = 8) {
  try {
    const q = query(
      collection(db, "products"),
      where("featured", "==", true),
      orderBy("rating", "desc"),
      limit(count)
    );

    const snapshot = await getDocs(q);
    const products = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { data: products, error: null };
  } catch (error) {
    console.error("Error fetching featured products:", error);
    return { data: [], error };
  }
}

/**
 * Add review to product
 */
export async function addProductReview(productId, review) {
  try {
    const reviewData = {
      ...review,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    // Add review to reviews subcollection
    const reviewRef = await addDoc(
      collection(db, "products", productId, "reviews"),
      reviewData
    );

    // Update product rating and review count
    const productRef = doc(db, "products", productId);
    const productSnap = await getDoc(productRef);

    if (productSnap.exists()) {
      const product = productSnap.data();
      const currentRating = product.rating || 0;
      const currentCount = product.review_count || 0;

      const newCount = currentCount + 1;
      const newRating =
        (currentRating * currentCount + review.rating) / newCount;

      await updateDoc(productRef, {
        rating: newRating,
        review_count: newCount,
        updatedAt: Timestamp.now(),
      });
    }

    return { data: { id: reviewRef.id, ...reviewData }, error: null };
  } catch (error) {
    console.error("Error adding review:", error);
    return { data: null, error };
  }
}

/**
 * Get product reviews
 */
export async function getProductReviews(productId, limitCount = 10) {
  try {
    const q = query(
      collection(db, "products", productId, "reviews"),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    const reviews = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { data: reviews, error: null };
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return { data: [], error };
  }
}

/**
 * Get all categories with subcategories extracted from products
 */
export async function getCategories() {
  try {
    // Fetch categories
    const categoriesSnapshot = await getDocs(collection(db, "categories"));
    const categories = categoriesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Fetch all products to extract subcategories
    const productsSnapshot = await getDocs(collection(db, "products"));

    // Build subcategories map for each category
    const categorySubcategoriesMap = {};

    productsSnapshot.docs.forEach((doc) => {
      const product = doc.data();
      const categoryName = product.category;
      const subcategories = product.subcategories || [];

      if (categoryName && subcategories.length > 0) {
        if (!categorySubcategoriesMap[categoryName]) {
          categorySubcategoriesMap[categoryName] = new Set();
        }

        subcategories.forEach((sub) => {
          if (sub && sub.trim()) {
            categorySubcategoriesMap[categoryName].add(sub.trim());
          }
        });
      }
    });

    // Attach unique subcategories to each category
    const categoriesWithSubcategories = categories.map((category) => {
      const subcategoriesSet =
        categorySubcategoriesMap[category.name] || new Set();
      const subcategoriesArray = Array.from(subcategoriesSet)
        .sort()
        .map((subName) => ({
          name: subName,
          slug: subName.toLowerCase().replace(/\s+/g, "-"),
        }));

      return {
        ...category,
        subcategories: subcategoriesArray,
      };
    });

    return { data: categoriesWithSubcategories, error: null };
  } catch (error) {
    console.error("Error fetching categories:", error);
    return { data: [], error };
  }
}

/**
 * Get related products by category
 */
export async function getRelatedProducts(category, productId, limitCount = 6) {
  try {
    let q = collection(db, "products");
    const constraints = [];

    if (category) {
      constraints.push(where("category", "==", category));
    }

    constraints.push(limit(limitCount + 5)); // Fetch extra to filter out current product

    if (constraints.length > 0) {
      q = query(q, ...constraints);
    }

    const snapshot = await getDocs(q);

    let products = snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .filter((p) => p.id !== productId) // Exclude current product
      .slice(0, limitCount);

    return { data: products, error: null };
  } catch (error) {
    console.error("Error fetching related products:", error);
    return { data: [], error };
  }
}

/**
 * Get price range for products (optionally filtered by category and subcategory)
 * Uses simplified query to avoid complex indexes
 */
export async function getPriceRange(category = null, subcategory = null) {
  try {
    let q = collection(db, "products");
    const constraints = [];

    // Only filter by category if provided (avoid complex indexes)
    if (category) {
      constraints.push(where("category", "==", category));
    }

    // Note: We can't add subcategory filter without creating a complex index
    // So we'll filter client-side if needed

    if (constraints.length > 0) {
      q = query(q, ...constraints);
    }

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return { data: { min: 0, max: 10000 }, error: null };
    }

    let products = snapshot.docs.map((doc) => doc.data());

    // Filter by subcategory client-side if needed
    if (subcategory) {
      products = products.filter(
        (p) => p.subcategories && p.subcategories.includes(subcategory)
      );
    }

    if (products.length === 0) {
      return { data: { min: 0, max: 10000 }, error: null };
    }

    const prices = products
      .map((p) => p.price || p.priceValue || 0)
      .filter((price) => price > 0);

    if (prices.length === 0) {
      return { data: { min: 0, max: 10000 }, error: null };
    }

    return {
      data: {
        min: Math.min(...prices),
        max: Math.max(...prices),
      },
      error: null,
    };
  } catch (error) {
    console.error("Error fetching price range:", error);
    return { data: { min: 0, max: 10000 }, error };
  }
}

/**
 * Convert category slug to category name
 * Firestore stores category names with proper casing (e.g., "Plants")
 * URLs use slugs (e.g., "plants")
 */
export function slugToCategoryName(slug) {
  if (!slug) return null;

  const mapping = {
    plants: "Plants",
    seeds: "Seeds",
    planters: "Planters",
    "plant-care": "Plant Care",
    decor: "Decor",
    accessories: "Accessories",
  };

  return mapping[slug.toLowerCase()] || slug;
}
