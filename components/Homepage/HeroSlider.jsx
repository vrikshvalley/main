'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation, EffectFade } from 'swiper/modules';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';
import '@/styles/heroSlider.scss';

const slides = [
  { src: '/heroSlider/(1).webp', alt: 'Premium Plant Collection' },
  { src: '/heroSlider/(2).webp', alt: 'Indoor Green Paradise' },
  { src: '/heroSlider/(3).webp', alt: 'Outdoor Garden Dreams' },
  { src: '/heroSlider/(4).webp', alt: 'Nature\'s Beauty' },
  { src: '/heroSlider/(5).webp', alt: 'Green Living' }
];

const contentVariants = {
  hidden: { 
    opacity: 0
  },
  visible: { 
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

export default function HeroSlider() {
  const router = useRouter();

  const handleJoinMovement = () => {
    router.push('/join-green-movement');
  };

  const handleLearnMore = () => {
    router.push('/our-story');  
  };

  const handleNatureNurture = () => {
    router.push('/where-nature-meets-nurture');
  };

  return (
    <div className="heroContainer">
      <div className="sliderWrapper">
        {/* Custom Navigation Arrows - Must be inside sliderWrapper */}
        <div className="swiper-button-prev"></div>
        <div className="swiper-button-next"></div>
        
        <Swiper
          modules={[Autoplay, Pagination, Navigation, EffectFade]}
          spaceBetween={0}
          slidesPerView={1}
          loop
          effect="fade"
          fadeEffect={{ crossFade: true }}
          navigation={{
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
          }}
          autoplay={{ 
            delay: 3000, 
            disableOnInteraction: false,
            pauseOnMouseEnter: true 
          }}
          pagination={{ 
            clickable: true,
            bulletActiveClass: 'swiper-pagination-bullet-active',
          }}
          speed={1000}
          style={{ width: '100%', height: '100%' }}
        >
          {slides.map((slide, idx) => (
            <SwiperSlide key={idx}>
              <img
                src={slide.src}
                alt={slide.alt}
                loading={idx === 0 ? 'eager' : 'lazy'}
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      
      <motion.div 
        className="heroContent"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={contentVariants}
      >
        <motion.button 
          className="badge badge-clickable" 
          variants={itemVariants}
          onClick={handleNatureNurture}
          aria-label="Learn about where nature meets nurture"
        >
          🌿 Where Nature Meets Nurture
        </motion.button>
        
        <motion.h1 className="heroTitle" variants={itemVariants}>
          Welcome to Vriksh Valley
        </motion.h1>
        
        <motion.p className="heroSubtitle" variants={itemVariants}>
          Vriksh Valley is a plant-care and gardening companion app that helps users discover plants, track care schedules, and manage their gardening needs.
        </motion.p>

        <motion.div className="features" variants={itemVariants}>
          <div className="feature">Healthy Plants</div>
          <div className="feature">Eco Packaging</div>
          <div className="feature">Expert Support</div>
        </motion.div>

        <motion.div className="ctaButtons" variants={itemVariants}>
          <button className="ctaButton" onClick={handleJoinMovement}>
            Join the Green Movement
          </button>
          {/* <button className="ctaButtonSecondary" onClick={handleLearnMore}>
            Our Story
          </button> */}
          <button className="ctaButtonSecondary" onClick={() => router.push('/products')}>
            Shop Now
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}