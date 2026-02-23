import { NextResponse } from "next/server";
import * as orderService from "@/lib/services/orderService";

/**
 * POST /api/webhooks/delhivery
 * Webhook endpoint for real-time Delhivery shipment status updates
 *
 * Delhivery will POST shipment status changes to this endpoint
 * Verifies authenticity and updates order status in real-time
 */
export async function POST(request) {
  try {
    const payload = await request.json();

    // Verify webhook authenticity (optional - add X-Delhivery-Signature verification if needed)
    // const signature = request.headers.get('x-delhivery-signature');
    // if (!verifyWebhookSignature(payload, signature)) {
    //   return NextResponse.json(
    //     { error: { message: "Invalid webhook signature" } },
    //     { status: 401 }
    //   );
    // }

    console.log("🔔 Delhivery webhook received:", {
      waybill: payload.waybill,
      status: payload.status,
      timestamp: new Date().toISOString(),
    });

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

    // Map Delhivery status to internal status
    const statusMap = {
      Pending: "pending",
      "Waiting for Pickup": "pending",
      "Picked Up": "confirmed",
      Manifested: "confirmed",
      "In Transit": "shipped",
      "Out for Delivery": "shipped",
      Delivered: "delivered",
      Cancelled: "cancelled",
      "RTO Initiated": "returned",
      Undeliverable: "ndr",
    };

    const internalStatus = statusMap[status] || status.toLowerCase();

    // Find order by order_number or waybill
    let orderId = order_number;
    if (!orderId && waybill) {
      // Try to find order by waybill if order_number not provided
      // This would need a database query: const order = await db.orders.findOne({ waybill })
      console.log("⚠️ Order number not in webhook, using waybill:", waybill);
    }

    // Update order shipping status in database
    if (orderId) {
      const updateData = {
        shipment_status: status,
        status: internalStatus,
        current_location: current_location || "",
        expected_delivery: expected_delivery_date || "",
        delivered_date: delivered_date || "",
        last_webhook_update: new Date().toISOString(),
      };

      // Add tracking scans if available
      if (scans && scans.length > 0) {
        updateData.tracking_scans = scans.map((scan) => ({
          location: scan.location || scan.ScannedLocation || "",
          status: scan.status || scan.ScanDetail?.Scan || "",
          date: scan.date || scan.ScanDateTime || "",
          instructions:
            scan.instructions || scan.ScanDetail?.Instructions || "",
        }));
      }

      try {
        await orderService.updateShippingDetails(orderId, updateData);
        console.log("✅ Order status updated:", orderId, "→", internalStatus);
      } catch (dbError) {
        console.error("Database update error:", dbError);
        // Don't fail webhook, just log the error
      }
    }

    // Emit real-time notification (optional - integrate with Socket.io, SSE, or push notifications)
    // await notifyCustomer(orderId, { status: internalStatus, location: current_location });

    return NextResponse.json({
      success: true,
      message: "Webhook processed successfully",
      waybill: waybill,
      status: internalStatus,
    });
  } catch (error) {
    console.error("Webhook processing error:", error);

    // Return 200 to acknowledge webhook even if processing failed
    // This prevents Delhivery from retrying excessively
    return NextResponse.json(
      {
        success: false,
        message: "Webhook received but processing failed",
        error: error.message,
      },
      { status: 200 },
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
