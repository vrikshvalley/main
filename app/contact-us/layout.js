import Topbar from "@/components/general/Topbar";
import Navbar from "@/components/general/Navbar";
import Footer from "@/components/general/Footer";
import WhatsAppButton from "@/components/general/WhatsAppButton";

export const metadata = {
  title: "Contact Us - Get in Touch",
  description:
    "Contact Vriksh Valley for plant care advice, orders, or inquiries. Reach us via phone, email, WhatsApp, or visit our location. Expert plant guidance available.",
  keywords: [
    "contact plant nursery",
    "plant care help",
    "customer support",
    "plant advice",
    "nursery location",
  ],
  openGraph: {
    title: "Contact Vriksh Valley - Plant Care Experts",
    description:
      "Get expert plant advice and support. Contact us via phone, email, or WhatsApp.",
    url: "https://vrikshvalley.com/contact-us",
  },
};

export default function ContactUsLayout({ children }) {
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
