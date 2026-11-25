"use client";

import { useEffect, useState } from "react";

/**
 * "mobile" (< 768px), "tablet" (768-1023px) or "desktop" (>= 1024px).
 *
 * Uses matchMedia change events, so components re-render only when the layout
 * actually crosses a breakpoint. A plain resize listener fires constantly on
 * phones (the address bar shows and hides while scrolling) and re-rendered
 * whole carousels mid-scroll.
 */
export function useBreakpoint() {
  const [bp, setBp] = useState("desktop");

  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 767.98px)");
    const desktop = window.matchMedia("(min-width: 1024px)");
    const update = () => setBp(mobile.matches ? "mobile" : desktop.matches ? "desktop" : "tablet");

    update();
    mobile.addEventListener("change", update);
    desktop.addEventListener("change", update);
    return () => {
      mobile.removeEventListener("change", update);
      desktop.removeEventListener("change", update);
    };
  }, []);

  return bp;
}
