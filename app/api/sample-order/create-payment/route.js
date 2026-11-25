// API Route: Create Payment with Razorpay
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/serverAuth";
import { testRoutesDisabled } from "@/lib/server/http";
import { createOrder, rupeesToPaise } from "@/lib/services/razorpayService";

// GET endpoint for testing Razorpay configuration
export async function GET(request) {
  const disabled = testRoutesDisabled();
  if (disabled) return disabled;
  const auth = await requireAdmin(request);
  if (auth.response) return auth.response;
  try {
    console.log("\n=== Testing Razorpay Configuration ===");

    // Check environment variables
    const config = {
      keyId: process.env.RAZORPAY_KEY_ID ? "✅ Set" : "❌ Missing",
      keySecret: process.env.RAZORPAY_KEY_SECRET ? "✅ Set" : "❌ Missing",
      webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET
        ? "✅ Set"
        : "❌ Missing",
    };

    console.log("Environment Configuration:", config);

    return NextResponse.json({
      success: true,
      message: "Razorpay configuration check",
      config,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Test error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const disabled = testRoutesDisabled();
  if (disabled) return disabled;
  const auth = await requireAdmin(request);
  if (auth.response) return auth.response;
  try {
    const body = await request.json().catch(() => null);
    const { amount, customer, items } = body || {};

    // Validate required fields
    const numAmount = Number(amount);
    if (!Number.isFinite(numAmount) || numAmount < 1 || !customer?.name || !customer?.phone || !customer?.email) {
      return NextResponse.json(
        { success: false, error: "Missing or invalid required fields" },
        { status: 400 }
      );
    }

    // Generate unique order ID
    const receipt = `ORDER-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Convert amount from rupees to paise
    const amountInPaise = rupeesToPaise(amount);

    // Prepare payment data
    const paymentData = {
      amount: amountInPaise,
      currency: "INR",
      receipt,
      notes: {
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        items: JSON.stringify(items),
      },
    };

    // Create Razorpay order
    console.log("\n=== Creating Razorpay Payment Order ===");
    console.log("Receipt ID:", receipt);
    console.log("Amount (paise):", amountInPaise);

    const { data: order, error } = await createOrder(paymentData);

    if (error) {
      console.error("❌ Razorpay order creation failed:", error);
      return NextResponse.json(
        {
          success: false,
          error: error || "Payment creation failed",
        },
        { status: 500 }
      );
    }

    console.log("✅ Razorpay order created successfully");
    console.log("Order ID:", order.id);

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Send public key for frontend
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
