"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Leaf, Sparkles, ShoppingBag, CreditCard } from "lucide-react";
import { ONLINE_PAYMENTS_ENABLED, PAYMENTS_COMING_SOON } from "@/lib/commerce";
import Navbar from "@/components/general/Navbar";
import Topbar from "@/components/general/Topbar";
import Footer from "@/components/general/Footer";
import CartLine from "@/components/cart/CartLine";
import WhatsAppGlyph from "@/components/general/WhatsAppGlyph";
import OfferCountdown from "@/components/general/OfferCountdown";
import { useCartLines, formatINR } from "@/lib/hooks/useCartLines";
import "@/styles/cart.scss";

/**
 * Cart page: a roomy list of lines on the left and a sticky summary card on
 * the right (a bottom bar on phones). Orders go through WhatsApp only.
 */
export default function CartPage() {
  const cart = useCartLines();
  const { items, count, subtotal, savings, isLoading } = cart;
  const hasItems = items.length > 0;

  // Phones show a sticky order bar; move the floating buttons out of its way
  // (like the product page does).
  useEffect(() => {
    if (!hasItems) return;
    document.body.classList.add("cart-bar-open");
    return () => document.body.classList.remove("cart-bar-open");
  }, [hasItems]);

  return (
    <>
      <Topbar />
      <Navbar />
      <main className="vv-cartpage">
        <div className="vv-cartpage__glow" aria-hidden="true" />
        <div className="vv-cartpage__inner">
          <header className="vv-cartpage__head">
            <Link href="/products" className="vv-cartpage__back">
              <ArrowLeft size={18} aria-hidden="true" /> Continue Shopping
            </Link>
            <h1>
              <ShoppingBag size={36} aria-hidden="true" /> Your Cart
            </h1>
            {!isLoading && (
              <p className="vv-cartpage__count">
                {count} {count === 1 ? "item" : "items"}
              </p>
            )}
          </header>

          {isLoading ? (
            <div className="vv-cartpage__grid" aria-busy="true">
              <div className="vv-cartpage__list">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="vv-skeleton-line vv-skeleton-line--tall" />
                ))}
              </div>
            </div>
          ) : items.length === 0 ? (
            <div className="vv-cart-empty vv-cart-empty--page">
              <div className="vv-cart-empty__art" aria-hidden="true">
                <span className="vv-cart-empty__halo" />
                <Image src="/hero/money-plant-cutout.webp" alt="" width={180} height={272} priority />
              </div>
              <h2>Your cart is empty</h2>
              <p>Looks like you haven&apos;t added anything to your cart yet.</p>
              <div className="vv-cart-empty__actions">
                <Link href="/products" className="vv-btn vv-btn--stone">
                  <Leaf size={18} aria-hidden="true" /> Start Shopping
                </Link>
                <Link href="/offers" className="vv-btn vv-btn--pebble">
                  <Sparkles size={18} aria-hidden="true" /> See offers
                </Link>
              </div>
            </div>
          ) : (
            <div className="vv-cartpage__grid">
              <section className="vv-cartpage__list" aria-label="Items in your cart">
                {savings > 0 && (
                  <p className="vv-drawer__savings">
                    <Sparkles size={16} aria-hidden="true" /> You are saving <strong>{formatINR(savings)}</strong> with this week’s offers
                  </p>
                )}
                <ul>
                  {items.map((item) => (
                    <CartLine
                      key={item.key || item.id}
                      size="roomy"
                      item={item}
                      qty={cart.qtyOf(item)}
                      unit={cart.unitPrice(item)}
                      onIncrement={() => cart.increment(item)}
                      onDecrement={() => cart.decrement(item)}
                      onRemove={() => cart.remove(item)}
                    />
                  ))}
                </ul>
                <OfferCountdown variant="card" />
              </section>

              <aside className="vv-summary" aria-label="Order summary">
                <h2>Order Summary</h2>
                <dl>
                  <div>
                    <dt>Subtotal ({count} items)</dt>
                    <dd>{formatINR(subtotal)}</dd>
                  </div>
                  {savings > 0 && (
                    <div className="is-saving">
                      <dt>You save</dt>
                      <dd>{formatINR(savings)}</dd>
                    </div>
                  )}
                  <div>
                    <dt>Shipping</dt>
                    <dd><span className="vv-free">FREE</span></dd>
                  </div>
                  <div>
                    <dt>Tax</dt>
                    <dd className="is-muted">Confirmed on WhatsApp</dd>
                  </div>
                  <div className="vv-summary__total">
                    <dt>Total</dt>
                    <dd>{formatINR(subtotal)}</dd>
                  </div>
                </dl>
                <p className="vv-drawer__note">Includes free shipping</p>

                {ONLINE_PAYMENTS_ENABLED ? (
                  <>
                    <Link href="/checkout" className="vv-btn vv-btn--stone breathe">
                      <CreditCard size={18} aria-hidden="true" /> Proceed to Checkout
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

                <ul className="vv-summary__benefits">
                  <li><span aria-hidden="true">🚚</span> Free Delivery</li>
                  <li><span aria-hidden="true">🔒</span> Easy WhatsApp Ordering</li>
                  <li><span aria-hidden="true">🌱</span> Quality Assured</li>
                </ul>
              </aside>

              {/* phones: the total and the order button stay in reach */}
              <div className="vv-cartpage__bar">
                <div>
                  <small>Total · Free shipping</small>
                  <strong>{formatINR(subtotal)}</strong>
                </div>
                {ONLINE_PAYMENTS_ENABLED ? (
                  <Link href="/checkout" className="vv-btn vv-btn--stone">
                    <CreditCard size={18} aria-hidden="true" /> Checkout
                  </Link>
                ) : (
                  <a className="vv-btn vv-btn--whatsapp" href={cart.whatsappUrl} target="_blank" rel="noopener noreferrer">
                    <WhatsAppGlyph size={18} /> Order
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
