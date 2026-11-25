// Run: npm test   (Node's built-in test runner; no extra dependencies)
import { test } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";

import { isValidPaymentSignature, isValidWebhookSignature, safeEqualHex } from "../lib/payments/signature.js";
import { priceCart, priceService, PricingError } from "../lib/payments/pricing.js";
import { normalizeProductRecord } from "../lib/productPricing.js";
import { validateAddress, normalisePhone, validateEmail } from "../lib/payments/address.js";
import {
  apiHost,
  buildShipmentPayload,
  encodeCreateBody,
  parseCreateResponse,
  parseServiceability,
} from "../lib/payments/delhiveryPayload.js";

const SECRET = "test_secret_123";
const sign = (msg, secret = SECRET) => crypto.createHmac("sha256", secret).update(msg).digest("hex");

// ---------- signatures ----------

test("accepts a genuine checkout signature", () => {
  const signature = sign("order_ABC|pay_XYZ");
  assert.equal(isValidPaymentSignature({ razorpayOrderId: "order_ABC", razorpayPaymentId: "pay_XYZ", signature, secret: SECRET }), true);
});

test("rejects a signature for a different payment, order or secret", () => {
  const signature = sign("order_ABC|pay_XYZ");
  assert.equal(isValidPaymentSignature({ razorpayOrderId: "order_ABC", razorpayPaymentId: "pay_OTHER", signature, secret: SECRET }), false);
  assert.equal(isValidPaymentSignature({ razorpayOrderId: "order_OTHER", razorpayPaymentId: "pay_XYZ", signature, secret: SECRET }), false);
  assert.equal(isValidPaymentSignature({ razorpayOrderId: "order_ABC", razorpayPaymentId: "pay_XYZ", signature: sign("order_ABC|pay_XYZ", "wrong"), secret: SECRET }), false);
});

test("rejects missing pieces and a missing secret (fails closed)", () => {
  const signature = sign("order_ABC|pay_XYZ");
  assert.equal(isValidPaymentSignature({ razorpayOrderId: "order_ABC", razorpayPaymentId: "pay_XYZ", signature, secret: "" }), false);
  assert.equal(isValidPaymentSignature({ razorpayOrderId: "", razorpayPaymentId: "pay_XYZ", signature, secret: SECRET }), false);
  assert.equal(isValidPaymentSignature({ razorpayOrderId: "order_ABC", razorpayPaymentId: "pay_XYZ", signature: "", secret: SECRET }), false);
  assert.equal(safeEqualHex("abc", "abcd"), false);
});

test("webhook signature is checked over the exact raw body", () => {
  const body = JSON.stringify({ event: "payment.captured", payload: {} });
  assert.equal(isValidWebhookSignature({ rawBody: body, signature: sign(body), secret: SECRET }), true);
  assert.equal(isValidWebhookSignature({ rawBody: body + " ", signature: sign(body), secret: SECRET }), false);
  assert.equal(isValidWebhookSignature({ rawBody: body, signature: undefined, secret: SECRET }), false);
});

// ---------- pricing ----------

const catalogue = {
  p1: { id: "p1", name: "Snake Plant", price: 399, stock: 5, category: "Plants" },
  p2: { id: "p2", name: "Pot", price: 249.5, stock: 2, category: "Planters", variants: [{ label: "Large", price: 349 }] },
  p3: { id: "p3", name: "Custom Garden", price: 0, priceOnCustomization: true },
  p4: { id: "p4", name: "Gone", price: 100, stock: 0 },
};
const lookup = async (id) => catalogue[id] || null;
// A date with no running offers, so prices are the catalogue prices.
// A day when no repeating offer is running (offers cycle deterministically, so this stays true).
const NO_OFFERS = new Date("2030-01-30T11:30:00+05:30");

test("prices the cart on the server in paise, ignoring any client price", async () => {
  const r = await priceCart([{ id: "p1", quantity: 2, price: 1 }], lookup, { now: NO_OFFERS });
  assert.equal(r.subtotalPaise, 79800);
  assert.equal(r.shippingPaise, 0);
  assert.equal(r.totalPaise, 79800);
  assert.equal(r.lines[0].unitPaise, 39900);
});

test("uses the variant price and avoids float drift", async () => {
  const r = await priceCart([{ id: "p2", quantity: 1, variant: "Large" }, { id: "p2", quantity: 1 }], lookup, { now: NO_OFFERS });
  assert.equal(r.totalPaise, 34900 + 24950);
});

