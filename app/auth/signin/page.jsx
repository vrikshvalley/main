'use client';

import { Suspense, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Clock, Mail, MailCheck, Shield, Lock, CheckCircle } from 'lucide-react';
import { handleGoogleLogin, handleEmailAuth } from '@/lib/authHandlers';
import '@/styles/login.scss';

const SLIDES = [
  { src: '/loginSlider/(1).webp', note: 'Premium Plants', title: 'Handpicked for your space' },
  { src: '/loginSlider/(2).webp', note: 'Indoor Paradise', title: 'Bring nature inside' },
  { src: '/loginSlider/(3).webp', note: 'Garden Dreams', title: 'Create your own oasis' },
  { src: '/loginSlider/(4).webp', note: 'Green Living', title: 'Embrace sustainability' },
  { src: '/loginSlider/(5).webp', note: 'Plant Paradise', title: 'Your green journey starts here' },
];

const RESEND_SECONDS = 60;

function GoogleIcon() {
  return (
    <svg className="lg-google-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

/**
 * Sign in: a slow, crossfading garden scene (pure CSS, no JS timers) beside a
 * cream card with Google sign-in and an email magic link.
 */
function LoginContent() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || null;

  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // resend countdown
  useEffect(() => {
    if (countdown <= 0) return;
    const id = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [countdown]);

  const sendLink = async (address) => {
    setSending(true);
    try {
      const res = await handleEmailAuth({ preventDefault: () => {}, target: { email: { value: address } } }, redirectUrl);
      if (res?.success) {
        setEmailSent(true);
        setCountdown(RESEND_SECONDS);
      }
    } finally {
      setSending(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const address = e.currentTarget.email.value.trim();
    setEmail(address);
    sendLink(address);
  };

  return (
    <main className="lg">
      {/* ---- Scene ---- */}
      <section className="lg-scene" aria-hidden="true">
        {SLIDES.map((slide, i) => (
          <figure key={slide.src} className="lg-slide" style={{ '--i': i }}>
            <Image src={slide.src} alt="" fill priority={i === 0} sizes="(max-width: 900px) 100vw, 60vw" />
            <figcaption>
              <small>{slide.note}</small>
              {slide.title}
            </figcaption>
          </figure>
        ))}
        <div className="lg-scene__shade" />
        <div className="lg-scene__brand">
          <Image src="/icons/white-logo.webp" alt="" width={44} height={44} />
          <span>Vriksh Valley</span>
        </div>
      </section>

      {/* ---- Card ---- */}
      <section className="lg-panel">
        <div className="lg-panel__glow" aria-hidden="true" />
        <div className="lg-card">
          <Link href="/" className="lg-back">
            <ArrowLeft size={16} aria-hidden="true" /> Back to the shop
          </Link>

          {!emailSent ? (
            <>
              <Image src="/big-logo.webp" alt="Vriksh Valley" width={204} height={40} className="lg-logo" style={{ height: 'auto' }} priority />
              <h1>Welcome Back</h1>
              <p className="lg-lead">Sign in to continue your green journey</p>

              <button type="button" className="lg-btn lg-btn--google" onClick={() => handleGoogleLogin(redirectUrl)}>
                <GoogleIcon /> Continue with Google
              </button>

              <div className="lg-divider"><span>OR</span></div>

              <form className="lg-form" onSubmit={onSubmit}>
                <label className="lg-label" htmlFor="lg-email">Email Address</label>
                <div className="lg-field">
                  <Mail size={18} aria-hidden="true" />
                  <input id="lg-email" type="email" name="email" placeholder="Enter your email" autoComplete="email" required />
                </div>
                <button type="submit" className="lg-btn lg-btn--stone" disabled={sending}>
                  <Mail size={18} aria-hidden="true" /> {sending ? 'Sending…' : 'Send Magic Link'}
                </button>
              </form>

              <ul className="lg-badges">
                <li><Shield size={15} aria-hidden="true" /> Secure</li>
                <li><Lock size={15} aria-hidden="true" /> Encrypted</li>
                <li><CheckCircle size={15} aria-hidden="true" /> Verified</li>
              </ul>
            </>
          ) : (
            <div className="lg-sent" role="status">
              <div className="lg-sent__icon">
                <MailCheck size={40} aria-hidden="true" />
              </div>
              <h1>Check Your Email</h1>
              <p className="lg-lead">
                We&apos;ve sent a magic link to
                <br />
                <strong>{email}</strong>
              </p>

              <ol className="lg-steps">
                <li><span><strong>Check your inbox</strong> Look for an email from Vriksh Valley</span></li>
                <li><span><strong>Click the magic link</strong> You&apos;ll be signed in automatically</span></li>
                <li><span><strong>Start shopping</strong> Explore our collection of plants</span></li>
              </ol>

              {countdown > 0 ? (
                <p className="lg-fine">
                  <Clock size={15} aria-hidden="true" /> Resend available in {countdown}s
                </p>
              ) : (
                <button type="button" className="lg-btn lg-btn--pebble" onClick={() => sendLink(email)} disabled={sending}>
                  {sending ? 'Sending…' : 'Resend Magic Link'}
                </button>
              )}

              <div className="lg-sent__alt">
                <button type="button" className="lg-text-btn" onClick={() => setEmailSent(false)}>
                  Back
                </button>
                <span aria-hidden="true">·</span>
                <button type="button" className="lg-text-btn" onClick={() => handleGoogleLogin(redirectUrl)}>
                  Sign in with Google instead
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="lg" />}>
      <LoginContent />
    </Suspense>
  );
}
