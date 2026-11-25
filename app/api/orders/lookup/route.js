import { NextResponse } from "next/server";
import { adminDb, isAdminConfigured } from "@/lib/server/firebaseAdmin";
import { ORDERS } from "@/lib/server/orders";
import { jsonError, rateLimited } from "@/lib/server/http";

/**
 * POST /api/orders/lookup  { orderId, email }
 *
 * Lets a guest check their order without signing in. Both the order id and the
 * email used at checkout must match. A miss always gives the same generic
 * answer, so the endpoint cannot be used to discover which orders exist.
 */
export async function POST(request) {
  const limited = rateLimited(request, "order-lookup", { limit: 8 });
  if (limited) return limited;
  if (!isAdminConfigured()) return jsonError("Order tracking is not available yet.", 503);

  const { orderId, email } = (await request.json().catch(() => ({}))) || {};
  const notFound = () => jsonError("We could not find an order with those details.", 404, "NOT_FOUND");
  if (!orderId || !email) return notFound();

  try {
    const snap = await adminDb().collection(ORDERS).doc(String(orderId).trim().slice(0, 64)).get();
    const o = snap.exists ? snap.data() : null;
    if (!o || String(o.customer_email || "").toLowerCase() !== String(email).trim().toLowerCase()) return notFound();
    if (o.payment_status === "pending") return notFound();

    return NextResponse.json({
      order: {
        order_id: o.order_id,
        order_date: o.order_date,
        kind: o.kind,
        status: o.status,
        payment_status: o.payment_status,
        total: o.total,
        appointment: o.appointment || null,
        items: (o.items || []).map((i) => ({ name: i.name, quantity: i.quantity, options: [i.variant, i.size, i.color].filter(Boolean).join(", ") })),
        shipment_status: o.shipment_status || null,
        waybill: o.waybill || null,
        tracking_url: o.waybill ? `https://www.delhivery.com/track-v2/package/${encodeURIComponent(o.waybill)}` : null,
      },
    });
  } catch (error) {
    console.error("order-lookup failed:", error.message);
    return jsonError("Something went wrong. Please try again.", 500);
  }
}
