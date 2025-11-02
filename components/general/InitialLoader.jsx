'use client';

import { useEffect, useState } from 'react';
import '@/styles/initialLoader.scss';

export default function InitialLoader() {
  const [isLoading, setIsLoading] = useState(true);
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  useEffect(() => {
    // Always show loader on homepage - no session check
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 5500); // 5.5 seconds - full animation

    return () => clearTimeout(timer);
  }, []);

  if (!isLoading) return null;
  if(pathname !== '/') return null;

  return (
    <div className="initial-loader">
      <div className="plant-container">
        {/* Pot */}
        <div className="pot">
          <div className="pot-top"></div>
          <div className="pot-body"></div>
        </div>
        
        {/* Plant stem and leaves */}
        <div className="plant">
          <div className="stem"></div>
          <div className="leaf left-leaf-1"></div>
          <div className="leaf right-leaf-1"></div>
          <div className="leaf left-leaf-2"></div>
          <div className="leaf right-leaf-2"></div>
          <div className="leaf top-leaf"></div>
        </div>
      </div>
      
      <div className="brand-container">
        <div className="brand-name">Vriksh Valley</div>
        <div className="tagline">Growing Naturally</div>
      </div>
    </div>
  );
}
