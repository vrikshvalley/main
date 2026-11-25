'use client';

import { useEffect, useLayoutEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
// Note: removed direct import of global SCSS to avoid Turbopack client-proxy issues
// Styles are applied via global stylesheet in app layout instead.

const NOTO_FONTS_URL =
  'https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@600&family=Noto+Sans+Bengali:wght@600&family=Noto+Sans+Devanagari:wght@600&family=Noto+Sans+Gujarati:wght@600&family=Noto+Sans+Kannada:wght@600&family=Noto+Sans+Malayalam:wght@600&family=Noto+Sans+Meetei+Mayek:wght@600&family=Noto+Sans+Oriya:wght@600&family=Noto+Sans+Tamil:wght@600&family=Noto+Sans+Telugu:wght@600&family=Noto+Sans:wght@600&display=swap';
const INTRO_SEEN_KEY = 'vv-intro-seen';

export default function InitialLoader() {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(pathname === '/');
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
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
  // The word rolling out above it (the sequence only ever moves forward).
  const prevText = currentTextIndex > 0 ? textArray[currentTextIndex - 1] : null;

  // Toggle loader whenever route changes to homepage.
  useLayoutEffect(() => {
    // The intro plays once per browser session; repeat visits go straight to the page.
    let introSeen = false;
    try {
      introSeen = sessionStorage.getItem(INTRO_SEEN_KEY) === '1';
    } catch (e) {}

    if (pathname === '/' && !introSeen) {
      setCurrentTextIndex(0);
      setValleyShown(false);
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
      try {
        sessionStorage.setItem(INTRO_SEEN_KEY, '1');
      } catch (e) {}
    }
  }, [isLoading]);

  // Load the multi-script Noto fonts only when the intro actually plays,
  // instead of blocking every page with render-blocking @imports.
  useEffect(() => {
    if (!isLoading || document.getElementById('vv-noto-fonts')) return;
    const link = document.createElement('link');
    link.id = 'vv-noto-fonts';
    link.rel = 'stylesheet';
    link.href = NOTO_FONTS_URL;
    document.head.appendChild(link);
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
            <div className="loaderBackgroundOverlay" />
            <div className="loaderBackgroundFallback" />
          </div>

          {/* Content Container */}
          <div className="loaderContent">
            {/*
              Two fixed halves meeting at the centre line: the word slot on the left is
              right-aligned and clips its contents, so each local-language word rolls
              up into place like a counter while "Valley" never moves.
            */}
            <div className="brandWrapper">
              <span className="wordSlot" aria-hidden="true">
                {prevText && (
                  <span
                    key={`out-${currentTextIndex}`}
                    className={`scrollingText is-out ${prevText.className || ''}`.trim()}
                    dir={prevText.dir || 'ltr'}
                  >
                    {prevText.text}
                  </span>
                )}
                <span
                  key={`in-${currentTextIndex}`}
                  className={`scrollingText is-in ${currentText.className || ''}`.trim()}
                  dir={currentText.dir || 'ltr'}
                >
                  {currentText.text}
                </span>
              </span>
              <span className={`valleyText${valleyShown ? ' is-in' : ''}`}>Valley</span>
              <span className="sr-only">Vriksh Valley</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}