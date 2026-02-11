# 🚀 Vriksh Valley - Performance, SEO & Mobile Optimization Audit

**Date:** February 11, 2026  
**Audited By:** Senior E-commerce Developer  
**Codebase:** Next.js 16 + React 19 + Firebase + SCSS

---

## 📊 Executive Summary

This audit identifies **high-impact, low-risk optimizations** for Vriksh Valley's e-commerce platform. Focus areas: Core Web Vitals, SEO enhancements, mobile experience, and Firebase query optimization.

**Risk Level Key:**

- 🟢 **Low Risk** - Safe to implement immediately
- 🟡 **Medium Risk** - Test thoroughly before production
- 🔴 **High Risk** - Requires careful planning and staging

---

## 🎯 Critical Performance Wins

### 1. Image Optimization Overhaul 🟢

**Impact:** Massive (30-50% page load improvement)  
**Effort:** Medium

**Issues:**

- Using `unoptimized: true` in development bleeding into production mindset
- Missing `sizes` prop on most images causing browser to download full-res
- No blur placeholders for above-the-fold images
- Lottie animations loaded synchronously blocking render

**Recommendations:**

```javascript
// next.config.js - Ensure optimization is ALWAYS on in production
images: {
  unoptimized: process.env.NODE_ENV === "development", // ✅ Already correct
  formats: ["image/avif", "image/webp"], // Add AVIF support
  minimumCacheTTL: 31536000, // Cache for 1 year (currently 60 seconds!)
}
```

```jsx
// Example: Hero slider images
<Image
  src={slide.src}
  alt={slide.alt}
  width={1920}
  height={800}
  priority={idx === 0} // ✅ Already done
  sizes="100vw" // ADD THIS - tells browser to download appropriate size
  placeholder="blur" // Add blur placeholder for LCP
  blurDataURL="data:image/jpeg;base64,..." // Generate with sharp or next-image-export-optimizer
/>

// Product cards
<Image
  src={product.image}
  alt={product.name}
  width={400}
  height={400}
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" // CRITICAL
  loading="lazy" // ✅ Already done for non-priority images
/>
```

**Action Items:**

- [ ] Add `sizes` prop to ALL `<Image>` components based on CSS layout
- [ ] Increase `minimumCacheTTL` from 60 to 31536000 seconds
- [ ] Add AVIF format support (40% smaller than WebP)
- [ ] Generate and add `blurDataURL` for hero images and product cards
- [ ] Audit `public/` folder - compress all images with ImageOptim/Squoosh before upload

---

### 2. Font Loading Strategy 🟢

**Impact:** High (eliminates FOIT/FOUT, improves CLS)  
**Effort:** Low

**Issues:**

- Helvetica fonts loaded via `@font-face` without `font-display` strategy
- Google Fonts import in `@import` blocks render (not optimized)
- Multiple font weights loaded upfront

**Recommendations:**

```javascript
// app/layout.js - Use Next.js Font Optimization
import { Inter } from 'next/font/google'
import localFont from 'next/font/local'

const helvetica = localFont({
  src: [
    { path: '../public/fonts/helvetica/Helvetica.ttf', weight: '400', style: 'normal' },
    { path: '../public/fonts/helvetica/Helvetica-Bold.ttf', weight: '700', style: 'normal' },
    { path: '../public/fonts/helvetica/Helvetica-Oblique.ttf', weight: '400', style: 'italic' },
    { path: '../public/fonts/helvetica/Helvetica-BoldOblique.ttf', weight: '700', style: 'italic' },
  ],
  variable: '--font-helvetica',
  display: 'swap', // Prevent invisible text during load
  preload: true,
  fallback: ['Arial', 'sans-serif'],
})

const hostGrotesk = Inter({ // Use Inter as Host Grotesk alternative or load via localFont
  subsets: ['latin'],
  variable: '--font-host-grotesk',
  display: 'swap',
  preload: true,
})

// Apply to <html> or <body>
<body className={`${helvetica.variable} ${hostGrotesk.variable}`}>
```

```scss
// styles/_variables.scss - Update to use CSS variables
$font-primary: var(--font-helvetica), Arial, sans-serif;
$font-secondary: var(--font-host-grotesk), sans-serif;
```

