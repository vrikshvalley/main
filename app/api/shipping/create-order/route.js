import { NextResponse } from "next/server";
import * as shiprocketService from "@/lib/services/shiprocketService";
import * as orderService from "@/lib/services/orderService";

/**
 * POST /api/shipping/create-order
 * Creates a Shiprocket order and assigns courier
 */
export async function POST(request) {
  try {
    const { orderId, order } = await request.json();

    if (!orderId || !order) {
      return NextResponse.json(
        { error: { message: "Missing required fields" } },
        { status: 400 }
      );
    }

    // Format order for Shiprocket
    const shiprocketOrderData = {
      order_id: orderId,
      order_date: new Date().toISOString().split("T")[0],
      billing_customer_name: order.customer_name,
      billing_last_name: "",
      billing_address: order.shipping_address.line1,
      billing_address_2: order.shipping_address.line2 || "",
      billing_city: order.shipping_address.city,
      billing_pincode: order.shipping_address.pincode,
      billing_state: order.shipping_address.state,
      billing_country: "India",
      billing_email: order.customer_email,
      billing_phone: order.customer_phone,
      shipping_is_billing: true,
      order_items: orderService.formatItemsForShiprocket(order.items),
      payment_method: "Prepaid",
      sub_total: order.total, // Total already in rupees
      length: 15,
      breadth: 15,
      height: 15,
      weight: 0.5,
    };

    // Create Shiprocket order
    const { data: shiprocketOrder, error: createError } =
      await shiprocketService.createOrder(shiprocketOrderData);

    if (createError || !shiprocketOrder) {
      console.error("Shiprocket order creation failed:", createError);
      return NextResponse.json(
        {
          error: createError || {
            message: "Failed to create Shiprocket order",
          },
        },
        { status: 500 }
      );
    }

    // Assign courier (using default courier from .env)
    const shipmentId = shiprocketOrder.shipment_id;
    const { data: courierAssignment, error: courierError } =
      await shiprocketService.assignCourier(shipmentId);

    if (courierError) {
      console.error("Courier assignment failed:", courierError);
      // Continue even if courier assignment fails - can be done manually
    }

    // Update order in database with Shiprocket details
    await orderService.updateShippingDetails(orderId, {
      shiprocket_order_id: shiprocketOrder.order_id,
      shiprocket_shipment_id: shipmentId,
      awb_code: courierAssignment?.response?.data?.awb_code || null,
      courier_name: courierAssignment?.response?.data?.courier_name || null,
      courier_id: courierAssignment?.response?.data?.courier_id || null,
    });

    return NextResponse.json({
      success: true,
      shiprocketOrder,
      courierAssignment,
    });
  } catch (error) {
    console.error("Create shipping order API error:", error);
    return NextResponse.json(
      { error: { message: "Internal server error" } },
      { status: 500 }
    );
  }
}
