import crypto from "crypto";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "./firebaseAdmin";
import * as razorpayService from "@/lib/services/razorpayService";
import * as delhiveryService from "@/lib/services/delhiveryService";
import * as emailService from "@/lib/services/emailService";
import { priceCart, priceService, PricingError } from "@/lib/payments/pricing";
import { attachCustomerForOrder } from "./customers";
import { verifyEmailToken } from "./emailOtp";
import { SLOT_TIMES, slotId } from "@/lib/payments/slots";
import { RESERVATION_MS, checkAvailability } from "@/lib/payments/stock";
import { buildOwnerAlert } from "@/lib/payments/alerts";
import { returnWindowStatus, RETURN_WINDOW_DAYS } from "@/lib/payments/returns";
import { isValidPaymentSignature } from "@/lib/payments/signature";
import { SERVICE_PRICES } from "@/lib/servicePrices";
import { normalizeProductRecord, stockOf } from "@/lib/productPricing";
import { FREE_SHIPPING } from "@/lib/commerce";

/**
 * Order lifecycle (server only; all writes use Firebase Admin).
 *
 *   startCheckout ──► order "pending_payment" + Razorpay order
 *        │
 *   browser pays in Razorpay Checkout
 *        │
 *   confirmPayment (from /api/payment/verify OR the Razorpay webhook,
 *        │          whichever arrives first; the second is a no-op)
 *        │   - HMAC signature check (browser path)
 *        │   - payment fetched from Razorpay: order id, amount, currency, status
 *        │   - transaction: mark paid + decrement stock, exactly once
 *        ▼
 *   fulfilOrder ──► Delhivery shipment + confirmation email (idempotent; retried by admin if needed)
 *
 * Money is stored in integer paise (`*_paise`) with rupee mirrors for the existing UI.
 */

export const ORDERS = "orders";
const PRODUCTS = "products";

export class CheckoutError extends Error {
  constructor(message, status = 400, code = "CHECKOUT_ERROR") {
    super(message);
    this.status = status;
    this.code = code;
  }
}

const rupees = (paise) => Math.round(paise) / 100;
const now = () => new Date().toISOString();

