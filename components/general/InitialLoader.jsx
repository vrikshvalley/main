'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '@/styles/initialLoader.scss';

export default function InitialLoader() {
  const [isLoading, setIsLoading] = useState(true);
  const [pathname, setPathname] = useState('');
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [showVriksh, setShowVriksh] = useState(false);
  const [showValley, setShowValley] = useState(false);

  // Array of text in different languages
  const textArray = ['वृक्ष', 'বৃক্ষ', 'ବୃକ୍ଷ', 'وڻ', 'વૃક્ષ', 'ಮರ', 'చెట్టు', 'மரம்', 'മരം', 'ꯔꯨ'];

  useEffect(() => {
    // Set pathname on client side only
    setPathname(window.location.pathname);

    // Scroll through different language texts
    const textInterval = setInterval(() => {
      setCurrentTextIndex((prev) => {
        if (prev < textArray.length - 1) {
          return prev + 1;
        } else {
          clearInterval(textInterval);
          // After scrolling through all texts, show "Vriksh"
          setTimeout(() => setShowVriksh(true), 200);
          return prev;
        }
      });
    }, 150); // Fast scrolling effect

    // Show Valley after Vriksh appears
    setTimeout(() => {
      setShowValley(true);
    }, 2000);

    // Complete animation and hide loader (increased by 1 second)
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 4500);

    return () => {
      clearInterval(textInterval);
      clearTimeout(timer);
    };
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
            transition: { duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96] }
          }}
        >
          {/* Green Background */}
          <div className="loaderBackground" />

          {/* Content Container */}
          <div className="loaderContent">
            {/* Scrolling Text Animation */}
            {!showVriksh && (
              <motion.div
                className="scrollingTextContainer"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.span
                  className="scrollingText"
                  key={currentTextIndex}
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -50, opacity: 0 }}
                  transition={{
                    duration: 0.15,
                    ease: [0.43, 0.13, 0.23, 0.96]
                  }}
                >
                  {textArray[currentTextIndex]}
                </motion.span>
              </motion.div>
            )}

            {/* Vriksh Valley Animation */}
            {showVriksh && (
              <div className="brandContainer">
                <div className="brandWrapper">
                  {/* Vriksh - appears then slides left */}
                  <motion.div
                    className="vrikshText"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ 
                      opacity: 1, 
                      scale: 1,
                      x: showValley ? -10 : 0
                    }}
                    transition={{
                      opacity: { duration: 0.4, ease: 'easeOut' },
                      scale: { duration: 0.4, ease: [0.43, 0.13, 0.23, 0.96] },
                      x: { duration: 0.6, delay: 0.5, ease: [0.43, 0.13, 0.23, 0.96] }
                    }}
                  >
                    Vriksh
                  </motion.div>

                  {/* Valley - slides in from right */}
                  {showValley && (
                    <motion.div
                      className="valleyText"
                      initial={{ opacity: 0, x: 100 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: 0.6,
                        ease: [0.43, 0.13, 0.23, 0.96]
                      }}
                    >
                      Valley
                    </motion.div>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}