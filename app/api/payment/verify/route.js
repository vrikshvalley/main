import { NextResponse, after } from "next/server";
import { confirmPayment, fulfilOrder, getOrderAdmin, linkCustomer } from "@/lib/server/orders";
import { handleRouteError, jsonError, paymentsUnavailable, rateLimited } from "@/lib/server/http";

/**
 * POST /api/payment/verify
 * Body: { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature }
 *
 * Called by the browser after Razorpay Checkout succeeds. The order is only
 * marked paid after (1) the HMAC signature matches and (2) Razorpay confirms
 * the payment belongs to this order and the amount is exactly the order total.
 * Safe to call twice; the Razorpay webhook does the same if the browser never returns.
 */
export async function POST(request) {
  const gate = paymentsUnavailable();
  if (gate) return gate;
  const limited = rateLimited(request, "verify", { limit: 20 });
  if (limited) return limited;

  try {
    const body = await request.json().catch(() => null);
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = body || {};
    if (!orderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return jsonError("Missing payment details");
    }

    const { order } = await confirmPayment({
      orderId: String(orderId),
      razorpayOrderId: String(razorpay_order_id),
      razorpayPaymentId: String(razorpay_payment_id),
      signature: String(razorpay_signature),
    });

    // Quick: attach the order to the customer's account (so the screen can say how to sign in).
    await linkCustomer(order.order_id).catch((e) => console.error("Linking customer failed:", e.message));

    // Slow: book the courier shipment, send the emails and alert the team AFTER the response,
    // so a slow courier or mail server never delays or fails a successful payment.
    after(async () => {
      try {
        await fulfilOrder(order.order_id);
      } catch (e) {
        console.error("Fulfilment after payment failed:", e.message);
      }
    });

    // Re-read: the webhook may have done part of the work first.
    const latest = (await getOrderAdmin(order.order_id).catch(() => null)) || order;

    return NextResponse.json({
      success: true,
      order: {
        orderId: order.order_id,
        kind: order.kind,
        status: order.status,
        paymentStatus: order.payment_status,
        total: order.total,
        email: order.customer_email,
        appointment: order.appointment || null,
        shipment: latest.shipment_status,
        // Lets the confirmation screen tell guests how to sign in later.
        accountCreated: Boolean(latest.account_created),
        accountLinked: Boolean(latest.customer_linked),
      },
    });
  } catch (error) {
    return handleRouteError(error, "verify-payment");
  }
}
