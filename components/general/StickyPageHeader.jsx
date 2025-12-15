'use client';

import { useEffect, useState } from 'react';
import '@/styles/stickyPageHeader.scss';

export default function StickyPageHeader({ title, subtitle }) {
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Look for hero-banner, products-header, or search-header
      const headerElement = document.querySelector('.hero-banner, .products-header, .search-header');
      if (!headerElement) return;

      const headerRect = headerElement.getBoundingClientRect();
      const headerBottom = headerRect.bottom;

      // Make sticky when header is about to leave viewport
      if (headerBottom <= 0) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    // Check on mount and scroll
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!title) return null;

  return (
    <div className={`sticky-page-header ${isSticky ? 'visible' : ''}`}>
      <div className="sticky-content">
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
    </div>
  );
}