test("merges duplicate lines and enforces stock across them", async () => {
  await assert.rejects(priceCart([{ id: "p2", quantity: 2 }, { id: "p2", quantity: 1 }], lookup, { now: NO_OFFERS }), (e) => e instanceof PricingError && e.code === "OUT_OF_STOCK");
  await assert.rejects(priceCart([{ id: "p4", quantity: 1 }], lookup, { now: NO_OFFERS }), (e) => e.code === "OUT_OF_STOCK");
});

test("rejects bad quantities, unknown products and price-on-request items", async () => {
  for (const q of [0, -1, 1.5, 51, "two", null]) {
    await assert.rejects(priceCart([{ id: "p1", quantity: q }], lookup, { now: NO_OFFERS }), (e) => e.code === "INVALID_ITEM");
  }
  await assert.rejects(priceCart([{ id: "nope", quantity: 1 }], lookup), (e) => e.code === "NOT_FOUND");
  await assert.rejects(priceCart([{ id: "p3", quantity: 1 }], lookup), (e) => e.code === "PRICE_ON_REQUEST");
  await assert.rejects(priceCart([], lookup), (e) => e.code === "EMPTY_CART");
});

test("applies a running offer exactly as the site shows it", async () => {
  // Featured offer from lib/offers.js (15% off featured products) while it runs.
  const featured = { p9: { id: "p9", name: "Fern", price: 249, stock: 9, featured: true } };
  const r = await priceCart([{ id: "p9", quantity: 1 }], async (id) => featured[id], { now: new Date("2026-11-26T12:00:00+05:30") });
  assert.equal(r.lines[0].unitPaise, 21200); // round(249 * 0.85) = 212
  assert.equal(r.savingsPaise, 3700);
});

test("services are priced from the server list only", () => {
  assert.equal(priceService("plant-doctor", { "plant-doctor": 49 }).totalPaise, 4900);
  assert.throws(() => priceService("__proto__", { "plant-doctor": 49 }), PricingError);
  assert.throws(() => priceService("free-stuff", { "plant-doctor": 49 }), PricingError);
});

// ---------- address ----------

test("normalises Indian mobile numbers", () => {
  assert.equal(normalisePhone("+91 98765 43210"), "9876543210");
  assert.equal(normalisePhone("09876543210"), "9876543210");
  assert.equal(normalisePhone("12345"), null);
  assert.equal(normalisePhone("5876543210"), null);
});

test("validates a delivery address", () => {
  const ok = validateAddress({ name: "Riya Sen", phone: "9876543210", line1: "12 Lake Road", city: "Kolkata", state: "West Bengal", pincode: "700029" });
  assert.ok(ok.value);
  const bad = validateAddress({ name: "R", phone: "1", line1: "x", city: "", state: "", pincode: "012345" });
  assert.deepEqual(Object.keys(bad.errors).sort(), ["city", "line1", "name", "phone", "pincode", "state"]);
  assert.equal(validateEmail("A@B.co"), "a@b.co");
  assert.equal(validateEmail("nope"), null);
});

// ---------- Delhivery ----------

test("accepts both host forms for the Delhivery base URL", () => {
  assert.equal(apiHost("https://track.delhivery.com/api"), "https://track.delhivery.com");
  assert.equal(apiHost("https://staging-express.dlv.in/"), "https://staging-express.dlv.in");
  assert.equal(apiHost(""), "https://track.delhivery.com");
});

test("builds a prepaid shipment and form-encodes it the way Delhivery expects", () => {
  const order = {
    order_id: "ORD-20261126-ABCD1234",
    customer_name: "Riya Sen",
    customer_phone: "9876543210",
    total_paise: 79800,
    order_date: "2026-11-26T10:00:00.000Z",
    items: [{ name: "Snake Plant", quantity: 2, weight_grams: null }],
    shipping_address: { name: "Riya Sen", phone: "9876543210", line1: "12 Lake Road", line2: "", landmark: "Near park", city: "Kolkata", state: "West Bengal", pincode: "700029" },
  };
  const payload = buildShipmentPayload(order, { pickupLocation: "VV Nursery", name: "Vriksh Valley" });
  const s = payload.shipments[0];
  assert.equal(s.payment_mode, "Prepaid");
  assert.equal(s.cod_amount, 0);
  assert.equal(s.total_amount, 798);
  assert.equal(s.add, "12 Lake Road, Near park");
  assert.equal(s.weight, 1200); // 2 x 500 g + 200 g packaging
  assert.equal(payload.pickup_location.name, "VV Nursery");

  const body = encodeCreateBody(payload);
  assert.ok(body.startsWith("format=json&data="));
  assert.deepEqual(JSON.parse(decodeURIComponent(body.slice("format=json&data=".length))), payload);
});