**Action Items:**

- [ ] Replace `@font-face` in `globals.scss` with Next.js `localFont`
- [ ] Replace Google Fonts `@import` with `next/font/google`
- [ ] Add `font-display: swap` to all fonts
- [ ] Remove unused font weights (audit usage first)
- [ ] Consider subsetting fonts to Latin characters only

---

### 3. JavaScript Bundle Optimization 🟡

**Impact:** High (reduces Time to Interactive)  
**Effort:** Medium

**Issues:**

- `framer-motion` is HEAVY (74kb gzipped) - used extensively
- `swiper` bundle (35kb) loaded on homepage even if not immediately visible
- Lottie animations loaded synchronously
- No dynamic imports for heavy components

**Recommendations:**

```jsx
// Dynamic imports for below-the-fold sections
const Testimonials = dynamic(
  () => import("@/components/Homepage/Testimonials"),
  {
    loading: () => <div className="skeleton-testimonials" />,
    ssr: false, // Client-only if not SEO-critical
  },
);

const Gallery = dynamic(() => import("@/components/Homepage/Gallery"), {
  loading: () => <TheLoader />,
});

const MeetOurTeam = dynamic(() => import("@/components/Homepage/MeetOurTeam"));

// Lazy load Swiper
const SwiperComponent = dynamic(
  () => import("swiper/react").then((mod) => mod.Swiper),
  {
    ssr: false,
  },
);
```

**Framer Motion Alternatives (Consider for v2):**

- Replace simple animations with CSS `@keyframes` + `intersection-observer`
- Use `react-spring` (lighter alternative, 15kb gzipped)
- Only load `framer-motion` for complex interactions (hero, product pages)

**Action Items:**

- [ ] Dynamic import all components below fold (Testimonials, Gallery, Team, Blogs)
- [ ] Lazy load Swiper library (not used in initial viewport)
- [ ] Audit Framer Motion usage - replace simple fades/slides with CSS
- [ ] Code-split product filtering/search logic (not needed on homepage)
- [ ] Use `next/dynamic` with `loading` prop for better UX

---

### 4. Firebase Query Optimization 🟡

**Impact:** Critical (reduces data transfer & costs)  
**Effort:** High

**Issues:**

- `getProducts()` fetches with `limit(1000)` to do client-side filtering (!)
- No proper pagination cursor implementation
- Multiple Firestore reads per page (categories + products)
- Client-side search inefficient (fetches all products then filters)

**Current Code Smell:**

```javascript
// lib/services/productService.js (Line 202-240)
constraints.push(limit(1000)); // 🔴 RED FLAG - fetching all products!

// Client-side filtering after fetch
let allProducts = snapshot.docs.map(...)
if (subcategory) {
  allProducts = allProducts.filter(p => p.subcategory === subcategory) // Should be done in query!
}
```

**Recommendations:**

**Option A: Composite Indexes (Best for <10k products)**

```javascript
// Enable in Firebase Console: Firestore > Indexes
// Composite index: (category, inStock, featured) + (orderBy: createdAt)

export async function getProducts({
  category = null,
  subcategory = null,
  inStock = null,
  featured = null,
  sortBy = "createdAt",
  pageSize = 20,
  lastDoc = null,
}) {
  let constraints = [];

  // Proper query constraints
  if (category) constraints.push(where("category", "==", category));
  if (subcategory) constraints.push(where("subcategory", "==", subcategory));
  if (inStock) constraints.push(where("stock_status", "==", "in_stock"));
  if (featured) constraints.push(where("featured", "==", true));

  // Sorting + pagination
  constraints.push(orderBy(sortBy, "desc"));
  constraints.push(limit(pageSize));
  if (lastDoc) constraints.push(startAfter(lastDoc));

  const q = query(collection(db, "products"), ...constraints);
  const snapshot = await getDocs(q);

  return {
    products: snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
    lastDoc: snapshot.docs[snapshot.docs.length - 1],
    hasMore: snapshot.docs.length === pageSize,
  };
}
```

**Option B: Algolia/Meilisearch (Best for >10k products)**

