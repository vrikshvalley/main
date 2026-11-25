import { NextResponse } from "next/server";
import * as delhiveryService from "@/lib/services/delhiveryService";
import { rateLimited } from "@/lib/server/http";

/**
 * POST /api/shipping/check-pincode
 * Validates pincode serviceability with Delhivery
 */
export async function POST(request) {
  const limited = rateLimited(request, "pincode", { limit: 30 });
  if (limited) return limited;

  try {
    const { pincode } = await request.json();

    if (typeof pincode !== "string" || !/^[1-9]\d{5}$/.test(pincode)) {
      return NextResponse.json(
        { error: { message: "Invalid pincode. Must be 6 digits." } },
        { status: 400 },
      );
    }

    const { data, error, notServiceable } = await delhiveryService.checkServiceability(pincode);

    if (notServiceable) {
      return NextResponse.json({ success: true, data: { serviceable: false, pincode } });
    }
    if (error) {
      // Lookup failed (courier API down / not configured): say so, don't claim "no delivery".
      return NextResponse.json({ success: false, error: { message: "Could not check this pincode right now", code: "LOOKUP_FAILED" } }, { status: 502 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Check pincode API error:", error);
    return NextResponse.json(
      { error: { message: "Internal server error" } },
      { status: 500 },
    );
  }
}