test("parses Delhivery create and serviceability responses", () => {
  assert.equal(parseCreateResponse({ success: true, packages: [{ waybill: "123", status: "Success", refnum: "ORD-1" }] }).waybill, "123");
  assert.throws(() => parseCreateResponse({ success: false, rmk: "Pickup location invalid", packages: [] }), /Pickup location invalid/);

  const ok = parseServiceability({ delivery_codes: [{ postal_code: { pin: 700029, pre_paid: "Y", is_oda: "Y", city: "Kolkata", remarks: "" } }] }, "700029");
  assert.equal(ok.serviceable, true);
  assert.equal(ok.oda, true);
  assert.equal(parseServiceability({ delivery_codes: [{ postal_code: { pre_paid: "Y", remarks: "Embargo" } }] }, "1").serviceable, false);
  assert.equal(parseServiceability({ delivery_codes: [] }, "999999").serviceable, false);
});

// ---------- real catalogue shapes ----------

test("charges the price the site displays (first variant), not the raw price field", async () => {
  // Real records: the raw `price` disagrees with the displayed variant price.
  const alocasia = normalizeProductRecord({ id: "Alocasia", name: "Alocasia", price: 349, stock: 10, category: "Plants", variants: [{ label: "option", id: "option", price: 689 }] });
  const tray = normalizeProductRecord({ id: "Tray", name: "Tray", price: 359, stock: 10, category: "Planters", variants: [{ label: "option", id: "option", price: 249 }] });
  const get = async (id) => ({ Alocasia: alocasia, Tray: tray })[id] || null;
  const r = await priceCart([{ id: "Alocasia", quantity: 1 }, { id: "Tray", quantity: 1 }], get, { now: NO_OFFERS });
  assert.equal(r.lines[0].unitPaise, 68900);
  assert.equal(r.lines[1].unitPaise, 24900);
});

test("a multi-variant product is priced by the chosen variant", async () => {
  const rubber = normalizeProductRecord({ id: "Rubber", name: "Rubber Plant", price: 399, stock: 5, category: "Plants", variants: [{ label: "normal", id: "normal", price: 399 }, { label: "variegated", id: "variegated", price: 499 }] });
  const get = async () => rubber;
  assert.equal((await priceCart([{ id: "Rubber", quantity: 1, variant: "variegated" }], get, { now: NO_OFFERS })).totalPaise, 49900);
  assert.equal((await priceCart([{ id: "Rubber", quantity: 1 }], get, { now: NO_OFFERS })).totalPaise, 39900);
});

test("quote-only products (price shown as 0) cannot be bought online", async () => {
  const moss = normalizeProductRecord({ id: "Moss", name: "Moss Wall", price: 0, stock: 3, variants: [{ label: "option", price: 0 }] });
  await assert.rejects(priceCart([{ id: "Moss", quantity: 1 }], async () => moss, { now: NO_OFFERS }), (e) => e.code === "PRICE_ON_REQUEST");
});

test("a Large and a Small of one product are separate order lines with their options kept", async () => {
  const pot = normalizeProductRecord({ id: "Pot", name: "Ganda Pot", price: 299, stock: 10, category: "Planters", sizes: ["Large", "Small"], colors: [], variants: [{ label: "option", price: 299 }] });
  const r = await priceCart([{ id: "Pot", quantity: 1, size: "Large" }, { id: "Pot", quantity: 2, size: "Small" }], async () => pot, { now: NO_OFFERS });
  assert.equal(r.lines.length, 2);
  assert.deepEqual(r.lines.map((l) => l.size), ["Large", "Small"]);
  assert.equal(r.totalPaise, 29900 * 3);
});

test("a size the product does not offer is rejected, an option on a product without one is ignored", async () => {
  const pot = normalizeProductRecord({ id: "Pot", name: "Ganda Pot", price: 299, stock: 10, sizes: ["Large"], colors: [], variants: [{ label: "option", price: 299 }] });
  await assert.rejects(priceCart([{ id: "Pot", quantity: 1, size: "Huge" }], async () => pot, { now: NO_OFFERS }), (e) => e.code === "INVALID_OPTION");
  const r = await priceCart([{ id: "Pot", quantity: 1, color: "Red" }], async () => pot, { now: NO_OFFERS });
  assert.equal(r.lines[0].color, null);
});
