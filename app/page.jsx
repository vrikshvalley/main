"use client"

import TopBar from "../components/general/Topbar";
import Navbar from "../components/general/Navbar";
import HeroSlider from "../components/Homepage/HeroSlider";
import CategoryCircles from "../components/Homepage/CategoryCircles";
import FeaturedProducts from "../components/Homepage/FeaturedProducts";
import WhyChooseUs from "@/components/Homepage/WhyChooseUs";
import BringNatureHome from "@/components/Homepage/BringNatureHome";
import ImpactCounter from "@/components/Homepage/ImpactCounter";
import Testimonials from "@/components/Homepage/Testimonials";
import PlantFAQs from "@/components/Homepage/PlantFAQs";
import OurLocation from "@/components/Homepage/OurLocation";
import Gallery from "@/components/Homepage/Gallery";
import About from "@/components/Homepage/AboutUs";
import OurBlogs from "@/components/Homepage/OurBlogs";
import Footer from "@/components/general/Footer";
import WhatsAppButton from "@/components/general/WhatsAppButton";


import HomeSidebar from "@/components/general/HomeSidebar";
import CartModal from "@/components/cart/CartModal";
import Ads from "@/components/general/Ads";

import { React, useState } from "react";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/navigation";  

export default function Home() {
  const router = useRouter();
  const [cartOpen, setCartOpen] = useState(false);


  useEffect(() => {
    async function checkAuth() {
    const { data, error } = await supabase.auth.getSession();
    if (data?.session) {
      router.push('/'); // redirect after login
    } else if (error) {
      router.push('/auth/login'); // redirect to login on error
    }
  }
    checkAuth();
  }, [router]);


  // Animation variants for sections
  const sectionVariants = {
    hidden: { 
      opacity: 0, 
      y: 50 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <>
      <CartModal isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      <TopBar />
      <Navbar onCartClick={() => setCartOpen(true)} />
      <HomeSidebar />
      
      {/* Hero Section */}
      <motion.section
        id="hero"
        className="scroll-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={sectionVariants}
      >
        <HeroSlider />
      </motion.section>

      <Ads 
        items={['New Arrivals', 'Premium Collection', 'Indoor Plants', 'Outdoor Gardens', 'Succulents', 'Bonsai']} 
        bgColor="primary" 
        textColor="light"
        speed={25}
      />

      {/* Category Section */}
      <motion.section
        id="categories"
        className="scroll-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={sectionVariants}
      >
        <CategoryCircles />
      </motion.section>

      {/* Featured Products Section */}
      <motion.section
        id="featured"
        className="scroll-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={sectionVariants}
      >
        <FeaturedProducts title="Featured Products"  />
      </motion.section>

      <Ads 
        items={['Free Shipping', 'Expert Care Tips', '100% Organic', 'Healthy Plants Guaranteed']} 
        bgColor="yellow" 
        textColor="dark" 
        speed={30}
      />

      {/* Why Choose Us Section */}
      <motion.section
        id="why-choose"
        className="scroll-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={sectionVariants}
      >
        <WhyChooseUs />
      </motion.section>

      {/* New Arrivals Section */}
      <motion.section
        className="scroll-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={sectionVariants}
      >
        <FeaturedProducts title="New Arrivals"/>
      </motion.section>

      {/* Bring Nature Home Section */}
      <motion.section
        className="scroll-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={sectionVariants}
      >
        <BringNatureHome />
      </motion.section>

      {/* Impact Counter Section */}
      <motion.section
        id="impact"
        className="scroll-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={sectionVariants}
      >
        <ImpactCounter />
      </motion.section>

      {/* Testimonials Section */}
      <motion.section
        id="testimonials"
        className="scroll-section"
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
        className="scroll-section"
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
        className="scroll-section"
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
        className="scroll-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={sectionVariants}
      >
        <Gallery />
      </motion.section>

      {/* About Section */}
      <motion.section
        id="about"
        className="scroll-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={sectionVariants}
      >
        <About />
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
