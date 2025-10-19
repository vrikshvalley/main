'use client';
import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import '@/styles/footer.scss';

gsap.registerPlugin(ScrollTrigger);

export default function Footer() {
  const footerRef = useRef(null);

  useEffect(() => {
    if (footerRef.current) {
      gsap.fromTo(
        footerRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: footerRef.current,
            start: 'top 85%',
          },
        }
      );
    }
  }, []);

  return (
    <footer className="footer" ref={footerRef}>
      <div className="footer-container">
        <div className="footer-section">
          <h3>About</h3>
          <ul>
            <li><Link href="/about-us">About Us</Link></li>
            <li><Link href="/our-story">Our Story</Link></li>
            <li><Link href="/terms-of-services">Terms of Services</Link></li>
            <li><Link href="/contact-us">Contact Us</Link></li>
            <li><Link href="/cancellation-return">Cancellation & Return Policy</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Customer Care</h3>
          <ul>
            <li><Link href="/track-order">Track Order</Link></li>
            <li><Link href="/faqs">FAQs</Link></li>
            <li><Link href="/shipping-policies">Shipping Policies</Link></li>
            <li><Link href="/terms-conditions">Terms and Conditions</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Get in Touch</h3>
          <ul>
            <li><a href="tel:+911234567890">Call: +91 12345 67890</a></li>
            <li><a href="mailto:support@example.com">Email: support@example.com</a></li>
            <li><a href="https://wa.me/911234567890" target="_blank">WhatsApp: +91 12345 67890</a></li>
          </ul>
        </div>

        <div className="footer-section newsletter">
          <h3>Sign up for Newsletter</h3>
          <form>
            <input type="email" placeholder="Enter your email" />
            <button type="submit">Subscribe</button>
          </form>
          <div className="social-icons">
            <a href="#"><Facebook size={20} /></a>
            <a href="#"><Instagram size={20} /></a>
            <a href="#"><Twitter size={20} /></a>
            <a href="#"><Youtube size={20} /></a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Vriksh Valley. All rights reserved.</p>
      </div>
    </footer>
  );
}
