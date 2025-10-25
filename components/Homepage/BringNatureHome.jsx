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
          We don't just deliver plants-we bring the essence of nature into your life. Each plant is handpicked, nurtured with care, and packed with the freshness of earth. From lush greens to vibrant blooms, let nature breathe life into your space. Grow nature, and connect with the beauty that surrounds us-because every leaf tells a story, and yours is just beginning.
        </motion.p>
      </div>
    </motion.section>
  );
}
