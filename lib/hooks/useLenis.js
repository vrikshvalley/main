"use client";

import { useEffect } from "react";
import Lenis from "lenis";

let lenisInstance = null;

export function useLenis() {
  useEffect(() => {
    // Prevent multiple instances in development with HMR
    if (lenisInstance) {
      return;
    }

    // Native scrolling is smoother on touch devices and for people who
    // prefer reduced motion: only enable Lenis for mouse/trackpad users.
    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (coarsePointer || reducedMotion) {
      return;
    }

    const lenis = new Lenis({
      duration: 0.6, // Reduced from 1.2 for smoother, snappier scrolling
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // easing function
      direction: "vertical",
      gestureDirection: "vertical",
      smooth: true,
      smoothTouch: false,
      touchMultiplier: 1.5,
      wheelMultiplier: 1,
      infinite: false,
      autoResize: true,
      syncTouch: false,
    });

    lenisInstance = lenis;

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      // Don't destroy on unmount to keep smooth scroll active during navigation
      // lenis.destroy();
      // lenisInstance = null;
    };
  }, []);
}
