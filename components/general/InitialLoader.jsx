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

    // Animation duration: 3.5 seconds total (reduced for better performance)
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  // Only show on homepage
  if (pathname !== '/' && pathname !== '') return null;

  // Generate leaf positions - reduced from 20 to 8 for better performance
  const leaves = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 3 + Math.random() * 2,
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
            {/* Logo Animation */}
            <motion.div
              className="logoContainer"
              initial={{ scale: 0, opacity: 0, rotate: -180 }}
              animate={{ 
                scale: [0, 1.2, 1],
                opacity: [0, 1, 1],
                rotate: [- 180, 0, 0]
              }}
              transition={{
                duration: 1.5,
                times: [0, 0.7, 1],
                ease: [0.22, 1, 0.36, 1]
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

            {/* Brand Name Container */}
            <div className="brandContainer">
              {/* VRIKSH */}
              <motion.div
                className="brandWord"
                initial={{ opacity: 0, y: 30 }}
                animate={{ 
                  opacity: [0, 1, 1, 1],
                  y: [30, 0, 0, 0]
                }}
                transition={{
                  duration: 2,
                  times: [0, 0.3, 0.7, 1],
                  ease: [0.22, 1, 0.36, 1],
                  delay: 0.8
                }}
              >
                <span className="brandText gradient-text">VRIKSH</span>
              </motion.div>

              {/* VALLEY */}
              <motion.div
                className="brandWord"
                initial={{ opacity: 0, y: 30 }}
                animate={{ 
                  opacity: [0, 1, 1, 1],
                  y: [30, 0, 0, 0]
                }}
                transition={{
                  duration: 2,
                  times: [0, 0.3, 0.7, 1],
                  ease: [0.22, 1, 0.36, 1],
                  delay: 1.2
                }}
              >
                <span className="brandText gradient-text">VALLEY</span>
              </motion.div>
            </div>

            {/* Tagline */}
            <motion.p
              className="tagline"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 1] }}
              transition={{
                duration: 1.5,
                times: [0, 0.5, 1],
                delay: 2
              }}
            >
              Bring Nature Home
            </motion.p>

            {/* Growing Vine Effect */}
            <motion.div
              className="vineDecoration"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{
                duration: 2.5,
                delay: 1.5,
                ease: 'easeOut'
              }}
            />
          </div>

          {/* Particles/Sparkles */}
          <div className="sparklesContainer">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="sparkle"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0]
                }}
                transition={{
                  duration: 2,
                  delay: Math.random() * 3,
                  repeat: 0
                }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}