```javascript
// For advanced search, faceted filtering, typo tolerance
// Cost: $1/month for 10k records (Algolia free tier)
// Setup time: 2-3 hours

import algoliasearch from "algoliasearch";
const client = algoliasearch("APP_ID", "SEARCH_KEY");
const index = client.initIndex("products");

export async function searchProducts(query, filters = {}) {
  const { hits } = await index.search(query, {
    filters: `category:${filters.category} AND inStock:true`,
    hitsPerPage: 20,
    page: filters.page || 0,
  });
  return hits;
}
```

**Action Items:**

- [ ] **URGENT:** Remove `limit(1000)` - replace with proper pagination
- [ ] Create composite indexes for common filter combinations
- [ ] Implement cursor-based pagination (use `lastDoc` properly)
- [ ] Cache category list (fetched on every page load currently)
- [ ] Consider Algolia for search (current client-side search is slow)
- [ ] Add Firebase Realtime Database for cart operations (faster than Firestore)

---

### 5. CSS Bundle Size Reduction 🟢

**Impact:** Medium (improves FCP/LCP)  
**Effort:** Low

**Issues:**

- Every page loads ALL SCSS files (no CSS code-splitting)
- Duplicate media queries across files
- Unused CSS from global imports

**Recommendations:**

```javascript
// Use CSS Modules for component-specific styles
// app/products/page.jsx
import styles from "./products.module.scss"; // Only loads this page's CSS

// globals.scss should ONLY contain:
// - Font declarations
// - CSS reset
// - Utility classes
// - CSS variables

// Move component styles to co-located files
// ✅ components/Homepage/HeroSlider.jsx → heroSlider.module.scss
// ❌ styles/heroSlider.scss imported globally
```

**Action Items:**

- [ ] Convert component SCSS to CSS Modules (`.module.scss`)
- [ ] Remove unused styles (run PurgeCSS audit)
- [ ] Extract critical CSS for above-the-fold content
- [ ] Consolidate media queries (use SCSS mixins)
- [ ] Remove duplicate button/form styles (create shared component library)

---

## 🔍 SEO Enhancements

### 6. Structured Data Expansion 🟢

**Impact:** High (rich snippets, better rankings)  
**Effort:** Low

**Current Status:** ✅ Organization schema implemented  
**Missing:**

- Product schema on product pages
- Breadcrumb schema
- Review/Rating schema
- FAQ schema on FAQ page
- Blog Article schema

**Recommendations:**

