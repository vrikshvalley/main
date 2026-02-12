import "../styles/globals.scss";
import "../styles/initialLoader.scss";
import Providers from "./providers";
import AutoLogoutProvider from "@/components/general/AutoLogoutProvider";
import InitialLoader from "@/components/general/InitialLoader";
import TheLoader from "@/components/general/TheLoader";
import GlobalCartModal from "@/components/cart/GlobalCartModal";
import ToastContainer from "@/components/general/ToastContainer";
import ScrollToTop from "@/components/general/ScrollToTop";
// ScrollProgress removed - using native scrollbar
import HomeSidebar from "@/components/general/HomeSidebar";

export const metadata = {
  metadataBase: new URL("https://vrikshvalley.com"),
  title: {
    default: "Vriksh Valley – Where Nature Meets Nurture",
    template: "%s | Vriksh Valley",
  },
  description:
    "Elevate your home with handpicked, specially curated greenery and artisanal planters, creating a tranquil, nature-inspired haven.",
  keywords: [
    "Vriksh Valley",
    "indoor plants",
    "succulents",
    "ceramic planters",
    "nature-inspired decor",
    "handcrafted planters",
    "buy plants online",
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
    title: "Vriksh Valley – Where Nature Meets Nurture",
    description:
      "Elevate your home with handpicked, specially curated greenery and artisanal planters, creating a tranquil, nature-inspired haven.",
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
    title: "Vriksh Valley – Where Nature Meets Nurture",
    description:
      "Elevate your home with handpicked, specially curated greenery and artisanal planters.",
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
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Vriksh Valley",
    url: "https://vrikshvalley.com",
    logo: "https://vrikshvalley.com/big-logo.png",
    description:
      "Elevate your home with handpicked, specially curated greenery and artisanal planters, creating a tranquil, nature-inspired haven.",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+91-9204745612",
      contactType: "Customer Service",
      areaServed: "IN",
      availableLanguage: ["English", "Hindi"],
    },
    sameAs: [
      "https://www.instagram.com/vrikshvalley",
      "https://www.facebook.com/vrikshvalley",
    ],
    potentialAction: {
      "@type": "SearchAction",
      target: "https://vrikshvalley.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  const siteNavigationData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: [
      {
        "@type": "SiteNavigationElement",
        position: 1,
        name: "Indoor Plants",
        description:
          "Breathe life into your home – lush indoor plants to purify and uplift your space.",
        url: "https://vrikshvalley.com/category/indoor-plants",
      },
      {
        "@type": "SiteNavigationElement",
        position: 2,
        name: "Succulents",
        description:
          "Stunning succulents – low-maintenance green companions that bring calm and joy.",
        url: "https://vrikshvalley.com/category/succulents",
      },
      {
        "@type": "SiteNavigationElement",
        position: 3,
        name: "Ceramic Planters",
        description:
          "Handcrafted ceramic planters – stylish, artisanal homes for your beloved plants.",
        url: "https://vrikshvalley.com/category/ceramic-planters",
      },
      {
        "@type": "SiteNavigationElement",
        position: 4,
        name: "Decor",
        description:
          "Nature-inspired decor – accents to transform your space into a serene sanctuary.",
        url: "https://vrikshvalley.com/category/decor",
      },
      {
        "@type": "SiteNavigationElement",
        position: 5,
        name: "Contact Us",
        description: "Let's Talk Plants. Questions? Custom orders? We're here.",
        url: "https://vrikshvalley.com/contact-us",
      },
    ],
  };

  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-title" content="Vriksh Valley" />
        <link rel="canonical" href="https://vrikshvalley.com" />
        <meta name="theme-color" content="#073b22" />
        <link
          rel="icon"
          type="image/x-icon"
          href="https://vrikshvalley.com/favicon.ico"
          sizes="any"
        />
        <link
          rel="apple-touch-icon"
          href="https://vrikshvalley.com/favicon.ico"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(siteNavigationData),
          }}
        />
      </head>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `
          if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
          }
        `,
          }}
        />
        {/* ScrollProgress removed - using native scrollbar */}
        <InitialLoader />
        <TheLoader fullscreen showOnRouteChange />
        <Providers>
          <AutoLogoutProvider>
            <GlobalCartModal />
            <ToastContainer />
            <ScrollToTop />
            <HomeSidebar />
            <div className="container">{children}</div>
          </AutoLogoutProvider>
        </Providers>
      </body>
    </html>
  );
}
