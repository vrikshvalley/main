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

  const handleShopNow = () => {
    // Scroll to products section or navigate to products page
    const productsSection = document.getElementById('products');
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      // Fallback: navigate to products page if it exists
      // router.push('/products');
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
  };

  const handleLearnMore = () => {
    router.push('/about');
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
      
      <div className="heroContent">
        <div className="badge">
          🌿 Premium Plant Collection
        </div>
        
        <h1 className="heroTitle">
          Welcome to Vriksh Valley
        </h1>
        
        <p className="heroSubtitle">
          Discover nature's finest treasures with our curated collection of premium plants. 
          Transform your space into a green paradise.
        </p>

        <div className="features">
          <div className="feature">100% Organic</div>
          <div className="feature">Free Delivery</div>
          <div className="feature">Expert Care Tips</div>
        </div>

        <div className="ctaButtons">
          <button className="ctaButton" onClick={handleShopNow}>
            Shop Now & Grow Green
          </button>
          <button className="ctaButtonSecondary" onClick={handleLearnMore}>
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
}