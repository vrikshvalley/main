import { NextResponse } from "next/server";
import * as razorpayService from "@/lib/services/razorpayService";

/**
 * POST /api/payment/create-order
 * Creates a Razorpay payment order
 */
export async function POST(request) {
  try {
    const { amount, receipt, customerName, customerEmail } =
      await request.json();

    if (!amount || !receipt) {
      return NextResponse.json(
        { error: { message: "Missing required fields" } },
        { status: 400 }
      );
    }

    // Prepare notes/metadata
    const notes = {
      customerName: customerName || "",
      customerEmail: customerEmail || "",
      source: "Vriksh Valley",
    };

    const { data: order, error } = await razorpayService.createOrder({
      amount, // Amount should already be in paise
      currency: "INR",
      receipt,
      notes,
    });

    if (error) {
      return NextResponse.json({ error: { message: error } }, { status: 500 });
    }

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      status: order.status,
    });
  } catch (error) {
    console.error("Create payment order API error:", error);
    return NextResponse.json(
      { error: { message: "Internal server error" } },
      { status: 500 }
    );
  }
}