export function newOrderId() {
  // Sortable + unguessable: ORD-<yyyymmdd>-<8 hex>
  const d = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `ORD-${d}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
}

async function getProductAdmin(id) {
  const snap = await adminDb().collection(PRODUCTS).doc(id).get();
  // Same normalisation as the website: the displayed price is the first variant's
  // price, which can differ from the raw `price` field (12 products do).
  return snap.exists ? normalizeProductRecord({ id: snap.id, ...snap.data() }) : null;
}

function toOrderItems(lines) {
  return lines.map((l) => ({
    product_id: l.productId,
    name: l.name,
    image: l.image,
    variant: l.variant,
    size: l.size || null,
    color: l.color || null,
    quantity: l.quantity,
    price: rupees(l.unitPaise), // unit price actually charged
    regular_price: rupees(l.regularPaise),
    price_paise: l.unitPaise,
    line_total_paise: l.lineTotalPaise,
    offer_id: l.offerId,
    weight_grams: l.weightGrams,
  }));
}

const RESERVATIONS = "reservations";
const SLOTS = "plantDoctorSlots";
const slotDocId = (date, time) => `${date}_${time}`;

function demandOf(lines) {
  const demand = {};
  for (const l of lines) demand[l.productId] = (demand[l.productId] || 0) + l.quantity;
  return demand;
}

/**
 * Holds the cart's units for RESERVATION_MS so two people cannot both start
 * paying for the last one. The check and the hold are one transaction.
 */
async function reserveStock(orderId, demand, names = {}) {
  const db = adminDb();
  const ids = Object.keys(demand);
  const nowMs = Date.now();
  try {
    await db.runTransaction(async (tx) => {
      const productSnaps = await Promise.all(ids.map((id) => tx.get(db.collection(PRODUCTS).doc(id))));
      const holdSnaps = await Promise.all(
        ids.map((id) => tx.get(db.collection(RESERVATIONS).where("product_ids", "array-contains", id).where("expires_at", ">", nowMs)))
      );
      const stocks = {};
      ids.forEach((id, i) => {
        if (productSnaps[i].exists) stocks[id] = stockOf(productSnaps[i].data());
      });
      const holds = holdSnaps.flatMap((snap) => snap.docs.map((d) => d.data()));
      const { ok, shortages } = checkAvailability(demand, stocks, holds, orderId, nowMs);
      if (!ok) {
        const s0 = shortages[0];
        const name = names[s0.product_id] || "an item";
        throw new CheckoutError(
          s0.available > 0
            ? `Only ${s0.available} of ${name} left right now. Please reduce the quantity.`
            : `${name} was just taken by another customer who is checking out. Please try again in a few minutes.`,
          409,
          "OUT_OF_STOCK"
        );
      }
      tx.set(db.collection(RESERVATIONS).doc(orderId), {
        order_id: orderId,
        product_ids: ids,
        items: demand,
        status: "active",
        expires_at: nowMs + RESERVATION_MS,
        created_at: now(),
      });
    });
  } catch (e) {
    if (e instanceof CheckoutError) throw e;
    // The composite index (see firestore.indexes.json) is not deployed yet: don't block
    // customers; the paid-order step still clamps stock and flags any oversell for the team.
    if (e.code === 9 || /FAILED_PRECONDITION|requires an index/i.test(String(e.message))) {
      console.error("Stock hold skipped (deploy firestore.indexes.json):", e.message);
      return;
    }
    throw e;
  }
}

/** One Plant Doctor consultation per slot: held while paying, booked once paid. */
async function holdSlot(orderId, date, time) {
  const db = adminDb();
  const ref = db.collection(SLOTS).doc(slotDocId(date, time));
  const nowMs = Date.now();
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const d = snap.exists ? snap.data() : null;
    const takenByOther = d && d.order_id !== orderId && (d.status === "booked" || (d.status === "held" && d.expires_at > nowMs));
    if (takenByOther) throw new CheckoutError("Sorry, that time slot was just taken. Please pick another.", 409, "SLOT_TAKEN");
    tx.set(ref, { date, time, order_id: orderId, status: "held", expires_at: nowMs + RESERVATION_MS });
  });
}

/** Gives the stock or the slot back (cancelled / failed checkout). Safe to call twice. */
export async function releaseHolds(orderId, kind, appointment) {
  const db = adminDb();
  if (kind === "service" && appointment) {
    const ref = db.collection(SLOTS).doc(slotDocId(appointment.date, appointment.time));
    const snap = await ref.get();
    if (snap.exists && snap.data().order_id === orderId) await ref.delete();
    return;
  }
  const ref = db.collection(RESERVATIONS).doc(orderId);
  const snap = await ref.get();
  if (snap.exists && snap.data().status === "active") await ref.update({ status: "released" });
}

/** Slots nobody else can book right now, as "YYYY-MM-DD|HH:MM" ids (no personal data). */
export async function takenSlotIds(fromDateKey) {
  const snap = await adminDb().collection(SLOTS).where("date", ">=", fromDateKey).get();
  const nowMs = Date.now();
  const taken = [];
  snap.forEach((doc) => {
    const d = doc.data();
    if (d.status === "booked" || (d.status === "held" && d.expires_at > nowMs)) taken.push(slotId(d.date, d.time));
  });
  return taken;
}

/**
 * Creates the pending order and its Razorpay order.
 * kind "cart":    { items, address, email }
 * kind "service": { service, email, name, phone, appointment: { date, time, notes } }
 */
export async function startCheckout({ kind, user, items, address, email, emailToken = null, service, contact, appointment, saveAddress = true }) {
  let priced;
  try {
    priced = kind === "service" ? priceService(service, SERVICE_PRICES) : await priceCart(items, getProductAdmin, { freeShipping: FREE_SHIPPING });
  } catch (e) {
    if (e instanceof PricingError) throw new CheckoutError(e.message, 400, e.code);
    throw e;
  }

  let serviceabilityUnverified = false;
  if (kind === "cart") {
    const { error, notServiceable } = await delhiveryService.checkServiceability(address.pincode);
    if (notServiceable) throw new CheckoutError(`Sorry, we can't deliver to pincode ${address.pincode} yet`, 400, "NOT_SERVICEABLE");
    // If the courier lookup itself failed, take the order and flag it for the team.
    if (error) serviceabilityUnverified = true;
  }

  const orderId = newOrderId();

  // Hold the stock (or the consultation slot) before taking money.
  if (kind === "cart") {
    await reserveStock(orderId, demandOf(priced.lines), Object.fromEntries(priced.lines.map((l) => [l.productId, l.name])));
  } else {
    await holdSlot(orderId, appointment.date, appointment.time);
  }

  const { data: rzpOrder, error: rzpError } = await razorpayService.createOrder({
    amount: priced.totalPaise,
    currency: priced.currency,
    receipt: orderId,
    notes: { order_id: orderId, kind, user_id: user?.uid || "guest" },
  });
  if (rzpError || !rzpOrder?.id) {
    await releaseHolds(orderId, kind, appointment).catch(() => {});
    throw new CheckoutError("Could not start the payment. Please try again.", 502, "GATEWAY");
  }

  const items_ = kind === "service"
    ? [{ product_id: service, name: "Plant Doctor - Expert Consultation", image: null, variant: null, quantity: 1, price: rupees(priced.totalPaise), regular_price: rupees(priced.totalPaise), price_paise: priced.totalPaise, line_total_paise: priced.totalPaise, offer_id: null, weight_grams: null }]
    : toOrderItems(priced.lines);

  const verifiedMatch = Boolean(
    user?.uid &&
    user?.email_verified &&
    String(user.email || "").toLowerCase() === String(email || "").toLowerCase()
  );
  const otpVerified = Boolean(emailToken && verifyEmailToken(emailToken, email));
  const emailVerifiedOwner = verifiedMatch || otpVerified;

  const order = {
    order_id: orderId,
    kind,
    // Only link immediately when the signed-in user's verified email matches;
    // unverified guest checkouts must verify via email OTP before linking to an account.
    user_id: verifiedMatch ? user.uid : null,
    guest_checkout: !verifiedMatch,
    email_verified_owner: emailVerifiedOwner,
    customer_linked: false,
    account_created: false,
    save_address: Boolean(saveAddress),
    status: "pending_payment",
    payment_status: "pending",
    payment_method: "razorpay",
    razorpay_order_id: rzpOrder.id,
    razorpay_payment_id: null,
    items: items_,
    currency: priced.currency,
    subtotal_paise: priced.subtotalPaise,
    savings_paise: priced.savingsPaise,
    shipping_paise: priced.shippingPaise,
    total_paise: priced.totalPaise,
    // rupee mirrors for the existing order pages
    subtotal: rupees(priced.subtotalPaise),
    shipping_charges: rupees(priced.shippingPaise),
    discount: rupees(priced.savingsPaise),
    tax: 0, // prices are GST-inclusive
    total: rupees(priced.totalPaise),
    free_shipping: FREE_SHIPPING,
    customer_name: kind === "service" ? contact.name : address.name,
    customer_email: email,
    customer_phone: kind === "service" ? contact.phone || "" : address.phone,
    shipping_address: kind === "service" ? null : address,
    appointment: kind === "service" ? appointment : null,
    shipment_status: kind === "service" ? "not_required" : "not_created",
    serviceability_unverified: serviceabilityUnverified,
    waybill: null,
    awb_code: null,
    courier_name: null,
    email_sent: false,
    stock_adjusted: false,
    order_date: now(),
    payment_date: null,
    created_at: FieldValue.serverTimestamp(),
    updated_at: FieldValue.serverTimestamp(),
    events: [{ at: now(), type: "created", by: user?.uid || "guest" }],
  };

  await adminDb().collection(ORDERS).doc(orderId).set(order);

  return {
    orderId,
    razorpay: {
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      orderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
    },
    totals: { subtotal: order.subtotal, savings: order.discount, shipping: order.shipping_charges, total: order.total },
  };
}

