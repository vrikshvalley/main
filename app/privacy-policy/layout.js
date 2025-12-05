import Topbar from "@/components/general/Topbar";
import Navbar from "@/components/general/Navbar";
import Footer from "@/components/general/Footer";
import WhatsAppButton from "@/components/general/WhatsAppButton";

export const metadata = {
  title: "Privacy Policy - Your Data Protection",
  description:
    "Vriksh Valley privacy policy. Learn how we collect, use, and protect your personal information when you shop with us.",
  keywords: [
    "privacy policy",
    "data protection",
    "user privacy",
    "personal information",
  ],
  openGraph: {
    title: "Privacy Policy - Vriksh Valley",
    description: "How we protect and handle your personal information.",
    url: "https://vrikshvalley.com/privacy-policy",
  },
};

export default function PrivacyPolicyLayout({ children }) {
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
