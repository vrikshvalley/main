import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/serverAuth";
import { requestReturnForCustomer } from "@/lib/server/orders";
import { handleRouteError } from "@/lib/server/http";
import { isAdminConfigured } from "@/lib/server/firebaseAdmin";

/**
 * POST /api/orders/:orderId/return  { reason }
 * The signed-in owner requests a return after delivery; the team reviews it
 * and books the reverse pickup (POST /api/shipping/returns, staff only).
 */
export async function POST(request, { params }) {
  const auth = await requireAuth(request);
  if (auth.response) return auth.response;
  if (!isAdminConfigured()) return NextResponse.json({ error: { message: "Not available yet" } }, { status: 503 });

  try {
    const { orderId } = await params;
    const { reason } = (await request.json().catch(() => ({}))) || {};
    const order = await requestReturnForCustomer({ orderId, uid: auth.user.uid, reason });
    return NextResponse.json({ success: true, status: order.status });
  } catch (error) {
    return handleRouteError(error, "return-order");
  }
}
