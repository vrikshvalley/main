import { NextResponse } from "next/server";
import * as delhiveryService from "@/lib/services/delhiveryService";

/**
 * POST /api/shipping/calculate-cost
 * Calculates shipping cost based on shipment details
 */
export async function POST(request) {
  try {
    const { originPin, destinationPin, weight, paymentMode, declaredValue } =
      await request.json();

    if (!originPin || !destinationPin || !weight || !declaredValue) {
      return NextResponse.json(
        {
          error: {
            message:
              "Missing required fields: originPin, destinationPin, weight, declaredValue",
          },
        },
        { status: 400 },
      );
    }

    const { data, error } = await delhiveryService.calculateShippingCost({
      originPin,
      destinationPin,
      weight,
      paymentMode: paymentMode || "Prepaid",
      declaredValue,
    });

    if (error) {
      return NextResponse.json({ error: { message: error } }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: data,
    });
  } catch (error) {
    console.error("Calculate cost API error:", error);
    return NextResponse.json(
      { error: { message: "Internal server error" } },
      { status: 500 },
    );
  }
}
