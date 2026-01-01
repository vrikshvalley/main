import { NextResponse } from "next/server";
import * as delhiveryService from "@/lib/services/delhiveryService";
import * as orderService from "@/lib/services/orderService";

/**
 * POST /api/shipping/create-order
 * Creates a Delhivery shipment
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

    // Format order for Delhivery
    const delhiveryShipmentData = {
      orderNumber: orderId,
      orderDate: new Date().toISOString().split("T")[0],
      pickupLocation: process.env.DELHIVERY_PICKUP_LOCATION || "Primary",
      shippingName: order.customer_name,
      shippingAddress: order.shipping_address.line1,
      shippingAddress2: order.shipping_address.line2 || "",
      shippingCity: order.shipping_address.city,
      shippingState: order.shipping_address.state,
      shippingPincode: order.shipping_address.pincode,
      shippingCountry: "India",
      shippingPhone: order.customer_phone,
      shippingEmail: order.customer_email,
      items: order.items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      paymentMode: "Prepaid",
      totalAmount: order.total,
      weight: 0.5,
      length: 15,
      breadth: 15,
      height: 15,
      sellerName: process.env.DELHIVERY_CLIENT_NAME || "Vriksh Valley",
      sellerAddress: process.env.DELHIVERY_SELLER_ADDRESS || "",
      sellerPhone: process.env.DELHIVERY_SELLER_PHONE || "",
    };

    // Create Delhivery shipment
    const { data: delhiveryShipment, error: createError } =
      await delhiveryService.createShipment(delhiveryShipmentData);

    if (createError || !delhiveryShipment) {
      console.error("Delhivery shipment creation failed:", createError);
      return NextResponse.json(
        {
          error: createError || {
            message: "Failed to create Delhivery shipment",
          },
        },
        { status: 500 }
      );
    }

    // Update order in database with Delhivery details
    await orderService.updateShippingDetails(orderId, {
      waybill: delhiveryShipment.waybill,
      shipment_status: delhiveryShipment.status,
      reference_id: delhiveryShipment.referenceId,
      shipping_provider: "Delhivery",
    });

    return NextResponse.json({
      success: true,
      waybill: delhiveryShipment.waybill,
      orderNumber: delhiveryShipment.orderNumber,
      status: delhiveryShipment.status,
    });
  } catch (error) {
    console.error("Create shipping order API error:", error);
    return NextResponse.json(
      { error: { message: "Internal server error" } },
      { status: 500 }
    );
  }
}