/**
 * Marks an order paid exactly once, after proving the payment is real.
 * `signature` is required for the browser path; the webhook path has already
 * verified its own body signature and passes `trustedWebhook: true`.
 */
export async function confirmPayment({ orderId, razorpayOrderId, razorpayPaymentId, signature, trustedWebhook = false }) {
  if (!orderId || !razorpayOrderId || !razorpayPaymentId) throw new CheckoutError("Missing payment details", 400);

  if (!trustedWebhook) {
    const ok = isValidPaymentSignature({
      razorpayOrderId,
      razorpayPaymentId,
      signature,
      secret: process.env.RAZORPAY_KEY_SECRET,
    });
    if (!ok) throw new CheckoutError("Payment verification failed", 400, "BAD_SIGNATURE");
  }

  const ref = adminDb().collection(ORDERS).doc(orderId);
  const snap = await ref.get();
  if (!snap.exists) throw new CheckoutError("Order not found", 404);
  const order = snap.data();
  if (order.razorpay_order_id !== razorpayOrderId) throw new CheckoutError("Payment does not belong to this order", 400, "ORDER_MISMATCH");
  if (order.payment_status === "paid") return { order, alreadyPaid: true };

  if (order.status === "cancelled") {
    // The customer cancelled while a payment window was still open and then paid.
    // Never resurrect a cancelled order: refund that payment instead.
    if (!order.refund_id) {
      const { data: refund } = await razorpayService.initiateRefund({
        paymentId: razorpayPaymentId,
        amount: order.total_paise,
        notes: { order_id: orderId, reason: "paid_after_cancellation" },
      });
      await ref.update({
        refund_id: refund?.id || null,
        payment_status: refund ? "refund_pending" : "refund_needed",
        needs_attention: !refund,
        ...(refund ? {} : { attention_reasons: FieldValue.arrayUnion("refund_failed") }),
        razorpay_payment_id: razorpayPaymentId,
        updated_at: FieldValue.serverTimestamp(),
        events: FieldValue.arrayUnion({ at: now(), type: "paid_after_cancel", payment_id: razorpayPaymentId, refund_id: refund?.id || null }),
      });
    }
    throw new CheckoutError("This order was cancelled. Your payment will be refunded automatically.", 409, "ORDER_CANCELLED");
  }

  // Never trust the browser about money: ask Razorpay what was actually paid.
  const { data: payment, error } = await razorpayService.fetchPayment(razorpayPaymentId);
  if (error || !payment) throw new CheckoutError("Could not confirm the payment with Razorpay", 502, "GATEWAY");
  if (payment.orderId !== razorpayOrderId) throw new CheckoutError("Payment does not belong to this order", 400, "ORDER_MISMATCH");
  if (Number(payment.amount) !== Number(order.total_paise) || payment.currency !== order.currency) {
    throw new CheckoutError("Paid amount does not match the order", 400, "AMOUNT_MISMATCH");
  }

  let status = payment.status;
  if (status === "authorized") {
    // Capture now if the account is not on auto-capture.
    const { data: captured, error: capErr } = await razorpayService.capturePayment(razorpayPaymentId, order.total_paise, order.currency);
    if (capErr) throw new CheckoutError("Payment authorised but could not be captured", 502, "CAPTURE_FAILED");
    status = captured?.status || "captured";
  }
  if (status !== "captured") throw new CheckoutError(`Payment is ${status}`, 400, "NOT_CAPTURED");

  const result = await adminDb().runTransaction(async (tx) => {
    const fresh = await tx.get(ref);
    const o = fresh.data();
    if (o.payment_status === "paid") return { order: o, alreadyPaid: true };
    if (o.status === "cancelled") return { order: o, cancelledMidFlight: true };

    const slotRef = o.kind === "service" && o.appointment ? adminDb().collection(SLOTS).doc(slotDocId(o.appointment.date, o.appointment.time)) : null;
    const slotSnap = slotRef ? await tx.get(slotRef) : null;

    // Reads first (Firestore transaction rule), then writes. Several lines can be the
    // same product (different variants), so demand is totalled per product.
    const demand = new Map();
    if (o.kind === "cart" && !o.stock_adjusted) {
      for (const it of o.items) demand.set(it.product_id, (demand.get(it.product_id) || 0) + it.quantity);
    }
    const productIds = [...demand.keys()];
    const productRefs = productIds.map((id) => adminDb().collection(PRODUCTS).doc(id));
    const productSnaps = await Promise.all(productRefs.map((r) => tx.get(r)));

    const oversold = [];
    const stockDeductedMap = {};
    productSnaps.forEach((ps, i) => {
      if (!ps.exists) return;
      const stock = stockOf(ps.data());
      if (!Number.isFinite(stock)) return;
      const wanted = demand.get(productIds[i]);
      // Paid is paid: never go below zero; shortfalls are flagged for the team.
      if (stock < wanted) oversold.push({ product_id: productIds[i], wanted, available: stock });
      const actualDeducted = Math.min(stock, wanted);
      stockDeductedMap[productIds[i]] = actualDeducted;
      const left = Math.max(0, stock - wanted);
      tx.update(productRefs[i], { stock: left, stock_status: left > 0 ? "in_stock" : "out_of_stock" });
    });

    const reasons = [];
    if (oversold.length) reasons.push("oversold");
    if (slotRef) {
      const sd = slotSnap.exists ? slotSnap.data() : null;
      const takenByOther = sd && sd.order_id !== orderId && (sd.status === "booked" || (sd.status === "held" && sd.expires_at > Date.now()));
      if (takenByOther) reasons.push("slot_conflict");
      else tx.set(slotRef, { date: o.appointment.date, time: o.appointment.time, order_id: orderId, status: "booked", booked_at: now() });
    }
    if (o.kind === "cart") tx.set(adminDb().collection(RESERVATIONS).doc(orderId), { status: "consumed" }, { merge: true });

    const updates = {
      status: "confirmed",
      payment_status: "paid",
      razorpay_payment_id: razorpayPaymentId,
      payment_method_detail: payment.method || null,
      payment_date: now(),
      stock_adjusted: o.kind === "cart" ? true : o.stock_adjusted,
      stock_deducted_map: o.kind === "cart" ? stockDeductedMap : o.stock_deducted_map || null,
      oversold_items: oversold.length ? oversold : null,
      attention_reasons: reasons.length ? reasons : o.attention_reasons || [],
      needs_attention: reasons.length ? true : o.needs_attention || false,
      updated_at: FieldValue.serverTimestamp(),
      events: FieldValue.arrayUnion({ at: now(), type: "paid", via: trustedWebhook ? "webhook" : "checkout", payment_id: razorpayPaymentId }),
    };
    tx.update(ref, updates);
    return { order: { ...o, ...updates, events: undefined }, alreadyPaid: false };
  });

  if (result.cancelledMidFlight) {
    if (!result.order.refund_id) {
      const { data: refund } = await razorpayService.initiateRefund({
        paymentId: razorpayPaymentId,
        amount: result.order.total_paise,
        notes: { order_id: orderId, reason: "paid_after_cancellation" },
      });
      await ref.update({
        refund_id: refund?.id || null,
        payment_status: refund ? "refund_pending" : "refund_needed",
        needs_attention: !refund,
        ...(refund ? {} : { attention_reasons: FieldValue.arrayUnion("refund_failed") }),
        razorpay_payment_id: razorpayPaymentId,
        updated_at: FieldValue.serverTimestamp(),
        events: FieldValue.arrayUnion({ at: now(), type: "paid_after_cancel", payment_id: razorpayPaymentId, refund_id: refund?.id || null }),
      });
    }
    throw new CheckoutError("This order was cancelled. Your payment will be refunded automatically.", 409, "ORDER_CANCELLED");
  }

  return result;
}

