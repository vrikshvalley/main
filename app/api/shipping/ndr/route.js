import { NextResponse } from "next/server";
import * as delhiveryService from "@/lib/services/delhiveryService";

/**
 * POST /api/shipping/ndr
 * Handles non-delivery requests (NDR) with action options
 * Supports: reattempt, return, reschedule, instructions
 */
export async function POST(request) {
  try {
    const { waybill, action, reason, actionDetails } = await request.json();

    if (!waybill || !action) {
      return NextResponse.json(
        { error: { message: "Waybill and action are required" } },
        { status: 400 },
      );
    }

    const { data, error } = await delhiveryService.handleNDR({
      waybill,
      action,
      reason: reason || "",
      actionDetails: actionDetails || {},
    });

    if (error) {
      return NextResponse.json({ error: { message: error } }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: data,
    });
  } catch (error) {
    console.error("NDR handling API error:", error);
    return NextResponse.json(
      { error: { message: "Internal server error" } },
      { status: 500 },
    );
  }
}

/**
 * GET /api/shipping/ndr?waybill=XXX
 * Retrieves NDR status for a shipment
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const waybill = searchParams.get("waybill");

    if (!waybill) {
      return NextResponse.json(
        { error: { message: "Waybill is required" } },
        { status: 400 },
      );
    }

    const { data, error } = await delhiveryService.getNDRStatus(waybill);

    if (error) {
      return NextResponse.json({ error: { message: error } }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: data,
    });
  } catch (error) {
    console.error("Get NDR status API error:", error);
    return NextResponse.json(
      { error: { message: "Internal server error" } },
      { status: 500 },
    );
  }
}
