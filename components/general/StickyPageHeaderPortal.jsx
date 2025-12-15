'use client';

import { useEffect, useState } from 'react';
import { getStickyHeaderData, subscribe } from '@/lib/stickyHeaderStore';
import '@/styles/stickyPageHeader.scss';

export default function StickyPageHeaderPortal() {
  const [headerData, setHeaderData] = useState({ title: null, subtitle: null });
  const [isSticky, setIsSticky] = useState(false);

  // Subscribe to header data changes
  useEffect(() => {
    const unsubscribe = subscribe((data) => {
      setHeaderData(data);
    });
    return unsubscribe;
  }, []);

  // Handle scroll to show/hide sticky header
  useEffect(() => {
    const handleScroll = () => {
      // Look for hero-banner, products-header, or search-header
      const headerElement = document.querySelector('.hero-banner, .products-header, .search-header');
      
      if (!headerElement || !headerData.title) {
        setIsSticky(false);
        return;
      }

      const headerRect = headerElement.getBoundingClientRect();
      const navbarHeight = 60; // Navbar height
      const breadcrumbsHeight = 50; // Approximate breadcrumbs height
      
      // Make sticky when header + navbar + breadcrumbs have scrolled past
      const threshold = -(headerRect.height + breadcrumbsHeight);
      
      if (headerRect.top <= threshold) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    // Check on mount and scroll
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [headerData.title]);

  if (!headerData.title) return null;

  return (
    <div className={`sticky-page-header ${isSticky ? 'visible' : ''}`}>
      <div className="sticky-content">
        <h2>{headerData.title}</h2>
        {headerData.subtitle && <p>{headerData.subtitle}</p>}
      </div>
    </div>
  );
}
