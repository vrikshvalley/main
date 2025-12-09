import React from "react";
import Navbar from "@/components/general/Navbar";
import Footer from "@/components/general/Footer";
import WhatsAppButton from "@/components/general/WhatsAppButton";

export const metadata = {
  title: "Where Nature Meets Nurture | Vriksh Valley",
  description:
    "Discover the story and philosophy behind Vriksh Valley. Where Nature Meets Nurture: our journey, our promises, and our commitment to every plant and gardener.",
};

export default function WhereNatureMeetsNurtureLayout({ children }) {
  return <>
    <Navbar />
    {children}
    <Footer />
    <WhatsAppButton />
  </>;
}
