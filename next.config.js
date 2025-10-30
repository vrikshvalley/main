/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compiler: {
    styledComponents: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  images: {
    remotePatterns: [new URL("https://avatar.iran.liara.run/public/**")],
    qualities: [75, 85, 90, 95, 100],
  },
};

module.exports = nextConfig;
