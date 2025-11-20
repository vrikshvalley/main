import { NextResponse } from "next/server";
import * as emailService from "@/lib/services/emailService";

/**
 * POST /api/email/order-confirmation
 * Sends order confirmation email
 */
export async function POST(request) {
  try {
    const { order } = await request.json();

    if (!order) {
      return NextResponse.json(
        { error: { message: "Missing order data" } },
        { status: 400 }
      );
    }

    const orderData = {
      orderId: order.order_id,
      customerName: order.customer_name,
      orderDate: order.order_date,
      paymentMethod: order.payment_method,
      items: order.items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.image,
      })),
      total: order.total,
      shippingAddress: order.shipping_address,
    };

    const { data, error } = await emailService.sendOrderConfirmation(
      orderData,
      order.customer_email
    );

    if (error) {
      console.error("Email send error:", error);
      // Don't fail the order if email fails
      return NextResponse.json({ success: false, error }, { status: 200 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Order confirmation email API error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Internal server error" } },
      { status: 500 }
    );
  }
}
