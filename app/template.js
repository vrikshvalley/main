"use client";

import { motion } from "framer-motion";

export default function Template({ children }) {
  return (
    <>
      {/* page-transition-overlay removed to disable green full-screen transition */}
      {children}
    </>
  );
}
