import Topbar from "@/components/general/Topbar";
import Navbar from "@/components/general/Navbar";
import Footer from "@/components/general/Footer";
import WhatsAppButton from "@/components/general/WhatsAppButton";


export const metadata = {
  title: "Shop Plants Online - Indoor & Outdoor Plants",
  description:
    "Browse our premium collection of indoor plants, outdoor plants, succulents, bonsai, and organic gardening products. High-quality plants with expert care tips and home delivery.",
  keywords: [
    "buy plants online",
    "indoor plants for sale",
    "outdoor plants online",
    "succulents online",
    "bonsai plants",
    "garden plants",
    "plant shop",
  ],
  openGraph: {
    title: "Shop Plants Online - Premium Indoor & Outdoor Plants",
    description:
      "Discover our curated collection of healthy, premium plants. Free shipping and expert care guidance included.",
    url: "https://vrikshvalley.com/products",
  },
};

export default function ProductsLayout({ children }) {
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
