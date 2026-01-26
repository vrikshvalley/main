'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Image from '@/components/general/ImgWithLoader';
import { Star, MessageCircle, Quote } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCards, Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-cards';
import 'swiper/css/pagination';
import '@/styles/testimonialsPage.scss';

// Same testimonials data from Homepage component
const testimonialsData = [
  {
    id: 1,
    name: 'Anindya Chakraborty',
    username: '',
    avatar: '/AnindyaChakraborty.jpeg',
    text: "I am really impressed with the quality of the plants I received. They arrived healthy, well-packed, and settled beautifully into my space. Will definitely order again.",
    rating: 5
  },
  {
    id: 2,
    name: 'Arka Jyoti Sanyal',
    username: '',
    avatar: '/ArkaJyotiSanyal.jpeg',
    text: 'Highly satisfied with the services and products! Definitely a recommendation for all those people who are into plants and gardening!',
    rating: 5
  },
  {
    id: 3,
    name: 'Debanko Chakraborty',
    username: '',
    avatar: '/DebankoChakraborty.jpeg',
    text: 'It has a great community, providing diy ways to take care of plants. The plants are genuinely nurtured and taken care of, which pleased me a lot. Best wishes, and I hope it continues the same in the coming future.',
    rating: 5
  },
  {
    id: 4,
    name: 'Dhiman Datta',
    username: '',
    avatar: '/DhimanDatta.jpeg',
    text: 'Vriksh Valley seems to me a one-stop solution for gardening. The experience was smooth, from ordering till the delivery and post-delivery follow-ups. All thanks to the Vriksh Valley Team.',
    rating: 5
  },
  {
    id: 5,
    name: 'Manish Kumar Shaw',
    username: '',
    avatar: '/ManishKumarShaw.jpeg',
    text: 'The customer service is fantastic! They helped me choose the best indoor plants for my apartment. Highly recommended for plant lovers!.',
    rating: 5
  },
  {
    id: 6,
    name: 'Nilanjan Hazarika',
    username: '',
    avatar: '/NilanjanHazarika.jpeg',
    text: 'Picked up a plant from this store and it instantly became the freshest corner of my home. Healthy, well-packed, and clearly chosen with care. Loved the experience!',
    rating: 5
  },
  {
    id: 7,
    name: 'Riza Ray',
    username: '',
    avatar: '/RizaRay.jpeg',
    text: 'The products and the services provided by Vriksh Valley are commendable. It really brings out the love for your plants with the right product and guidance. Vrisk Valley is definitely the go-to website for my plants and for the gardener in me.',
    rating: 5
  },
  {
    id: 8,
    name: 'Sarthak Bose',
    username: '',
    avatar: '/SarthakBose.jpeg',
    text: 'Vriksh Valley offers exceptional quality and outstanding customer service. I loved their packaging. Their genuinely well-nurtured plants left me truly impressed.',
    rating: 5
  },
  {
    id: 9,
    name: 'Sayan Manna',
    username: '',
    avatar: '/SayanManna.jpeg',
    text: 'Loved the quality of the plants. The packaging was actually quite good. I didn\'t expect that from such a fresh business and such a great service. The plants arrived a day early, and I will be recommending you for sure',
    rating: 5
  },
  {
    id: 10,
    name: 'Shakhya Halder',
    username: '',
    avatar: '/ShakhyaHalder.jpeg',
    text: 'Absolutely love the plants I got! They came well-packaged with detailed care instructions.',
    rating: 5
  },
  {
    id: 11,
    name: 'Shreya Mondal',
    username: '',
    avatar: '/ShreyaMondal.jpeg',
    text: 'I have purchased from Vriksh Valley and would highly recommend them!! They are a lovely team and never disappoint!✨',
    rating: 5
  },
  {
    id: 12,
    name: 'Sourav Kundu',
    username: '',
    avatar: '/SouravKundu.jpeg',
    text: 'A beautiful little nursery with such fresh, healthy plants! The owner guides you so well. Highly recommended!',
    rating: 5
  },
  {
    id: 13,
    name: 'Sparsho Sengupta',
    username: '',
    avatar: '/SparshoSengupta.jpeg',
    text: "Really appreciate the support and customer service! Highly recommended if you're looking to add some greenery to your home!!",
    rating: 5
  },
  {
    id: 14,
    name: 'Suparna Dutta',
    username: '',
    avatar: '/SuparnaDutta.jpeg',
    text: 'With a vast inventory featuring thousands of seedlings, cuttings, grafted varieties, and potted specimens, Vriksh Valley offers the highest quality and consistently delivers the best customer care.',
    rating: 5
  },
  {
    id: 15,
    name: 'Suvangi Chakraborty',
    username: '',
    avatar: '/SuvangiChakraborty.jpeg',
    text: 'Vriksh Valley has an amazing variety of high-quality plants. Highly recommended for anyone looking to enhance their home or garden. A growing nursery that truly deserves more recognition.',
    rating: 5
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.2
    }
  }
};