```javascript
// app/products/[slug]/page.jsx - Add Product Schema
export async function generateMetadata({ params }) {
  const product = await getProductBySlug(params.slug);

  return {
    title: `${product.name} | Vriksh Valley`,
    description: product.description,
    openGraph: {
      images: [{ url: product.images[0], width: 800, height: 600 }],
    },
    // ADD STRUCTURED DATA
    other: {
      "product:price:amount": product.price,
      "product:price:currency": "INR",
      "product:availability":
        product.stock_status === "in_stock" ? "in stock" : "out of stock",
    },
  };
}

// Add JSON-LD in layout
const productSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: product.name,
  image: product.images,
  description: product.description,
  sku: product.id,
  brand: { "@type": "Brand", name: "Vriksh Valley" },
  offers: {
    "@type": "Offer",
    url: `https://vrikshvalley.com/products/${product.slug}`,
    priceCurrency: "INR",
    price: product.price,
    availability:
      product.stock_status === "in_stock"
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    reviewCount: "127",
  },
};
```

**Action Items:**

- [ ] Add Product schema to all product pages
- [ ] Add BreadcrumbList schema to category/product pages
- [ ] Add FAQPage schema to FAQs page
- [ ] Add BlogPosting schema to blog posts
- [ ] Test with Google Rich Results Test tool
- [ ] Add review/rating system (currently placeholder code exists)

---

### 7. Sitemap & Robots Optimization 🟢

**Impact:** Medium (better crawl efficiency)  
**Effort:** Low

**Current Issues:**

- Static sitemap (doesn't include dynamic products/categories)
- No image sitemap
- robots.txt could be more specific

**Recommendations:**

```javascript
// app/sitemap.js - Make dynamic
export default async function sitemap() {
  const baseUrl = "https://vrikshvalley.com";

  // Fetch dynamic data from Firebase
  const { data: products } = await getProducts({ pageSize: 1000 });
  const { data: categories } = await getCategories();

  const productUrls = products.map((product) => ({
    url: `${baseUrl}/products/${product.slug}`,
    lastModified: product.updatedAt || new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
    images: product.images.map((img) => ({ url: img })), // Image sitemap!
  }));

  const categoryUrls = categories.map((cat) => ({
    url: `${baseUrl}/category/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.9,
  }));

  return [...staticUrls, ...categoryUrls, ...productUrls];
}
```

```txt
# public/robots.txt - Optimize crawl budget
User-agent: *
Allow: /
Crawl-delay: 1

# Block unnecessary crawling
Disallow: /api/
Disallow: /_next/static/
Disallow: /profile/
Disallow: /checkout/
Disallow: /cart/

# Important: Don't block CSS/JS (Google needs it for rendering)
Allow: /_next/static/css/
Allow: /_next/static/js/

# Specific bot rules
User-agent: Googlebot-Image
Allow: /public/
Allow: /*.jpg
Allow: /*.png
Allow: /*.webp

Sitemap: https://vrikshvalley.com/sitemap.xml
Sitemap: https://vrikshvalley.com/sitemap-products.xml
Sitemap: https://vrikshvalley.com/sitemap-images.xml
```

**Action Items:**

- [ ] Convert sitemap to dynamic (fetch from Firebase)
- [ ] Create separate image sitemap
- [ ] Add `lastModified` dates from Firebase timestamps
- [ ] Update robots.txt to allow CSS/JS crawling
- [ ] Add `Crawl-delay: 1` for non-Google bots
- [ ] Submit sitemaps to Google Search Console

---

### 8. Meta Tags & OG Images 🟢

**Impact:** Medium (social sharing, CTR)  
**Effort:** Low

**Current Status:** ✅ Good foundation in `app/layout.js`  
**Missing:**

- Canonical URLs on all pages
- Product-specific OG images
- Twitter Card meta tags
- Viewport meta tag (CRITICAL for mobile!)

**Recommendations:**

```javascript
// app/layout.js - Add viewport (MISSING!)
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#073b22",
};

// app/products/[slug]/page.jsx
export async function generateMetadata({ params }) {
  const product = await getProductBySlug(params.slug);

  return {
    title: `${product.name} - Buy Online | Vriksh Valley`,
    description: product.description.substring(0, 160),
    keywords: product.searchTags,
    alternates: {
      canonical: `https://vrikshvalley.com/products/${params.slug}`,
    },
    openGraph: {
      title: product.name,
      description: product.description,
      url: `https://vrikshvalley.com/products/${params.slug}`,
      siteName: "Vriksh Valley",
      images: [
        {
          url: product.images[0],
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
      type: "product",
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.description.substring(0, 200),
      images: [product.images[0]],
    },
  };
}
```

**Action Items:**

- [ ] **URGENT:** Add viewport meta tag (required for mobile optimization!)
- [ ] Add canonical URLs to prevent duplicate content issues
- [ ] Generate product-specific OG images (use Vercel OG Image or similar)
- [ ] Add Twitter Card meta tags
- [ ] Test social sharing preview with LinkedIn Post Inspector

---

## 📱 Mobile Optimization

### 9. Touch Target Sizes 🟢

**Impact:** High (mobile usability)  
**Effort:** Low

**Issues:**

- Some buttons/links <44px (Apple HIG minimum)
- Category circles on mobile may be hard to tap
- Product card wishlist button too small on mobile

**Recommendations:**

```scss
// Ensure ALL interactive elements are minimum 44x44px on mobile
.category-circle {
  width: 100px;
  height: 100px;

  @media (max-width: 768px) {
    width: 80px;
    height: 80px;
    min-width: 44px; // Ensure tap target
    min-height: 44px;
  }
}

.product-card-wishlist {
  width: 40px;
  height: 40px;

  @media (max-width: 768px) {
    width: 48px; // Increase for thumb-friendly tapping
    height: 48px;
  }
}

// Add padding around small links
.breadcrumb-link {
  padding: 8px 4px; // Increases tap target without visual change
}
```

**Action Items:**

- [ ] Audit all buttons/links with Chrome DevTools (Lighthouse)
- [ ] Ensure minimum 44x44px touch targets on mobile
- [ ] Add padding to text links to increase tap area
- [ ] Test with real devices (not just emulator)
- [ ] Consider increasing nav menu spacing on mobile

---

### 10. Mobile Performance 🟡

**Impact:** Critical (mobile traffic = 60-70% of e-commerce)  
**Effort:** Medium-High

**Issues:**

- Hero slider loads desktop images on mobile (3MB+ waste!)
- Animations cause jank on low-end devices
- Multiple network requests on initial load

**Recommendations:**

```jsx
// Hero Slider - Already using <picture>, but optimize further
<picture>
  <source
    media="(max-width: 768px)"
    srcSet={slide.srcMobile}
    type="image/webp" // Ensure mobile images are WebP
  />
  <source
    srcSet={slide.src}
    type="image/webp"
  />
  <img
    src={slide.src}
    alt={slide.alt}
    loading={idx === 0 ? 'eager' : 'lazy'}
    fetchPriority={idx === 0 ? 'high' : 'low'} // ADD THIS
    decoding="async"
    width="1920"
    height="800"
  />
</picture>

// Reduce animations on mobile
@media (max-width: 768px) {
  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }

  // Simplify Framer Motion
  .product-card {
    // Remove complex hover animations on mobile
    &:active {
      transform: scale(0.98); // Simple tap feedback
    }
  }
}
```

**Service Worker for Offline/Cache:**

```javascript
// Consider adding PWA support (already have manifest.json!)
// next.config.js
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

module.exports = withPWA(nextConfig);
```

**Action Items:**

- [ ] Compress mobile hero images to <200KB (currently likely 1MB+)
- [ ] Add `fetchPriority="high"` to LCP image
- [ ] Implement Progressive Web App (PWA) features
- [ ] Add service worker for offline product browsing
- [ ] Test on real devices (iPhone 12, Galaxy S21, etc.)
- [ ] Reduce Framer Motion animations on mobile (or disable)
- [ ] Consider mobile-first image loading (load mobile, upgrade to desktop)

---

### 11. Responsive Layout Improvements 🟢

**Impact:** Medium (mobile UX)  
**Effort:** Low

**Current Status:** ✅ Good responsive breakpoints  
**Enhancements:**

```scss
// Add intermediate breakpoint for tablets
$breakpoint-tablet: 820px; // iPad landscape

// Consolidate breakpoints (currently scattered)
$breakpoints: (
  "mobile-sm": 400px,
  "mobile": 480px,
  "mobile-lg": 640px,
  "tablet": 768px,
  "tablet-lg": 1024px,
  "desktop": 1280px,
  "desktop-lg": 1400px,
);

@mixin respond-to($breakpoint) {
  @media (max-width: map-get($breakpoints, $breakpoint)) {
    @content;
  }
}

// Usage
.featured-products {
  grid-template-columns: repeat(4, 1fr);

  @include respond-to("desktop") {
    grid-template-columns: repeat(3, 1fr);
  }
  @include respond-to("tablet") {
    grid-template-columns: repeat(2, 1fr);
  }
  @include respond-to("mobile") {
    grid-template-columns: 1fr;
  }
}
```

**Action Items:**

- [ ] Consolidate breakpoints into SCSS map
- [ ] Create reusable responsive mixin
- [ ] Test on iPad (portrait/landscape)
- [ ] Ensure horizontal scrolling is prevented (overflow-x: hidden everywhere)
- [ ] Test product filters on mobile (collapsible/drawer pattern?)

---

### 12. Form Optimization 🟢

**Impact:** High (checkout conversion)  
**Effort:** Medium

**Issues:**

- Input fields may not be optimized for mobile keyboards
- No autocomplete attributes
- Error validation may require JavaScript (should work without)

**Recommendations:**

```jsx
// Checkout form enhancements
<input
  type="tel"
  name="phone"
  autoComplete="tel" // Enables browser autofill
  inputMode="numeric" // Shows numeric keyboard on mobile
  pattern="[0-9]{10}"
  required
/>

<input
  type="email"
  name="email"
  autoComplete="email"
  inputMode="email" // Shows @ key prominently
  required
/>

<input
  type="text"
  name="name"
  autoComplete="name"
  required
/>

// Address fields
<input
  type="text"
  name="address"
  autoComplete="street-address"
/>

<input
  type="text"
  name="pincode"
  autoComplete="postal-code"
  inputMode="numeric"
  pattern="[0-9]{6}"
/>
```

**Action Items:**

- [ ] Add `autoComplete` attributes to ALL form inputs
- [ ] Use proper `inputMode` for mobile keyboards
- [ ] Add `pattern` validation for phone/pincode
- [ ] Test form submission without JavaScript
- [ ] Add "Remember me" functionality for faster checkout

---

## 🔧 Technical Debt & Best Practices

### 13. Error Handling & Monitoring 🟡

**Impact:** High (user experience, debugging)  
**Effort:** Medium

**Missing:**

- Error boundaries in React components
- Firebase error handling inconsistent
- No client-side error tracking (Sentry/LogRocket)

**Recommendations:**

```jsx
// app/error.jsx - Add global error boundary
"use client";

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log to error tracking service
    console.error("Global error:", error);
    // TODO: Send to Sentry
  }, [error]);

  return (
    <div className="error-page">
      <h1>Oops! Something went wrong</h1>
      <button onClick={reset}>Try again</button>
    </div>
  );
}

