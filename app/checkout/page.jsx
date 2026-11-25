'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useDispatch } from 'react-redux';
import { ArrowLeft, Check, CreditCard, Loader2, Lock, MapPin, PackageCheck, ShieldCheck, Truck, UserCheck } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useCartLines, formatINR } from '@/lib/hooks/useCartLines';
import { clearCart } from '@/lib/slices/cartSlice';
import * as userService from '@/lib/services/userService';
import { validateAddress, validateEmail } from '@/lib/payments/address';
import { startPayment, openRazorpay, verifyPayment, loadRazorpay } from '@/lib/payments/razorpayCheckout';
import { ONLINE_PAYMENTS_ENABLED, PAYMENTS_COMING_SOON } from '@/lib/commerce';
import { INDIAN_STATES } from '@/lib/indianStates';
import { showErrorToast } from '@/lib/toastHelpers';
import WhatsAppGlyph from '@/components/general/WhatsAppGlyph';
import '@/styles/cart.scss';
import '@/styles/checkout.scss';

const EMPTY_ADDRESS = { name: '', phone: '', pincode: '', line1: '', line2: '', landmark: '', city: '', state: '' };

const cartKey = (items, address, email, save) =>
  JSON.stringify([items.map((i) => [i.key || i.id, i.qty ?? i.quantity]), address, email, save]);

/**
 * Checkout: delivery details → Razorpay → confirmation.
 * Prices, stock and the payable amount are decided by the server; shipping is free.
 * While direct payment is "coming soon" this page offers WhatsApp ordering instead.
 */
