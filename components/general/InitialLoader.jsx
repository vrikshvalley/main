'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '@/styles/initialLoader.scss';

export default function InitialLoader() {
  const [isLoading, setIsLoading] = useState(true);
  const [pathname, setPathname] = useState('');

  useEffect(() => {
    // Set pathname on client side only
    setPathname(window.location.pathname);

    // Animation duration: 4 seconds total
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  // Only show on homepage
  if (pathname !== '/' && pathname !== '') return null;

  return (
    <AnimatePresence mode="wait">
      {isLoading && (
        <motion.div
          className="initialLoader"
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            transition: { duration: 0.5, ease: 'easeOut' }
          }}
        >
          {/* Animated Mist Layers */}
          <div className="mistLayer mist1" />
          <div className="mistLayer mist2" />
          <div className="mistLayer mist3" />

          {/* Content Container */}
          <div className="loaderContent">
            {/* VRIKSH - White Layer */}
            <motion.h1 
              className="brandText brandWord whiteLayer vriksh"
              initial={{ opacity: 0, y: 30 }}
              animate={{ 
                opacity: [0, 1, 1, 0, 0],
                y: [30, 0, 0, -20, -20],
                transition: {
                  duration: 4,
                  times: [0, 0.4, 0.65, 1, 1],
                  ease: [0.22, 1, 0.36, 1]
                }
              }}
            >
              VRIKSH
            </motion.h1>

            {/* VRIKSH - Masked Layer */}
            <motion.h1 
              className="brandText brandWord maskedLayer vriksh"
              initial={{ opacity: 0, y: 30 }}
              animate={{ 
                opacity: [0, 0, 1, 1, 0],
                y: [30, 0, 0, 0, -20],
                transition: {
                  duration: 4,
                  times: [0, 0.4, 0.45, 0.65, 1],
                  ease: [0.22, 1, 0.36, 1]
                }
              }}
            >
              VRIKSH
            </motion.h1>

            {/* VALLEY - White Layer */}
            <motion.h1 
              className="brandText brandWord whiteLayer valley"
              initial={{ opacity: 0, y: 30 }}
              animate={{ 
                opacity: [0, 1, 1, 0, 0],
                y: [30, 0, 0, -20, -20],
                transition: {
                  duration: 4,
                  times: [0, 0.4, 0.65, 1, 1],
                  ease: [0.22, 1, 0.36, 1],
                  delay: 0.3
                }
              }}
            >
              VALLEY
            </motion.h1>

            {/* VALLEY - Masked Layer */}
            <motion.h1 
              className="brandText brandWord maskedLayer valley"
              initial={{ opacity: 0, y: 30 }}
              animate={{ 
                opacity: [0, 0, 1, 1, 0],
                y: [30, 0, 0, 0, -20],
                transition: {
                  duration: 4,
                  times: [0, 0.4, 0.45, 0.65, 1],
                  ease: [0.22, 1, 0.36, 1],
                  delay: 0.3
                }
              }}
            >
              VALLEY
            </motion.h1>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