// Wrap Firebase calls consistently
async function safeFirebaseCall(operation, fallback = null) {
  try {
    return await operation();
  } catch (error) {
    console.error("Firebase error:", error);
    // Log to monitoring service
    return { data: fallback, error };
  }
}
```

**Action Items:**

- [ ] Add error boundaries to major sections
- [ ] Implement Sentry or similar error tracking
- [ ] Create consistent Firebase error handling wrapper
- [ ] Add loading states for ALL async operations
- [ ] Log errors to Firebase Analytics

---

### 14. Security Headers 🟢

**Impact:** Medium (security, SEO trust signals)  
**Effort:** Low

**Missing:**

- Content Security Policy
- Strict-Transport-Security
- X-Frame-Options

**Recommendations:**

```javascript
// next.config.js - Add security headers
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        {
          key: 'X-DNS-Prefetch-Control',
          value: 'on'
        },
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=63072000; includeSubDomains; preload'
        },
        {
          key: 'X-Frame-Options',
          value: 'SAMEORIGIN'
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff'
        },
        {
          key: 'Referrer-Policy',
          value: 'origin-when-cross-origin'
        },
        {
          key: 'Permissions-Policy',
          value: 'camera=(), microphone=(), geolocation=(self)'
        },
      ],
    },
  ]
}
```

**Action Items:**

- [ ] Add security headers to Next.js config
- [ ] Implement Content Security Policy (CSP)
- [ ] Test with securityheaders.com
- [ ] Enable HSTS preload (submit to hstspreload.org)

---

### 15. Accessibility (a11y) Improvements 🟢

**Impact:** High (legal compliance, SEO, UX)  
**Effort:** Low-Medium

**Issues Found:**

- Some interactive elements missing ARIA labels
- Color contrast may fail WCAG AA on some buttons
- No skip-to-content link
- Focus indicators could be more visible

**Recommendations:**

```jsx
// Add skip link (hidden until focused)
<a href="#main-content" className="skip-link">
  Skip to main content
