"use client";
import React from 'react';
import Button from '@/components/general/Button';

export default function Payments({ payments = [], onSetDefault }) {
  return (
    <section className="payments card">
      <div className="section-header">
        <h3>Payments</h3>
        <Button variant="secondary" size="sm">Manage</Button>
      </div>

      <div className="payments-list">
        {payments && payments.length > 0 ? (
          payments.map(p => (
            <div className="payment-card" key={p.id}>
              <div className="payment-meta">
                <div className="payment-type">{p.type}</div>
                <div className="payment-desc muted">{p.brand ? `${p.brand} • **** ${p.last4}` : p.identifier}</div>
              </div>
              <div className="payment-actions">
                {!p.default && <Button variant="ghost" size="sm" onClick={() => onSetDefault?.(p.id)}>Set as Default</Button>}
                {p.default && <span className="badge">Default</span>}
              </div>
            </div>
          ))
        ) : (
          <p className="muted">No saved payment methods. Add a card or UPI (demo).</p>
        )}
      </div>
    </section>
  );
}
