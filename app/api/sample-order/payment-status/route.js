// API Route: Check Payment Status
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/serverAuth";
import { testRoutesDisabled } from "@/lib/server/http";
import { fetchPayment, fetchOrder } from "@/lib/services/razorpayService";

export async function GET(request) {
  const disabled = testRoutesDisabled();
  if (disabled) return disabled;
  const auth = await requireAdmin(request);
  if (auth.response) return auth.response;
  try {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get("paymentId");
    const orderId = searchParams.get("orderId");

    if (!paymentId && !orderId) {
      return NextResponse.json(
        { success: false, error: "Payment ID or Order ID is required" },
        { status: 400 }
      );
    }

    let data, error;

    // Check payment status with Razorpay
    if (paymentId) {
      ({ data, error } = await fetchPayment(paymentId));
    } else if (orderId) {
      ({ data, error } = await fetchOrder(orderId));
    }

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: error || "Failed to check payment status",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      status: data.status,
      data: data,
    });
  } catch (error) {
    console.error("Payment status check error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
