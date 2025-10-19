'use client';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import '@/styles/aboutUs.scss';

gsap.registerPlugin(ScrollTrigger);

export default function About() {
  const aboutRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    if (!aboutRef.current || !textRef.current) return;

    gsap.from(aboutRef.current, {
      opacity: 0,
      y: 50,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: aboutRef.current,
        start: 'top 80%',
        toggleActions: 'play none none reverse'
      }
    });

    gsap.from(textRef.current, {
      opacity: 0,
      y: 30,
      duration: 1,
      delay: 0.2,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: textRef.current,
        start: 'top 85%',
        toggleActions: 'play none none reverse'
      }
    });
  }, []);

  return (
    <section className="about-section" ref={aboutRef}>
      <h2>About Us</h2>
      <p ref={textRef}>
        At Vriksh Valley, we believe plants are more than just greenery—they’re a way of life. Whether you’re creating a lush indoor oasis or an outdoor paradise, we bring you handpicked plants, exquisite bonsai, kokedama, moss walls, and terrariums, along with high-quality seeds, soil, organic fertilizers, and eco-friendly pots.
        <br /><br />
        Need guidance? Our Plant consultation ensures you find the perfect green companions for your space. With sustainability at our core, every purchase supports a greener planet.
        <br /><br />
        Join us in making the world more vibrant—one plant at a time!
      </p>
    </section>
  );
}
