'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getActiveOffers, getOfferById, isOfferActive } from '@/lib/offers';

function timeLeft(endsAt) {
  const s = Math.max(0, Math.floor((new Date(endsAt) - Date.now()) / 1000));
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}

const pad = (n) => String(n).padStart(2, '0');

/**
 * Live countdown for a real offer from lib/offers.js.
 *
 * - offerId: show that offer; otherwise the active offer that ends soonest.
 * - variant: "banner" (full-width bar), "card" (inside a page), "ticker" (top bar).
 * Renders nothing when no offer is running, and disappears when it ends.
 */
export default function OfferCountdown({ offerId, variant = 'banner', label }) {
  const [state, setState] = useState(null);

  useEffect(() => {
    const tick = () => {
      const offer = offerId ? getOfferById(offerId) : getActiveOffers()[0];
      if (!offer || !isOfferActive(offer)) return setState(null);
      setState({ offer, left: timeLeft(offer.endsAt) });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [offerId]);

  if (!state) return null;
  const { offer, left } = state;

  if (variant === 'ticker') {
    return (
      <Link href={offer.href || '/offers'} className="offer-ticker">
        <span className="offer-ticker-badge">{offer.badge}</span>
        <span className="offer-ticker-title">{offer.title}</span>
        <span className="offer-ticker-sep" aria-hidden="true">·</span>
        <span className="offer-ticker-ends">ends in</span>
        <strong className="offer-ticker-time">
          {left.d > 0 && `${left.d}d `}
          {pad(left.h)}:{pad(left.m)}:{pad(left.s)}
        </strong>
      </Link>
    );
  }

  const units = [
    ['d', 'days'],
    ['h', 'hrs'],
    ['m', 'min'],
    ['s', 'sec'],
  ].filter(([k]) => k !== 'd' || left.d > 0);

  return (
    <div className={`offer-countdown offer-countdown--${variant}`} role="region" aria-label={`${offer.title} offer`}>
      <p className="offer-title">
        <span className="offer-badge">{offer.badge}</span>
        <span className="offer-title-text">{label || offer.title}</span>
        {variant === 'card' && <span className="offer-ends"> ends in</span>}
      </p>
      <div className="offer-clock" aria-label="Time left">
        {units.map(([k, unit]) => (
          <span key={k} className="offer-unit">
            <strong>{pad(left[k])}</strong>
            <small>{unit}</small>
          </span>
        ))}
      </div>
      {variant === 'banner' && (
        <Link href={offer.href || '/offers'} className="offer-cta breathe">
          Shop<span className="offer-cta-long"> the offer</span>
        </Link>
      )}
    </div>
  );
}