/** Records a failed attempt (the customer can retry; the order stays payable). */
export async function recordPaymentFailure({ orderId, razorpayOrderId, razorpayPaymentId, reason }) {
  const ref = adminDb().collection(ORDERS).doc(orderId);
  const snap = await ref.get();
  if (!snap.exists) return;
  const o = snap.data();
  if (o.payment_status === "paid" || o.status === "cancelled") return;
  if (razorpayOrderId && o.razorpay_order_id && o.razorpay_order_id !== razorpayOrderId) return;
  const alreadyRecorded =
    Array.isArray(o.events) &&
    o.events.some((e) => e?.type === "payment_failed" && e?.payment_id === (razorpayPaymentId || null));
  await ref.update({
    payment_status: "failed",
    updated_at: FieldValue.serverTimestamp(),
    ...(alreadyRecorded
      ? {}
      : {
          events: FieldValue.arrayUnion({
            at: now(),
            type: "payment_failed",
            payment_id: razorpayPaymentId || null,
            reason: String(reason || "").slice(0, 200),
          }),
        }),
  });
}

/**
 * After payment: book the Delhivery shipment and send the confirmation email.
 * Safe to call repeatedly (each step is skipped once done).
 */
const FULFILMENT_LOCK_MS = 90_000;

/**
 * Only one caller works on an order's shipment / email / account at a time.
 * Payment confirmation can arrive twice at once (the browser and the Razorpay
 * webhook); without this both would book a Delhivery shipment and send a
 * duplicate email.
 */
