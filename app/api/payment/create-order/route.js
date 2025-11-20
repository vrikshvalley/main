import { NextResponse } from "next/server";
import * as phonepeService from "@/lib/services/phonepeService";

/**
 * POST /api/payment/create-order
 * Creates a PhonePe payment order
 */
export async function POST(request) {
  try {
    const {
      amount,
      merchantOrderId,
      redirectUrl,
      customerName,
      customerEmail,
    } = await request.json();

    if (!amount || !merchantOrderId || !redirectUrl) {
      return NextResponse.json(
        { error: { message: "Missing required fields" } },
        { status: 400 }
      );
    }

    // Prepare metadata
    const metaInfo = {
      udf1: customerName || "",
      udf2: customerEmail || "",
      udf3: "Vriksh Valley Order",
    };

    const { data: order, error } = await phonepeService.createPaymentOrder({
      merchantOrderId,
      amount, // Amount should already be in paisa
      redirectUrl,
      metaInfo,
      expireAfter: 1200, // 20 minutes
    });

    if (error) {
      return NextResponse.json({ error: { message: error } }, { status: 500 });
    }

    return NextResponse.json({
      orderId: order.orderId,
      merchantOrderId: order.merchantOrderId,
      redirectUrl: order.redirectUrl,
      state: order.state,
      expireAt: order.expireAt,
    });
  } catch (error) {
    console.error("Create payment order API error:", error);
    return NextResponse.json(
      { error: { message: "Internal server error" } },
      { status: 500 }
    );
  }
}
