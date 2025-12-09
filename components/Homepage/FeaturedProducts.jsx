'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import ProductCard from '../products/ProductCard';
import "@/styles/featuredProducts.scss";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15, // Slightly slower stagger
      delayChildren: 0.15
    }
  }
};

const cardVariants = {
  hidden: { 
    opacity: 0, 
    y: 40,
    scale: 0.95
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      duration: 0.8, // Slower animation (was 0.6)
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

export default function FeaturedProducts({ title, sortBy }) {
  return (
    <motion.section 
      className="featured-products"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.2, margin: "0px 0px -100px 0px" }}
      variants={containerVariants}
    >
      <div className="featured-header">
        <motion.h2 
          className="featured-title"
          variants={cardVariants}
        >
          {title}
        </motion.h2>
        <motion.div variants={cardVariants}>
          <Link href="/products" className="view-all-link">
            View All Products
            <ArrowRight size={18} />
          </Link>
        </motion.div>
      </div>
      <motion.div 
        className="products-container"
        variants={containerVariants}
      >
        <ProductCard sortBy={sortBy} />
      </motion.div>
    </motion.section>
  );
}
