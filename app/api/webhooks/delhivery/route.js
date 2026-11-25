import { NextResponse } from "next/server";
import { applyShipmentUpdate } from "@/lib/server/orders";
import { isAdminConfigured } from "@/lib/server/firebaseAdmin";
import { verifyDelhiveryWebhook } from "@/lib/webhookAuth";

/**
 * POST /api/webhooks/delhivery
 * Webhook endpoint for real-time Delhivery shipment status updates
 *
 * Delhivery will POST shipment status changes to this endpoint
 * Verifies authenticity and updates order status in real-time
 */
export async function POST(request) {
  try {
    // Read the raw body first: the signature is computed over the exact bytes sent.
    const rawBody = await request.text();

    if (!verifyDelhiveryWebhook(request, rawBody)) {
      return NextResponse.json(
        { error: { message: "Invalid webhook signature" } },
        { status: 401 },
      );
    }

    let payload;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: { message: "Invalid JSON payload" } }, { status: 400 });
    }
    if (!payload || typeof payload !== "object") {
      return NextResponse.json({ error: { message: "Invalid payload" } }, { status: 400 });
    }

    // Extract shipment data from webhook
    const {
      waybill,
      order_number,
      status,
      scans = [],
      current_location,
      expected_delivery_date,
      delivered_date,
    } = payload;

    if (!waybill) {
      return NextResponse.json(
        { error: { message: "Waybill is required in webhook payload" } },
        { status: 400 },
      );
    }

    if (!isAdminConfigured()) {
      return NextResponse.json({ error: { message: "Not configured" } }, { status: 503 });
    }

    // Matched by order number when present (and cross-checked against the
    // stored waybill), otherwise by waybill. Unknown parcels are ignored.
    const applied = await applyShipmentUpdate({
      waybill: String(waybill),
      orderId: order_number ? String(order_number) : null,
      status,
      location: current_location || scans?.[0]?.location || scans?.[0]?.ScannedLocation || "",
      deliveredAt: delivered_date || null,
      expectedDeliveryDate: expected_delivery_date || null,
    });
    const internalStatus = applied?.status || null;

    return NextResponse.json({
      success: true,
      message: "Webhook processed successfully",
      waybill: waybill,
      status: internalStatus,
    });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Webhook processing failed",
        error: error.message,
      },
      { status: 500 },
    );
  }
}

/**
 * GET /api/webhooks/delhivery
 * Health check endpoint for webhook verification
 */
export async function GET(request) {
  return NextResponse.json({
    success: true,
    message: "Delhivery webhook endpoint is active",
    timestamp: new Date().toISOString(),
  });
}
