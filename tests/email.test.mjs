import { test } from "node:test";
import assert from "node:assert/strict";
import { generateOrderConfirmationHTML, generateOrderConfirmationText } from "../lib/services/emailService.js";
import { isSlotBookable, openSlots, bookingDays, istDateKey, slotId } from "../lib/payments/slots.js";
import { checkAvailability, reservedByOthers, RESERVATION_MS } from "../lib/payments/stock.js";

const base = {
  orderId: "ORD-20261126-ABCD1234",
  customerName: "Riya Sen",
  orderDate: "2026-11-26T10:00:00.000Z",
  items: [{ name: "Snake Plant", quantity: 2, price: 399, image: "https://img/x.jpg" }],
  total: 798,
};

test("order email renders a delivery address without an 'undefined' locality", () => {
  const html = generateOrderConfirmationHTML({ ...base, shippingAddress: { name: "Riya Sen", line1: "12 Lake Road", city: "Kolkata", state: "West Bengal", pincode: "700029" } });
  assert.ok(html.includes("12 Lake Road"));
  assert.ok(!html.includes("undefined"));
  const text = generateOrderConfirmationText({ ...base, shippingAddress: { line1: "12 Lake Road", city: "Kolkata", state: "West Bengal", pincode: "700029" } });
  assert.ok(!text.includes("undefined"));
});

test("a Plant Doctor order (no address) renders, with the appointment", () => {
  const order = { ...base, items: [{ name: "Plant Doctor", quantity: 1, price: 49, image: null }], total: 49, shippingAddress: null, appointment: { date: "2026-11-28", time: "15:00", dateLabel: "Saturday, 28 November", timeLabel: "3 PM" } };
  const html = generateOrderConfirmationHTML(order);
  assert.ok(html.includes("Saturday, 28 November"));
  assert.ok(html.includes("3 PM"));
  assert.ok(!html.includes("Delivering to"));
  assert.ok(generateOrderConfirmationText(order).includes("3 PM"));
});

test("customer-supplied text cannot inject HTML into the email", () => {
  const html = generateOrderConfirmationHTML({
    ...base,
    customerName: '<img src=x onerror=alert(1)>',
    shippingAddress: { name: "<b>x</b>", line1: '"><script>alert(1)</script>', city: "K", state: "W", pincode: "700029" },
  });
  assert.ok(!html.includes("<script>"));
  assert.ok(!html.includes("<img src=x"));
  assert.ok(html.includes("&lt;script&gt;"));
});

// ---------- Plant Doctor slots (India time) ----------

test("a slot closes two hours before it starts", () => {
  const day = "2026-11-26";
  assert.equal(isSlotBookable(day, "12:00", new Date("2026-11-26T09:00:00+05:30")), true); // 3h ahead
  assert.equal(isSlotBookable(day, "12:00", new Date("2026-11-26T10:30:00+05:30")), false); // 1.5h ahead
  assert.equal(isSlotBookable(day, "12:00", new Date("2026-11-26T13:00:00+05:30")), false); // already past
});

test("rejects bad slot input and slots too far ahead", () => {
  const now = new Date("2026-11-26T09:00:00+05:30");
  assert.equal(isSlotBookable("2026-11-30", "13:00", now), false);
  assert.equal(isSlotBookable("nope", "12:00", now), false);
  assert.equal(isSlotBookable("2026-12-20", "12:00", now), false);
});

test("booking days follow India's calendar, and late in the day today has no slots", () => {
  const lateIST = new Date("2026-11-26T18:30:00+05:30"); // after the 5 PM slot's cut-off
  assert.equal(istDateKey(lateIST), "2026-11-26");
  assert.equal(openSlots("2026-11-26", lateIST).length, 0);
  assert.equal(openSlots("2026-11-27", lateIST).length, 3);
  assert.equal(bookingDays(lateIST).length, 7);
});

