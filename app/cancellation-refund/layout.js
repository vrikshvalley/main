import Topbar from "@/components/general/Topbar";
import Navbar from "@/components/general/Navbar";
import Footer from "@/components/general/Footer";
import WhatsAppButton from "@/components/general/WhatsAppButton";

export const metadata = {
  title: "Cancellation & Return Policy - Plant Returns",
  description:
    "Learn about our plant cancellation and return policy. Information on order cancellations, plant returns, refund process, and satisfaction guarantee.",
  keywords: [
    "plant return policy",
    "order cancellation",
    "refund policy",
    "plant guarantee",
  ],
  openGraph: {
    title: "Cancellation & Return Policy - Vriksh Valley",
    description:
      "Our cancellation and return policy for plant orders and eco-friendly products.",
    url: "https://vrikshvalley.com/cancellation-return",
  },
};

export default function CancellationReturnLayout({ children }) {
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
