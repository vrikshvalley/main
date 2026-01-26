"use client";
import React from 'react';
import Button from '@/components/general/Button';
import { showSuccessToast } from '@/lib/toastHelpers';

export default function Wishlist({ items = [], onRemove, onAddToCart }) {
  return (
    <section className="wishlist card">
      <div className="section-header">
        <h3>Saved Items</h3>
      </div>

      <div className="wishlist-list">
        {items && items.length > 0 ? (
          items.map(it => (
            <div className="wishlist-item" key={it.id}>
              <img src={it.image || '/hero1.jpg'} alt={it.name} width={72} height={72} />
              <div className="wish-meta">
                <div className="wish-name">{it.name}</div>
                <div className="wish-actions">
                <Button variant="primary" size="sm" onClick={() => { onAddToCart?.(it); showSuccessToast('Added to cart') }}>Add to cart</Button>
                <Button variant="danger" size="sm" onClick={() => onRemove?.(it.id)}>Remove</Button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="muted">Nothing saved yet.</p>
        )}
      </div>
    </section>
  );
}
