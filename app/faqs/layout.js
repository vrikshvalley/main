import TopBar from "@/components/general/Topbar";
import Navbar from "@/components/general/Navbar";
import Footer from "@/components/general/Footer";
import WhatsAppButton from "@/components/general/WhatsAppButton";

export const metadata = {
  title: "FAQs - Plant Care Questions & Answers",
  description:
    "Find answers to common questions about plant care, ordering, shipping, returns, and more. Expert advice for indoor plants, outdoor plants, and gardening.",
  keywords: [
    "plant care faq",
    "plant questions",
    "how to care for plants",
    "plant delivery faq",
    "gardening help",
  ],
  openGraph: {
    title: "Plant Care FAQs - Expert Answers",
    description:
      "Get answers to all your plant care and ordering questions. Expert guidance for healthy, thriving plants.",
    url: "https://vrikshvalley.com/faqs",
  },
};

export default function FAQsLayout({ children }) {
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
