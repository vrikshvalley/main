/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compress: true,
  compiler: {
    // Drop console.log/debug noise from production bundles; keep errors and warnings.
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },
  poweredByHeader: false,
  async redirects() {
    return [
      {
        source: "/auth",
        destination: "/auth/signin",
        permanent: true,
      },
      {
        source: "/blog",
        destination: "/blogs",
        permanent: true,
      },
      {
        source: "/blog/:slug",
        destination: "/blogs/:slug",
        permanent: true,
      },
    ];
  },
  async headers() {
    // Static files in /public: cache in the browser for 30 days and refresh in
    // the background for up to a year, so repeat visits and page changes load
    // images, icons and fonts from cache instead of the network.
    // (Hashed /_next/static files are cached as immutable by Next.js itself.)
    const staticAssetCache = {
      key: "Cache-Control",
      value: "public, max-age=2592000, stale-while-revalidate=31536000",
    };

    return [
      {
        source: "/:all*(png|jpg|jpeg|webp|avif|gif|svg|ico|woff|woff2|ttf|otf|mp4)",
        headers: [staticAssetCache],
      },
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self)",
          },
        ],
      },
    ];
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
    unoptimized: process.env.NODE_ENV === "development", // Skip optimization in dev to avoid 500 errors
    deviceSizes: [360, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000,
    qualities: [60, 70, 75, 85],
  },
};

module.exports = nextConfig;
