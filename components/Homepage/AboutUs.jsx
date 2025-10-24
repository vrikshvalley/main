'use client';
import { motion } from 'framer-motion';
import '@/styles/aboutUs.scss';

const sectionVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.7,
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
      duration: 0.7,
      delay: 0.2,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

export default function About() {
  return (
    <motion.section 
      className="about-section"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.3, margin: "0px 0px -50px 0px" }}
      variants={sectionVariants}
    >
      <motion.h2 variants={sectionVariants}>About Us</motion.h2>
      <motion.p variants={textVariants}>
        At Vriksh Valley, we believe plants are more than just greenery—they’re a way of life. Whether you’re creating a lush indoor oasis or an outdoor paradise, we bring you handpicked plants, exquisite bonsai, kokedama, moss walls, and terrariums, along with high-quality seeds, soil, organic fertilizers, and eco-friendly pots.
        <br /><br />
        Need guidance? Our Plant consultation ensures you find the perfect green companions for your space. With sustainability at our core, every purchase supports a greener planet.
        <br /><br />
        Join us in making the world more vibrant—one plant at a time!
      </motion.p>
    </motion.section>
  );
}
