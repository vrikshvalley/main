'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, ShoppingBag, ArrowRight, Sparkles, Leaf, Truck, CreditCard } from 'lucide-react';
import { ONLINE_PAYMENTS_ENABLED, PAYMENTS_COMING_SOON } from '@/lib/commerce';
import CartLine from '@/components/cart/CartLine';
import WhatsAppGlyph from '@/components/general/WhatsAppGlyph';
import { useCartLines, formatINR } from '@/lib/hooks/useCartLines';
import '@/styles/cart.scss';

/**
 * Cart drawer: slides in from the right over a dimmed page. Closes on the
 * backdrop, the close button or Escape. Ordering happens on WhatsApp.
 */
export default function CartModal({ isOpen, onClose }) {
  const cart = useCartLines();
  const { items, count, subtotal, savings, isLoading } = cart;
  const panelRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    panelRef.current?.focus();
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="vv-drawer" role="dialog" aria-modal="true" aria-label="Your cart">
      <div className="vv-drawer__backdrop" onClick={onClose} />

      <aside className="vv-drawer__panel" ref={panelRef} tabIndex={-1}>
        <header className="vv-drawer__head">
          <div>
            <p className="vv-drawer__eyebrow">Free shipping on every order</p>
            <h2>
              Your Cart ({count} {count === 1 ? 'item' : 'items'})
            </h2>
          </div>
          <button type="button" className="vv-drawer__close" onClick={onClose} aria-label="Close cart">
            <X size={20} />
          </button>
        </header>

        {isLoading ? (
          <div className="vv-drawer__loading" aria-busy="true">
            {[0, 1].map((i) => (
              <div key={i} className="vv-skeleton-line" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="vv-cart-empty">
            <div className="vv-cart-empty__art" aria-hidden="true">
              <span className="vv-cart-empty__halo" />
              <Image src="/hero/money-plant-cutout.webp" alt="" width={150} height={227} />
            </div>
            <h3>Your cart is empty</h3>
            <p>Add some plants to get started! 🌿</p>
            <div className="vv-cart-empty__actions">
              <Link href="/products" className="vv-btn vv-btn--stone" onClick={onClose}>
                <Leaf size={18} aria-hidden="true" /> Shop plants
              </Link>
              <Link href="/offers" className="vv-btn vv-btn--pebble" onClick={onClose}>
                <Sparkles size={18} aria-hidden="true" /> See offers
              </Link>
            </div>
          </div>
        ) : (
          <>
            {savings > 0 && (
              <p className="vv-drawer__savings">
                <Sparkles size={16} aria-hidden="true" /> You are saving <strong>{formatINR(savings)}</strong> with this week’s offers
              </p>
            )}

            <ul className="vv-drawer__lines">
              {items.map((item) => {
                const qty = cart.qtyOf(item);
                return (
                  <CartLine
                    key={item.key || item.id}
                    item={item}
                    qty={qty}
                    unit={cart.unitPrice(item)}
                    onIncrement={() => cart.increment(item)}
                    onDecrement={() => cart.decrement(item)}
                    onRemove={() => cart.remove(item)}
                    onNavigate={onClose}
                  />
                );
              })}
            </ul>

            <footer className="vv-drawer__foot">
              <div className="vv-drawer__rows">
                <span>Subtotal</span>
                <span>{formatINR(subtotal)}</span>
                <span><Truck size={14} aria-hidden="true" /> Shipping</span>
                <span className="vv-free">FREE</span>
              </div>
              <div className="vv-drawer__total">
                <span>Total</span>
                <strong>{formatINR(subtotal)}</strong>
              </div>
              {ONLINE_PAYMENTS_ENABLED ? (
                <>
                  <Link href="/checkout" className="vv-btn vv-btn--stone breathe" onClick={onClose}>
                    <CreditCard size={18} aria-hidden="true" /> Checkout
                  </Link>
                  <a className="vv-btn vv-btn--whatsapp" href={cart.whatsappUrl} target="_blank" rel="noopener noreferrer">
                    <WhatsAppGlyph /> Order on WhatsApp
                  </a>
                </>
              ) : (
                <>
                  <a className="vv-btn vv-btn--whatsapp breathe" href={cart.whatsappUrl} target="_blank" rel="noopener noreferrer">
                    <WhatsAppGlyph /> Order on WhatsApp
                  </a>
                  <p className="vv-drawer__note">
                    <CreditCard size={14} aria-hidden="true" /> {PAYMENTS_COMING_SOON}
                  </p>
                </>
              )}
              <Link href="/cart" className="vv-btn vv-btn--ghost" onClick={onClose}>
                <ShoppingBag size={18} aria-hidden="true" /> View Full Cart <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
