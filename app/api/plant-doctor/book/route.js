import { NextResponse } from "next/server";
import * as orderService from "@/lib/services/orderService";
import * as emailService from "@/lib/services/emailService";

export async function POST(request) {
  try {
    const body = await request.json();

    const {
      customerName,
      customerEmail,
      customerPhone,
      appointmentDate,
      appointmentTime,
      amount,
      paymentMethod,
      item,
    } = body;

    if (!customerEmail || !appointmentDate || !appointmentTime || !item) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate a unique order id
    const orderId = orderService.generateOrderId();

    const totals = orderService.calculateOrderTotals([item], 0, 0);

    const orderPayload = {
      userId: null,
      orderId,
      status: "confirmed",
      paymentStatus: "paid",
      paymentMethod: paymentMethod || "online",
      items: [
        {
          product_id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity || 1,
          image: item.image,
        },
      ],
      subtotal: totals.subtotal,
      shippingCharges: 0,
      tax: totals.tax,
      discount: totals.discount,
      total: totals.total || amount,
      customerName: customerName || "",
      customerEmail: customerEmail,
      customerPhone: customerPhone || "",
      shippingAddress: null,
      orderDate: new Date().toISOString(),
      paymentDate: new Date().toISOString(),
      notes: {
        appointmentDate,
        appointmentTime,
        service: "Plant Doctor - 30 min consultation",
      },
    };

    const { data: createdOrder, error } = await orderService.createOrder(
      orderPayload
    );

    if (error) {
      console.error("Order create error:", error);
      return NextResponse.json(
        { error: "Failed to create order" },
        { status: 500 }
      );
    }

    // Send order confirmation email
    try {
      await emailService.sendOrderConfirmation(createdOrder, customerEmail);
    } catch (mailErr) {
      console.error("Email send error:", mailErr);
    }

    return NextResponse.json({ success: true, order: createdOrder });
  } catch (err) {
    console.error("API error", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
