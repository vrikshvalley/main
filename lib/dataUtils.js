/**
 * Data utilities for loading and transforming JSON collection data
 */

import categoriesData from "@/categories_collection.json";
import productsData from "@/products_collection.json";

/**
 * Transform categories JSON to app format
 * @returns {Array} Array of category objects
 */
export function getCategoriesFromJSON() {
  const categories = [];

  Object.entries(categoriesData).forEach(([categoryName, categoryData]) => {
    const category = {
      name: categoryData.name || categoryName,
      slug: categoryName.toLowerCase().replace(/\s+/g, "-"),
      description:
        categoryData.description || `Explore our collection of ${categoryName}`,
      productsCount: categoryData.productsCount || 0,
      imageUrl: {
        desktop: categoryData.imageUrl?.[0]?.desktop || "",
        mobile:
          categoryData.imageUrl?.[1]?.mobile ||
          categoryData.imageUrl?.[0]?.desktop ||
          "",
      },
      subcategories: [],
    };

    // Process subcategories if they exist
    if (
      categoryData.subcategories &&
      Array.isArray(categoryData.subcategories)
    ) {
      category.subcategories = categoryData.subcategories.map((subcat) => {
        const subcatName = Object.keys(subcat)[0];
        const subcatData = subcat[subcatName];

        return {
          name: subcatName,
          slug: subcatName
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/&/g, "and"),
          imageUrl: {
            desktop: subcatData.imageUrl?.[0]?.desktop || "",
            mobile:
              subcatData.imageUrl?.[1]?.mobile ||
              subcatData.imageUrl?.[0]?.desktop ||
              "",
          },
        };
      });
    }

    categories.push(category);
  });

  return categories;
}

/**
 * Transform products JSON to app format
 * @returns {Array} Array of product objects
 */
export function getProductsFromJSON() {
  const products = [];

  Object.entries(productsData).forEach(([productName, productData]) => {
    // Handle ImageUrl - can be string or array
    let images = [];
    if (productData.ImageUrl) {
      if (Array.isArray(productData.ImageUrl)) {
        images = productData.ImageUrl;
      } else if (typeof productData.ImageUrl === "string") {
        images = [productData.ImageUrl];
      }
    }

    // Handle Price - can be number, string, or array with variants
    let price = 0;
    let variants = [];
    let priceOnCustomization = false;

    if (typeof productData.Price === "string") {
      if (
        productData.Price.toLowerCase().includes("customization") ||
        productData.Price.toLowerCase().includes("custom")
      ) {
        priceOnCustomization = true;
        price = 0; // Set to 0 for customization products
      } else {
        price = parseFloat(productData.Price) || 0;
      }
    } else if (typeof productData.Price === "number") {
      price = productData.Price;
    } else if (
      Array.isArray(productData.Price) &&
      productData.Price.length > 0
    ) {
      // Handle price array with variants
      const priceObj = productData.Price[0];
      const variantKeys = Object.keys(priceObj);

      // Set base price to the minimum variant price
      price = Math.min(...Object.values(priceObj));

      // Create variants array
      variants = variantKeys.map((key) => ({
        name: key,
        price: priceObj[key],
        label:
          key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1"),
      }));
    }

    const product = {
      name: productName,
      slug: productName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim(),
      description: productData.Description || "",
      price: price,
      priceOnCustomization: priceOnCustomization,
      variants: variants,
      alternatePriceReason: productData["Alternate price(reason)"] || null,
      category: productData.Category || "",
      subcategories: productData["Sub-Categories"] || [],
      color: productData.Color,
      petFriendly: productData["Pet-Friendly Category"] || null,
      maintenanceLevel: productData["Maintenance Level"] || null,
      size: productData.Size,
      stock: productData["Stock "] || 0,
      inStock: (productData["Stock "] || 0) > 0,
      additionalDetails: productData["Additional Details"] || "",
      knowAboutProduct: productData["Know About the Product"] || "",
      whatsInTheBox: productData["What's In The Box?"] || "",
      images: images,
      searchTags: productData.SearchTags || [],
      // Add fields needed by existing components
      rating: 4.5, // Default rating
      reviews: 0,
      reviews_count: 0,
      featured: false,
      id: productName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    products.push(product);
  });

  return products;
}

/**
 * Get category by slug
 * @param {string} slug - Category slug
 * @returns {Object|null} Category object or null
 */
export function getCategoryBySlug(slug) {
  const categories = getCategoriesFromJSON();
  return categories.find((cat) => cat.slug === slug) || null;
}

/**
 * Get products by category
 * @param {string} categoryName - Category name
 * @returns {Array} Array of products
 */
export function getProductsByCategory(categoryName) {
  const products = getProductsFromJSON();
  return products.filter((product) => product.category === categoryName);
}

/**
 * Get products by category and subcategory
 * @param {string} categoryName - Category name
 * @param {string} subcategoryName - Subcategory name
 * @returns {Array} Array of products
 */
export function getProductsByCategoryAndSubcategory(
  categoryName,
  subcategoryName
) {
  const products = getProductsFromJSON();
  return products.filter(
    (product) =>
      product.category === categoryName &&
      product.subcategories.includes(subcategoryName)
  );
}

/**
 * Get product by slug
 * @param {string} slug - Product slug
 * @returns {Object|null} Product object or null
 */
export function getProductBySlug(slug) {
  const products = getProductsFromJSON();
  return products.find((product) => product.slug === slug) || null;
}

/**
 * Search products
 * @param {string} searchTerm - Search term
 * @returns {Array} Array of matching products
 */
export function searchProducts(searchTerm) {
  const products = getProductsFromJSON();
  const term = searchTerm.toLowerCase();

  return products.filter(
    (product) =>
      product.name.toLowerCase().includes(term) ||
      product.description.toLowerCase().includes(term) ||
      product.searchTags.some((tag) => tag.toLowerCase().includes(term))
  );
}
