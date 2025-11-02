'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { categories } from '@/lib/sampleProducts';
import "@/styles/categoryCircles.scss";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const circleVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.8,
    y: 30
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.34, 1.56, 0.64, 1] // Back easing similar to back.out
    }
  }
};

export default function CategoryCircles() {
  return (
    <motion.section 
      className="category-circles"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.2, margin: "0px 0px -100px 0px" }}
      variants={containerVariants}
    >
      <motion.div className="circle-container" variants={containerVariants}>

        {categories.map((category) => (
          <Link key={category.slug} href={`/category/${category.slug}`} passHref>
            <motion.div className="circle-item" variants={circleVariants}>
              <div className="circle-icon">
                <span className="category-emoji">{category.icon}</span>
              </div>
              <p>{category.name}</p>
            </motion.div>
          </Link>
        ))}

      </motion.div>
    </motion.section>
  );
}
