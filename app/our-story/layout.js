import TopBar from "@/components/general/Topbar";
import Navbar from "@/components/general/Navbar";
import Footer from "@/components/general/Footer";
import WhatsAppButton from "@/components/general/WhatsAppButton";

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
