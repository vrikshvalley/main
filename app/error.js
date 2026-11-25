'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error('Route error:', error?.message || error);
  }, [error]);

  return (
    <main style={{
      minHeight: '70vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem 1.5rem',
      textAlign: 'center',
      color: '#ffffff',
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>Something went wrong</h1>
      <p style={{ maxWidth: 460, opacity: 0.85, marginBottom: '1.5rem', lineHeight: 1.6 }}>
        We couldn&apos;t load this page right now. Please try again or return to the shop.
      </p>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          type="button"
          onClick={() => reset()}
          style={{
            padding: '0.75rem 1.5rem',
            borderRadius: 999,
            border: 'none',
            background: '#fbbf24',
            color: '#073b22',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Try again
        </button>
        <Link
          href="/products"
          style={{
            padding: '0.75rem 1.5rem',
            borderRadius: 999,
            border: '1px solid rgba(255,255,255,0.4)',
            color: '#ffffff',
            textDecoration: 'none',
            fontWeight: 600,
          }}
        >
          Browse plants
        </Link>
      </div>
    </main>
  );
}
