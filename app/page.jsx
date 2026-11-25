import Topbar from "../components/general/Topbar";
import Navbar from "../components/general/Navbar";
import LivingShelfHero from "../components/Homepage/LivingShelfHero";
import CategoryCircles from "../components/Homepage/CategoryCircles";
import FeaturedProducts from "../components/Homepage/FeaturedProducts";
import NewArrivals from "../components/Homepage/NewArrivals";
import PremiumCollection from "@/components/Homepage/PremiumCollection";
import WhyChooseUs from "@/components/Homepage/WhyChooseUs";
import BringNatureHome from "@/components/Homepage/BringNatureHome";
import Testimonials from "@/components/Homepage/Testimonials";
import PlantFAQs from "@/components/Homepage/PlantFAQs";
import OurLocation from "@/components/Homepage/OurLocation";
import Gallery from "@/components/Homepage/Gallery";
import About from "@/components/Homepage/AboutUs";
import MeetOurTeam from "@/components/Homepage/MeetOurTeam";
import OurBlogs from "@/components/Homepage/OurBlogs";
import Footer from "@/components/general/Footer";
import WhatsAppButton from "@/components/general/WhatsAppButton";
import Ads from "@/components/general/Ads";
import ShopByCategory from "@/components/Homepage/ShopByCategory";
import ParallaxDivider from "@/components/general/ParallaxDivider";

import Reveal from "@/components/general/Reveal";
import OfferCountdown from "@/components/general/OfferCountdown";

// Canonical for the homepage only (not inherited by other routes).
export const metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <>
      <Topbar />
      <Navbar />
      
      {/* Soonest-ending offer from lib/offers.js (renders nothing when none is running) */}
      <OfferCountdown />

      {/* Hero: no motion wrapper here, to avoid a containing block for fixed elements */}
      <section
        id="hero"
        className="scroll-section"
      >
        <LivingShelfHero />
      </section>

      <Ads 
        items={['New Arrivals', 'Premium Collection', 'Indoor Plants', 'Outdoor Plants', 'Succulents', 'Bonsai']} 
        bgColor="primary" 
        textColor="light"
        speed={25}
      />

      {/* Category Section */}
      <div className="no-horizontal-padding">
      <Reveal id="categories" className="scroll-section home-section">
        <CategoryCircles />
        </Reveal>
        </div>

      {/* Featured Products Section */}
      <Reveal id="featured" className="scroll-section home-section featured-section-wrapper">
        <FeaturedProducts />
      </Reveal>

      <Ads
        items={['Bring Nature Home with Vriksh Valley', 'Rare Plants', 'Terrace Garden', 'Gifting Plants', 'Plant Care Essentials', 'Decor Planters']}
        bgColor="yellow"
        textColor="dark"
        speed={22}
      />

      {/* Why Choose Us Section */}
      <section id="why-choose" className="scroll-section home-section">
        <WhyChooseUs />
      </section>

        {/* Shop By Category Section */}
        <section id="shop-by-category" className="scroll-section home-section">
          <ShopByCategory />
        </section>

      {/* New Arrivals Section */}
      <Reveal id="new-arrivals" className="scroll-section home-section new-arrivals-section-wrapper">
        <NewArrivals />
      </Reveal>
      
      <ParallaxDivider />

      {/* Bring Nature Home Section */}
      <section className="scroll-section home-section">
        <BringNatureHome />
      </section>

      {/* Premium Collection Section */}
      <Reveal id="premium-collection" className="scroll-section home-section premium-section-wrapper">
        <PremiumCollection />
      </Reveal>

      {/* Testimonials Section */}
      <section id="testimonials" className="scroll-section home-section">
        <Testimonials />
      </section>

      {/* FAQs Section */}
      <Reveal id="faqs" className="scroll-section home-section">
        <PlantFAQs />
      </Reveal>

      {/* Location Section */}
      <section id="location" className="scroll-section home-section">
        <OurLocation />
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="scroll-section home-section">
        <Gallery />
      </section>

      {/* About Section */}
      <section id="about" className="scroll-section home-section">
        <About />
      </section>

      {/* Meet Our Team Section */}
      <section id="team" className="scroll-section">
        <MeetOurTeam />
      </section>

      {/* Blogs Section */}
      <section id="blogs" className="scroll-section">
        <OurBlogs />
      </section>

      <Footer />
  <WhatsAppButton />

    </>
  );
}
