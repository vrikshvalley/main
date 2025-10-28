'use client';

import { motion } from 'framer-motion';
import { siWhatsapp } from 'simple-icons';
import '@/styles/whatsappButton.scss';

export default function WhatsAppButton() {
  const message = 'Hello! I am interested in your plants.';
  
  const openWhatsApp = () => {
    const url = `https://wa.me/+919204745612?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <motion.button
      className="whatsapp-float"
      onClick={openWhatsApp}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ 
        delay: 1,
        type: "spring",
        stiffness: 260,
        damping: 20 
      }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      aria-label="Contact us on WhatsApp"
    >
      <svg role="img" viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
        <path d={siWhatsapp.path} />
      </svg>
      <span className="pulse-ring"></span>
    </motion.button>
  );
}
