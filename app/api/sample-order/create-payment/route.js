// API Route: Create Payment with PhonePe
import { NextResponse } from "next/server";
import {
  createPaymentOrder,
  rupeesToPaisa,
  authenticate,
} from "@/lib/services/phonepeService";

// GET endpoint for testing authentication
export async function GET(request) {
  try {
    console.log("\n=== Testing PhonePe Authentication ===");

    // Check environment variables
    const config = {
      clientId: process.env.PHONEPE_CLIENT_ID ? "✅ Set" : "❌ Missing",
      clientSecret: process.env.PHONEPE_CLIENT_SECRET ? "✅ Set" : "❌ Missing",
      clientVersion: process.env.PHONEPE_CLIENT_VERSION
        ? "✅ Set"
        : "❌ Missing",
      merchantId: process.env.PHONEPE_MERCHANT_ID ? "✅ Set" : "❌ Missing",
      baseUrl: process.env.PHONEPE_BASE_URL || "Using default",
      authUrl: process.env.PHONEPE_AUTH_URL || "Using default",
    };

    console.log("Environment Configuration:", config);

    // Test authentication
    const { data: token, error } = await authenticate();

    if (error) {
      console.error("❌ Authentication failed:", error);
      return NextResponse.json(
        {
          success: false,
          message: "PhonePe authentication failed",
          error,
          config,
        },
        { status: 500 }
      );
    }

    console.log("✅ Authentication successful");
    console.log("Token (first 20 chars):", token?.substring(0, 20) + "...");

    return NextResponse.json({
      success: true,
      message: "PhonePe authentication successful",
      config,
      tokenPreview: token?.substring(0, 20) + "...",
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
    console.log("\n=== Creating PhonePe Payment Order ===");
    console.log("Merchant Order ID:", merchantOrderId);
    console.log("Amount (paisa):", amountInPaisa);

    const { data: paymentOrder, error } = await createPaymentOrder(paymentData);

    if (error) {
      console.error("❌ Payment creation failed:", error);
      return NextResponse.json(
        {
          success: false,
          error: error || "Payment creation failed",
          details: paymentData,
        },
        { status: 500 }
      );
    }

    console.log("✅ Payment order created successfully");

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
