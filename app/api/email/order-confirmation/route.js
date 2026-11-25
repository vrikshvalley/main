import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/serverAuth";
import { adminDb } from "@/lib/server/firebaseAdmin";
import { fulfilOrder, ORDERS } from "@/lib/server/orders";
import { handleRouteError, jsonError } from "@/lib/server/http";

/**
 * POST /api/email/order-confirmation  { orderId }   (store staff only)
 *
 * Confirmation emails are sent automatically after payment; this resends one.
 * It used to accept a whole order object from any signed-in user, which let
 * anyone send branded emails to any address.
 */
export async function POST(request) {
  const auth = await requireAdmin(request);
  if (auth.response) return auth.response;

  try {
    const { orderId } = (await request.json().catch(() => ({}))) || {};
    if (!orderId) return jsonError("orderId is required");
    const ref = adminDb().collection(ORDERS).doc(String(orderId));
    const snap = await ref.get();
    if (!snap.exists) return jsonError("Order not found", 404);
    const order = snap.data();
    if (order.payment_status !== "paid" || order.status === "cancelled") {
      return jsonError("Confirmation email can only be sent for paid, active orders", 409);
    }
    await ref.update({ email_sent: false });
    const result = await fulfilOrder(String(orderId));
    return NextResponse.json({ success: true, emailSent: result.email });
  } catch (error) {
    return handleRouteError(error, "resend-confirmation");
  }
}
