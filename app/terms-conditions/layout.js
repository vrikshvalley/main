import Topbar from "@/components/general/Topbar";
import Navbar from "@/components/general/Navbar";
import Footer from "@/components/general/Footer";
import WhatsAppButton from "@/components/general/WhatsAppButton";

export const metadata = {
  title: "Terms & Conditions - Legal Information",
  description:
    "Read our terms and conditions for using Vriksh Valley services. Information about orders, user accounts, intellectual property, and legal policies.",
  keywords: [
    "terms of service",
    "legal terms",
    "user agreement",
    "website terms",
  ],
  openGraph: {
    title: "Terms & Conditions - Vriksh Valley",
    description: "Legal terms and conditions for using Vriksh Valley services.",
    url: "https://vrikshvalley.com/terms-conditions",
  },
};

export default function TermsConditionsLayout({ children }) {
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
