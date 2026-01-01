// API Route: Create Shipping with Delhivery
import { NextResponse } from "next/server";
import {
  createShipment,
  checkServiceability,
  calculateShippingCost,
} from "@/lib/services/delhiveryService";

// GET endpoint for testing Delhivery configuration
export async function GET(request) {
  try {
    console.log("\n=== Testing Delhivery Configuration ===");

    // Check environment variables
    const apiKey = process.env.DELHIVERY_API_KEY;

    const config = {
      apiKey: apiKey ? "✅ Set (hidden)" : "❌ Missing",
      baseUrl:
        process.env.DELHIVERY_BASE_URL ||
        "Using default: https://track.delhivery.com/api",
      clientName: process.env.DELHIVERY_CLIENT_NAME || "Not set",
    };

    console.log("Environment Configuration:", config);

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          message: "Delhivery API key not configured",
          config,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Delhivery configuration check successful",
      config,
      timestamp: new Date().toISOString(),
    });
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

    // Step 1: Check pincode serviceability
    console.log("Checking pincode serviceability:", address.pincode);
    const { data: serviceabilityData, error: serviceError } =
      await checkServiceability(address.pincode);

    if (serviceError || !serviceabilityData) {
      console.error("❌ Pincode not serviceable:", serviceError);
      return NextResponse.json(
        {
          success: false,
          error: "Delivery not available for this pincode",
        },
        { status: 400 }
      );
    }

    console.log("✅ Pincode is serviceable");

    // Step 2: Create Delhivery shipment
    const shipmentData = {
      orderNumber: orderId,
      orderDate: new Date().toISOString().split("T")[0],
      pickupLocation: process.env.DELHIVERY_PICKUP_LOCATION || "Primary",
      shippingName: customer.name,
      shippingAddress: address.line1,
      shippingAddress2: address.line2 || "",
      shippingCity: address.city,
      shippingState: address.state,
      shippingPincode: address.pincode,
      shippingCountry: address.country || "India",
      shippingPhone: customer.phone,
      shippingEmail: customer.email,
      items: items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      paymentMode: "Prepaid",
      totalAmount: amount,
      weight: 1, // kg - adjust based on items
      length: 15,
      breadth: 15,
      height: 15,
      sellerName: process.env.DELHIVERY_CLIENT_NAME || "Vriksh Valley",
      sellerAddress: process.env.DELHIVERY_SELLER_ADDRESS || "",
      sellerPhone: process.env.DELHIVERY_SELLER_PHONE || "",
    };

    console.log("\n=== Creating Delhivery Shipment ===");
    console.log("Order ID:", orderId);
    console.log("Customer:", customer.name);
    console.log("Pincode:", address.pincode);

    const { data: shipmentResult, error: shipmentError } = await createShipment(
      shipmentData
    );

    if (shipmentError || !shipmentResult) {
      console.error("❌ Delhivery shipment creation failed:", shipmentError);
      return NextResponse.json(
        {
          success: false,
          error: shipmentError || "Failed to create shipment",
        },
        { status: 500 }
      );
    }

    console.log("✅ Delhivery shipment created successfully");
    console.log("Waybill:", shipmentResult.waybill);

    return NextResponse.json({
      success: true,
      waybill: shipmentResult.waybill,
      orderNumber: shipmentResult.orderNumber,
      status: shipmentResult.status,
      referenceId: shipmentResult.referenceId,
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
