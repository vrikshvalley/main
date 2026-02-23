import { NextResponse } from "next/server";
import * as delhiveryService from "@/lib/services/delhiveryService";

/**
 * POST /api/shipping/check-pincode
 * Validates pincode serviceability with Delhivery
 */
export async function POST(request) {
  try {
    const { pincode } = await request.json();

    if (!pincode || pincode.length !== 6 || !/^\d{6}$/.test(pincode)) {
      return NextResponse.json(
        { error: { message: "Invalid pincode. Must be 6 digits." } },
        { status: 400 },
      );
    }

    const { data, error } = await delhiveryService.checkServiceability(pincode);

    if (error) {
      return NextResponse.json({ error: { message: error } }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: data,
    });
  } catch (error) {
    console.error("Check pincode API error:", error);
    return NextResponse.json(
      { error: { message: "Internal server error" } },
      { status: 500 },
    );
  }
}
