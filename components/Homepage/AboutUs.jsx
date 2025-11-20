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
        Welcome to Vriksh Valley, where nature meets nurture. We believe that every home, balcony and workspace deserves a touch of green. It is not just for beauty—it is also for balance and well-being, along with harmony. Our journey began with a simple thought: What if plants were not just decor? What if they were daily companions that inspire mindfulness and joy?
        <br /><br />
        We are more than an online plant destination at Vriksh Valley. We are a community that celebrates growth in every form. From lush indoor plants to air purifiers to flowering varieties and garden essentials, we bring the best of nature to your doorstep. Each plant is handpicked and nurtured with care—delivered with the same love we would give our own.
        <br /><br />
        Join the Vriksh Valley family. Let us grow happiness, one leaf at a time.
      </motion.p>
    </motion.section>
  );
}
