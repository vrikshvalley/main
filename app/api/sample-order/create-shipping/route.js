// API Route: Create Shipping with Shiprocket
import { NextResponse } from "next/server";
import {
  createOrder,
  checkServiceability,
  assignCourier,
} from "@/lib/services/shiprocketService";

export async function POST(request) {
  try {
    const { orderId, customer, address, items, amount } = await request.json();

    // Validate required fields
    if (!orderId || !customer || !address || !items) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Step 1: Create Shiprocket order
    const orderData = {
      order_id: orderId,
      order_date: new Date().toISOString().split("T")[0],
      pickup_location: "Primary", // Use your default pickup location
      billing_customer_name: customer.name,
      billing_address: `${address.line1}, ${address.line2}`,
      billing_city: address.city,
      billing_pincode: address.pincode,
      billing_state: address.state,
      billing_country: address.country || "India",
      billing_email: customer.email,
      billing_phone: customer.phone,
      shipping_is_billing: true,
      order_items: items.map((item) => ({
        name: item.name,
        sku: item.sku || item.id,
        units: item.quantity,
        selling_price: item.price,
        discount: 0,
        tax: 0,
      })),
      payment_method: "Prepaid", // Since payment is already done via PhonePe
      shipping_charges: 50,
      sub_total: amount - 50, // amount - shipping charges
      length: 15,
      breadth: 15,
      height: 15,
      weight: 1, // kg
    };

    console.log("Creating Shiprocket order...");
    const { data: orderResult, error: orderError } = await createOrder(
      orderData
    );

    if (orderError) {
      return NextResponse.json(
        {
          success: false,
          error: orderError.message || "Failed to create order",
        },
        { status: 500 }
      );
    }

    const shiprocketOrderId = orderResult.order_id;
    const shipmentId = orderResult.shipment_id;

    // Step 2: Check serviceability and get available couriers
    console.log("Checking courier serviceability...");
    const { data: serviceabilityData, error: serviceError } =
      await checkServiceability(
        "700001", // Your pickup pincode
        address.pincode,
        1, // weight in kg
        "0" // COD (0 for prepaid)
      );

    let awbCode = null;
    let courierName = null;
    let courierId = null;

    // Step 3: Assign courier and generate AWB (if couriers available)
    if (
      !serviceError &&
      serviceabilityData?.data?.available_courier_companies?.length > 0
    ) {
      const availableCouriers =
        serviceabilityData.data.available_courier_companies;
      const bestCourier = availableCouriers[0]; // Select first available courier
      console.log("Assigning courier:", bestCourier.courier_name);

      const { data: awbResult, error: awbError } = await assignCourier(
        shipmentId,
        bestCourier.courier_company_id
      );

      if (!awbError && awbResult) {
        awbCode = awbResult.awb_code;
        courierName = awbResult.courier_name;
        courierId = awbResult.courier_company_id;
      }
    }

    return NextResponse.json({
      success: true,
      shiprocketOrderId,
      shipmentId,
      awbCode,
      courierName,
      courierId,
      availableCouriers:
        serviceabilityData?.data?.available_courier_companies?.length || 0,
      message: "Shipment created successfully",
    });
  } catch (error) {
    console.error("Create shipping error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}
