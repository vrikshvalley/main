import { NextResponse } from "next/server";
import * as phonepeService from "@/lib/services/phonepeService";

/**
 * POST /api/payment/verify
 * Verifies PhonePe payment by checking order status
 */
export async function POST(request) {
  try {
    const { merchantOrderId } = await request.json();

    if (!merchantOrderId) {
      return NextResponse.json(
        { success: false, error: { message: "Missing merchant order ID" } },
        { status: 400 }
      );
    }

    const { data: verificationResult, error } =
      await phonepeService.verifyPayment(merchantOrderId);

    if (error) {
      return NextResponse.json(
        { success: false, error: { message: error } },
        { status: 400 }
      );
    }

    if (!verificationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: { message: `Payment is in ${verificationResult.state} state` },
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      orderId: verificationResult.orderId,
      merchantOrderId: verificationResult.merchantOrderId,
      transactionId: verificationResult.transactionId,
      amount: verificationResult.amount,
      paymentMode: verificationResult.paymentMode,
      timestamp: verificationResult.timestamp,
    });
  } catch (error) {
    console.error("Verify payment API error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Internal server error" } },
      { status: 500 }
    );
  }
}
