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
import CartModal from "@/components/cart/CartModal";
import Ads from "@/components/general/Ads";

import { React, useState } from "react";
import { useEffect } from "react";
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

  return (
    <>
      <CartModal isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      <TopBar />
      <Navbar onCartClick={() => setCartOpen(true)} />
      <HeroSlider />
      <Ads 
        items={['New Arrivals', 'Premium Collection', 'Indoor Plants', 'Outdoor Gardens', 'Succulents', 'Bonsai']} 
        bgColor="primary" 
        textColor="light"
        speed={25}
      />
      <CategoryCircles />
      <FeaturedProducts title="Featured Products"  />
      <Ads 
        items={['Free Shipping', 'Expert Care Tips', '100% Organic', 'Healthy Plants Guaranteed']} 
        bgColor="yellow" 
        textColor="dark" 
        speed={30}
      />
      <WhyChooseUs />
      <FeaturedProducts title="New Arrivals"/>
      <BringNatureHome />
      <ImpactCounter />
      <Testimonials />
      <PlantFAQs />
      <OurLocation />
      <Gallery />
      <About />
      <OurBlogs />
      <Footer />
      <WhatsAppButton />
      
    </>
  );
}
