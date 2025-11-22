import TopBar from "@/components/general/Topbar";
import Navbar from "@/components/general/Navbar";
import Footer from "@/components/general/Footer";
import WhatsAppButton from "@/components/general/WhatsAppButton";

export const metadata = {
  title: "Join the Green Movement - Vriksh Valley",
  description:
    "Become part of Vriksh Valley's community of plant lovers. Together, we turn concrete dreams into leafy sanctuaries and make every corner of India a little bit more green.",
  keywords: [
    "green movement",
    "sustainable gardening",
    "plant community",
    "eco-friendly",
    "urban gardening",
    "Vriksh Valley story",
  ],
  openGraph: {
    title: "Join the Green Movement - Vriksh Valley",
    description:
      "Join us in growing greener homes and embracing a sustainable lifestyle.",
    url: "https://vrikshvalley.com/join-green-movement",
  },
};

export default function JoinGreenMovementLayout({ children }) {
  return (
    <>
      <TopBar />
      <Navbar />
      {children}
      <Footer />
      <WhatsAppButton />
    </>
  );
}
