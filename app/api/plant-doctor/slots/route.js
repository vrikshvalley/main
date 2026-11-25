import { NextResponse } from "next/server";
import { takenSlotIds } from "@/lib/server/orders";
import { isAdminConfigured } from "@/lib/server/firebaseAdmin";
import { istDateKey } from "@/lib/payments/slots";
import { rateLimited } from "@/lib/server/http";

/**
 * GET /api/plant-doctor/slots
 * Consultation slots nobody else can book right now (booked, or being paid for).
 * Returns ids only ("2026-11-27|15:00"), no personal data.
 */
export async function GET(request) {
  const limited = rateLimited(request, "pd-slots", { limit: 60 });
  if (limited) return limited;

  let taken = [];
  if (isAdminConfigured()) {
    try {
      taken = await takenSlotIds(istDateKey());
    } catch (e) {
      console.error("slots lookup failed:", e.message);
    }
  }
  return NextResponse.json({ taken }, { headers: { "Cache-Control": "no-store" } });
}
