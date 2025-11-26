'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { handleGoogleLogin, handleFacebookLogin, handleEmailAuth } from '@/lib/authHandlers';
import { Shield, Lock, CheckCircle, Mail, Clock, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import '@/styles/login.scss';

const slides = [
  { src: '/hero1.jpg', alt: 'Premium Plant Collection', title: 'Premium Plants', subtitle: 'Handpicked for your space' },
  { src: '/hero2.jpg', alt: 'Indoor Green Paradise', title: 'Indoor Paradise', subtitle: 'Bring nature inside' },
  { src: '/hero3.jpg', alt: 'Outdoor Garden Dreams', title: 'Garden Dreams', subtitle: 'Create your own oasis' }
];

export default function LoginPage() {
  const [emailSent, setEmailSent] = useState(false);
  const [email, setEmail] = useState('');
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-advance slideshow
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    const emailValue = e.target.email.value;
    setEmail(emailValue);
    
    // Create a new event with the email
    const result = await handleEmailAuth(e);
    
    // Show success state
    setEmailSent(true);
    setCanResend(false);
    setCountdown(60);

    // Start countdown for resend
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResend = async () => {
    if (!canResend) return;
    
    // Resend email
    const fakeEvent = {
      preventDefault: () => {},
      target: { email: { value: email } }
    };
    await handleEmailAuth(fakeEvent);
    
    // Reset countdown
    setCanResend(false);
    setCountdown(60);
    
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleBack = () => {
    setEmailSent(false);
    setEmail('');
    setCanResend(false);
    setCountdown(60);
  };

  return (
    <div className="login-page">
      {/* Left Side - Image Slideshow */}
      <div className="login-slideshow">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            className="slide-wrapper"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            <Image 
              src={slides[currentSlide].src} 
              alt={slides[currentSlide].alt}
              fill
              style={{ objectFit: 'cover' }}
              priority={currentSlide === 0}
            />
            <div className="slide-overlay">
              <motion.div 
                className="slide-content"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                <h2>{slides[currentSlide].title}</h2>
                <p>{slides[currentSlide].subtitle}</p>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Slide Indicators */}
        <div className="slide-indicators">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`indicator ${index === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="login-form-section">
        <div className="login-container">{!emailSent ? (
          <>
            {/* Logo */}
            <div className="brand-logo">
              <Image src="/big-logo.png" alt="Vriksh Valley" width={220} height={60} priority />
            </div>

            {/* Header */}
            <div className="login-header">
              <h1>Welcome Back</h1>
              <p>Sign in to continue your green journey</p>
            </div>

            {/* Social Login Buttons */}
            <button 
              type="button" 
              className="google-login-btn"
              onClick={handleGoogleLogin}
            >
              <svg className="google-icon" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <button 
              type="button" 
              className="facebook-login-btn"
              onClick={handleFacebookLogin}
            >
              <svg className="facebook-icon" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Continue with Facebook
            </button>

            {/* Divider */}
            <div className="divider">
              <span>OR</span>
            </div>

            {/* Email Magic Link Form */}
            <form className="login-form" onSubmit={handleEmailSubmit}>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter your email"
                  required
                />
              </div>
              
              <button type="submit" className="submit-btn">
                <Mail size={18} />
                Send Magic Link
              </button>
            </form>

            {/* Trust Badges */}
            <div className="trust-badges">
              <div className="badge">
                <Shield size={16} />
                <span>Secure</span>
              </div>
              <div className="badge">
                <Lock size={16} />
                <span>Encrypted</span>
              </div>
              <div className="badge">
                <CheckCircle size={16} />
                <span>Verified</span>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Email Sent Success State */}
            <div className="email-sent-container">
              <button className="back-btn" onClick={handleBack}>
                <ArrowLeft size={20} />
                Back
              </button>

              <div className="success-icon">
                <Mail size={64} />
              </div>

              <h2>Check Your Email</h2>
              <p className="email-sent-message">
                We've sent a magic link to<br />
                <strong>{email}</strong>
              </p>

              <div className="steps">
                <div className="step">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <h4>Check your inbox</h4>
                    <p>Look for an email from Vriksh Valley</p>
                  </div>
                </div>

                <div className="step">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <h4>Click the magic link</h4>
                    <p>You'll be signed in automatically</p>
                  </div>
                </div>

                <div className="step">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <h4>Start shopping</h4>
                    <p>Explore our collection of plants</p>
                  </div>
                </div>
              </div>

              <div className="resend-section">
                {!canResend ? (
                  <p className="countdown-text">
                    <Clock size={16} />
                    Resend available in {countdown}s
                  </p>
                ) : (
                  <button className="resend-btn" onClick={handleResend}>
                    Resend Magic Link
                  </button>
                )}
              </div>

              <div className="divider">
                <span>OR</span>
              </div>

              <button 
                type="button" 
                className="google-login-btn"
                onClick={handleGoogleLogin}
              >
                <svg className="google-icon" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign in with Google instead
              </button>

              <button 
                type="button" 
                className="facebook-login-btn"
                onClick={handleFacebookLogin}
              >
                <svg className="facebook-icon" viewBox="0 0 24 24" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Sign in with Facebook instead
              </button>
            </div>
          </>
        )}
        </div>
      </div>
    </div>
  );
}
