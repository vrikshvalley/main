'use client';

import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { getProducts } from '@/lib/services/productService';
import ProductListCard from '@/components/products/ProductListCard';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import "@/styles/featuredProducts.scss";
import "@/styles/products.scss";

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

export default function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewportWidth, setViewportWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const viewAllLink = '/products?filter=featured';
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data: allProducts } = await getProducts({ 
          featured: true,
          pageSize: 8
        });
        setProducts(allProducts || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        setViewportWidth(window.innerWidth);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = viewportWidth < 768;
  const isDesktop = viewportWidth >= 1024;
  const itemsPerSlide = isDesktop ? 4 : 2;
  const slides = [];
  for (let i = 0; i < products.length; i += itemsPerSlide) {
    slides.push(products.slice(i, i + itemsPerSlide));
  }
  
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
          Featured Products
        </motion.h2>
        <motion.div variants={cardVariants}>
          <Link href={viewAllLink} className="view-all-link">
            View All
            <ArrowRight size={18} />
          </Link>
        </motion.div>
      </div>

      {/* Featured Products Slider */}
      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
      ) : products.length > 0 ? (
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          navigation
          pagination={{ clickable: true }}
          autoplay={isMobile ? {
            delay: 3000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true
          } : false}
          spaceBetween={16}
          slidesPerView={1}
          breakpoints={{
            0: { slidesPerView: 1, spaceBetween: 12 },
            768: { slidesPerView: 1, spaceBetween: 16 },
            1024: { slidesPerView: 1, spaceBetween: 20 }
          }}
          className="featured-products-slider"
        >
          {slides.map((group, index) => (
            <SwiperSlide key={`featured-slide-${index}`}>
              <div className="slide-grid">
                {group.map((product) => (
                  <div className="slide-card" key={product.id}>
                    <ProductListCard product={product} viewMode="grid" />
                  </div>
                ))}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>
          No products available
        </div>
      )}
    </motion.section>
  );
}
