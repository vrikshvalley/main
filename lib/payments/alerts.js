/**
 * The email the team receives for each paid order or Plant Doctor booking.
 * Pure: takes an order document, returns { subject, text, html }.
 */

const esc = (v) =>
  String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const rupees = (n) => "₹" + Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });

const REASONS = {
  oversold: "Stock ran short: more was bought than was in stock. Restock, substitute or contact the customer.",
  slot_conflict: "The consultation slot was taken by someone else before this payment cleared. Contact the customer to reschedule.",
};

export function attentionNotes(order) {
  const notes = (order.attention_reasons || []).map((r) => REASONS[r] || r);
  if (order.shipment_status === "failed") notes.push(`Shipment could not be booked (${order.shipment_error || "unknown error"}). Retry it from the admin page.`);
  if (order.serviceability_unverified) notes.push("The courier pincode check was unavailable at checkout: confirm this address is serviceable.");
  return notes;
}

export function buildOwnerAlert(order, { adminUrl } = {}) {
  const isService = order.kind === "service";
  const notes = attentionNotes(order);
  const flag = notes.length ? "[Needs attention] " : "";

  const slot = order.appointment ? `${order.appointment.date} at ${order.appointment.time} (IST)` : "";
  const subject = isService
    ? `${flag}New Plant Doctor booking: ${slot} · ${rupees(order.total)}`
    : `${flag}New paid order ${order.order_id} · ${rupees(order.total)}`;

  const items = (order.items || []).map((i) => {
    const options = [i.variant, i.size, i.color].filter(Boolean).join(", ");
    return `${i.name}${options ? ` (${options})` : ""} x ${i.quantity} = ${rupees(i.price * i.quantity)}`;
  });
  const a = order.shipping_address;
  const address = a ? [a.name, a.line1, a.line2, a.landmark, [a.city, a.state].filter(Boolean).join(", "), a.pincode && `PIN ${a.pincode}`].filter(Boolean) : [];

  const lines = [
    isService ? "A Plant Doctor consultation was booked and paid." : "A new order was paid.",
    "",
    `Order: ${order.order_id}`,
    `Paid: ${rupees(order.total)}${order.free_shipping ? " (free shipping)" : ""}`,
    "",
    `Customer: ${order.customer_name || "-"}`,
    `Email: ${order.customer_email || "-"}`,
    `Phone: ${order.customer_phone || "-"}`,
    slot ? `Consultation: ${slot}. Send the video link on WhatsApp.` : null,
    "",
    ...items,
    address.length ? "" : null,
    address.length ? "Ship to:" : null,
    ...address,
    "",
    !isService ? `Shipment: ${order.shipment_status || "-"}${order.waybill ? ` (waybill ${order.waybill})` : ""}` : null,
    notes.length ? "" : null,
    ...notes.map((n) => `NEEDS ATTENTION: ${n}`),
    adminUrl ? "" : null,
    adminUrl ? `Open in admin: ${adminUrl}` : null,
  ].filter((l) => l !== null);

  const html = `<div style="font-family:Helvetica,Arial,sans-serif;max-width:560px;color:#111827;">${lines
    .map((l) => (l === "" ? "<br />" : `<p style="margin:2px 0;${l.startsWith("NEEDS ATTENTION") ? "color:#b45309;font-weight:700;" : ""}">${esc(l)}</p>`))
    .join("")}${adminUrl ? `<p style="margin-top:16px;"><a href="${esc(adminUrl)}" style="background:#073b22;color:#fff;padding:10px 18px;border-radius:999px;text-decoration:none;">Open order</a></p>` : ""}</div>`;

  return { subject, text: lines.join("\n"), html };
}
