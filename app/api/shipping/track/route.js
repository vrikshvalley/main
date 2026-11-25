import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/serverAuth";
import { adminDb, isAdminConfigured } from "@/lib/server/firebaseAdmin";
import { rateLimited } from "@/lib/server/http";
import * as delhiveryService from "@/lib/services/delhiveryService";

/**
 * POST /api/shipping/track
 * Authenticated endpoint for shipment tracking (prevents anonymous waybill enumeration & API quota abuse).
 */
export async function POST(request) {
  const limited = rateLimited(request, "shipping-track", { limit: 20 });
  if (limited) return limited;

  const auth = await requireAuth(request);
  if (auth.response) return auth.response;

  try {
    const body = await request.json().catch(() => null);
    const waybill = typeof body?.waybill === "string" ? body.waybill.trim() : "";

    if (!waybill) {
      return NextResponse.json(
        { error: { message: "Waybill is required" } },
        { status: 400 },
      );
    }

    if (isAdminConfigured() && !auth.user.admin) {
      const q = await adminDb().collection("orders").where("waybill", "==", waybill).limit(1).get();
      if (!q.empty && q.docs[0].data().user_id !== auth.user.uid) {
        return NextResponse.json({ error: { message: "Order not found" } }, { status: 404 });
      }
    }

    const { data, error } = await delhiveryService.trackShipment(waybill);

    if (error) {
      return NextResponse.json({ error: { message: error } }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: data,
    });
  } catch (error) {
    console.error("Track shipment API error:", error);
    return NextResponse.json(
      { error: { message: "Internal server error" } },
      { status: 500 },
    );
  }
}
