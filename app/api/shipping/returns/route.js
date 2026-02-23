import { NextResponse } from "next/server";
import * as delhiveryService from "@/lib/services/delhiveryService";

/**
 * POST /api/shipping/returns
 * Creates reverse pickup request (RVP QC 3.0) for returns with quality checks
 */
export async function POST(request) {
  try {
    const {
      originalWaybill,
      reason,
      customerName,
      customerPhone,
      returnAddress,
      returnCity,
      returnState,
      returnPin,
    } = await request.json();

    if (
      !originalWaybill ||
      !reason ||
      !customerName ||
      !customerPhone ||
      !returnPin
    ) {
      return NextResponse.json(
        {
          error: {
            message:
              "Missing required fields for return: originalWaybill, reason, customerName, customerPhone, returnPin",
          },
        },
        { status: 400 },
      );
    }

    const { data, error } = await delhiveryService.createReversePickup({
      originalWaybill,
      reason,
      customerName,
      customerPhone,
      returnAddress,
      returnCity,
      returnState,
      returnPin,
    });

    if (error) {
      return NextResponse.json({ error: { message: error } }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: data,
    });
  } catch (error) {
    console.error("Return creation API error:", error);
    return NextResponse.json(
      { error: { message: "Internal server error" } },
      { status: 500 },
    );
  }
}
