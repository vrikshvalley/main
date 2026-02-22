"use client";

import { useEffect, useRef } from "react";
import SplitType from "split-type";

export function useSplitType(selector = ".split-text", animationOptions = {}) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const elements = containerRef.current.querySelectorAll(selector);
    const splitInstances = [];

    elements.forEach((element) => {
      // Don't split if already split
      if (element.classList.contains("split-type-applied")) return;

      const split = new SplitType(element, {
        types: "lines, words, chars",
        tagName: "span",
      });

      splitInstances.push(split);
      element.classList.add("split-type-applied");

      // Default animation: fade in with slide up
      const { delay = 0, stagger = 0.03, duration = 0.6 } = animationOptions;

      split.chars.forEach((char, index) => {
        char.style.opacity = "0";
        char.style.transform = "translateY(20px)";
        char.style.display = "inline-block";

        setTimeout(
          () => {
            char.style.transition = `all ${duration}s cubic-bezier(0.22, 1, 0.36, 1)`;
            char.style.opacity = "1";
            char.style.transform = "translateY(0)";
          },
          delay + index * stagger * 1000,
        );
      });
    });

    return () => {
      // Revert splits on unmount
      splitInstances.forEach((split) => {
        try {
          split.revert();
        } catch (e) {
          // Split may have already been reverted
        }
      });
    };
  }, [selector, animationOptions]);

  return containerRef;
}
