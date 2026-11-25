'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useBreakpoint } from '@/lib/hooks/useBreakpoint';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { getProducts } from '@/lib/services/productService';
import ProductListCard from '@/components/products/ProductListCard';
import AnimatedText from '@/components/general/AnimatedText';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import '@/styles/featuredProducts.scss';
import '@/styles/premiumSection.scss';
import '@/styles/products.scss';

export default function PremiumCollection() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const breakpoint = useBreakpoint();
  const viewAllLink = '/premium-collection';

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data: allProducts } = await getProducts({
          priceRange: { min: 500 },
          sortBy: 'price-desc',
          pageSize: 8
        });
        setProducts(allProducts || []);
      } catch (error) {
        console.error('Error fetching premium products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const wrapper = document.querySelector('.premium-section-wrapper');
    if (!wrapper) return;

    // One update per animation frame instead of a layout read on every mousemove
    let frame = 0;
    let lastEvent = null;
    const handleMouseMove = (e) => {
      lastEvent = e;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const rect = wrapper.getBoundingClientRect();
        wrapper.style.setProperty('--glow-x', `${lastEvent.clientX - rect.left}px`);
        wrapper.style.setProperty('--glow-y', `${lastEvent.clientY - rect.top}px`);
      });
    };

    const handleMouseLeave = () => {
      wrapper.style.setProperty('--glow-x', '-999px');
      wrapper.style.setProperty('--glow-y', '-999px');
    };

    wrapper.addEventListener('mousemove', handleMouseMove);
    wrapper.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      cancelAnimationFrame(frame);
      wrapper.removeEventListener('mousemove', handleMouseMove);
      wrapper.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const isMobile = breakpoint === 'mobile';
  const isDesktop = breakpoint === 'desktop';
  const itemsPerSlide = isDesktop ? 4 : 2;
  const slides = [];
  for (let i = 0; i < products.length; i += itemsPerSlide) {
    slides.push(products.slice(i, i + itemsPerSlide));
  }

  return (
    <motion.section 
      className="featured-products"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2, margin: '0px 0px -100px 0px' }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="featured-header">
        <div className="featured-header-left">
          <p className="left cursive-subtitle">Premium Picks</p>
          <AnimatedText
            as="h2"
            text="Premium Collection"
            className="featured-title"
            delay={0.1}
            stagger={0.05}
          />
        </div>
        <motion.div>
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
            <SwiperSlide key={`premium-slide-${index}`}>
              <div className="slide-grid">
                {group.map((product, cardIndex) => (
                  <motion.div
                    className="slide-card"
                    key={product.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{
                      delay: cardIndex * 0.15,
                      duration: 0.6,
                      ease: [0.22, 1, 0.36, 1]
                    }}
                  >
                    <ProductListCard product={product} viewMode="grid" />
                  </motion.div>
                ))}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>
          No premium products available
        </div>
      )}
    </motion.section>
  );
}
