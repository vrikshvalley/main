import TopBar from "@/components/general/Topbar";
import Navbar from "@/components/general/Navbar";
import Footer from "@/components/general/Footer";
import WhatsAppButton from "@/components/general/WhatsAppButton";

export const metadata = {
  title: "Our Story - Journey of Vriksh Valley",
  description:
    "Discover the journey of Vriksh Valley from a small nursery to a leading online plant store. Learn about our passion for plants, sustainability, and creating greener spaces.",
  keywords: [
    "vriksh valley story",
    "plant nursery history",
    "sustainable gardening journey",
    "eco-friendly business",
  ],
  openGraph: {
    title: "Our Story - The Vriksh Valley Journey",
    description:
      "From passion to mission - discover how Vriksh Valley became a trusted name in premium plants and sustainable gardening.",
    url: "https://vrikshvalley.com/our-story",
  },
};

export default function OurStoryLayout({ children }) {
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