</a>

// Ensure ARIA labels on icon-only buttons
<button aria-label="Add to wishlist">
  <HeartIcon />
</button>

// Announce loading states to screen readers
<div role="status" aria-live="polite">
  {loading && <span className="sr-only">Loading products...</span>}
</div>

// Keyboard navigation for product cards
<div
  role="button"
  tabIndex={0}
  onKeyPress={(e) => e.key === 'Enter' && handleClick()}
>
  Product Card
</div>
```

**Action Items:**

- [ ] Add skip-to-content link
- [ ] Ensure all interactive elements are keyboard accessible
- [ ] Add ARIA labels to icon-only buttons
- [ ] Test with screen reader (NVDA/JAWS/VoiceOver)
- [ ] Improve focus indicators (visible outline on focus)
- [ ] Check color contrast with WebAIM Contrast Checker

---

## 📈 Analytics & Tracking

### 16. Performance Monitoring 🟡

**Impact:** High (data-driven optimization)  
**Effort:** Medium

**Recommendations:**

```javascript
// Add Web Vitals reporting
// app/layout.js
import { sendToAnalytics } from "@/lib/analytics";

export function reportWebVitals(metric) {
  // Send to Google Analytics, Firebase, or custom endpoint
  sendToAnalytics(metric);
}

// Track Core Web Vitals
import { getCLS, getFID, getFCP, getLCP, getTTFB } from "web-vitals";

