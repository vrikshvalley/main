import "../styles/globals.scss";
import Providers from "./providers";
import AutoLogoutProvider from "@/components/general/AutoLogoutProvider";
import InitialLoader from "@/components/general/InitialLoader";
import PageLoader from "@/components/general/PageLoader";

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
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="canonical" href="https://vrikshvalley.com" />
        <meta name="theme-color" content="#073b22" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/logo.png" />
      </head>
      <body>
        <InitialLoader />
        <PageLoader />
        <Providers>
          <AutoLogoutProvider>
            <div className="container">{children}</div>
          </AutoLogoutProvider>
        </Providers>
      </body>
    </html>
  );
}
