'use client';

import { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Lottie from 'lottie-react';
import leavesAnimation from '@/public/leaves.json';
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
    }, 2000);

    return () => clearTimeout(timer);
  }, [pathname, showOnRouteChange]);

  if (!isLoading) return null;

  return (
    <div className={`the-loader-container ${fullscreen ? 'fullscreen' : ''}`}>
      <div className="lottie-loader">
        <Lottie 
          animationData={leavesAnimation} 
          loop={true}
          style={{ width: 200, height: 200 }}
        />
      </div>
    </div>
  );
}
