import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/serverAuth";
import { cancelOrderForCustomer } from "@/lib/server/orders";
import { handleRouteError } from "@/lib/server/http";
import { isAdminConfigured } from "@/lib/server/firebaseAdmin";

/**
 * POST /api/orders/:orderId/cancel  { reason? }
 * The signed-in owner can cancel before dispatch; paid orders are refunded in full
 * and the Delhivery shipment (if booked) is cancelled.
 */
export async function POST(request, { params }) {
  const auth = await requireAuth(request);
  if (auth.response) return auth.response;
  if (!isAdminConfigured()) return NextResponse.json({ error: { message: "Not available yet" } }, { status: 503 });

  try {
    const { orderId } = await params;
    const { reason } = (await request.json().catch(() => ({}))) || {};
    const order = await cancelOrderForCustomer({ orderId, uid: auth.user.uid, reason });
    return NextResponse.json({ success: true, status: order.status, paymentStatus: order.payment_status });
  } catch (error) {
    return handleRouteError(error, "cancel-order");
  }
}
