// API Route: Check Payment Status
import { NextResponse } from "next/server";
import { checkOrderStatus } from "@/lib/services/phonepeService";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const transactionId = searchParams.get("transactionId");

    if (!transactionId) {
      return NextResponse.json(
        { success: false, error: "Transaction ID is required" },
        { status: 400 }
      );
    }

    // Check payment status with PhonePe
    const { data: orderStatus, error } = await checkOrderStatus(transactionId);

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
      status: orderStatus.state,
      data: orderStatus,
    });
  } catch (error) {
    console.error("Payment status check error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