async function claimFulfilment(ref) {
  return adminDb().runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) return null;
    const o = snap.data();
    const heldSince = o.fulfilment_lock_at ? Date.parse(o.fulfilment_lock_at) : 0;
    if (Date.now() - heldSince < FULFILMENT_LOCK_MS) return { busy: true, order: o };
    tx.update(ref, { fulfilment_lock_at: now() });
    return { busy: false, order: o };
  });
}

export async function fulfilOrder(orderId) {
  const ref = adminDb().collection(ORDERS).doc(orderId);
  const claim = await claimFulfilment(ref);
  if (!claim) throw new CheckoutError("Order not found", 404);
  const order = claim.order;
  if (order.payment_status !== "paid") {
    if (!claim.busy) await ref.update({ fulfilment_lock_at: null });
    throw new CheckoutError("Order is not paid", 409);
  }
  if (claim.busy) {
    return { busy: true, shipment: order.shipment_status, email: order.email_sent, account: order.customer_linked ? { created: Boolean(order.account_created) } : null };
  }
  try {
    return await runFulfilment(ref, order);
  } finally {
    await ref.update({ fulfilment_lock_at: null }).catch(() => {});
  }
}

/**
 * Links the order to the customer's account (finds or creates it by email).
 * Quick, idempotent, and run before the payment response so the confirmation
 * screen can tell guests how to sign in later.
 */
async function linkCustomerStage(ref, order) {
  if (order.customer_linked) return { created: Boolean(order.account_created) };
  // Never attach an unverified guest email order to an existing/new customer account.
  if (!order.email_verified_owner) return { created: false, skippedUnverified: true };
  try {
    const { uid, created } = await attachCustomerForOrder(order);
    await ref.update({
      user_id: uid,
      customer_linked: true,
      account_created: created,
      updated_at: FieldValue.serverTimestamp(),
      events: FieldValue.arrayUnion({ at: now(), type: created ? "account_created" : "account_linked", uid }),
    });
    order.user_id = uid;
    order.customer_linked = true;
    return { created };
  } catch (e) {
    console.error("Linking customer failed:", e.message);
    return null;
  }
}

export async function linkCustomer(orderId) {
  const ref = adminDb().collection(ORDERS).doc(orderId);
  const snap = await ref.get();
  if (!snap.exists || snap.data().payment_status !== "paid") return null;
  return linkCustomerStage(ref, snap.data());
}

