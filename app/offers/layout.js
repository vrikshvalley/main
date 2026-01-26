import Topbar from "@/components/general/Topbar";
import Navbar from "@/components/general/Navbar";
import Footer from "@/components/general/Footer";
import WhatsAppButton from "@/components/general/WhatsAppButton";

export const metadata = {
  title: "Exclusive Offers - Up to 60% OFF",
  description:
    "Discover amazing deals on plants, pots, and gardening essentials. Limited time offers with discounts up to 60% OFF on premium quality products.",
  keywords: [
    "plant offers",
    "gardening deals",
    "plant discounts",
    "sale",
    "offers",
  ],
  openGraph: {
    title: "Exclusive Plant Offers - Vriksh Valley",
    description: "Grab amazing deals on your favorite plants - up to 60% OFF!",
    url: "https://vrikshvalley.com/offers",
  },
};

export default function OffersLayout({ children }) {
  return (
    <>
      <Topbar />
      <Navbar />
      {children}
      <Footer />
      <WhatsAppButton />
    </>
  );
}
