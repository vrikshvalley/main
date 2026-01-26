import Topbar from "@/components/general/Topbar";
import Navbar from "@/components/general/Navbar";
import Footer from "@/components/general/Footer";
import WhatsAppButton from "@/components/general/WhatsAppButton";

export const metadata = {
  title: "Customer Testimonials - Real Reviews",
  description:
    "Read authentic reviews from our satisfied customers. Discover why plant lovers trust Vriksh Valley for healthy plants, expert care, and exceptional service.",
  keywords: [
    "plant reviews",
    "customer testimonials",
    "plant nursery reviews",
    "customer feedback",
    "plant store ratings",
  ],
  openGraph: {
    title: "Customer Testimonials - Vriksh Valley",
    description: "Real stories from real plant lovers who trust Vriksh Valley",
    url: "https://vrikshvalley.com/testimonials",
  },
};

export default function TestimonialsLayout({ children }) {
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
