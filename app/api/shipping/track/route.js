import { NextResponse } from "next/server";
import * as delhiveryService from "@/lib/services/delhiveryService";

/**
 * POST /api/shipping/track
 * Server-side endpoint for shipment tracking
 * Prevents API key exposure
 */
export async function POST(request) {
  try {
    const { waybill } = await request.json();

    if (!waybill) {
      return NextResponse.json(
        { error: { message: "Waybill is required" } },
        { status: 400 },
      );
    }

    const { data, error } = await delhiveryService.trackShipment(waybill);

    if (error) {
      return NextResponse.json({ error: { message: error } }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: data,
    });
  } catch (error) {
    console.error("Track shipment API error:", error);
    return NextResponse.json(
      { error: { message: "Internal server error" } },
      { status: 500 },
    );
  }
}
