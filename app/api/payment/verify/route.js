import { NextResponse } from "next/server";
import * as razorpayService from "@/lib/services/razorpayService";

/**
 * POST /api/payment/verify
 * Verifies Razorpay payment signature and fetches payment details
 */
export async function POST(request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      await request.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, error: { message: "Missing required fields" } },
        { status: 400 }
      );
    }

    // Verify signature
    const { data: verificationResult, error: verifyError } =
      await razorpayService.verifyPaymentSignature({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      });

    if (verifyError || !verificationResult.verified) {
      return NextResponse.json(
        {
          success: false,
          error: { message: verifyError || "Payment verification failed" },
        },
        { status: 400 }
      );
    }

    // Fetch payment details
    const { data: payment, error: fetchError } =
      await razorpayService.fetchPayment(razorpay_payment_id);

    if (fetchError) {
      return NextResponse.json(
        { success: false, error: { message: fetchError } },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      verified: true,
      orderId: payment.orderId,
      paymentId: payment.id,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      method: payment.method,
      email: payment.email,
      contact: payment.contact,
    });
  } catch (error) {
    console.error("Verify payment API error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Internal server error" } },
      { status: 500 }
    );
  }
}
