'use client';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

import '@/styles/whyChooseUs.scss';



export default function WhyChooseUs() {
  const containerRef = useRef(null);
  const contentRef = useRef(null);

  const items = [
    { emoji: '🌱', text: 'Fresh & Healthy Plants' },
    { emoji: '🚚', text: 'Fast & Safe Delivery' },
    { emoji: '💧', text: 'Low Maintenance' },
    { emoji: '🪴', text: 'Wide Variety of Pots' },
    { emoji: '🌿', text: 'Eco-Friendly Practices' },
    { emoji: '💳', text: 'Easy Payments' },
  ];

  useEffect(() => {
    const scrollContainer = containerRef.current;
    const scrollContent = contentRef.current;
    const itemElements = Array.from(scrollContent.querySelectorAll('.why-item'));

    // Clone items for seamless looping
    itemElements.forEach((item) => {
      const clone = item.cloneNode(true);
      scrollContent.appendChild(clone);
    });

    // Calculate total width of original set
    const itemWidth = itemElements.reduce(
      (total, item) => total + item.offsetWidth + 32, // 32px = gap (2rem)
      0
    );

    // GSAP seamless looping using ModifiersPlugin
    const tl = gsap.to(scrollContent, {
      x: `-=${itemWidth}`,
      duration: 25,
      ease: 'none',
      repeat: -1,
      modifiers: {
        x: gsap.utils.unitize((x) => parseFloat(x) % itemWidth),
      },
    });

    // Hover to slow down
    const handleMouseEnter = () => {
      gsap.to(tl, { timeScale: 0.25, duration: 1, ease: 'power2.out' });
    };
    const handleMouseLeave = () => {
      gsap.to(tl, { timeScale: 1, duration: 1, ease: 'power2.in' });
    };

    scrollContainer.addEventListener('mouseenter', handleMouseEnter);
    scrollContainer.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      scrollContainer.removeEventListener('mouseenter', handleMouseEnter);
      scrollContainer.removeEventListener('mouseleave', handleMouseLeave);
      tl.kill();
    };
  }, []);

  return (
    <section className="why-choose-us">
      <div className="scroll-container" ref={containerRef}>
        <div className="scroll-content" ref={contentRef}>
          {items.map((item, idx) => (
            <div className="why-item" key={idx}>
              <span className="emoji">{item.emoji}</span>
              <p>{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
