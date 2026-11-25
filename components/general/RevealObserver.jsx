'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { observeOnce } from '@/lib/inView';

const SELECTOR = '.reveal:not([data-inview]), .scroll-fade:not([data-inview])';

/**
 * Lets server components use the `.reveal` / `.scroll-fade` classes without
 * their own client wrapper: every such element on the page (including ones
 * added later) is registered with the shared one-time IntersectionObserver.
 * Without this, browsers lacking CSS scroll-driven animations (e.g. Firefox)
 * would leave those elements hidden.
 */
export default function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const scan = (root) => {
      if (root.nodeType !== 1) return;
      if (root.matches?.(SELECTOR)) observeOnce(root);
      root.querySelectorAll?.(SELECTOR).forEach((el) => observeOnce(el));
    };

    scan(document.body);

    let queued = false;
    const pending = new Set();
    const mo = new MutationObserver((records) => {
      for (const r of records) r.addedNodes.forEach((n) => pending.add(n));
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        pending.forEach(scan);
        pending.clear();
        queued = false;
      });
    });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => mo.disconnect();
  }, [pathname]);

  return null;
}
