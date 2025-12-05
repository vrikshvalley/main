// API Route: Payment Callback from PhonePe
import { NextResponse } from "next/server";
import { verifyPayment } from "@/lib/services/phonepeService";

export async function POST(request) {
  try {
    const body = await request.json();

    // PhonePe sends various payment status updates
    const { merchantOrderId, paymentStatus, transactionId } = body;

    if (!merchantOrderId) {
      return NextResponse.json(
        { success: false, error: "Invalid callback data" },
        { status: 400 }
      );
    }

    // Verify payment status with PhonePe
    const { data: verificationData, error } = await verifyPayment(
      merchantOrderId
    );

    if (error) {
      console.error("Payment verification failed:", error);
      return NextResponse.json(
        { success: false, error: "Payment verification failed" },
        { status: 400 }
      );
    }

    // Log payment status
    console.log("Payment callback received:", {
      orderId: merchantOrderId,
      status: verificationData.state,
      transactionId: verificationData.transactionId,
      amount: verificationData.amount,
    });

    // Here you would typically:
    // 1. Update order status in database
    // 2. Send confirmation email
    // 3. Trigger shipping process

    return NextResponse.json({
      success: true,
      message: "Payment callback processed",
      status: verificationData.state,
    });
  } catch (error) {
    console.error("Payment callback error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