const cardVariants = {
  hidden: { 
    opacity: 0, 
    y: 30,
    scale: 0.95
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

export default function TestimonialsPage() {
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
          const rowHeight = 10;
          const rowGap = 24;
          const rowSpan = Math.ceil((cardHeight + rowGap) / (rowHeight + rowGap));
          card.style.gridRowEnd = `span ${rowSpan}`;
        });
      };

      setTimeout(resizeGridItems, 100);
      window.addEventListener('resize', resizeGridItems);
      
      return () => window.removeEventListener('resize', resizeGridItems);
    }
  }, [isMobile]);

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star 
        key={i} 
        size={16} 
        fill={i < rating ? 'currentColor' : 'none'}
        className="star"
      />
    ));
  };

  return (
    <div className="testimonials-page">
      <motion.div 
        className="testimonials-hero"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="hero-content">
          <MessageCircle className="hero-icon" size={48} />
          <h1>What Our Customers Say</h1>
          <p>Real stories from real plant lovers who trust Vriksh Valley</p>
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-number">500+</span>
              <span className="stat-label">Happy Customers</span>
            </div>
            <div className="stat">
              <span className="stat-number">4.9</span>
              <span className="stat-label">Average Rating</span>
            </div>
            <div className="stat">
              <span className="stat-number">98%</span>
              <span className="stat-label">Satisfaction Rate</span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="testimonials-container">
        <motion.div 
          className="section-intro"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Quote className="quote-icon" size={40} />
          <p>
            Don't just take our word for it—see what our plant lover community has to say. 
            Every review represents a home transformed, a plant thriving, and a customer delighted.
          </p>
        </motion.div>

        {isMobile ? (
          <div className="testimonials-swiper-container">
            <Swiper
              effect={'cards'}
              grabCursor={true}
              modules={[EffectCards, Autoplay, Pagination]}
              className="testimonials-swiper"
              autoplay={{
                delay: 3000,
                disableOnInteraction: false,
              }}
              pagination={{
                clickable: true,
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
                        width={60}
                        height={60}
                        className="avatar"
                      />
                      <div className="user-info">
                        <h4>{testimonial.name}</h4>
                        <div className="rating">
                          {renderStars(testimonial.rating)}
                        </div>
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
            animate="visible"
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
                    width={60}
                    height={60}
                    className="avatar"
                  />
                  <div className="user-info">
                    <h4>{testimonial.name}</h4>
                    <div className="rating">
                      {renderStars(testimonial.rating)}
                    </div>
                  </div>
                </div>
                <p className="testimonial-text">{testimonial.text}</p>
              </motion.div>
            ))}
          </motion.div>
        )}

        <motion.div 
          className="testimonials-footer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h3>Join Our Happy Plant Family!</h3>
          <p>Experience the Vriksh Valley difference for yourself</p>
          <a href="/products" className="shop-now-btn">
            Shop Now
          </a>
        </motion.div>
      </div>
    </div>
  );
}
