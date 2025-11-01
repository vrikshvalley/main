'use client';

import { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Loader from './Loader';

export default function PageLoader() {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const isInitialMount = useRef(true);

  useEffect(() => {
    // Skip on initial mount (homepage load)
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Don't show loader on homepage
    if (pathname === '/') {
      return;
    }

    // Show PageLoader for all other pages
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [pathname]);

  if (!isLoading) return null;

  return <Loader fullscreen />;
}
