"use client";

import { motion } from "framer-motion";

export default function Template({ children }) {
  return (
    <>
      <motion.div
        className="page-transition-overlay"
        initial={{ scaleY: 1 }}
        animate={{ scaleY: 0 }}
        exit={{ scaleY: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "#073b22",
          zIndex: 9999,
          transformOrigin: "top",
          pointerEvents: "none",
        }}
      />
      {children}
    </>
  );
}
