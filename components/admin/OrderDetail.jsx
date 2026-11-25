"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { authFetch } from "@/lib/authFetch";
import { money, when } from "./format";

const ACTIONS = [
  ["retry_shipment", "Retry shipment", "Books the Delhivery shipment again."],
  ["resend_email", "Resend confirmation email", "Sends the customer email again."],
  ["resolve_attention", "Mark as handled", "Clears the needs-attention flag."],
  ["cancel_refund", "Cancel and refund", "Cancels the order, releases stock and refunds the full amount.", true],
];

export default function OrderDetail({ orderId }) {
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await authFetch(`/api/admin/orders/${encodeURIComponent(orderId)}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message || "Could not load order");
      setOrder(json.order);
    } catch (e) {
      setError(e.message);
    }
  }, [orderId]);

  useEffect(() => {
    load();
  }, [load]);

  const act = async (action, confirmText) => {
    if (confirmText && !window.confirm(confirmText)) return;
    setBusy(true);
    setMsg("");
    try {
      const res = await authFetch(`/api/admin/orders/${encodeURIComponent(orderId)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, note }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message || "Action failed");
      setMsg(json.message || "Done.");
      if (action === "add_note") setNote("");
      await load();
    } catch (e) {
      setMsg(e.message);
    } finally {
      setBusy(false);
    }
  };

  if (error) return <p className="adm-error adm-center">{error}</p>;
  if (!order) return <p className="adm-center">Loading…</p>;

  const a = order.shipping_address;
  const reasons = order.attention_reasons || [];

  return (
    <section>
      <Link href="/admin" className="adm-back">← All orders</Link>
      <div className="adm-head">
        <h1>{order.order_id}</h1>
        <span>
          <i className={`adm-pill st-${order.status}`}>{order.status}</i>
          <i className={`adm-pill pay-${order.payment_status}`}>{order.payment_status}</i>
        </span>
      </div>

      {(order.needs_attention || order.shipment_status === "failed") && (
        <div className="adm-alert">
          <strong>Needs attention</strong>
          <ul>
            {reasons.includes("oversold") && <li>Stock ran short: more was bought than was in stock.</li>}
            {reasons.includes("slot_conflict") && <li>The consultation slot was double-booked. Contact the customer to reschedule.</li>}
            {order.shipment_status === "failed" && <li>Shipment failed: {order.shipment_error || "unknown error"}. Use Retry shipment.</li>}
            {order.serviceability_unverified && <li>Courier pincode check was unavailable at checkout. Confirm the address is serviceable.</li>}
          </ul>
        </div>
      )}

      <div className="adm-grid">
        <div className="adm-card">
          <h2>Customer</h2>
          <p>{order.customer_name}<br />{order.customer_email}<br />{order.customer_phone}</p>
          {order.appointment && <p><b>Consultation:</b> {order.appointment.date} at {order.appointment.time} IST</p>}
          {a && <p className="adm-addr">{[a.name, a.line1, a.line2, a.landmark, [a.city, a.state].filter(Boolean).join(", "), a.pincode && `PIN ${a.pincode}`].filter(Boolean).join("\n")}</p>}
        </div>
        <div className="adm-card">
          <h2>Payment and shipping</h2>
          <p>Total <b>{money(order.total)}</b> (free shipping)<br />Placed {when(order.order_date)}</p>
          <p className="adm-mono">Razorpay order: {order.razorpay_order_id || "-"}<br />Payment: {order.razorpay_payment_id || "-"}{order.refund_id ? <><br />Refund: {order.refund_id}</> : null}</p>
          {order.kind === "cart" && <p>Shipment: <b>{order.shipment_status || "-"}</b>{order.waybill ? <> · waybill <span className="adm-mono">{order.waybill}</span></> : null}</p>}
        </div>
      </div>

      <div className="adm-card">
        <h2>Items</h2>
        {(order.items || []).map((i, n) => (
          <div key={n} className="adm-item">
            <span>{i.name}<small>{[i.variant, i.size, i.color].filter(Boolean).join(" · ")}</small></span>
            <span>{i.quantity} × {money(i.price)}</span>
          </div>
        ))}
      </div>

      <div className="adm-card">
        <h2>Actions</h2>
        <div className="adm-actions">
          {ACTIONS.map(([key, label, hint, danger]) => (
            <button key={key} disabled={busy} title={hint} className={`adm-btn ${danger ? "adm-btn--danger" : ""}`} onClick={() => act(key, danger ? `${label}? This cannot be undone.` : null)}>{label}</button>
          ))}
        </div>
        <div className="adm-note">
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Internal note (also used as the cancellation reason)" maxLength={500} />
          <button className="adm-btn" disabled={busy || !note.trim()} onClick={() => act("add_note")}>Add note</button>
        </div>
        {msg && <p className="adm-msg">{msg}</p>}
      </div>

      <div className="adm-card">
        <h2>Timeline</h2>
        <ol className="adm-timeline">
          {[...(order.events || [])].reverse().map((e, n) => (
            <li key={n}>
              <b>{String(e.type).replace(/_/g, " ")}</b> <small>{when(e.at)}{e.by ? ` · ${e.by}` : ""}</small>
              {e.note && <p>{e.note}</p>}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
