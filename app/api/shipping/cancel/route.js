import { NextResponse } from "next/server";
import * as delhiveryService from "@/lib/services/delhiveryService";

/**
 * POST /api/shipping/cancel
 * Cancels a shipment before dispatch
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

    const { data, error } = await delhiveryService.cancelShipment(waybill);

    if (error) {
      return NextResponse.json({ error: { message: error } }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: data,
    });
  } catch (error) {
    console.error("Cancel shipment API error:", error);
    return NextResponse.json(
      { error: { message: "Internal server error" } },
      { status: 500 },
    );
  }
}
