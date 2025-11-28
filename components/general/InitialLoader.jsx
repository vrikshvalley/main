'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import '@/styles/initialLoader.scss';

export default function InitialLoader() {
  const [isLoading, setIsLoading] = useState(true);
  const [pathname, setPathname] = useState('');

  useEffect(() => {
    // Set pathname on client side only
    setPathname(window.location.pathname);

    // Animation duration: 2.5 seconds total (optimized for better performance)
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  // Only show on homepage
  if (pathname !== '/' && pathname !== '') return null;

  // Generate leaf positions - reduced to 5 for better performance
  const leaves = Array.from({ length: 5 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 1.5,
    duration: 2.5 + Math.random() * 1,
    rotate: Math.random() * 360
  }));

  return (
    <AnimatePresence mode="wait">
      {isLoading && (
        <motion.div
          className="initialLoader"
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            transition: { duration: 0.6, ease: 'easeOut' }
          }}
        >
          {/* Animated Background Gradient */}
          <div className="loaderBackground" />

          {/* Floating Leaves */}
          <div className="leavesContainer">
            {leaves.map((leaf) => (
              <motion.div
                key={leaf.id}
                className="leaf"
                style={{
                  left: `${leaf.left}%`,
                  rotate: leaf.rotate
                }}
                initial={{ y: -100, opacity: 0 }}
                animate={{ 
                  y: '100vh',
                  opacity: [0, 0.7, 0.7, 0],
                  rotate: [leaf.rotate, leaf.rotate + 180]
                }}
                transition={{
                  duration: leaf.duration,
                  delay: leaf.delay,
                  ease: 'linear',
                  repeat: 0
                }}
              />
            ))}
          </div>

          {/* Mist/Fog Effect */}
          <div className="mistContainer">
            <div className="mist mist1" />
            <div className="mist mist2" />
          </div>

          {/* Content Container */}
          <div className="loaderContent">
            {/* Logo Animation - Simplified slow fade-in */}
            <motion.div
              className="logoContainer"
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: 1
              }}
              transition={{
                duration: 1.2,
                ease: 'easeOut'
              }}
            >
              <Image
                src="/white-logo.png"
                alt="Vriksh Valley"
                width={120}
                height={120}
                priority
              />
            </motion.div>

            {/* Brand Name Container - Simplified */}
            <div className="brandContainer">
              {/* VRIKSH */}
              <motion.div
                className="brandWord"
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: 1
                }}
                transition={{
                  duration: 0.8,
                  ease: 'easeOut',
                  delay: 0.4
                }}
              >
                <span className="brandText gradient-text">VRIKSH</span>
              </motion.div>

              {/* VALLEY */}
              <motion.div
                className="brandWord"
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: 1
                }}
                transition={{
                  duration: 0.8,
                  ease: 'easeOut',
                  delay: 0.7
                }}
              >
                <span className="brandText gradient-text">VALLEY</span>
              </motion.div>
            </div>

            {/* Tagline - Simplified */}
            <motion.p
              className="tagline"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: 0.8,
                ease: 'easeOut',
                delay: 1
              }}
            >
              Bring Nature Home
            </motion.p>

            {/* Growing Vine Effect - Removed for performance */}
          </div>

          {/* Particles/Sparkles - Removed for performance */}
        </motion.div>
      )}
    </AnimatePresence>
  );
}