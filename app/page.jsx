"use client"

import Topbar from "../components/general/Topbar";
import Navbar from "../components/general/Navbar";
import HeroSlider from "../components/Homepage/HeroSlider";
import CategoryCircles from "../components/Homepage/CategoryCircles";
import FeaturedProducts from "../components/Homepage/FeaturedProducts";
import NewArrivals from "../components/Homepage/NewArrivals";
import PremiumCollection from "@/components/Homepage/PremiumCollection";
import WhyChooseUs from "@/components/Homepage/WhyChooseUs";
import BringNatureHome from "@/components/Homepage/BringNatureHome";
import ImpactCounter from "@/components/Homepage/ImpactCounter";
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

import { motion } from "framer-motion";

export default function Home() {


  // Animation variants for sections
  const sectionVariants = {
    hidden: { 
      opacity: 0, 
      y: 60,
      scale: 0.98
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.85,
        ease: [0.22, 1, 0.36, 1],
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  };

  return (
    <>
      <Topbar />
      <Navbar />
      
      {/* Hero Section - No motion wrapper to avoid containing block for fixed elements */}
      <section
        id="hero"
        className="scroll-section"
      >
        <HeroSlider />
      </section>

      <Ads 
        items={['New Arrivals', 'Premium Collection', 'Indoor Plants', 'Outdoor Plants', 'Succulents', 'Bonsai']} 
        bgColor="primary" 
        textColor="light"
        speed={25}
      />

      {/* Category Section */}
      <div className="no-horizontal-padding">
      <motion.section
        id="categories"
        className="scroll-section home-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={sectionVariants}
      >
        <CategoryCircles />
        </motion.section>
        </div>

      {/* Featured Products Section */}
      <motion.section
        id="featured"
        className="scroll-section home-section featured-section-wrapper"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={sectionVariants}
      >
        <FeaturedProducts />
      </motion.section>

      <Ads 
        items={['Free Shipping', 'Expert Care Tips', '100% Organic', 'Healthy Plants Guaranteed']} 
        bgColor="yellow" 
        textColor="dark" 
        speed={30}
        direction="reverse"
        renderLinks={false}
      />

      {/* Why Choose Us Section */}
      <motion.section
        id="why-choose"
        className="scroll-section home-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={sectionVariants}
      >
        <WhyChooseUs />
      </motion.section>

        {/* Shop By Category Section */}
        <motion.section
          id="shop-by-category"
          className="scroll-section home-section"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={sectionVariants}
        >
          <ShopByCategory />
        </motion.section>

      {/* New Arrivals Section */}
      <motion.section
        id="new-arrivals"
        className="scroll-section home-section new-arrivals-section-wrapper"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={sectionVariants}
      >
        <NewArrivals />
      </motion.section>
      
      <ParallaxDivider />

      {/* Bring Nature Home Section */}
      <motion.section
        className="scroll-section home-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={sectionVariants}
      >
        <BringNatureHome />
      </motion.section>

      {/* Premium Collection Section */}
      <motion.section
        id="premium-collection"
        className="scroll-section home-section premium-section-wrapper"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={sectionVariants}
      >
        <PremiumCollection />
      </motion.section>

      {/* Testimonials Section */}
      <motion.section
        id="testimonials"
        className="scroll-section home-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={sectionVariants}
      >
        <Testimonials />
      </motion.section>

      {/* FAQs Section */}
      <motion.section
        id="faqs"
        className="scroll-section home-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={sectionVariants}
      >
        <PlantFAQs />
      </motion.section>

      {/* Location Section */}
      <motion.section
        id="location"
        className="scroll-section home-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={sectionVariants}
      >
        <OurLocation />
      </motion.section>

      {/* Gallery Section */}
      <motion.section
        id="gallery"
        className="scroll-section home-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={sectionVariants}
      >
        <Gallery />
      </motion.section>

      {/* About Section */}
      <motion.section
        id="about"
        className="scroll-section home-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={sectionVariants}
      >
        <About />
      </motion.section>

      {/* Impact Counter (Mobile Only) */}
      <motion.section
        className="scroll-section home-section impact-mobile-only"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={sectionVariants}
      >
        <ImpactCounter variant="compact" showHeader={false} />
      </motion.section>

      {/* Meet Our Team Section */}
      <motion.section
        id="team"
        className="scroll-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={sectionVariants}
      >
        <MeetOurTeam />
      </motion.section>

      {/* Blogs Section */}
      <motion.section
        id="blogs"
        className="scroll-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={sectionVariants}
      >
        <OurBlogs />
      </motion.section>

      <Footer />
  <WhatsAppButton />

    </>
  );
}
