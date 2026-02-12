'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from '@/components/general/ImgWithLoader';
import AnimatedText from '@/components/general/AnimatedText';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import '@/styles/shopByCategory.scss';

// Top-level categories are replaced by subcategories for the "Shop By Category" display

const getImageForSubcategory = (name) => {
  const imageMap = {
    'Indoor Plants': '/subcategories/IndoorPlantsMobile.png',
    'Succulents': '/subcategories/SucculentsMobile.png',
    'Flowering Plants': '/subcategories/FloweringPlantsMobile.png',
    'Foliage Plants': '/subcategories/FoliagePlantsMobile.png',
    'Hanging Plants': '/subcategories/HangingPlantsMobile.png',
    'Air Plants': '/subcategories/AirPlantsMobile.png',
    'Cactus': '/subcategories/CactusMobile.png',
    'Herbs': '/subcategories/MedicinalandHerbPlantsMobile.png',
    'Vegetables': '/subcategories/VegetableSeedsMobile.png',
    'Herbs & Microgreens': '/subcategories/MicrogreenandHerbsMobile.png',
    'Bonsai': '/subcategories/BonsaiMobile.png',
    'Aquatic Plants': '/subcategories/AquaticPlantsMobile.png'
  };
  return imageMap[name] || '/subcategories/Plants.png';
};

const allSubcategories = [
  { name: 'Indoor Plants' },
  { name: 'Succulents' },
  { name: 'Flowering Plants' },
  { name: 'Foliage Plants' },
  { name: 'Hanging Plants' },
  { name: 'Air Plants' },
  { name: 'Cactus' },
  { name: 'Herbs' },
  { name: 'Vegetables' },
  { name: 'Herbs & Microgreens' },
  { name: 'Bonsai' },
  { name: 'Aquatic Plants' }
];

const getRandomSubcategories = () => {
  const shuffled = [...allSubcategories].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 12);
};

const slugify = (str) =>
  str
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');

const pascalize = (str) =>
  str
    .split(/\s+|&/)
    .map(s => s.replace(/[^a-z0-9]/gi, ''))
    .filter(Boolean)
    .map(s => s.charAt(0).toUpperCase() + s.slice(1))
    .join('');

// Prefer images located in `/subcategories/` (mobile variant first)
const imagePathFromName = (name) => {
  const pascal = pascalize(name);
  return `/subcategories/${pascal}Mobile.png`;
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

// Bento Span Pattern
const BENTO_PATTERNS = [
  'span-2x2', 'span-1x1', 'span-1x2', 
  'span-1x1', 'span-2x1', 'span-1x1',
  'span-1x1', 'span-1x1', 'span-2x2',
  'span-1x2', 'span-1x1', 'span-1x1'
];

export default function ShopByCategory() {
  const [categories, setCategories] = useState([]);
  
  useEffect(() => {
    // Determine categories to show
    setCategories(allSubcategories.slice(0, 12));
  }, []);

  return (
    <section className="shop-by-category">
      <div className="category-container">
        <div className="category-header">
          <AnimatedText text="Curated Collections" className="cursive-subtitle" />
          <h2 className="category-title">Shop by Category</h2>
          <p className="category-description">Explore our hand-picked selections for every space.</p>
        </div>

        <motion.div 
          className="bento-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {categories.map((cat, index) => {
            const spanClass = BENTO_PATTERNS[index % BENTO_PATTERNS.length];
            const linkHref = `/category/${slugify(cat.name)}`;
            
            return (
              <motion.div 
                key={cat.name}
                className={`bento-item ${spanClass}`}
                variants={cardVariants}
              >
                <Link href={linkHref} style={{ display: 'block', width: '100%', height: '100%', position: 'relative' }}>
                  <Image 
                    src={getImageForSubcategory(cat.name)}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="category-image"
                    style={{ objectFit: 'cover' }}
                  />
                  <div className="bento-content">
                    <h3>{cat.name}</h3>
                    <div className="explore-link">
                      Explore <ArrowRight size={16} style={{ marginLeft: '4px' }} />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
