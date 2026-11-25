import Topbar from "@/components/general/Topbar";
import Navbar from "@/components/general/Navbar";
import Footer from "@/components/general/Footer";
import WhatsAppButton from "@/components/general/WhatsAppButton";

export const metadata = {
  title: "Offers on Plants, Planters & Seeds",
  description:
    "Limited-time offers from Vriksh Valley: featured plants, premium picks, planters and seeds at offer prices. Order on WhatsApp.",
  keywords: [
    "plant offers",
    "gardening deals",
    "plant discounts",
    "sale",
    "offers",
  ],
  openGraph: {
    title: "Plant Offers - Vriksh Valley",
    description: "Limited-time offers on featured plants, premium picks, planters and seeds.",
    url: "https://vrikshvalley.com/offers",
  },
  alternates: { canonical: "/offers" },
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
