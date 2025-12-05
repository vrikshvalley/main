// API Route: Create Payment with PhonePe
import { NextResponse } from "next/server";
import {
  createPaymentOrder,
  rupeesToPaisa,
} from "@/lib/services/phonepeService";

export async function POST(request) {
  try {
    const { amount, customer, items } = await request.json();

    // Validate required fields
    if (!amount || !customer?.name || !customer?.phone || !customer?.email) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate unique order ID
    const merchantOrderId = `ORDER-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Convert amount from rupees to paisa
    const amountInPaisa = rupeesToPaisa(amount);

    // Prepare payment data
    const paymentData = {
      merchantOrderId,
      amount: amountInPaisa,
      redirectUrl: `${
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      }/sample-order/payment-status?orderId=${merchantOrderId}`,
      metaInfo: {
        udf1: customer.name,
        udf2: customer.email,
        udf3: customer.phone,
        udf4: JSON.stringify(items),
      },
      expireAfter: 1200, // 20 minutes
    };

    // Create payment order with PhonePe
    const { data: paymentOrder, error } = await createPaymentOrder(paymentData);

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: error || "Payment creation failed",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      orderId: merchantOrderId,
      paymentUrl: paymentOrder.paymentUrl,
      amount,
      paymentOrder,
    });
  } catch (error) {
    console.error("Create payment error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}
