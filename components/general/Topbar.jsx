'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import "@/styles/topbar.scss";

export default function TopBar() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const impactText = "500 litres of water saved • 100 kg of organic matter composted";

  return (
    <div className="topbar">
      <div className="topbar-container">
        <div className="topbar-logo">
          <Image src="/white-logo.png" alt="Logo" width={30} height={30} />
        </div>
        
        {isMobile ? (
          <div className="impact-marquee">
            <div className="marquee-content">
              <span>{impactText}</span>
              <span>{impactText}</span>
              <span>{impactText}</span>
            </div>
          </div>
        ) : (
          <div className="impact-text">
            <span className="impact-icon">🌱</span>
            {impactText}
          </div>
        )}

        <nav className="topbar-links">
          <Link href="/blog">Blog</Link>
          <span className="separator">|</span>
          <Link href="/consulting">Consulting</Link>
          <span className="separator">|</span>
          <Link href="/offers">Offers</Link>
          <span className="separator">|</span>
          <Link href="/testimonials">Testimonials</Link>
          <span className="separator">|</span>
          <Link href="/faq">FAQ</Link>
        </nav>
      </div>
    </div>
  );
}
