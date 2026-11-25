import { test } from "node:test";
import assert from "node:assert/strict";

import { buildCartItem, mergeCartMaps, toRemoteLines, fromRemoteDoc, normalizeCart, lineKey, defaultOptions, sameCart, MAX_LINE_QUANTITY } from "../lib/cartItems.js";
import { mergeAddress, addressKey } from "../lib/payments/address.js";

const item = (id, qty, extra = {}) => ({ id, qty, quantity: qty, name: `P${id}`, price: 100, ...extra });

test("guest cart merges into the account cart by adding quantities, once", () => {
  const account = { a: item("a", 2), b: item("b", 1) };
  const guest = { b: item("b", 3), c: item("c", 1) };
  const merged = mergeCartMaps(account, guest);
  assert.equal(merged.a.qty, 2);
  assert.equal(merged.b.qty, 4);
  assert.equal(merged.c.qty, 1);
  // inputs are not mutated
  assert.equal(account.b.qty, 1);
  assert.equal(guest.b.qty, 3);
});

test("merging never exceeds the per-line limit", () => {
  const merged = mergeCartMaps({ a: item("a", 40) }, { a: item("a", 40) });
  assert.equal(merged.a.qty, MAX_LINE_QUANTITY);
});

test("merging with an empty guest cart changes nothing", () => {
  const account = { a: item("a", 2) };
  assert.ok(sameCart(mergeCartMaps(account, {}), account));
});

test("different options of one product are different cart lines", () => {
  assert.equal(lineKey({ id: "pot" }), "pot");
  assert.notEqual(lineKey({ id: "pot", size: "Large" }), lineKey({ id: "pot", size: "Small" }));
  assert.notEqual(lineKey({ id: "rubber", variant: "normal" }), lineKey({ id: "rubber", variant: "variegated" }));
  const a = { ...item("pot", 1), key: lineKey({ id: "pot", size: "Large" }), size: "Large" };
  const b = { ...item("pot", 1), key: lineKey({ id: "pot", size: "Small" }), size: "Small" };
  const merged = mergeCartMaps({ [a.key]: a }, { [b.key]: b });
  assert.equal(Object.keys(merged).length, 2);
});

test("an older cart keyed by product id is re-keyed without losing quantities", () => {
  const out = normalizeCart({ pot: item("pot", 2, { size: "Large" }), fern: item("fern", 1) });
  assert.ok(out[lineKey({ id: "pot", size: "Large" })]);
  assert.equal(out.fern.qty, 1);
});

test("Firestore cart stores only product, quantity and options (never prices)", () => {
  const lines = toRemoteLines({ a: item("a", 2, { variant: "Large" }), zero: item("zero", 0) }, "2026-01-01T00:00:00.000Z");
  assert.equal(lines.length, 1);
  assert.deepEqual(lines[0], { product_id: "a", quantity: 2, variant: "Large", size: null, color: null, added_at: "2026-01-01T00:00:00.000Z" });
  assert.equal("price" in lines[0], false);
});

test("reads both the current and the older Firestore cart shapes", () => {
  const now = fromRemoteDoc({ lines: [{ product_id: "a", quantity: 3, size: "Large" }, { product_id: "x", quantity: 0 }] });
  assert.equal(now[lineKey({ id: "a", size: "Large" })].qty, 3);
  assert.equal(Object.keys(now).length, 1);
  const old = fromRemoteDoc({ items: { fern: { product_id: "fern", quantity: 2 } } });
  assert.equal(old.fern.qty, 2);
});

test("the card's quick-add and the product page land on the same line", () => {
  const product = { id: "rubber", variants: [{ label: "normal", price: 399 }, { label: "variegated", price: 499 }], sizes: ["6inch pot"], colors: [] };
  assert.deepEqual(defaultOptions(product), { variant: "normal", size: "6inch pot", color: null });
  assert.deepEqual(defaultOptions({ id: "x", variants: [{ label: "option", price: 5 }], sizes: [], colors: [] }), { variant: null, size: null, color: null });
});

test("a cart item is rebuilt from the live product with the current price and offer", () => {
  const product = { id: "p9", slug: "fern", name: "Fern", price: 249, featured: true, images: [{ url: "https://img/x.jpg" }] };
  const during = buildCartItem(product, { qty: 2 }); // not mocked: uses today's date
  assert.equal(during.id, "p9");
  assert.equal(during.qty, 2);
  assert.equal(during.image, "https://img/x.jpg");
  assert.ok(during.price <= 249 && during.price > 0);
  if (during.regularPrice) assert.ok(during.regularPrice > during.price);

  const variant = buildCartItem({ id: "p2", name: "Pot", price: 100, variants: [{ label: "Large", price: 350 }] }, { variant: "Large" });
  assert.equal(variant.regularPrice === null ? variant.price : variant.regularPrice, 350);
});

test("saved addresses are not duplicated", () => {
  const a = { name: "Riya", pincode: "700029", line1: "12 Lake Road, Flat 3" };
  const list = mergeAddress([], a);
  assert.equal(list.length, 1);
  assert.equal(mergeAddress(list, { ...a, line1: "12 lake road flat 3", phone: "9876543210" }).length, 1);
  assert.equal(mergeAddress(list, { ...a, line1: "99 Other Street" }).length, 2);
  assert.equal(mergeAddress(undefined, null).length, 0);
  assert.equal(addressKey({ pincode: "700 029", line1: "A-1" }), addressKey({ pincode: "700029", line1: "a1" }));
});
