/**
 * One shared IntersectionObserver for every "reveal once" element on a page.
 * Elements get `data-inview="true"` the first time they enter the viewport and
 * are then unobserved, so nothing re-animates or re-renders on later scrolls.
 * CSS does the actual animation.
 */

let observer = null;

function getObserver() {
  if (observer || typeof window === "undefined") return observer;
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.setAttribute("data-inview", "true");
          observer.unobserve(entry.target);
        }
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
  );
  return observer;
}

export function observeOnce(el) {
  if (!el) return () => {};
  // No IntersectionObserver (very old browsers): just show the content.
  if (typeof IntersectionObserver === "undefined") {
    el.setAttribute("data-inview", "true");
    return () => {};
  }
  const obs = getObserver();
  obs.observe(el);
  return () => obs.unobserve(el);
}
