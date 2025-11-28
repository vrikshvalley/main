import Topbar from "@/components/general/Topbar";
import Navbar from "@/components/general/Navbar";
import Footer from "@/components/general/Footer";
import WhatsAppButton from "@/components/general/WhatsAppButton";

export const metadata = {
  title: "Terms of Service - Customer Agreement",
  description:
    "Our terms of service outline the agreement between Vriksh Valley and customers. Learn about our policies, services, user responsibilities, and legal terms.",
  keywords: [
    "terms of service",
    "service agreement",
    "customer terms",
    "plant store policies",
  ],
  openGraph: {
    title: "Terms of Service - Vriksh Valley",
    description:
      "Customer agreement and terms of service for Vriksh Valley plant nursery.",
    url: "https://vrikshvalley.com/terms-of-services",
  },
};

export default function TermsOfServicesLayout({ children }) {
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
