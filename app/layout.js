import "../styles/globals.scss";
import Providers from "./providers";
import AutoLogoutProvider from "@/components/general/AutoLogoutProvider";
import InitialLoader from "@/components/general/InitialLoader";
import TheLoader from "@/components/general/TheLoader";

export const metadata = {
  metadataBase: new URL("https://vrikshvalley.com"),
  title: {
    default:
      "Vriksh Valley - Premium Plants & Eco-Friendly Products | Online Plant Nursery",
    template: "%s | Vriksh Valley",
  },
  description:
    "Discover premium indoor plants, outdoor plants, and eco-friendly organic products at Vriksh Valley. Expert plant care, sustainable gardening solutions, and home delivery across India.",
  keywords: [
    "plants online",
    "buy plants online",
    "indoor plants",
    "outdoor plants",
    "organic products",
    "plant nursery",
    "eco-friendly products",
    "sustainable gardening",
    "home plants",
    "garden plants",
  ],
  authors: [{ name: "Vriksh Valley" }],
  creator: "Vriksh Valley",
  publisher: "Vriksh Valley",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://vrikshvalley.com",
    title: "Vriksh Valley - Premium Plants & Eco-Friendly Products",
    description:
      "Buy premium indoor & outdoor plants, organic products, and sustainable gardening solutions. Expert care tips and home delivery across India.",
    siteName: "Vriksh Valley",
    images: [
      {
        url: "/big-logo.png",
        width: 1200,
        height: 630,
        alt: "Vriksh Valley - Premium Plant Nursery",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vriksh Valley - Premium Plants & Eco-Friendly Products",
    description:
      "Buy premium plants and organic products online. Expert care & home delivery.",
    images: ["/big-logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add when available: google: 'your-google-verification-code',
    // Add when available: yandex: 'your-yandex-verification-code',
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/logo.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/logo.png", sizes: "180x180", type: "image/png" }],
    other: [
      {
        rel: "mask-icon",
        url: "/logo.png",
      },
    ],
  },
  manifest: "/manifest.json",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-title" content="Vriksh Valley" />
        <link rel="canonical" href="https://vrikshvalley.com" />
        <meta name="theme-color" content="#073b22" />
        <link rel="icon" type="image/x-icon" href="https://vrikshvalley.com/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="https://vrikshvalley.com/favicon.ico" />
      </head>
      <body>
        <InitialLoader />
        <TheLoader fullscreen showOnRouteChange />
        <Providers>
          <AutoLogoutProvider>
            <div className="container">{children}</div>
          </AutoLogoutProvider>
        </Providers>
      </body>
    </html>
  );
}
