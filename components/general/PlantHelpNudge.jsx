'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';

const STORAGE_KEY = 'vv-plant-help-dismissed';
const COOLDOWN_DAYS = 7;
const DELAY_MS = 25000;
const QUIET_PATHS = ['/admin', '/cart', '/checkout', '/auth', '/profile', '/orders', '/sample-order'];

/**
 * The one pop-up on the site: a small, non-blocking corner card offering free
 * plant advice on WhatsApp. Appears after 25 s of browsing (or when a desktop
 * visitor moves to leave), at most once a week, never on cart/checkout/account
 * pages, and never over the intro splash or the open mobile menu.
 */
export default function PlantHelpNudge() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (QUIET_PATHS.some((p) => pathname?.startsWith(p))) return;

    try {
      const last = Number(localStorage.getItem(STORAGE_KEY) || 0);
      if (Date.now() - last < COOLDOWN_DAYS * 86400000) return;
    } catch (e) {
      return; // storage blocked: stay quiet rather than nag every visit
    }

    const canShow = () =>
      !document.documentElement.hasAttribute('data-initial-loader') &&
      !document.body.classList.contains('mobile-menu-open') &&
      !document.querySelector('.cart-modal, .ReactModal__Content');

    const show = () => {
      if (canShow()) setVisible(true);
    };

    const timer = setTimeout(show, DELAY_MS);
    const onLeave = (e) => {
      if (e.clientY <= 0) show();
    };
    if (window.matchMedia('(pointer: fine)').matches) {
      document.addEventListener('mouseout', onLeave);
    }

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mouseout', onLeave);
    };
  }, [pathname]);

  const dismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch (e) {}
  };

  if (!visible) return null;

  const text = encodeURIComponent(
    "Hi Vriksh Valley! I'd like help choosing a plant. My space gets: (bright / medium / low) light."
  );

  return (
    <aside className="plant-nudge" role="dialog" aria-labelledby="plant-nudge-title" aria-modal="false">
      <button type="button" className="plant-nudge-close" onClick={dismiss} aria-label="Close">
        <X size={18} />
      </button>
      <p className="plant-nudge-eyebrow">Free plant advice</p>
      <h2 id="plant-nudge-title">Not sure which plant suits your space?</h2>
      <p>Tell us about your light and we&apos;ll suggest three plants that will actually thrive there.</p>
      <a
        className="plant-nudge-cta breathe"
        href={`https://wa.me/919204745612?text=${text}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={dismiss}
      >
        Ask on WhatsApp
      </a>
    </aside>
  );
}
