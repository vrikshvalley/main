'use client';

import { authFetch } from '@/lib/authFetch';

/**
 * Browser side of Razorpay Standard Checkout.
 *
 *   const start = await startPayment({ ...body })        // POST /api/payment/create-order
 *   const rzp   = await openRazorpay(start, { prefill })  // modal; resolves with handler response
 *   const done  = await verifyPayment(start.orderId, rzp) // POST /api/payment/verify
 *
 * The browser never decides amounts; it only relays Razorpay's response so the
 * server can check the signature and the real payment.
 */

const SCRIPT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';
let scriptPromise = null;

export function loadRazorpay() {
  if (typeof window === 'undefined') return Promise.reject(new Error('No window'));
  if (window.Razorpay) return Promise.resolve(window.Razorpay);
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = SCRIPT_SRC;
      s.async = true;
      s.onload = () => (window.Razorpay ? resolve(window.Razorpay) : reject(new Error('Razorpay failed to load')));
      s.onerror = () => {
        scriptPromise = null;
        reject(new Error('Could not load the payment window. Check your connection and try again.'));
      };
      document.body.appendChild(s);
    });
  }
  return scriptPromise;
}

async function postJson(url, body) {
  // authFetch attaches the Firebase ID token when signed in (guests send none).
  const res = await authFetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success === false) {
    const err = new Error(data?.error?.message || 'Something went wrong. Please try again.');
    err.code = data?.error?.code;
    err.fields = data?.error?.fields;
    throw err;
  }
  return data;
}

export const startPayment = (body) => postJson('/api/payment/create-order', body);

export function openRazorpay(start, { prefill = {}, description = 'Order payment', themeColor = '#073b22' } = {}) {
  return loadRazorpay().then(
    (Razorpay) =>
      new Promise((resolve, reject) => {
        const rzp = new Razorpay({
          key: start.razorpay.keyId,
          order_id: start.razorpay.orderId,
          amount: start.razorpay.amount,
          currency: start.razorpay.currency,
          name: 'Vriksh Valley',
          description,
          image: '/logo.webp',
          prefill,
          notes: { order_id: start.orderId },
          theme: { color: themeColor },
          retry: { enabled: true },
          handler: (response) => resolve(response),
          modal: {
            confirm_close: true,
            ondismiss: () => {
              const err = new Error('Payment was cancelled. You can try again.');
              err.code = 'DISMISSED';
              reject(err);
            },
          },
        });
        rzp.on('payment.failed', (resp) => {
          // Razorpay keeps the modal open for retries; we only surface the reason.
          console.warn('Payment attempt failed:', resp?.error?.description);
        });
        rzp.open();
      })
  );
}

export const verifyPayment = (orderId, response) =>
  postJson('/api/payment/verify', {
    orderId,
    razorpay_order_id: response.razorpay_order_id,
    razorpay_payment_id: response.razorpay_payment_id,
    razorpay_signature: response.razorpay_signature,
  });
