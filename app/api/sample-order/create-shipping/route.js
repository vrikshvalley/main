// API Route: Create Shipping with Shiprocket
import { NextResponse } from "next/server";
import {
  createOrder,
  checkServiceability,
  assignCourier,
  authenticate,
} from "@/lib/services/shiprocketService";

// GET endpoint for testing authentication
export async function GET(request) {
  try {
    console.log("\n=== Testing Shiprocket Authentication ===");

    // Check environment variables
    const email = process.env.SHIPROCKET_EMAIL;
    const password = process.env.SHIPROCKET_PASSWORD;

    const config = {
      email: email ? `✅ Set (${email})` : "❌ Missing",
      password: password ? "✅ Set (hidden)" : "❌ Missing",
      baseUrl:
        process.env.SHIPROCKET_BASE_URL ||
        "Using default: https://apiv2.shiprocket.in",
      courierId: process.env.SHIPROCKET_COURIER_ID || "Not set (optional)",
    };

    console.log("Environment Configuration:", config);

    // Test authentication
    try {
      const token = await authenticate();

      console.log("✅ Authentication successful");
      console.log("Token (first 20 chars):", token?.substring(0, 20) + "...");

      return NextResponse.json({
        success: true,
        message: "Shiprocket authentication successful",
        config,
        tokenPreview: token?.substring(0, 20) + "...",
        timestamp: new Date().toISOString(),
      });
    } catch (authError) {
      console.error("❌ Authentication failed:", authError.message);
      return NextResponse.json(
        {
          success: false,
          message: "Shiprocket authentication failed",
          error: authError.message,
          config,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Test error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

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

    console.log("\n=== Creating Shiprocket Order ===");
    console.log("Order ID:", orderId);
    console.log("Customer:", customer.name);
    console.log("Pincode:", address.pincode);

    const { data: orderResult, error: orderError } = await createOrder(
      orderData
    );

    if (orderError) {
      console.error("❌ Shiprocket order creation failed:", orderError.message);
      return NextResponse.json(
        {
          success: false,
          error: orderError.message || "Failed to create order",
          details: orderData,
        },
        { status: 500 }
      );
    }

    console.log("✅ Shiprocket order created successfully");
    console.log("Shiprocket Order ID:", orderResult.order_id);
    console.log("Shipment ID:", orderResult.shipment_id);

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
