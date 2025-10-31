'use client';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCards, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-cards';
import '@/styles/testimonials.scss';

const testimonialsData = [
  {
    id: 1,
    name: 'John Doe',
    username: '@johndoe',
    avatar: 'https://avatar.iran.liara.run/public/boy#22',
    text: 'Absolutely love the plants I got! Packaging was neat and delivery was on time.',
  },
  {
    id: 2,
    name: 'Emily Green',
    username: '@emgreen',
    avatar: 'https://avatar.iran.liara.run/public/girl#42',
    text: 'The customer service is fantastic! They helped me choose the best indoor plants for my apartment. Highly recommended for plant lovers!',
  },
  {
    id: 3,
    name: 'Raj Patel',
    username: '@rajplants',
    avatar: 'https://avatar.iran.liara.run/public/boy#2',
    text: 'Amazing variety of succulents! The colors are so vibrant and fresh.',
  },
  {
    id: 4,
    name: 'Sophia Lee',
    username: '@sophialee',
    avatar: 'https://avatar.iran.liara.run/public/girl#34',
    text: 'Quick shipping and the plant came in perfect condition. Will definitely order again.',
  },
  {
    id: 5,
    name: 'Maya Singh',
    username: '@mayaplants',
    avatar: 'https://avatar.iran.liara.run/public/girl#21',
    text: 'I was a complete beginner and the care guides helped me so much! My plants are thriving.',
  },
  {
    id: 6,
    name: 'David Chen',
    username: '@davidgrows',
    avatar: 'https://avatar.iran.liara.run/public/boy#11',
    text: 'Best online plant store! The quality is unmatched and prices are reasonable.',
  },
  {
    id: 7,
    name: 'Priya Sharma',
    username: '@priya_gardens',
    avatar: 'https://avatar.iran.liara.run/public/girl',
    text: 'The ferns I ordered are absolutely gorgeous! They came well-packaged with detailed care instructions.',
  },
  {
    id: 8,
    name: 'Michael Brown',
    username: '@mikeplants',
    avatar: 'https://avatar.iran.liara.run/public/boy',
    text: 'Excellent customer support! They replaced a damaged plant immediately, no questions asked.',
  },
];

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
  hidden: { 
    opacity: 0, 
    y: 50,
    scale: 0.95
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

export default function Testimonials() {
  const [isMobile, setIsMobile] = useState(false);
  const gridRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Calculate masonry layout after cards are rendered
  useEffect(() => {
    if (!isMobile && gridRef.current) {
      const resizeGridItems = () => {
        const grid = gridRef.current;
        if (!grid) return;
        
        const cards = grid.querySelectorAll('.testimonial-card');
        if (!cards || cards.length === 0) return;
        
        cards.forEach((card) => {
          const cardHeight = card.getBoundingClientRect().height;
          const rowHeight = 10; // Match grid-auto-rows value
          const rowGap = 24; // 1.5rem = 24px gap
          const rowSpan = Math.ceil((cardHeight + rowGap) / (rowHeight + rowGap));
          card.style.gridRowEnd = `span ${rowSpan}`;
        });
      };

      // Initial calculation
      setTimeout(resizeGridItems, 100);
      
      // Recalculate on window resize
      window.addEventListener('resize', resizeGridItems);
      
      return () => window.removeEventListener('resize', resizeGridItems);
    }
  }, [isMobile]);

  return (
    <section className="testimonials-section">
      <h2 className="testimonials-title">What Our Customers Say</h2>
      
      {isMobile ? (
        <div className="testimonials-swiper-container">
          <Swiper
            effect={'cards'}
            grabCursor={true}
            modules={[EffectCards, Autoplay]}
            className="testimonials-swiper"
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
            }}
            loop={true}
          >
            {testimonialsData.map((testimonial) => (
              <SwiperSlide key={testimonial.id}>
                <div className="testimonial-card">
                  <div className="card-header">
                    <Image
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      width={50}
                      height={50}
                      className="avatar"
                    />
                    <div className="user-info">
                      <h4>{testimonial.name}</h4>
                      <p className="username">{testimonial.username}</p>
                    </div>
                  </div>
                  <p className="testimonial-text">{testimonial.text}</p>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      ) : (
        <motion.div 
          ref={gridRef}
          className="testimonials-grid"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2, margin: "0px 0px -100px 0px" }}
          variants={containerVariants}
        >
          {testimonialsData.map((testimonial) => (
            <motion.div 
              key={testimonial.id} 
              className="testimonial-card"
              variants={cardVariants}
            >
              <div className="card-header">
                <Image
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  width={50}
                  height={50}
                  className="avatar"
                />
                <div className="user-info">
                  <h4>{testimonial.name}</h4>
                  <p className="username">{testimonial.username}</p>
                </div>
              </div>
              <p className="testimonial-text">{testimonial.text}</p>
            </motion.div>
          ))}
        </motion.div>
      )}
    </section>
  );
}
