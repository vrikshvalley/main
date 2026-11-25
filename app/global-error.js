'use client';

import Link from 'next/link';

export default function GlobalError({ reset }) {
  return (
    <html lang="en">
      <body style={{
        margin: 0,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        textAlign: 'center',
        background: '#073b22',
        color: '#ffffff',
        fontFamily: 'Helvetica, Arial, sans-serif',
      }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>Vriksh Valley</h1>
        <p style={{ maxWidth: 440, opacity: 0.85, marginBottom: '1.5rem', lineHeight: 1.6 }}>
          We hit an unexpected error loading the store. Please try refreshing the page.
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
            Reload
          </button>
          <Link
            href="/"
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: 999,
              border: '1px solid rgba(255,255,255,0.4)',
              color: '#ffffff',
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            Home
          </Link>
        </div>
      </body>
    </html>
  );
}