async function runFulfilment(ref, order) {
  const result = { shipment: order.shipment_status, email: order.email_sent, account: null };

  const linked = await linkCustomerStage(ref, order);
  result.account = linked;

  // Re-read fresh order state after account linking so mid-flight cancellations abort cleanly.
  const freshSnap = await ref.get();
  const current = freshSnap.exists ? freshSnap.data() : order;
  if (current.status === "cancelled") {
    return result;
  }

  if (current.kind === "cart" && !current.waybill) {
    const { data, error } = await delhiveryService.createShipmentForOrder(current);
    const afterShipSnap = await ref.get();
    if (afterShipSnap.exists && afterShipSnap.data().status === "cancelled") {
      if (data?.waybill) {
        await delhiveryService.cancelShipment(data.waybill).catch(() => null);
      }
      return result;
    }
    if (data?.waybill) {
      await ref.update({
        waybill: data.waybill,
        awb_code: data.waybill,
        courier_name: "Delhivery",
        shipment_status: "created",
        shipment_error: null,
        updated_at: FieldValue.serverTimestamp(),
        events: FieldValue.arrayUnion({ at: now(), type: "shipment_created", waybill: data.waybill }),
      });
      result.shipment = "created";
    } else {
      // Payment is safe; the team books the shipment manually / retries.
      await ref.update({
        shipment_status: "failed",
        shipment_error: String(error || "unknown").slice(0, 300),
        updated_at: FieldValue.serverTimestamp(),
        events: FieldValue.arrayUnion({ at: now(), type: "shipment_failed", error: String(error || "").slice(0, 200) }),
      });
      result.shipment = "failed";
    }
  }

  if (!current.email_sent && current.customer_email) {
    try {
      const { error } = await emailService.sendOrderConfirmation(
        {
          orderId: current.order_id,
          customerName: current.customer_name,
          orderDate: current.payment_date || current.order_date,
          paymentMethod: "Paid online (Razorpay)",
          items: current.items.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price, image: i.image, options: [i.variant, i.size, i.color].filter(Boolean).join(" · ") })),
          total: current.total,
          shippingAddress: current.shipping_address,
          appointment: current.appointment
            ? {
                ...current.appointment,
                dateLabel: new Date(`${current.appointment.date}T12:00:00+05:30`).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", weekday: "long", day: "numeric", month: "long" }),
                timeLabel: SLOT_TIMES.find((t) => t.value === current.appointment.time)?.label || current.appointment.time,
              }
            : null,
        },
        current.customer_email
      );
      if (!error) {
        await ref.update({ email_sent: true });
        result.email = true;
      }
    } catch (e) {
      console.error("Confirmation email failed:", e.message);
    }
  }

  // Tell the team (once): new paid order / booking, and anything that needs a human.
  if (!current.owner_alerted) {
    try {
      const fresh = (await ref.get()).data();
      const adminHost = process.env.ADMIN_URL || "https://admin.vrikshvalley.com";
      const alert = buildOwnerAlert(fresh, { adminUrl: `${adminHost}/admin/orders/${encodeURIComponent(fresh.order_id)}` });
      const { error } = await emailService.sendOwnerAlert(alert);
      if (!error) await ref.update({ owner_alerted: true });
    } catch (e) {
      console.error("Owner alert failed:", e.message);
    }
  }

  return result;
}

