'use client';
import { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import '@/styles/testimonials.scss';

gsap.registerPlugin(ScrollTrigger);

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

export default function Testimonials() {
  const scrollRef = useRef(null);
  const tlRef = useRef(null);
  const sectionRef = useRef(null);

  useEffect(() => {
    const el = scrollRef.current;
    const section = sectionRef.current;
    if (!el || !section) return;

    // Check if mobile or desktop
    const isMobile = window.innerWidth <= 768;
    
    if (!isMobile) {
      // ===== DESKTOP: Bento grid with fade-up animation =====
      const cards = el.querySelectorAll('.testimonial-card');
      
      // Set initial state: invisible and slightly below
      gsap.set(cards, {
        opacity: 0,
        y: 50,
        scale: 0.95
      });

      // Staggered animation when scrolled into view - REPEATABLE
      ScrollTrigger.create({
        trigger: section,
        start: 'top 80%',
        end: 'bottom 20%',
        toggleActions: 'play reverse play reverse', // Animate both on enter and leave
        onEnter: () => {
          gsap.to(cards, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            stagger: {
              amount: 1.2,
              from: 'start',
              ease: 'power2.out'
            },
            ease: 'back.out(1.2)'
          });
        },
        onLeaveBack: () => {
          gsap.to(cards, {
            opacity: 0,
            y: 50,
            scale: 0.95,
            duration: 0.4,
            stagger: {
              amount: 0.6,
              from: 'end'
            }
          });
        }
      });

      // Calculate masonry grid-row-end for each card
      cards.forEach((card) => {
        const height = card.offsetHeight;
        const rowSpan = Math.ceil((height + 20) / 20); // 20px is grid-auto-rows
        card.style.gridRowEnd = `span ${rowSpan}`;
      });

      // Cleanup function for desktop
      return () => {
        ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      };
      
    } else {
      // ===== MOBILE: Horizontal to-and-fro scroll animation =====
      const cards = Array.from(el.querySelectorAll('.testimonial-card'));
      
      // Clone cards multiple times for seamless to-and-fro effect
      for (let i = 0; i < 2; i++) {
        cards.forEach((card) => {
          const clone = card.cloneNode(true);
          el.appendChild(clone);
        });
      }

      const allCards = Array.from(el.querySelectorAll('.testimonial-card'));
      
      // Set initial state for mobile - all visible, no transform
      gsap.set(allCards, {
        opacity: 1,
      });
      
      gsap.set(el, {
        x: 0
      });

      // Calculate total width for animation (only original cards)
      const cardWidth = cards[0].offsetWidth;
      const gap = 16; // 1rem gap
      const totalWidth = (cardWidth + gap) * cards.length;

      // Start animation immediately after setup
      requestAnimationFrame(() => {
        // Create seamless to-and-fro timeline using yoyo
        const tl = gsap.timeline({ 
          repeat: -1,
          yoyo: true, // This makes it go back smoothly
        });
        
        // Move left (A to B) with smooth transition
        tl.to(el, {
          x: -totalWidth,
          duration: 20,
          ease: 'sine.inOut' // Smooth easing for natural motion
        });

        tlRef.current = tl;

        // Hover to slow down
        const handleEnter = () => {
          if (tlRef.current) tlRef.current.timeScale(0.3);
        };
        const handleLeave = () => {
          if (tlRef.current) tlRef.current.timeScale(1);
        };

        el.addEventListener('mouseenter', handleEnter);
        el.addEventListener('mouseleave', handleLeave);

        // Store cleanup handlers for later
        el._cleanupHandlers = { handleEnter, handleLeave };
      });

      // Cleanup function for mobile
      return () => {
        if (el._cleanupHandlers) {
          el.removeEventListener('mouseenter', el._cleanupHandlers.handleEnter);
          el.removeEventListener('mouseleave', el._cleanupHandlers.handleLeave);
        }
        if (tlRef.current) tlRef.current.kill();
        ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      };
    }
  }, []);

  return (
    <section className="testimonials" ref={sectionRef}>
      <h2>What Our Customers Say</h2>

      <div className="testimonials-grid" ref={scrollRef}>
        {testimonialsData.map((testimonial) => (
          <div key={testimonial.id} className="testimonial-card">
            <div className="user-info">
              <Image src={testimonial.avatar} alt={testimonial.name} width={48} height={48} />
              <div>
                <h4>{testimonial.name}</h4>
                <span>{testimonial.username}</span>
              </div>
            </div>
            <p className="testimonial-text">
              {testimonial.text}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
