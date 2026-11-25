import { blogPosts } from "@/lib/blogData";
import { getCategories, getProducts } from "@/lib/services/productService";

export const revalidate = 3600;

export default async function sitemap() {
  const baseUrl = "https://vrikshvalley.com";
  const now = new Date().toISOString();

  const staticRoutes = [
    "",
    "/about-us",
    "/contact-us",
    "/faqs",
    "/products",
    "/blogs",
    "/offers",
    "/testimonials",
    "/plant-doctor",
    "/our-story",
    "/join-green-movement",
    "/where-nature-meets-nurture",
    "/privacy-policy",
    "/terms-conditions",
    "/shipping-policies",
    "/cancellation-refund",
    "/disclaimer",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: route === "" || route === "/products" ? "daily" : "weekly",
    priority: route === "" ? 1.0 : route === "/products" ? 0.9 : 0.8,
  }));

  const blogRoutes = (blogPosts || [])
    .filter((b) => b?.slug)
    .map((b) => ({
      url: `${baseUrl}/blogs/${b.slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    }));

  let categoryRoutes = [];
  let productRoutes = [];

  try {
    const { data: categories } = await getCategories();
    if (Array.isArray(categories)) {
      for (const cat of categories) {
        if (cat?.slug) {
          categoryRoutes.push({
            url: `${baseUrl}/category/${cat.slug}`,
            lastModified: now,
            changeFrequency: "weekly",
            priority: 0.75,
          });
          for (const sub of cat.subcategories || []) {
            if (sub?.slug) {
              categoryRoutes.push({
                url: `${baseUrl}/category/${cat.slug}/${sub.slug}`,
                lastModified: now,
                changeFrequency: "weekly",
                priority: 0.7,
              });
            }
          }
        }
      }
    }
  } catch {
    // Fallback to static/blog routes if Firestore is unavailable at build time
  }

  try {
    const { data: products } = await getProducts({ pageSize: 1000 });
    if (Array.isArray(products)) {
      productRoutes = products
        .filter((p) => p?.slug && p.id !== "plant-doctor")
        .map((p) => ({
          url: `${baseUrl}/products/${p.slug}`,
          lastModified: p.updated_at || p.created_at || now,
          changeFrequency: "daily",
          priority: 0.8,
        }));
    }
  } catch {
    // Fallback gracefully
  }

  return [...staticRoutes, ...categoryRoutes, ...productRoutes, ...blogRoutes];
}
