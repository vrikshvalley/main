import Topbar from "@/components/general/Topbar";
import Navbar from "@/components/general/Navbar";
import Footer from "@/components/general/Footer";
import WhatsAppButton from "@/components/general/WhatsAppButton";

export const metadata = {
  title: "Plant Doctor - Expert Plant Consultation | Vriksh Valley",
  description:
    "Book a 30-minute expert plant consultation with our Plant Doctor. Get personalized diagnosis, care plans, and expert recommendations for your plants.",
  keywords: [
    "plant consultation",
    "plant doctor",
    "plant care advice",
    "plant health diagnosis",
    "expert gardening",
  ],
  openGraph: {
    title: "Plant Doctor - Expert Plant Consultation",
    description:
      "Book a professional plant consultation to diagnose and care for your plants.",
    url: "https://vrikshvalley.com/plant-doctor",
  },
};

export default function PlantDoctorLayout({ children }) {
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
