"use client";

import { useEffect, useRef } from "react";
import { observeOnce } from "@/lib/inView";

/**
 * Section wrapper that fades up once when it scrolls into view.
 * CSS-driven (see .reveal in globals.scss); it never re-renders on scroll.
 * `amount` is kept for backwards compatibility and ignored.
 */
export default function Reveal({ amount, className = "", children, ...rest }) {
  const ref = useRef(null);
  useEffect(() => observeOnce(ref.current), []);

  return (
    <section ref={ref} className={`reveal ${className}`} {...rest}>
      {children}
    </section>
  );
}
