/**
 * Pure helpers for Delhivery B2C (CMU) shipment creation.
 *
 * Delhivery's create API (POST /api/cmu/create.json) does NOT take a JSON
 * body: it expects `application/x-www-form-urlencoded` with
 * `format=json&data=<JSON string>`. Sending raw JSON is rejected, which is why
 * shipment creation never worked before.
 */

export const DEFAULT_ITEM_WEIGHT_GRAMS = 500;
export const PACKAGING_GRAMS = 200;

export function apiHost(baseUrl) {
  const fallback = "https://track.delhivery.com";
  if (!baseUrl) return fallback;
  // Accept either "https://track.delhivery.com" or the older ".../api" form.
  return String(baseUrl).replace(/\/+$/, "").replace(/\/api$/, "");
}

export function shipmentWeightGrams(lines) {
  const items = lines.reduce((sum, l) => sum + (l.weightGrams || DEFAULT_ITEM_WEIGHT_GRAMS) * l.quantity, 0);
  return Math.max(items + PACKAGING_GRAMS, 500);
}

/**
 * @param {object} order  Order document (snake_case fields, amounts in paise)
 * @param {object} seller { pickupLocation, name, address, gstin, returnPin, returnCity, returnState, returnPhone, returnAddress }
 */
export function buildShipmentPayload(order, seller) {
  const a = order.shipping_address || {};
  const lines = order.items || [];
  const totalRupees = Math.round(Number(order.total_paise ?? order.total * 100)) / 100;
  const quantity = lines.reduce((s, l) => s + Number(l.quantity || 0), 0);

  return {
    shipments: [
      {
        name: a.name || order.customer_name,
        add: [a.line1, a.line2, a.landmark].filter(Boolean).join(", "),
        pin: a.pincode,
        city: a.city,
        state: a.state,
        country: "India",
        phone: a.phone || order.customer_phone,
        order: order.order_id,
        payment_mode: "Prepaid",
        products_desc: lines
          .map((l) => `${l.name}${[l.variant, l.size, l.color].filter(Boolean).length ? ` (${[l.variant, l.size, l.color].filter(Boolean).join(", ")})` : ""} x ${l.quantity}`)
          .join(", ")
          .slice(0, 400),
        hsn_code: "",
        cod_amount: 0,
        order_date: (order.payment_date || order.order_date || new Date().toISOString()).slice(0, 10),
        total_amount: totalRupees,
        seller_add: seller.address || "",
        seller_name: seller.name || "",
        seller_inv: order.order_id,
        quantity,
        waybill: "",
        shipment_width: 20,
        shipment_height: 30,
        shipment_length: 20,
        weight: shipmentWeightGrams(lines.map((l) => ({ quantity: l.quantity, weightGrams: l.weight_grams }))),
        seller_gst_tin: seller.gstin || "",
        shipping_mode: "Surface",
        address_type: "home",
        return_pin: seller.returnPin || "",
        return_city: seller.returnCity || "",
        return_state: seller.returnState || "",
        return_phone: seller.returnPhone || "",
        return_add: seller.returnAddress || "",
        return_country: "India",
      },
    ],
    pickup_location: { name: seller.pickupLocation },
  };
}

export function encodeCreateBody(payload) {
  return `format=json&data=${encodeURIComponent(JSON.stringify(payload))}`;
}

/** Reads Delhivery's create response into { waybill, status, remarks } or throws. */
export function parseCreateResponse(data) {
  const pkg = data?.packages?.[0];
  if (!data || data.success !== true || !pkg?.waybill) {
    const remarks = [].concat(pkg?.remarks || [], data?.rmk || []).filter(Boolean).join("; ");
    throw new Error(remarks || "Delhivery did not accept the shipment");
  }
  return { waybill: String(pkg.waybill), status: pkg.status || "Manifested", referenceId: pkg.refnum || "", remarks: pkg.remarks || [] };
}

/** Serviceability for a prepaid delivery from Delhivery's pin-code API. */
export function parseServiceability(data, pincode) {
  const pc = data?.delivery_codes?.[0]?.postal_code;
  if (!pc) return { serviceable: false, pincode };
  const embargo = /embargo/i.test(String(pc.remarks || ""));
  return {
    serviceable: pc.pre_paid === "Y" && !embargo,
    pincode: String(pc.pin || pincode),
    city: pc.city || "",
    district: pc.district || "",
    state: pc.state_code || "",
    oda: pc.is_oda === "Y", // out-of-delivery-area: still deliverable, just slower
    cod: pc.cod === "Y" || pc.cash === "Y",
  };
}
