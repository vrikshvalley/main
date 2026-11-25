import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/server/firebaseAdmin";
import { ORDERS, CheckoutError, fulfilOrder, cancelOrderForCustomer } from "@/lib/server/orders";

export const FILTERS = ["all", "attention", "paid", "shipment_failed", "service", "returns"];

const matches = {
  all: () => true,
  attention: (o) => o.needs_attention === true,
  paid: (o) => o.payment_status === "paid",
  shipment_failed: (o) => o.shipment_status === "failed",
  service: (o) => o.kind === "service",
  returns: (o) => o.status === "return_requested",
};

/** Newest orders first. Filtered in memory so no extra Firestore index is needed. */
export async function listOrdersAdmin(filter = "all", limit = 200) {
  const snap = await adminDb().collection(ORDERS).orderBy("order_date", "desc").limit(limit).get();
  const test = matches[filter] || matches.all;
  const rows = [];
  const counts = { attention: 0, shipment_failed: 0, returns: 0 };
  snap.forEach((d) => {
    const o = d.data();
    if (o.needs_attention) counts.attention++;
    if (o.shipment_status === "failed") counts.shipment_failed++;
    if (o.status === "return_requested") counts.returns++;
    if (!test(o)) return;
    rows.push({
      order_id: o.order_id || d.id,
      order_date: o.order_date,
      kind: o.kind,
      status: o.status,
      payment_status: o.payment_status,
      shipment_status: o.shipment_status || null,
      total: o.total,
      customer_name: o.customer_name || null,
      customer_email: o.customer_email || null,
      needs_attention: Boolean(o.needs_attention),
      appointment: o.appointment || null,
      item_count: (o.items || []).reduce((n, i) => n + (i.quantity || 0), 0),
    });
  });
  return { rows, counts };
}

const clean = (v) => JSON.parse(JSON.stringify(v ?? null, (k, x) => (x && typeof x.toDate === "function" ? x.toDate().toISOString() : x)));

export async function getOrderForAdmin(orderId) {
  const snap = await adminDb().collection(ORDERS).doc(orderId).get();
  return snap.exists ? clean(snap.data()) : null;
}

/** Staff actions. Every one is logged on the order's event timeline. */
export async function runAdminAction(orderId, action, { note } = {}, actor = "staff") {
  const ref = adminDb().collection(ORDERS).doc(orderId);
  const snap = await ref.get();
  if (!snap.exists) throw new CheckoutError("Order not found", 404);
  const order = snap.data();
  const log = (type, extra = {}) => ({ at: new Date().toISOString(), type, by: actor, ...extra });

  switch (action) {
    case "retry_shipment": {
      if (order.payment_status !== "paid") throw new CheckoutError("Order is not paid", 409);
      await ref.update({ events: FieldValue.arrayUnion(log("admin_retry_shipment")) });
      const r = await fulfilOrder(orderId);
      return { message: r.busy ? "Fulfilment is already running, try again in a minute." : "Shipment retried." };
    }
    case "resend_email": {
      if (order.payment_status !== "paid") throw new CheckoutError("Order is not paid", 409);
      await ref.update({ email_sent: false, events: FieldValue.arrayUnion(log("admin_resend_email")) });
      await fulfilOrder(orderId);
      return { message: "Confirmation email re-sent." };
    }
    case "cancel_refund": {
      await cancelOrderForCustomer({ orderId, uid: order.user_id || actor, reason: note || "Cancelled by store", byAdmin: true });
      await ref.update({ events: FieldValue.arrayUnion(log("admin_cancelled")) });
      return { message: "Order cancelled and refund started." };
    }
    case "resolve_attention": {
      await ref.update({ needs_attention: false, updated_at: FieldValue.serverTimestamp(), events: FieldValue.arrayUnion(log("attention_resolved", { note: note || null })) });
      return { message: "Marked as handled." };
    }
    case "add_note": {
      const text = String(note || "").trim().slice(0, 500);
      if (!text) throw new CheckoutError("Write a note first", 400);
      await ref.update({ events: FieldValue.arrayUnion(log("note", { note: text })) });
      return { message: "Note added." };
    }
    default:
      throw new CheckoutError("Unknown action", 400);
  }
}
