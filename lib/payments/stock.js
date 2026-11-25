/**
 * Stock holds at checkout. When a customer starts paying, the units in their
 * cart are held for 15 minutes so a second buyer cannot start paying for the
 * same last unit. Holds are documents with an expiry (collection
 * `reservations`), so an abandoned checkout releases its stock by itself, with
 * no cleanup job. Pure functions; the Firestore transaction lives in
 * lib/server/orders.js.
 */

export const RESERVATION_MS = 15 * 60 * 1000;

/** Units of a product held by OTHER open checkouts. */
export function reservedByOthers(reservations, productId, ownOrderId, nowMs = Date.now()) {
  let held = 0;
  for (const r of reservations || []) {
    if (!r || r.status !== "active" || r.order_id === ownOrderId || !(r.expires_at > nowMs)) continue;
    held += Number(r.items?.[productId]) || 0;
  }
  return held;
}

/**
 * @param {Record<string, number>} demand       productId -> units wanted
 * @param {Record<string, number>} stocks       productId -> units in stock
 * @param {Array<object>} reservations          reservation documents
 * @returns {{ ok: boolean, shortages: Array<{product_id: string, wanted: number, available: number}> }}
 */
export function checkAvailability(demand, stocks, reservations, ownOrderId, nowMs = Date.now()) {
  const shortages = [];
  for (const [productId, wanted] of Object.entries(demand)) {
    const stock = Number(stocks[productId]);
    if (!Number.isFinite(stock)) continue; // stock not tracked for this product
    const available = Math.max(0, stock - reservedByOthers(reservations, productId, ownOrderId, nowMs));
    if (available < wanted) shortages.push({ product_id: productId, wanted, available });
  }
  return { ok: shortages.length === 0, shortages };
}
