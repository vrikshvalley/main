import { NextResponse } from "next/server";
import { getOptionalUser } from "@/lib/serverAuth";
import { startCheckout } from "@/lib/server/orders";
import { handleRouteError, jsonError, paymentsUnavailable, rateLimited } from "@/lib/server/http";
import { validateAddress, validateEmail, normalisePhone } from "@/lib/payments/address";
import { isSlotBookable } from "@/lib/payments/slots";

function validAppointment(a) {
  // Same rules the booking page uses (IST, closes 2h before the slot).
  if (!a || !isSlotBookable(a.date, a.time)) return null;
  const clip = (v, n) => (typeof v === "string" ? v.trim().slice(0, n) : "");
  return { date: a.date, time: a.time, plant: clip(a.plant, 80), problem: clip(a.problem, 500) };
}

/**
 * POST /api/payment/create-order
 *
 * Cart:    { items: [{ id, quantity, variant? }], address: {...}, email }
 * Service: { service: "plant-doctor", contact: { name, phone? }, email, appointment: { date, time, plant?, problem? } }
 *
 * Prices everything on the server, creates a "pending_payment" order and the
 * matching Razorpay order. Any amount sent by the browser is ignored.
 */
export async function POST(request) {
  const gate = paymentsUnavailable();
  if (gate) return gate;
  const limited = rateLimited(request, "create-order", { limit: 12 });
  if (limited) return limited;

  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") return jsonError("Invalid request");

    const user = await getOptionalUser(request);
    const email = validateEmail(body.email || user?.email);
    if (!email) return jsonError("Please enter a valid email for the order confirmation", 400, "EMAIL");

    if (body.service) {
      const name = typeof body.contact?.name === "string" ? body.contact.name.trim().slice(0, 80) : "";
      if (name.length < 2) return jsonError("Please enter your name", 400, "NAME");
      const appointment = validAppointment(body.appointment);
      if (!appointment) return jsonError("That time slot is no longer available. Please pick another.", 400, "SLOT");
      const phone = body.contact?.phone ? normalisePhone(body.contact.phone) : "";
      if (body.contact?.phone && !phone) return jsonError("Enter a valid 10-digit mobile number", 400, "PHONE");

      const result = await startCheckout({ kind: "service", user, service: body.service, email, contact: { name, phone }, appointment, saveAddress: false });
      return NextResponse.json({ success: true, ...result });
    }

    const { value: address, errors } = validateAddress(body.address);
    if (errors) return NextResponse.json({ success: false, error: { message: "Please check the delivery address", code: "ADDRESS", fields: errors } }, { status: 400 });

    const items = Array.isArray(body.items)
      ? body.items.map((i) => ({
          id: i?.id,
          quantity: i?.quantity ?? i?.qty,
          variant: i?.variant || null,
          size: i?.size || null,
          color: i?.color || null,
        }))
      : [];

    const result = await startCheckout({ kind: "cart", user, items, address, email, saveAddress: body.saveAddress !== false });
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    return handleRouteError(error, "create-order");
  }
}
