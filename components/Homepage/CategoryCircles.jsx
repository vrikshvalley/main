'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { getCategories } from '@/lib/services/productService';
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
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const { data: fetchedCategories } = await getCategories();
        
        // Define the desired order
        const categoryOrder = ['Plants', 'Seeds', 'Planters', 'Plant Care', 'Decor', 'Accessories'];
        
        // Sort categories based on the defined order (case-insensitive)
        const sortedCategories = (fetchedCategories || []).sort((a, b) => {
          const indexA = categoryOrder.findIndex(c => c.toLowerCase() === (a.name || '').toLowerCase());
          const indexB = categoryOrder.findIndex(c => c.toLowerCase() === (b.name || '').toLowerCase());
          // If not found in order array, put at end
          if (indexA === -1) return 1;
          if (indexB === -1) return -1;
          return indexA - indexB;
        });
        
        setCategories(sortedCategories);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <section className="category-circles">
        <div className="circle-container">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="circle-item skeleton">
              <div className="circle-icon skeleton-circle"></div>
              <div className="skeleton-text"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <motion.section 
      className="category-circles"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.2, margin: "0px 0px -100px 0px" }}
      variants={containerVariants}
    >
      <motion.div className="circle-container" variants={containerVariants}>

        {categories.map((category) => {
          // Map category names to their image files in public folder
          // Note: File names are case-sensitive
          const imageMap = {
            'Plants': '/Plants.jpg',
            'Seeds': '/seeds.jpg',
            'Planters': '/Pots.jpg',
            'Plant Care': '/Plant care.jpg', 
            'Decor': '/Decor.jpg',
            'Accessories': '/Plant tools.jpg'
          };
          
          const imagePath = imageMap[category.name] || '/logo.png';
          
          return (
            <Link key={category.slug} href={`/category/${category.slug}`} passHref>
              <motion.div className="circle-item" variants={circleVariants}>
                <div className="circle-icon">
                  <Image 
                    src={imagePath}
                    alt={category.name}
                    width={120}
                    height={120}
                    className="category-image"
                  />
                </div>
                <p>{category.name}</p>
              </motion.div>
            </Link>
          );
        })}

      </motion.div>
    </motion.section>
  );
}
