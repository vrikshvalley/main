'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Breadcrumbs from '@/components/general/Breadcrumbs';
import { setStickyHeaderData } from '@/lib/stickyHeaderStore';
import { Search, Package } from 'lucide-react';
import { showErrorToast } from '@/lib/toastHelpers';
import '@/styles/pages.scss';

export default function TrackOrder() {
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    setStickyHeaderData({ title: "Track Your Order", subtitle: "Enter your order ID to track your shipment" });
    return () => setStickyHeaderData({ title: null, subtitle: null });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!orderId.trim() || !email.trim()) {
      showErrorToast('Please enter your order ID and email');
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/orders/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: orderId.trim(), email: email.trim() }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error?.message || 'Could not look up that order');
      setResult(json.order);
    } catch (err) {
      showErrorToast(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      
      {/* Hero Banner */}
      <div className="hero-banner">
        <picture>
          <source media="(max-width: 768px)" srcSet="/pages/TrackOrderMobile.webp" />
          <Image
            src="/pages/TrackOrderDesktop.webp"
            alt="Track Your Order - Vriksh Valley"
            fill
            priority
            className="hero-image"
            style={{ objectFit: 'cover' }}
          />
        </picture>
        <div className="hero-overlay">
          <h1>Track Your Order</h1>
          <p>Enter your order ID to track your shipment</p>
        </div>
      </div>

      <Breadcrumbs items={[{ label: 'Track Order' }]} />
      
      <div className="page-content">
        <div className="page-header">
          <h1>Track Your Order</h1>
          <p>Enter your order ID to track your shipment</p>
        </div>

        <div className="content-section" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ 
              width: '80px', 
              height: '80px', 
              margin: '0 auto 1.5rem',
              background: 'linear-gradient(135deg, #4ade80, #22c55e)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}>
              <Package size={40} />
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ 
                display: 'block', 
                fontWeight: 600, 
                marginBottom: '0.5rem',
                color: '#073b22'
              }}>
                Order ID or Tracking Number
              </label>
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="e.g., VV123456789"
                required
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem',
                  border: '2px solid rgba(7, 59, 34, 0.2)',
                  borderRadius: '12px',
                  background: 'rgba(7, 59, 34, 0.05)',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#073b22' }}>
                Email used at checkout
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                style={{ width: '100%', padding: '0.875rem 1rem', border: '2px solid rgba(7, 59, 34, 0.2)', borderRadius: '12px', background: 'rgba(7, 59, 34, 0.05)', fontSize: '1rem' }}
              />
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '1rem',
                background: 'linear-gradient(135deg, #4ade80, #22c55e)',
                color: '#073b22',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1.05rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <Search size={20} />
              {loading ? 'Checking…' : 'Track Order'}
            </button>
          </form>

          {result && (
            <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(7, 59, 34, 0.15)', marginBottom: '2rem' }}>
              <h3 style={{ color: '#073b22', marginBottom: '0.5rem' }}>Order {result.order_id}</h3>
              <p style={{ marginBottom: '0.5rem' }}>
                Status: <strong style={{ textTransform: 'capitalize' }}>{String(result.status).replace(/_/g, ' ')}</strong>
                {result.shipment_status ? <> · Shipment: <strong style={{ textTransform: 'capitalize' }}>{String(result.shipment_status).replace(/_/g, ' ')}</strong></> : null}
              </p>
              {result.appointment && <p>Consultation: {result.appointment.date} at {result.appointment.time} (IST)</p>}
              <ul style={{ marginLeft: '1.25rem', lineHeight: 1.7 }}>
                {result.items.map((i, n) => (
                  <li key={n}>{i.name}{i.options ? ` (${i.options})` : ''} × {i.quantity}</li>
                ))}
              </ul>
              {result.tracking_url && (
                <p style={{ marginTop: '0.75rem' }}>
                  <a href={result.tracking_url} target="_blank" rel="noopener noreferrer" style={{ color: '#073b22', fontWeight: 700 }}>Track the parcel with Delhivery</a>
                </p>
              )}
            </div>
          )}

          <div style={{ 
            background: 'rgba(74, 222, 128, 0.1)',
            padding: '1.5rem',
            borderRadius: '12px',
            border: '1px solid rgba(74, 222, 128, 0.3)'
          }}>
            <h3 style={{ marginBottom: '1rem', color: '#073b22' }}>Where to find your Order ID?</h3>
            <ul style={{ marginLeft: '1.5rem', lineHeight: '1.8' }}>
              <li>Check your order confirmation email</li>
              <li>Look for the SMS sent after placing the order</li>
              <li>Find it in your account under "My Orders"</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
