'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Note: removed direct import of global SCSS to avoid Turbopack client-proxy issues
// Styles are applied via global stylesheet in app layout instead.

export default function InitialLoader() {
  const [isLoading, setIsLoading] = useState(true);
  const [pathname, setPathname] = useState('');
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [showVriksh, setShowVriksh] = useState(false);
  const [showValley, setShowValley] = useState(false);

  // Array of text in different languages
  const textArray = ['वृक्ष', 'বৃক্ষ', 'ବୃକ୍ଷ', 'وڻ', 'વૃક્ષ', 'ಮರ', 'చెట్టు', 'மரம்', 'മരം', 'ꯔꯨ', 'Vriksh'];

  useEffect(() => {
    // Set pathname on client side only
    setPathname(window.location.pathname);

    // Scroll through different language texts with count-up style
    const textInterval = setInterval(() => {
      setCurrentTextIndex((prev) => {
        if (prev < textArray.length - 1) {
          return prev + 1;
        } else {
          clearInterval(textInterval);
          // After showing "Vriksh", show "Valley" beside it
          setTimeout(() => setShowValley(true), 400);
          return prev;
        }
      });
    }, 180); // Smoother, less rushed timing

    // Complete animation and hide loader
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3800);

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
            transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] }
          }}
        >
          {/* Green Background */}
          <div className="loaderBackground" />

          {/* Content Container */}
          <div className="loaderContent">
            {/* Scrolling Text Animation */}
            <motion.div
              className="scrollingTextContainer"
              initial={{ opacity: 1 }}
            >
              <div className="brandWrapper">
                <motion.span
                  className="scrollingText"
                  key={currentTextIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: 0.25,
                    ease: [0.25, 0.1, 0.25, 1]
                  }}
                >
                  {textArray[currentTextIndex]}
                </motion.span>

                {/* Valley - appears beside Vriksh */}
                {showValley && (
                  <motion.span
                    className="valleyText"
                    initial={{ opacity: 0, x: 30, y: 2 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{
                      duration: 0.32,
                      ease: [0.25, 0.1, 0.25, 1]
                    }}
                  >
                    Valley
                  </motion.span>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}