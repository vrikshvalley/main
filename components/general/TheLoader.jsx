'use client';

import { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import '@/styles/theLoader.scss';

export default function TheLoader({ fullscreen = false, showOnRouteChange = false }) {
  const [isLoading, setIsLoading] = useState(fullscreen && !showOnRouteChange);
  const pathname = usePathname();
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (!showOnRouteChange) return;

    // Skip on initial mount (homepage load)
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Don't show loader on homepage
    if (pathname === '/') {
      return;
    }

    // Show loader for all other pages
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [pathname, showOnRouteChange]);

  if (!isLoading) return null;

  return (
    <div className={`the-loader-container ${fullscreen ? 'fullscreen' : ''}`}>
      {/* SVG filter for goo effect */}
      <svg className="goo-filter">
        <defs>
          <filter id="goo-effect">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>

      <div className="blob-spinner">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>
    </div>
  );
}
