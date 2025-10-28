'use client';
import { useState } from 'react';
import Breadcrumbs from '@/components/general/Breadcrumbs';
import { Search, Package } from 'lucide-react';
import '@/styles/pages.scss';

export default function TrackOrder() {
  const [orderId, setOrderId] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Track order logic here
    alert(`Tracking order: ${orderId}`);
  };

  return (
    <div className="page-container">
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
              Track Order
            </button>
          </form>

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