/** Customer-initiated (or admin-initiated) cancellation: only before the parcel moves. Refunds in full. */
export async function cancelOrderForCustomer({ orderId, uid, reason, byAdmin = false }) {
  const db = adminDb();
  const ref = db.collection(ORDERS).doc(orderId);
  const preSnap = await ref.get();
  if (!preSnap.exists) throw new CheckoutError("Order not found", 404);
  const preOrder = preSnap.data();
  if (!byAdmin && preOrder.user_id !== uid) throw new CheckoutError("Order not found", 404);
  if (!["pending_payment", "confirmed"].includes(preOrder.status)) {
    throw new CheckoutError("This order can no longer be cancelled online. Please contact us on WhatsApp.", 409, "NOT_CANCELLABLE");
  }
  if (!byAdmin && preOrder.kind === "service" && preOrder.appointment?.date && preOrder.appointment?.time) {
    const slotMs = new Date(`${preOrder.appointment.date}T${preOrder.appointment.time}:00+05:30`).getTime();
    if (Number.isFinite(slotMs) && slotMs <= Date.now()) {
      throw new CheckoutError("This consultation slot has already passed and cannot be cancelled online.", 409, "SLOT_PASSED");
    }
  }

  if (preOrder.waybill) {
    const { data: cancelRes, error } = await delhiveryService.cancelShipment(preOrder.waybill);
    if (error || !cancelRes?.success) {
      throw new CheckoutError("The parcel is already on its way; please contact us to return it.", 409, "SHIPMENT_ACTIVE");
    }
  }

  // Atomically transition status + restore exact deducted stock so concurrent cancels cannot double-refund or double-increment.
  const cancelledOrder = await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new CheckoutError("Order not found", 404);
    const o = snap.data();
    if (!byAdmin && o.user_id !== uid) throw new CheckoutError("Order not found", 404);
    if (!["pending_payment", "confirmed"].includes(o.status)) {
      throw new CheckoutError("This order can no longer be cancelled online. Please contact us on WhatsApp.", 409, "NOT_CANCELLABLE");
    }

    const restoreMap = new Map();
    if (o.kind === "cart" && o.stock_adjusted) {
      if (o.stock_deducted_map && typeof o.stock_deducted_map === "object") {
        for (const [pid, qty] of Object.entries(o.stock_deducted_map)) {
          if (Number(qty) > 0) restoreMap.set(pid, Number(qty));
        }
      } else {
        for (const it of o.items || []) {
          restoreMap.set(it.product_id, (restoreMap.get(it.product_id) || 0) + Number(it.quantity || 0));
        }
      }
    }
    const prodIds = [...restoreMap.keys()];
    const prodRefs = prodIds.map((pid) => db.collection(PRODUCTS).doc(pid));
    const prodSnaps = await Promise.all(prodRefs.map((r) => tx.get(r)));
    prodSnaps.forEach((ps, idx) => {
      if (!ps.exists) return;
      const qty = restoreMap.get(prodIds[idx]);
      if (qty > 0) {
        tx.update(prodRefs[idx], { stock: FieldValue.increment(qty), stock_status: "in_stock" });
      }
    });

    const updates = {
      status: "cancelled",
      cancelled_date: now(),
      cancellation_reason: String(reason || "").slice(0, 300) || null,
      payment_status: o.payment_status === "paid" ? "refund_pending" : "cancelled",
      stock_adjusted: false,
      shipment_status: o.waybill ? "cancelled" : o.shipment_status,
      updated_at: FieldValue.serverTimestamp(),
      events: FieldValue.arrayUnion({ at: now(), type: "cancelled", by: uid }),
    };
    tx.update(ref, updates);
    return { ...o, ...updates, events: undefined };
  });

  await releaseHolds(orderId, cancelledOrder.kind, cancelledOrder.appointment).catch(() => {});

  let refund = null;
  if (preOrder.payment_status === "paid" && preOrder.razorpay_payment_id && !preOrder.refund_id) {
    const { data, error } = await razorpayService.initiateRefund({
      paymentId: preOrder.razorpay_payment_id,
      amount: preOrder.total_paise,
      notes: { order_id: orderId, reason: byAdmin ? "admin_cancelled" : "customer_cancelled" },
    });
    if (error || !data) {
      await ref.update({
        payment_status: "refund_needed",
        needs_attention: true,
        attention_reasons: FieldValue.arrayUnion("refund_failed"),
        updated_at: FieldValue.serverTimestamp(),
      });
      throw new CheckoutError("Order was cancelled, but starting the refund failed. Our team has been alerted.", 502, "REFUND_FAILED");
    }
    refund = data;
    await ref.update({
      refund_id: refund.id,
      payment_status: "refund_pending",
      updated_at: FieldValue.serverTimestamp(),
    });
  }

  if (cancelledOrder.customer_email) {
    emailService
      .sendCancellationConfirmation(
        {
          orderId: cancelledOrder.order_id,
          customerName: cancelledOrder.customer_name,
          reason: cancelledOrder.cancellation_reason || "Cancelled as requested",
          refundAmount: refund ? cancelledOrder.total : 0,
        },
        cancelledOrder.customer_email
      )
      .catch(() => null);
  }

  return { ...cancelledOrder, refund_id: refund?.id || cancelledOrder.refund_id || null };
}

/** Customer return request (reviewed by the team, who book the reverse pickup). */
export async function requestReturnForCustomer({ orderId, uid, reason }) {
  const cleanReason = String(reason || "").trim().slice(0, 300);
  if (!cleanReason) throw new CheckoutError("Please tell us why you'd like to return this order", 400, "REASON_REQUIRED");
  const ref = adminDb().collection(ORDERS).doc(orderId);
  const snap = await ref.get();
  if (!snap.exists || snap.data().user_id !== uid) throw new CheckoutError("Order not found", 404);
  const order = snap.data();
  if (order.kind !== "cart") throw new CheckoutError("Only physical orders can be returned", 400, "NOT_RETURNABLE");
  if (order.status !== "delivered") throw new CheckoutError("Returns can be requested after delivery", 409, "NOT_DELIVERED");
  const window = returnWindowStatus(order);
  if (!window.open) {
    throw new CheckoutError(`Returns must be requested within ${RETURN_WINDOW_DAYS} days of delivery. Please contact us on WhatsApp if something is wrong.`, 409, "RETURN_WINDOW_CLOSED");
  }
  const updates = {
    status: "return_requested",
    return_reason: cleanReason,
    return_requested_date: now(),
    updated_at: FieldValue.serverTimestamp(),
    events: FieldValue.arrayUnion({ at: now(), type: "return_requested", by: uid }),
  };
  await ref.update(updates);
  return { ...order, ...updates, events: undefined };
}

/** Refund webhook bookkeeping (accumulates partial refunds and flags dashboard refunds). */
export async function markRefunded({ razorpayPaymentId, refundId, amountPaise }) {
  const db = adminDb();
  const q = await db.collection(ORDERS).where("razorpay_payment_id", "==", razorpayPaymentId).limit(1).get();
  if (q.empty) return;
  const ref = q.docs[0].ref;
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) return;
    const order = snap.data();
    const seenIds = Array.isArray(order.refund_ids) ? order.refund_ids : order.refund_id ? [order.refund_id] : [];
    if (refundId && seenIds.includes(refundId)) return;
    const added = Number(amountPaise) || 0;
    const totalRefunded = (Number(order.refunded_paise) || 0) + added;
    const isFull = totalRefunded >= Number(order.total_paise || 0);
    const updates = {
      payment_status: isFull ? "refunded" : "partially_refunded",
      refund_id: refundId || order.refund_id || null,
      refund_ids: refundId ? [...seenIds, refundId] : seenIds,
      refunded_paise: totalRefunded || null,
      updated_at: FieldValue.serverTimestamp(),
      events: FieldValue.arrayUnion({ at: now(), type: "refunded", refund_id: refundId || null, amount_paise: added }),
    };
    if (isFull && order.status !== "cancelled") {
      if (order.waybill) {
        updates.needs_attention = true;
        updates.attention_reasons = FieldValue.arrayUnion("refunded_after_dispatch");
      } else {
        updates.status = "cancelled";
        updates.cancelled_date = order.cancelled_date || now();
      }
    }
    tx.update(ref, updates);
  });
}

