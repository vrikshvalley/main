'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Note: removed direct import of global SCSS to avoid Turbopack client-proxy issues
// Styles are applied via global stylesheet in app layout instead.

export default function InitialLoader() {
  const [isLoading, setIsLoading] = useState(false);
  const [pathname, setPathname] = useState('');
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [videoFailed, setVideoFailed] = useState(false);
  const MOTION_DURATION = 300; // ms - matches framer-motion transitions
  const VALLEY_DELAY = 80; // ms delay before showing 'Valley' so both texts match

  const [valleyShown, setValleyShown] = useState(false);

  // Array of script-aware text entries to ensure proper rendering per language.
  useEffect(() => {
    // Determine pathname and whether this navigation was a reload.
    const path = window.location.pathname;
    setPathname(path);

    let navType = 'navigate';
    try {
      const navEntry = performance.getEntriesByType && performance.getEntriesByType('navigation') && performance.getEntriesByType('navigation')[0];
      if (navEntry && navEntry.type) navType = navEntry.type; // 'navigate', 'reload', 'back_forward', 'prerender'
      else if (performance.navigation && performance.navigation.type === 1) navType = 'reload';
    } catch (e) {
      // ignore
    }

    // Only show the initial loader on the homepage when the page load was a full reload.
    if (path === '/' && navType === 'reload') {
      setIsLoading(true);
    }
  }, []);

  // Start the text sequence only when the loader becomes visible.
  useEffect(() => {
    if (!isLoading) return;

    const motionDuration = MOTION_DURATION; // ms
    const cadence = [motionDuration + 120 + EXTRA_HOLD, motionDuration + 300 + EXTRA_HOLD, motionDuration + 300 + EXTRA_HOLD, motionDuration + 120 + EXTRA_HOLD];
    let step = 0;
    let textTimer;
    let exitTimer;

    const runSequence = () => {
      textTimer = setTimeout(() => {
        setCurrentTextIndex((prev) => {
          if (prev < textArray.length - 1) {
            step += 1;
            runSequence();
            return prev + 1;
          }

          exitTimer = setTimeout(() => setIsLoading(false), motionDuration + 400 + EXTRA_HOLD);
          return prev;
        });
      }, cadence[step % cadence.length]);
    };

    runSequence();

    const valleyTimer = setTimeout(() => setValleyShown(true), VALLEY_DELAY + MOTION_DURATION);

    return () => {
      clearTimeout(textTimer);
      clearTimeout(exitTimer);
      clearTimeout(valleyTimer);
    };
  }, [isLoading]);
  

  useEffect(() => {
    if (pathname !== '/') return;

    const previousOverflow = document.body.style.overflow;
    if (isLoading) {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isLoading, pathname]);

  // Only show on homepage
  if (pathname !== '/' && pathname !== '') return null;

  return (
    <AnimatePresence mode="wait">
      {isLoading && (
        <motion.div
          className="initialLoader"
          initial={false}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ 
            opacity: 0,
            scale: 4,
            transition: { duration: 1, ease: [0.4, 0, 0.2, 1] }
          }}
        >
          <div className="loaderBackground">
            <video
              className="loaderBackgroundVideo"
              autoPlay
              muted
              
              playsInline
              
              onError={() => setVideoFailed(true)}
            >
              <source src="/hero.mp4" type="video/mp4" />
            </video>
            <div className="loaderBackgroundOverlay" />
            {videoFailed && <div className="loaderBackgroundFallback" />}
          </div>

          {/* Content Container */}
          <div className="loaderContent">
            {/* Scrolling Text Animation */}
            <motion.div
              className="scrollingTextContainer"
              initial={{ opacity: 1 }}
            >
              <div className="brandWrapper">
                <motion.span
                  className={`scrollingText ${currentText.className || ''}`.trim()}
                  dir={currentText.dir || 'ltr'}
                  key={currentTextIndex}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: MOTION_DURATION / 1000,
                    ease: [0.25, 0.1, 0.25, 1]
                  }}
                >
                  {currentText.text}
                </motion.span>

                {!valleyShown ? (
                  <motion.span
                    className="valleyText"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: MOTION_DURATION / 1000, delay: VALLEY_DELAY / 1000, ease: [0.25, 0.1, 0.25, 1] }}
                  >
                    Valley
                  </motion.span>
                ) : (
                  <span className="valleyText">Valley</span>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}