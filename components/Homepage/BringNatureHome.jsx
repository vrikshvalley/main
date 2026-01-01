'use client';

import { motion } from 'framer-motion';
import Image from '@/components/general/ImgWithLoader';
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

const imageVariants = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.8,
      delay: 0.4,
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
      <div className="content-container">
        <div className="content-wrapper">
          <motion.h2 variants={textVariants}>
            Bring Nature Home, <br />
            <span className="highlight">One Leaf at a Time</span> 🌿
          </motion.h2>
          <motion.p variants={textVariants}>
            We don't just deliver plants-we bring the essence of nature into your life. Each plant is handpicked, nurtured with care, and packed with the freshness of earth. From lush greens to vibrant blooms, let nature breathe life into your space. Grow nature, and connect with the beauty that surrounds us-because every leaf tells a story, and yours is just beginning.
          </motion.p>
        </div>
        
        <motion.div className="image-card" variants={imageVariants}>
          <div className="image-wrapper">
            <Image
              src="/bringNature.jpg"
              alt="Nature is our home"
              width={400}
              height={500}
              className="nature-image"
              priority={false}
            />
          </div>
          <p className="nature-quote">
            "In every walk with nature, one receives far more than he seeks. Nature is not a place to visit, it is home."
          </p>
        </motion.div>
      </div>
    </motion.section>
  );
}
