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
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

export default function ShopByCategory() {
  // Fixed 6 subcategories for Explore More - no longer random
  const exploreMoreSubcategories = [
    { name: 'Indoor Plants' },
    { name: 'Succulents' },
    { name: 'Flowering Plants' },
    { name: 'Foliage Plants' },
    { name: 'Hanging Plants' },
    { name: 'Air Plants' }
  ];

  const SubcategoryCard = ({ subcategory, index }) => (
    <motion.div className="subcategory-card" variants={cardVariants}>
      <SubcategoryCardInner subcategory={subcategory} />
    </motion.div>
  );

  function SubcategoryCardInner({ subcategory }) {
    const [srcIndex, setSrcIndex] = useState(0);

    const pascal = pascalize(subcategory.name);
    const slug = slugify(subcategory.name);

    // candidate srcs in order of preference
    const candidates = [
      subcategory.image || null,
      // Prefer the manual map provided by getImageForSubcategory
      getImageForSubcategory(subcategory.name),
      `/subcategories/${pascal}Mobile.png`,
      `/subcategories/${pascal}Desktop.png`,
      `/subcategories/${slug}.jpg`,
      '/subcategories/Plants.png'
    ].filter(Boolean);

    const src = candidates[srcIndex] || candidates[candidates.length - 1];

    const handleImgError = () => {
      if (srcIndex < candidates.length - 1) setSrcIndex(i => i + 1);
    };

    return (
      <Link href={`/products/search?q=${encodeURIComponent(subcategory.name)}`}>
        <div className="subcategory-image-wrapper">
          <Image
            src={src}
            alt={subcategory.name}
            fill
            sizes="100px"
            className="subcategory-image"
            onError={handleImgError}
          />
          <span className="subcategory-arrow">
            <ArrowRight size={14} />
          </span>
        </div>
        <span>{subcategory.name}</span>
      </Link>
    );
  }

  return (
    <section className="shop-by-category">
      <motion.div 
        className="category-container"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.2 }}
        variants={containerVariants}
      >
        <motion.div className="category-header" variants={cardVariants}>
          <p className="cursive-subtitle">Explore Our Collection</p>
          <AnimatedText
            as="h2"
            text="Shop by categories"
            className="category-title"
            delay={0.1}
            stagger={0.05}
          />
          <AnimatedText
            as="p"
            text="Find exactly what your green space needs"
            className="category-description"
            delay={0.2}
            stagger={0.02}
          />
        </motion.div>

        {/* Top 6 Subcategories (displayed in place of categories) */}
        <div className="categories-slider-wrapper">
          <Swiper
            modules={[Navigation, Pagination]}
            navigation={{
              nextEl: '.category-slider-next',
              prevEl: '.category-slider-prev',
            }}
            pagination={{ clickable: true, el: '.category-slider-pagination' }}
            slidesPerView={1}
            spaceBetween={20}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
              1280: { slidesPerView: 6 },
            }}
            className="category-slider"
          >
            {exploreMoreSubcategories.map((subcategory, idx) => (
              <SwiperSlide key={`${subcategory.name}-top-${idx}`}>
                <motion.div variants={cardVariants}>
                  <Link href={`/products/search?q=${encodeURIComponent(subcategory.name)}`} className="category-card">
                    <div className="category-image-wrapper">
                      <Image
                        src={getImageForSubcategory(subcategory.name)}
                        alt={subcategory.name}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="category-image"
                      />
                      <div className="category-overlay" />
                    </div>
                    <div className="category-info">
                      <h3>{subcategory.name}</h3>
                      <p>{subcategory.description || ''}</p>
                      <span className="category-arrow">
                        <ArrowRight size={20} />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>

          <button className="category-slider-prev" aria-label="Previous subcategories (top)">
            <ChevronLeft size={24} />
          </button>
          <button className="category-slider-next" aria-label="Next subcategories (top)">
            <ChevronRight size={24} />
          </button>
          <div className="category-slider-pagination" />
        </div>

        {/* Subcategories Section */}
        <div className="subcategories-section">
          <h3 className="subcategories-title">Explore More</h3>
          <Swiper
            modules={[Navigation, Pagination]}
            navigation={{
              nextEl: '.subcategory-slider-next',
              prevEl: '.subcategory-slider-prev',
            }}
            pagination={{ clickable: true, el: '.subcategory-slider-pagination' }}
            slidesPerView={1}
            spaceBetween={15}
            breakpoints={{
              640: { slidesPerView: 3 },
              1024: { slidesPerView: 4 },
              1280: { slidesPerView: 6 },
            }}
            className="subcategory-slider"
          >
              {exploreMoreSubcategories.map((subcategory, index) => {
                // Build image path from subcategory name for 'Explore More'
                const nameBasedSrc = imagePathFromName(subcategory.name);
                return (
                  <SwiperSlide key={`${subcategory.name}-more-${index}`}>
                    <SubcategoryCard subcategory={{ ...subcategory, image: nameBasedSrc }} index={index} />
                  </SwiperSlide>
                );
              })}
          </Swiper>

          <button className="subcategory-slider-prev" aria-label="Previous subcategories">
            <ChevronLeft size={20} />
          </button>
          <button className="subcategory-slider-next" aria-label="Next subcategories">
            <ChevronRight size={20} />
          </button>
          <div className="subcategory-slider-pagination" />
        </div>
      </motion.div>
    </section>
  );
}
