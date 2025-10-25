"use client"

import TopBar from "../components/general/Topbar";
import Navbar from "../components/general/Navbar";
import HeroSlider from "../components/Homepage/HeroSlider";
import CategoryCircles from "../components/Homepage/CategoryCircles";
import FeaturedProducts from "../components/Homepage/FeaturedProducts";
import WhyChooseUs from "@/components/Homepage/WhyChooseUs";
import BringNatureHome from "@/components/Homepage/BringNatureHome";
import Testimonials from "@/components/Homepage/Testimonials";
import KnowYourPlants from "@/components/Homepage/KnowYourPlants";
import OurLocation from "@/components/Homepage/OurLocation";
import About from "@/components/Homepage/AboutUs";
import Footer from "@/components/general/Footer";

import { React, use } from "react";
import { useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/navigation";  

export default function Home() {
  const router = useRouter();
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
      <TopBar />
      <Navbar />
      <HeroSlider />
      <CategoryCircles />
      <FeaturedProducts title="Featured Products"  />
      <WhyChooseUs />
      <FeaturedProducts title="New Arrivals"/>
      <BringNatureHome />
      <Testimonials />
      <KnowYourPlants />
      <OurLocation />
      <About />
      <Footer />
    </>
  );
}
