import TopBar from "@/components/general/Topbar";
import Navbar from "@/components/general/Navbar";
import Footer from "@/components/general/Footer";
import WhatsAppButton from "@/components/general/WhatsAppButton";

export const metadata = {
  title: "Shipping Policies - Delivery Information",
  description:
    "Learn about our plant shipping policies, delivery timelines, packaging methods, and shipping charges. Safe and secure plant delivery across India.",
  keywords: [
    "plant delivery",
    "shipping policy",
    "plant packaging",
    "delivery charges",
    "plant shipping",
  ],
  openGraph: {
    title: "Shipping Policies - Safe Plant Delivery",
    description:
      "Secure plant packaging and timely delivery. Check our shipping policies and delivery information.",
    url: "https://vrikshvalley.com/shipping-policies",
  },
};

export default function ShippingPoliciesLayout({ children }) {
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
