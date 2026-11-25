import { NextResponse, after } from "next/server";
import { isValidWebhookSignature } from "@/lib/payments/signature";
import { confirmPayment, fulfilOrder, markRefunded, recordPaymentFailure, getOrderAdmin, findOrderIdByRazorpayOrder } from "@/lib/server/orders";
import { isAdminConfigured } from "@/lib/server/firebaseAdmin";

/**
 * POST /api/webhooks/razorpay
 *
 * Razorpay Dashboard > Settings > Webhooks:
 *   URL     https://<your-domain>/api/webhooks/razorpay
 *   Secret  RAZORPAY_WEBHOOK_SECRET
 *   Events  payment.captured, payment.failed, order.paid, refund.processed
 *
 * The safety net for customers who pay and then close the tab: the order is
 * still confirmed and fulfilled. Duplicate deliveries are harmless (confirm is
 * idempotent). Unsigned or mis-signed requests are rejected.
 */
export async function POST(request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!isValidWebhookSignature({ rawBody, signature, secret: process.env.RAZORPAY_WEBHOOK_SECRET })) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }
  if (!isAdminConfigured()) {
    // 5xx makes Razorpay retry later instead of dropping the event.
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Bad payload" }, { status: 400 });
  }

  try {
    const payment = event.payload?.payment?.entity;
    const rzpOrder = event.payload?.order?.entity;
    const orderId =
      rzpOrder?.notes?.order_id ||
      rzpOrder?.receipt ||
      (await findOrderIdByRazorpayOrder(payment?.order_id || rzpOrder?.id)) ||
      payment?.notes?.order_id;

    switch (event.event) {
      case "payment.captured":
      case "order.paid": {
        if (!orderId || !payment?.id) break;
        const existing = await getOrderAdmin(orderId);
        if (!existing) break; // not one of ours (e.g. a sample/test payment)
        await confirmPayment({
          orderId,
          razorpayOrderId: payment.order_id || rzpOrder?.id,
          razorpayPaymentId: payment.id,
          trustedWebhook: true,
        });
        // Respond to Razorpay straight away; fulfilment (courier, emails) continues after.
        after(() => fulfilOrder(orderId).catch((e) => console.error("Webhook fulfilment:", e.message)));
        break;
      }
      case "payment.failed": {
        if (orderId) {
          await recordPaymentFailure({
            orderId,
            razorpayOrderId: payment?.order_id || rzpOrder?.id,
            razorpayPaymentId: payment?.id,
            reason: payment?.error_description,
          });
        }
        break;
      }
      case "refund.processed": {
        const refund = event.payload?.refund?.entity;
        if (refund?.payment_id) {
          await markRefunded({ razorpayPaymentId: refund.payment_id, refundId: refund.id, amountPaise: refund.amount });
        }
        break;
      }
      default:
        break;
    }
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Razorpay webhook error:", error.message);
    // Mismatches (wrong amount / order) are permanent: acknowledge so Razorpay stops retrying,
    // the order stays unpaid and shows up for the team.
    if (error.status && error.status < 500) return NextResponse.json({ received: true, ignored: error.code });
    return NextResponse.json({ error: "Temporary failure" }, { status: 500 });
  }
}
