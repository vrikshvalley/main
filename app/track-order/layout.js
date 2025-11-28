import Topbar from "@/components/general/Topbar";
import Navbar from "@/components/general/Navbar";
import Footer from "@/components/general/Footer";
import WhatsAppButton from "@/components/general/WhatsAppButton";

export const metadata = {
  title: "Track Your Plant Order - Order Status",
  description:
    "Track your plant order in real-time. Check delivery status, shipping updates, and estimated arrival time for your plants and eco-friendly products.",
  keywords: [
    "track order",
    "order tracking",
    "plant delivery status",
    "shipping updates",
  ],
  openGraph: {
    title: "Track Your Order - Vriksh Valley",
    description:
      "Track your plant order and check delivery status in real-time.",
    url: "https://vrikshvalley.com/track-order",
  },
};

export default function TrackOrderLayout({ children }) {
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
