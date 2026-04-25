'use client';

import { useEffect, useLayoutEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
// Note: removed direct import of global SCSS to avoid Turbopack client-proxy issues
// Styles are applied via global stylesheet in app layout instead.

export default function InitialLoader() {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(pathname === '/');
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [videoFailed, setVideoFailed] = useState(false);
  const MOTION_DURATION = 300; // ms - matches framer-motion transitions
  const VALLEY_DELAY = 80; // ms delay before showing 'Valley' so both texts match

  const [valleyShown, setValleyShown] = useState(false);
  // Text sequence shown before the word "Valley". Use the full Indic set.
  const textArray = [
    { text: 'वृक्ष', className: 'script-devanagari', dir: 'ltr' },
    { text: 'বৃক্ষ', className: 'script-bengali', dir: 'ltr' },
    { text: 'ବୃକ୍ଷ', className: 'script-odia', dir: 'ltr' },
    { text: 'وڻ', className: 'script-arabic rtl', dir: 'rtl' },
    { text: 'વૃક્ષ', className: 'script-gujarati', dir: 'ltr' },
    { text: 'ಮರ', className: 'script-kannada', dir: 'ltr' },
    { text: 'చెట్టు', className: 'script-telugu', dir: 'ltr' },
    { text: 'மரம்', className: 'script-tamil', dir: 'ltr' },
    { text: 'മരം', className: 'script-malayalam', dir: 'ltr' },
    { text: 'ꯔꯨ', className: 'script-meitei', dir: 'ltr' },
    { text: 'Vriksh', className: 'script-latin', dir: 'ltr' }
  ];

  // Current active text object derived from the array and index.
  const currentText = textArray[currentTextIndex] || { text: '' };

  // Toggle loader whenever route changes to homepage.
  useLayoutEffect(() => {
    if (pathname === '/') {
      setCurrentTextIndex(0);
      setValleyShown(false);
      setVideoFailed(false);
      setIsLoading(true);
      return;
    }

    setIsLoading(false);
  }, [pathname]);

  // Keep the loader attribute in sync so the layout can hide main content before paint.
  useEffect(() => {
    if (typeof document === 'undefined') return;

    if (isLoading) {
      document.documentElement.setAttribute('data-initial-loader', '1');
    } else {
      document.documentElement.removeAttribute('data-initial-loader');
    }
  }, [isLoading]);

  // Start the text sequence only when the loader becomes visible.
  useEffect(() => {
    if (!isLoading) return;

    const motionDuration = MOTION_DURATION; // ms
    const cadence = [motionDuration + 120, motionDuration + 300, motionDuration + 300, motionDuration + 120];
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

          exitTimer = setTimeout(() => setIsLoading(false), motionDuration + 400);
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
            transition: { duration: 1, ease: [0.4, 0, 0.2, 1] },
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
            <motion.div className="scrollingTextContainer" initial={{ opacity: 1 }}>
              <div className="brandWrapper">
                <motion.span
                  className={`scrollingText ${currentText.className || ''}`.trim()}
                  dir={currentText.dir || 'ltr'}
                  key={currentTextIndex}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: MOTION_DURATION / 1000,
                    ease: [0.25, 0.1, 0.25, 1],
                  }}
                >
                  {currentText.text}
                </motion.span>

                {!valleyShown ? (
                  <motion.span
                    className="valleyText"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: MOTION_DURATION / 1000,
                      delay: VALLEY_DELAY / 1000,
                      ease: [0.25, 0.1, 0.25, 1],
                    }}
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