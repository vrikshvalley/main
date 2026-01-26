export default function sitemap() {
  const baseUrl = "https://vrikshvalley.com";

  // Static routes
  const routes = [
    "",
    "/about",
    "/contact-us",
    "/faqs",
    "/products",
    "/blogs",
    "/offers",
    "/testimonials",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1.0 : 0.8,
  }));

  // Add product categories (you can fetch these dynamically from Firebase if needed)
  const categories = [
    "indoor-plants",
    "outdoor-plants",
    "flowering-plants",
    "succulents",
    "herbs",
    "organic-products",
  ].map((category) => ({
    url: `${baseUrl}/category/${category}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...routes, ...categories];
}
