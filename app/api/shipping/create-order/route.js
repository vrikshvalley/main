import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/serverAuth";
import { fulfilOrder } from "@/lib/server/orders";
import { handleRouteError, jsonError } from "@/lib/server/http";

/**
 * POST /api/shipping/create-order  { orderId }   (store staff only)
 *
 * Shipments are booked automatically right after payment. This is the manual
 * retry for orders whose shipment_status is "failed". The order is read from
 * the database; nothing about the parcel comes from the request body.
 */
export async function POST(request) {
  const auth = await requireAdmin(request);
  if (auth.response) return auth.response;

  try {
    const { orderId } = (await request.json().catch(() => ({}))) || {};
    if (!orderId) return jsonError("orderId is required");
    const result = await fulfilOrder(String(orderId));
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    return handleRouteError(error, "shipping-create-order");
  }
}