test("a slot someone else has booked (or is paying for) is not offered", () => {
  const now = new Date("2026-11-26T09:00:00+05:30");
  const taken = new Set([slotId("2026-11-27", "15:00")]);
  assert.deepEqual(openSlots("2026-11-27", now, taken).map((t) => t.value), ["12:00", "17:00"]);
  assert.equal(openSlots("2026-11-27", now).length, 3);
});

// ---------- stock holds ----------

test("a held unit is not available to a second buyer, and frees up when the hold expires", () => {
  const now = 1_000_000;
  const holds = [{ order_id: "A", status: "active", expires_at: now + RESERVATION_MS, items: { fern: 1 } }];
  const second = checkAvailability({ fern: 1 }, { fern: 1 }, holds, "B", now);
  assert.equal(second.ok, false);
  assert.deepEqual(second.shortages[0], { product_id: "fern", wanted: 1, available: 0 });
  // after the hold expires the unit is free again
  assert.equal(checkAvailability({ fern: 1 }, { fern: 1 }, holds, "B", now + RESERVATION_MS + 1).ok, true);
  // the holder itself is never blocked by its own hold (retrying the same checkout)
  assert.equal(checkAvailability({ fern: 1 }, { fern: 1 }, holds, "A", now).ok, true);
});

test("released and consumed holds do not block stock; untracked stock is ignored", () => {
  const now = 1_000_000;
  const holds = [
    { order_id: "A", status: "released", expires_at: now + 1000, items: { fern: 5 } },
    { order_id: "C", status: "consumed", expires_at: now + 1000, items: { fern: 5 } },
  ];
  assert.equal(reservedByOthers(holds, "fern", "B", now), 0);
  assert.equal(checkAvailability({ fern: 3 }, { fern: 5 }, holds, "B", now).ok, true);
  assert.equal(checkAvailability({ x: 3 }, {}, [], "B", now).ok, true);
});

// ---------- owner alerts ----------
import { buildOwnerAlert } from "../lib/payments/alerts.js";

test("the team's alert for a paid order lists the customer, items with options and the address", () => {
  const a = buildOwnerAlert(
    { order_id: "ORD-1", kind: "cart", total: 798, free_shipping: true, customer_name: "Riya", customer_email: "r@x.co", customer_phone: "9876543210", items: [{ name: "Ganda Pot", quantity: 2, price: 399, size: "Large" }], shipping_address: { name: "Riya", line1: "12 Lake Rd", city: "Kolkata", state: "WB", pincode: "700029" }, shipment_status: "created", waybill: "123" },
    { adminUrl: "https://admin.example/admin/orders/ORD-1" }
  );
  assert.ok(a.subject.includes("ORD-1") && a.subject.includes("798"));
  assert.ok(a.text.includes("Ganda Pot (Large) x 2"));
  assert.ok(a.text.includes("12 Lake Rd"));
  assert.ok(!a.subject.includes("Needs attention"));
});

test("a failed shipment or oversell is flagged in the subject and the body", () => {
  const a = buildOwnerAlert({ order_id: "ORD-2", kind: "cart", total: 100, items: [], shipment_status: "failed", shipment_error: "Pickup location invalid", attention_reasons: ["oversold"] });
  assert.ok(a.subject.startsWith("[Needs attention]"));
  assert.ok(a.text.includes("Pickup location invalid"));
  assert.ok(a.text.includes("Stock ran short"));
});

test("a Plant Doctor booking alert says when to send the video link and escapes customer text", () => {
  const a = buildOwnerAlert({ order_id: "ORD-3", kind: "service", total: 49, customer_name: "<b>x</b>", items: [], appointment: { date: "2026-11-28", time: "15:00" } });
  assert.ok(a.subject.includes("Plant Doctor") && a.subject.includes("15:00"));
  assert.ok(a.text.includes("video link"));
  assert.ok(!a.html.includes("<b>x</b>"));
});
