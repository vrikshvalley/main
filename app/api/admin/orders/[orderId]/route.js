import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/serverAuth";
import { getOrderForAdmin, runAdminAction } from "@/lib/server/adminOrders";
import { handleRouteError, jsonError } from "@/lib/server/http";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  const auth = await requireAdmin(request);
  if (auth.response) return auth.response;
  try {
    const { orderId } = await params;
    const order = await getOrderForAdmin(orderId);
    if (!order) return jsonError("Order not found", 404);
    return NextResponse.json({ order }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return handleRouteError(error, "admin-order");
  }
}

/** POST { action, note }  actions: retry_shipment, resend_email, cancel_refund, resolve_attention, add_note */
export async function POST(request, { params }) {
  const auth = await requireAdmin(request);
  if (auth.response) return auth.response;
  try {
    const { orderId } = await params;
    const { action, note } = (await request.json().catch(() => ({}))) || {};
    const result = await runAdminAction(orderId, String(action || ""), { note }, auth.user.email || auth.user.uid);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    return handleRouteError(error, "admin-order-action");
  }
}