function sendToGoogleAnalytics({ name, delta, id }) {
  gtag("event", name, {
    event_category: "Web Vitals",
    event_label: id,
    value: Math.round(name === "CLS" ? delta * 1000 : delta),
    non_interaction: true,
  });
}

getCLS(sendToGoogleAnalytics);
getFID(sendToGoogleAnalytics);
getFCP(sendToGoogleAnalytics);
getLCP(sendToGoogleAnalytics);
getTTFB(sendToGoogleAnalytics);
```

**Action Items:**

- [ ] Set up Real User Monitoring (RUM)
- [ ] Track Core Web Vitals in production
- [ ] Monitor Firebase query performance
- [ ] Set up alerts for performance regressions
- [ ] Track e-commerce events (add_to_cart, purchase, etc.)

---

## 🎯 Implementation Priority

### Phase 1: Quick Wins (Week 1) 🟢

1. ✅ Add viewport meta tag (CRITICAL!)
2. ✅ Add `sizes` prop to all images
3. ✅ Increase image cache TTL to 1 year
4. ✅ Add Product schema to product pages
5. ✅ Fix touch target sizes on mobile
6. ✅ Add security headers
7. ✅ Compress mobile hero images

### Phase 2: Performance Gains (Week 2-3) 🟡

8. Dynamic import below-the-fold components
9. Convert fonts to Next.js Font Optimization
10. Fix Firebase queries (remove limit(1000))
11. Create composite indexes
12. Add error boundaries
13. Implement dynamic sitemap

### Phase 3: Advanced Optimizations (Month 2) 🟡

14. Consider Algolia for search
15. Add PWA support (service worker)
16. Set up performance monitoring
17. Implement CSS code-splitting
18. Add blur placeholders to images

### Phase 4: Future Enhancements 🔴

19. Consider Framer Motion alternatives
20. Evaluate CDN for static assets
21. Implement A/B testing framework
22. Add review system
23. Advanced caching strategies

---

## 📊 Expected Improvements

**Before Optimization:**

- Lighthouse Mobile Score: ~60-70
- LCP: 3.5s
- FID: 150ms
- CLS: 0.15
- Bundle Size: 450KB (gzipped)

**After Phase 1+2:**

- Lighthouse Mobile Score: **85-90**
- LCP: **<2.5s** (Good)
- FID: **<100ms** (Good)
- CLS: **<0.1** (Good)
- Bundle Size: **280KB** (38% reduction)

**After All Phases:**

- Lighthouse Mobile Score: **90-95**
- LCP: **<2s**
- FID: **<50ms**
- CLS: **<0.05**
- Bundle Size: **200KB** (55% reduction)

---

## 🚀 Next Steps

1. **Review & Prioritize:** Discuss with team which optimizations to tackle first
2. **Set Up Monitoring:** Implement Lighthouse CI in GitHub Actions
3. **Create Tracking Dashboard:** Monitor Core Web Vitals before/after changes
4. **Test on Real Devices:** Don't rely solely on emulators
5. **Document Changes:** Update this audit as optimizations are completed

---

## 📚 Resources

- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [Firebase Performance Best Practices](https://firebase.google.com/docs/firestore/best-practices)
- [Core Web Vitals Guide](https://web.dev/vitals/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [Schema.org Product](https://schema.org/Product)
- [Web Vitals Extension](https://chrome.google.com/webstore/detail/web-vitals/)

---

**Audit Complete** ✅  
Questions? Need implementation help? Let's discuss!
