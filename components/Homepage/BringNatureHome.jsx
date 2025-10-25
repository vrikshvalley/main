'use client';

import { motion } from 'framer-motion';
import '@/styles/bringNatureHome.scss';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

const textVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      delay: 0.2,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

export default function BringNatureHome() {
  return (
    <motion.section
      className="bring-nature-home"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.3 }}
      variants={containerVariants}
    >
      <div className="content-wrapper">
        <motion.h2 variants={textVariants}>
          Bring Nature Home, <span className="highlight">One Leaf at a Time</span> 🌿
        </motion.h2>
        <motion.p variants={textVariants}>
          Transform your space into a green sanctuary. Every plant brings life, freshness, and a touch of nature's tranquility to your home.
        </motion.p>
      </div>
    </motion.section>
  );
}
