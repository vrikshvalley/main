import TopBar from "@/components/general/Topbar";
import Navbar from "@/components/general/Navbar";
import Footer from "@/components/general/Footer";
import WhatsAppButton from "@/components/general/WhatsAppButton";

export const metadata = {
  title: "About Us - Our Mission & Values",
  description:
    "Learn about Vriksh Valley, your trusted partner in bringing nature closer. We offer premium indoor & outdoor plants with expert care, sustainability, and quality-first approach.",
  keywords: [
    "about vriksh valley",
    "plant nursery mission",
    "eco-friendly plants",
    "sustainable gardening",
    "plant care experts",
  ],
  openGraph: {
    title: "About Vriksh Valley - Our Mission & Values",
    description:
      "Premium plant nursery committed to quality, sustainability, and expert customer care. Bringing nature closer to you.",
    url: "https://vrikshvalley.com/about-us",
  },
};

export default function AboutUsLayout({ children }) {
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
