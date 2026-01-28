'use client';

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
import '@/styles/featuredProducts.scss';
import '@/styles/products.scss';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.15 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
};

export default function NewArrivals() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const viewAllLink = '/products?filter=new-arrivals';

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data: allProducts } = await getProducts({ new_arrival: true, pageSize: 12 });
        setProducts(allProducts || []);
      } catch (error) {
        console.error('Error fetching new arrivals:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // match FeaturedProducts structure: chunk into pairs so slider slides mirror featured layout
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.matchMedia('(max-width: 767px)').matches);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <motion.section 
      className="featured-products"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.2, margin: '0px 0px -100px 0px' }}
      variants={containerVariants}
    >
      <div className="featured-header">
        <motion.h2 className="featured-title" variants={cardVariants}>New Arrivals</motion.h2>
        <motion.div variants={cardVariants}>
          <Link href={viewAllLink} className="view-all-link">
            View All
            <ArrowRight size={18} />
          </Link>
        </motion.div>
      </div>

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
          spaceBetween={20}
          slidesPerView={1} // each slide will contain two products (chunked below)
          className="featured-products-slider"
        >
          {(() => {
            const chunks = [];
            for (let i = 0; i < products.length; i += 2) chunks.push(products.slice(i, i + 2));
            return chunks.map((pair, idx) => (
              <SwiperSlide key={`pair-${idx}`}>
                <div className="slide-row">
                  {pair.map((product) => (
                    <div className="slide-card" key={product.id}>
                      <ProductListCard product={product} viewMode="grid" />
                    </div>
                  ))}
                </div>
              </SwiperSlide>
            ));
          })()}
        </Swiper>
      ) : (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>No products available</div>
      )}
    </motion.section>
  );
}