export default function CheckoutPage() {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const cart = useCartLines();
  const { items, count, subtotal, savings, isLoading } = cart;

  const [email, setEmail] = useState('');
  const [address, setAddress] = useState(EMPTY_ADDRESS);
  const [saved, setSaved] = useState([]);
  const [selectedSaved, setSelectedSaved] = useState(null);
  const [saveForLater, setSaveForLater] = useState(true);
  const [errors, setErrors] = useState({});
  const [pin, setPin] = useState({ state: 'idle' }); // idle | checking | ok | bad
  const [paying, setPaying] = useState(false);
  const [done, setDone] = useState(null);
  const pendingRef = useRef(null); // reuse the same order if the customer retries unchanged

  // Prefill from the signed-in profile
  useEffect(() => {
    if (!user) return;
    setEmail((e) => e || user.email || '');
    userService.getProfile(user.uid).then(({ data }) => {
      if (!data) return;
      const list = (Array.isArray(data.address) ? data.address : []).map((a, idx) => ({
        ...a,
        id: a.id || `saved-${idx}`,
        line1: a.line1 || a.address_line1 || '',
        line2: a.line2 || a.address_line2 || '',
      }));
      setSaved(list);
      if (list[0]) {
        setSelectedSaved(list[0].id);
        setAddress({ ...EMPTY_ADDRESS, name: data.name || user.displayName || '', phone: data.phone || '', ...list[0] });
      } else {
        setAddress((a) => ({ ...a, name: a.name || data.name || user.displayName || '', phone: a.phone || data.phone || '' }));
      }
    });
  }, [user]);

  // Warm up the Razorpay script so the modal opens instantly
  useEffect(() => {
    if (ONLINE_PAYMENTS_ENABLED && items.length) loadRazorpay().catch(() => {});
  }, [items.length]);

  // Live pincode check (serviceability + city/state autofill)
  useEffect(() => {
    const code = address.pincode;
    if (!/^[1-9]\d{5}$/.test(code)) {
      setPin({ state: 'idle' });
      return;
    }
    let cancelled = false;
    setPin({ state: 'checking' });
    fetch('/api/shipping/check-pincode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pincode: code }),
    })
      .then((r) => r.json())
      .then((res) => {
        if (cancelled) return;
        if (res.success && res.data && res.data.serviceable === false) {
          setPin({ state: 'bad' });
        } else if (res.success && res.data) {
          setPin({ state: 'ok', oda: res.data.oda });
          const rawState = String(res.data.state || res.data.state_code || '').trim().toLowerCase();
          const matchedState = INDIAN_STATES.find((s) => s.toLowerCase() === rawState) || '';
          setAddress((a) => ({
            ...a,
            city: res.data.district || res.data.city || a.city || '',
            state: matchedState || a.state || '',
          }));
        } else {
          // Lookup failed: don't block the customer; the server re-checks at payment.
          setPin({ state: 'idle' });
        }
      })
      .catch(() => !cancelled && setPin({ state: 'idle' }));
    return () => {
      cancelled = true;
    };
  }, [address.pincode]);

  const set = (field) => (e) => {
    const value = e.target.value;
    setAddress((a) => ({ ...a, [field]: value }));
    setSelectedSaved(null);
    setErrors((er) => ({ ...er, [field]: undefined }));
  };

  const chooseSaved = (a) => {
    setSelectedSaved(a.id);
    setAddress((cur) => ({ ...EMPTY_ADDRESS, name: cur.name, phone: cur.phone, ...a }));
    setErrors({});
  };

  const payable = useMemo(() => subtotal, [subtotal]);

  const pay = async (e) => {
    e.preventDefault();
    const validEmail = validateEmail(email);
    const { value, errors: addrErrors } = validateAddress(address);
    const nextErrors = { ...(addrErrors || {}), ...(validEmail ? {} : { email: 'Enter a valid email for your receipt' }) };
    if (pin.state === 'bad') nextErrors.pincode = "We can't deliver to this pincode yet";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      showErrorToast('Please check the highlighted fields');
      return;
    }

    setPaying(true);
    try {
      const body = {
        email: validEmail,
        address: value,
        saveAddress: saveForLater,
        items: items.map((i) => ({ id: i.id, quantity: i.qty ?? i.quantity, variant: i.variant || null, size: i.size || null, color: i.color || null })),
      };
      const key = cartKey(items, value, validEmail, saveForLater);
      const cached = pendingRef.current;
      const isFresh = cached && cached.key === key && Date.now() - cached.at < 13 * 60 * 1000;
      let start = isFresh ? cached.start : null;
      if (!start) {
        start = await startPayment(body);
        pendingRef.current = { key, start, at: Date.now() };
      }

      const response = await openRazorpay(start, {
        description: `Order ${start.orderId}`,
        prefill: { name: value.name, email: validEmail, contact: value.phone },
      });
      const result = await verifyPayment(start.orderId, response);

      pendingRef.current = null;
      dispatch(clearCart()); // CartSync saves the empty cart (localStorage or the account)
      setDone(result.order);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      if (err.fields) setErrors(err.fields);
      if (['BAD_SIGNATURE', 'GATEWAY', 'NOT_CAPTURED', 'CAPTURE_FAILED'].includes(err.code)) {
        // Money may have moved: the Razorpay webhook will still confirm a real payment.
        showErrorToast("We couldn't confirm your payment yet. If money was deducted, your order will confirm automatically within a few minutes, or we'll refund it.");
      } else {
        showErrorToast(err.message);
      }
      // Keep the same order for dismissal or transient gateway verification failures.
      if (!['DISMISSED', 'GATEWAY', 'CAPTURE_FAILED'].includes(err.code)) pendingRef.current = null;
    } finally {
      setPaying(false);
    }
  };

  // ---- Confirmation ----
  if (done) {
    return (
      <main className="vv-cartpage ck">
        <div className="vv-cartpage__glow" aria-hidden="true" />
        <section className="ck-done">
          <div className="ck-done__icon"><Check size={40} aria-hidden="true" /></div>
          <p className="vv-drawer__eyebrow">Payment received</p>
          <h1>Thank you! Your order is confirmed.</h1>
          <p>
            Order <strong>{done.orderId}</strong> · {formatINR(done.total)} paid. A confirmation is on its way to{' '}
            <strong>{done.email}</strong>.
          </p>
          <ul className="ck-done__next">
            <li><PackageCheck size={18} aria-hidden="true" /> We hand-check and pack your plants</li>
            <li><Truck size={18} aria-hidden="true" /> Shipped with Delhivery; tracking appears in your order</li>
            {!user && done.accountLinked && (
              <li>
                <UserCheck size={18} aria-hidden="true" />
                <span>
                  {done.accountCreated ? 'We set up your account' : 'This order is on your account'} with{' '}
                  <strong>{done.email}</strong>. Sign in any time with Google or an email link to see your orders.
                </span>
              </li>
            )}
          </ul>
          <div className="vv-cart-empty__actions">
            {user ? (
              <Link href={`/orders/${done.orderId}`} className="vv-btn vv-btn--stone">View your order</Link>
            ) : (
              <Link href="/auth/signin?redirect=/orders" className="vv-btn vv-btn--stone">Sign in to track your order</Link>
            )}
            <Link href="/products" className="vv-btn vv-btn--pebble">Continue Shopping</Link>
          </div>
        </section>
      </main>
    );
  }

  // ---- Coming soon / empty states ----
  if (!ONLINE_PAYMENTS_ENABLED || (!isLoading && items.length === 0)) {
    return (
      <main className="vv-cartpage ck">
        <div className="vv-cartpage__glow" aria-hidden="true" />
        <section className="ck-done">
          <div className="ck-done__icon ck-done__icon--soft"><CreditCard size={36} aria-hidden="true" /></div>
          {items.length === 0 && !isLoading ? (
            <>
              <h1>Your cart is empty</h1>
              <p>Looks like you haven&apos;t added anything to your cart yet.</p>
              <div className="vv-cart-empty__actions">
                <Link href="/products" className="vv-btn vv-btn--stone">Start Shopping</Link>
              </div>
            </>
          ) : (
            <>
              <p className="vv-drawer__eyebrow">Coming soon</p>
              <h1>Direct online payment is almost here</h1>
              <p>{PAYMENTS_COMING_SOON}</p>
              <div className="vv-cart-empty__actions">
                <a className="vv-btn vv-btn--whatsapp" href={cart.whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <WhatsAppGlyph /> Order on WhatsApp
                </a>
                <Link href="/cart" className="vv-btn vv-btn--pebble">Back to cart</Link>
              </div>
            </>
          )}
        </section>
      </main>
    );
  }

  const field = (name, label, props = {}) => (
    <label className={`ck-field${errors[name] ? ' has-error' : ''}`}>
      <span>{label}</span>
      <input value={address[name]} onChange={set(name)} aria-invalid={Boolean(errors[name])} {...props} />
      {errors[name] && <small role="alert">{errors[name]}</small>}
    </label>
  );

  return (
    <main className="vv-cartpage ck">
      <div className="vv-cartpage__glow" aria-hidden="true" />
      <div className="vv-cartpage__inner">
        <header className="vv-cartpage__head">
          <Link href="/cart" className="vv-cartpage__back">
            <ArrowLeft size={18} aria-hidden="true" /> Back to cart
          </Link>
          <h1><Lock size={32} aria-hidden="true" /> Checkout</h1>
          <ol className="ck-steps" aria-label="Checkout steps">
            <li className="is-current">Delivery</li>
            <li>Payment</li>
            <li>Done</li>
          </ol>
        </header>

        <form className="vv-cartpage__grid" onSubmit={pay} noValidate>
          <section className="ck-card" aria-labelledby="ck-delivery">
            <h2 id="ck-delivery"><MapPin size={20} aria-hidden="true" /> Delivery details</h2>

            {saved.length > 0 && (
              <div className="ck-saved" role="radiogroup" aria-label="Saved addresses">
                {saved.map((a) => (
                  <button
                    type="button"
                    key={a.id}
                    role="radio"
                    aria-checked={selectedSaved === a.id}
                    className={selectedSaved === a.id ? 'is-active' : ''}
                    onClick={() => chooseSaved(a)}
                  >
                    <strong>{a.name || 'Saved address'}</strong>
                    <span>{[a.line1, a.city, a.pincode].filter(Boolean).join(', ')}</span>
                  </button>
                ))}
              </div>
            )}

            <label className={`ck-field${errors.email ? ' has-error' : ''}`}>
              <span>Email (for your receipt)</span>
              <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setErrors((er) => ({ ...er, email: undefined })); }} autoComplete="email" required aria-invalid={Boolean(errors.email)} />
              {errors.email && <small role="alert">{errors.email}</small>}
            </label>

            <div className="ck-row">
              {field('name', 'Full name', { autoComplete: 'name', required: true })}
              {field('phone', 'Mobile number', { autoComplete: 'tel', inputMode: 'tel', required: true, placeholder: '10-digit mobile' })}
            </div>

            <div className="ck-row ck-row--pin">
              <label className={`ck-field${errors.pincode || pin.state === 'bad' ? ' has-error' : ''}`}>
                <span>Pincode</span>
                <input value={address.pincode} onChange={set('pincode')} inputMode="numeric" maxLength={6} autoComplete="postal-code" required aria-invalid={Boolean(errors.pincode)} />
                {pin.state === 'checking' && <small className="ck-pin"><Loader2 size={13} className="ck-spin" aria-hidden="true" /> Checking delivery…</small>}
                {pin.state === 'ok' && <small className="ck-pin is-ok"><Check size={13} aria-hidden="true" /> We deliver here{pin.oda ? ' (remote area: may take a little longer)' : ''}</small>}
                {(pin.state === 'bad' || errors.pincode) && <small role="alert">{errors.pincode || "We can't deliver to this pincode yet"}</small>}
              </label>
              {field('city', 'City', { autoComplete: 'address-level2', required: true })}
            </div>

            {field('line1', 'House / flat, street', { autoComplete: 'address-line1', required: true })}
            <div className="ck-row">
              {field('line2', 'Area / locality (optional)', { autoComplete: 'address-line2' })}
              {field('landmark', 'Landmark (optional)')}
            </div>

            <label className={`ck-field${errors.state ? ' has-error' : ''}`}>
              <span>State</span>
              <select value={address.state} onChange={set('state')} autoComplete="address-level1" required aria-invalid={Boolean(errors.state)}>
                <option value="">Select state</option>
                {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              {errors.state && <small role="alert">{errors.state}</small>}
            </label>

            {!selectedSaved && (
              <label className="ck-check">
                <input type="checkbox" checked={saveForLater} onChange={(e) => setSaveForLater(e.target.checked)} />
                Save this address for next time
              </label>
            )}
            {!user && (
              <p className="ck-hint">
                <ShieldCheck size={14} aria-hidden="true" /> No account or password needed. We use your email and mobile number only for this
                order&apos;s updates, and set up an account for you so you can sign in later with Google or an email link.{' '}
                Already have an account? <Link href="/auth/signin?redirect=/checkout">Sign in</Link> (optional).
              </p>
            )}
          </section>

          <aside className="vv-summary" aria-label="Order summary">
            <h2>Order Summary</h2>
            <ul className="ck-lines">
              {items.map((i) => (
                <li key={i.key || i.id}>
                  <span>{i.name} <small>× {cart.qtyOf(i)}</small></span>
                  <span>{formatINR(cart.unitPrice(i) * cart.qtyOf(i))}</span>
                </li>
              ))}
            </ul>
            <dl>
              <div><dt>Subtotal ({count} items)</dt><dd>{formatINR(subtotal)}</dd></div>
              {savings > 0 && <div className="is-saving"><dt>You save</dt><dd>{formatINR(savings)}</dd></div>}
              <div><dt>Shipping</dt><dd><span className="vv-free">FREE</span></dd></div>
              <div className="vv-summary__total"><dt>Total</dt><dd>{formatINR(payable)}</dd></div>
            </dl>
            <p className="vv-drawer__note">Prices include GST. Final amount is confirmed securely before payment.</p>

            <button type="submit" className="vv-btn vv-btn--stone breathe" disabled={paying || isLoading}>
              {paying ? <><Loader2 size={18} className="ck-spin" aria-hidden="true" /> Processing…</> : <><Lock size={18} aria-hidden="true" /> Pay {formatINR(payable)} securely</>}
            </button>
            <p className="ck-secure"><ShieldCheck size={15} aria-hidden="true" /> UPI, cards, net banking &amp; wallets via Razorpay</p>
          </aside>
        </form>
      </div>
    </main>
  );
}
