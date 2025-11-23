'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation, EffectFade } from 'swiper/modules';
import { useRouter } from 'next/navigation';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';
import '@/styles/heroSlider.scss';

const slides = [
  { src: '/hero1.jpg', alt: 'Premium Plant Collection' },
  { src: '/hero2.jpg', alt: 'Indoor Green Paradise' },
  { src: '/hero3.jpg', alt: 'Outdoor Garden Dreams' }
];

export default function HeroSlider() {
  const router = useRouter();

  const handleJoinMovement = () => {
    router.push('/join-green-movement');
  };

  const handleLearnMore = () => {
    router.push('/our-story');  
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
        variants={contentVariants}
      >
        <motion.div className="badge" variants={itemVariants}>
          🌿 Where Nature Meets Nurture
        </motion.div>
        
        <motion.h1 className="heroTitle" variants={itemVariants}>
          Welcome to Vriksh Valley
        </motion.h1>
        
        <motion.p className="heroSubtitle" variants={itemVariants}>
          Every home deserves a touch of green. Transform your space into a sanctuary where plants thrive and life slows down to the gentle rhythm of growth.
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
          <button className="ctaButtonSecondary" onClick={handleLearnMore}>
            Our Story
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}