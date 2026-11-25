// API Route: Payment Callback/Webhook from Razorpay
import { NextResponse } from "next/server";
import { testRoutesDisabled } from "@/lib/server/http";
import {
  verifyWebhookSignature,
  fetchPayment,
} from "@/lib/services/razorpayService";

export async function POST(request) {
  const disabled = testRoutesDisabled();
  if (disabled) return disabled;
  try {
    const body = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json(
        { success: false, error: "Missing signature" },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const isValid = verifyWebhookSignature(body, signature);

    if (!isValid) {
      console.error("Invalid webhook signature");
      return NextResponse.json(
        { success: false, error: "Invalid signature" },
        { status: 401 }
      );
    }

    let event;
    try {
      event = JSON.parse(body);
    } catch {
      return NextResponse.json({ success: false, error: "Bad JSON payload" }, { status: 400 });
    }

    // Handle different webhook events
    switch (event?.event) {
      case "payment.captured":
        console.log("Payment captured:", event?.payload?.payment?.entity?.id);
        break;
      case "payment.failed":
        console.log("Payment failed:", event?.payload?.payment?.entity?.id);
        break;
      case "order.paid":
        console.log("Order paid:", event?.payload?.order?.entity?.id);
        break;
      default:
        break;
    }

    return NextResponse.json({
      success: true,
      message: "Webhook processed",
    });
  } catch (error) {
    console.error("Payment webhook error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