const STATUS_RANK = { pending_payment: 0, confirmed: 1, shipped: 2, delivered: 3, return_requested: 4, returned: 5, cancelled: 6 };

function mapDelhiveryStatus(status) {
  const key = String(status || "").trim().toLowerCase();
  if (!key) return null;
  // Check negative/RTO/cancel phrases BEFORE positive substrings like "delivered" or "pending".
  if (/\b(rto|returned|return to origin)\b/.test(key)) return "returned";
  if (/\b(cancel|cancelled|canceled)\b/.test(key)) return "cancelled";
  if (/\b(undelivered|not delivered|delivery attempted|failed)\b/.test(key)) return "shipped";
  if (/\bdelivered\b/.test(key)) return "delivered";
  if (/\b(picked up|in transit|dispatched|out for delivery|reached|manifest)\b/.test(key)) {
    return key.includes("manifest") ? "confirmed" : "shipped";
  }
  if (/\b(not picked|pending)\b/.test(key)) return "confirmed";
  return null;
}

/** Delhivery status → our order status (forward-only, triggers shipping/delivery emails). */
export async function applyShipmentUpdate({ waybill, orderId, status, location, deliveredAt, expectedDeliveryDate }) {
  const next = mapDelhiveryStatus(status);

  let ref;
  if (orderId) {
    ref = adminDb().collection(ORDERS).doc(orderId);
  } else {
    const q = await adminDb().collection(ORDERS).where("waybill", "==", waybill).limit(1).get();
    if (q.empty) return null;
    ref = q.docs[0].ref;
  }
  const snap = await ref.get();
  if (!snap.exists) return null;
  const order = snap.data();
  if (waybill && order.waybill && order.waybill !== waybill) return null;

  const updates = {
    shipment_status_text: String(status || "").slice(0, 80),
    shipment_location: location ? String(location).slice(0, 120) : null,
    ...(expectedDeliveryDate ? { expected_delivery_date: String(expectedDeliveryDate).slice(0, 40) } : {}),
    updated_at: FieldValue.serverTimestamp(),
    events: FieldValue.arrayUnion({ at: now(), type: "shipment", status: String(status || "").slice(0, 80) }),
  };

  const curRank = STATUS_RANK[order.status] ?? 0;
  const nextRank = next ? (STATUS_RANK[next] ?? 0) : -1;
  const canAdvance =
    next &&
    order.status !== "cancelled" &&
    (next === "returned" || next === "cancelled" || (nextRank > curRank && curRank < STATUS_RANK.return_requested));

  if (canAdvance) {
    updates.status = next;
    if (next === "shipped" && !order.shipped_date) updates.shipped_date = now();
    if (next === "delivered") updates.delivered_date = deliveredAt || now();
    if (next === "cancelled") updates.cancelled_date = order.cancelled_date || now();
    if ((next === "returned" || next === "cancelled") && order.payment_status === "paid") {
      updates.needs_attention = true;
      updates.attention_reasons = FieldValue.arrayUnion(`courier_${next}`);
    }
  }

  await ref.update(updates);
  return updates;
}

export async function findOrderIdByRazorpayOrder(razorpayOrderId) {
  if (!razorpayOrderId) return null;
  const q = await adminDb().collection(ORDERS).where("razorpay_order_id", "==", razorpayOrderId).limit(1).get();
  return q.empty ? null : q.docs[0].id;
}

export async function getOrderAdmin(orderId) {
  const snap = await adminDb().collection(ORDERS).doc(orderId).get();
  return snap.exists ? snap.data() : null;
}

/** Links a paid guest order after the buyer proves ownership of `email` via OTP. */
export async function claimVerifiedOrder({ orderId, email }) {
  const ref = adminDb().collection(ORDERS).doc(orderId);
  const snap = await ref.get();
  if (!snap.exists) return null;
  const order = snap.data();
  if (String(order.customer_email || "").toLowerCase() !== String(email || "").trim().toLowerCase()) {
    return null;
  }
  await ref.update({ email_verified_owner: true, updated_at: FieldValue.serverTimestamp() });
  if (order.payment_status === "paid" && !order.customer_linked) {
    return linkCustomerStage(ref, { ...order, email_verified_owner: true });
  }
  return { claimed: true };
}
