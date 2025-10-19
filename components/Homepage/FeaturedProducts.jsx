'use client';

import { useEffect, useRef } from 'react';
import ProductCard from '../products/ProductCard';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import "@/styles/featuredProducts.scss";

gsap.registerPlugin(ScrollTrigger);

export default function FeaturedProducts({ title}) {
  const sectionRef = useRef(null);
  
  
  useEffect(() => {
    if (sectionRef.current) {
      const cards = sectionRef.current.querySelectorAll('.product-card');
      
      // Set initial state
      gsap.set(cards, {
        opacity: 0,
        y: 40
      });

      // Create ScrollTrigger animation
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 80%',
        end: 'bottom 20%',
        toggleActions: 'play reverse play reverse', // Repeatable animation
        onEnter: () => {
          gsap.to(cards, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: 'power3.out'
          });
        },
        onLeaveBack: () => {
          gsap.to(cards, {
            opacity: 0,
            y: 40,
            duration: 0.5,
            stagger: {
              amount: 0.3,
              from: 'end'
            }
          });
        }
      });
    }

    return () => {
      // Cleanup ScrollTriggers on unmount
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <section className="featured-products" ref={sectionRef}>
      <h2 className="featured-title">{title}</h2>
      <div className="products-container">
        <ProductCard />
        
      </div>
    </section>
  );
}
