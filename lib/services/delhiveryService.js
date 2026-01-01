/**
 * Delhivery Shipping Service
 *
 * Service module for Delhivery B2C shipping integration
 * Handles shipment creation, tracking, label generation, and cancellation
 *
 * API Documentation: https://one.delhivery.com/developer-portal/documents/b2c/
 */

import axios from "axios";

// Environment configuration
const DELHIVERY_API_KEY = process.env.DELHIVERY_API_KEY;
const DELHIVERY_BASE_URL =
  process.env.DELHIVERY_BASE_URL || "https://track.delhivery.com/api";
const DELHIVERY_CLIENT_NAME = process.env.DELHIVERY_CLIENT_NAME;

/**
 * Ensure this service only runs server-side
 */
const getDelhiveryInstance = () => {
  if (typeof window !== "undefined") {
    throw new Error("Delhivery service can only be used server-side");
  }
  return true;
};

/**
 * Create axios instance with common headers
 */
const createAxiosInstance = () => {
  return axios.create({
    baseURL: DELHIVERY_BASE_URL,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${DELHIVERY_API_KEY}`,
      Accept: "application/json",
    },
  });
};

/**
 * Check pincode serviceability
 * Validates if a pincode is serviceable by Delhivery
 *
 * @param {string} pincode - Pincode to check
 * @returns {Promise<Object>} { data: serviceabilityInfo, error: null } or { data: null, error: errorMessage }
 */
export const checkServiceability = async (pincode) => {
  try {
    getDelhiveryInstance();

    if (!pincode || pincode.length !== 6) {
      return {
        data: null,
        error: "Invalid pincode. Must be 6 digits.",
      };
    }

    console.log("🔄 Checking Delhivery serviceability for pincode:", pincode);

    const axiosInstance = createAxiosInstance();
    const response = await axiosInstance.get("/c/api/pin-codes/json/", {
      params: {
        filter_codes: pincode,
      },
    });

    const pincodeData = response.data?.delivery_codes?.[0];

    if (!pincodeData) {
      return {
        data: null,
        error: "Pincode not serviceable",
      };
    }

    console.log("✅ Pincode is serviceable");

    return {
      data: {
        pincode: pincodeData.postal_code?.pin || pincode,
        city: pincodeData.postal_code?.city || "",
        state: pincodeData.postal_code?.state_code || "",
        prepaid: pincodeData.postal_code?.pre_paid === "Y",
        cod: pincodeData.postal_code?.cash === "Y",
        pickup: pincodeData.postal_code?.pickup === "Y",
        delivery: pincodeData.postal_code?.is_oda === "N",
      },
      error: null,
    };
  } catch (error) {
    console.error(
      "Delhivery serviceability check error:",
      error.response?.data || error.message
    );
    return {
      data: null,
      error:
        error.response?.data?.message ||
        "Failed to check pincode serviceability",
    };
  }
};

/**
 * Calculate shipping cost
 * Estimates shipping charges based on weight, dimensions, and pincodes
 *
 * @param {Object} shipmentData - Shipment details
 * @param {string} shipmentData.originPin - Origin pincode
 * @param {string} shipmentData.destinationPin - Destination pincode
 * @param {number} shipmentData.weight - Weight in kg
 * @param {string} shipmentData.paymentMode - 'Prepaid' or 'COD'
 * @param {number} shipmentData.declaredValue - Declared value in rupees
 * @returns {Promise<Object>} { data: rateInfo, error: null } or { data: null, error: errorMessage }
 */
export const calculateShippingCost = async (shipmentData) => {
  try {
    getDelhiveryInstance();

    const {
      originPin,
      destinationPin,
      weight,
      paymentMode = "Prepaid",
      declaredValue,
    } = shipmentData;

    if (!originPin || !destinationPin || !weight || !declaredValue) {
      return {
        data: null,
        error: "Missing required fields for rate calculation",
      };
    }

    console.log(
      "🔄 Calculating Delhivery shipping cost from",
      originPin,
      "to",
      destinationPin
    );

    const axiosInstance = createAxiosInstance();
    const response = await axiosInstance.get("/api/kinko/v1/invoice/charges", {
      params: {
        md: paymentMode === "COD" ? "E" : "S", // E for COD, S for Prepaid
        ss: "Delivered", // Assumed status
        d_pin: destinationPin,
        o_pin: originPin,
        cgm: weight * 1000, // Convert kg to grams
        pt: "Pre-paid", // Payment type
        cod: paymentMode === "COD" ? 1 : 0,
      },
    });

    const charges = response.data?.[0];

    if (!charges) {
      return {
        data: null,
        error: "Unable to calculate shipping charges",
      };
    }

    console.log("✅ Shipping cost calculated successfully");

    return {
      data: {
        totalAmount: charges.total_amount || 0,
        baseFreight: charges.base_freight || 0,
        fuelSurcharge: charges.fsc || 0,
        codCharges: charges.cod_charges || 0,
        gstAmount: charges.gst_amount || 0,
        currency: "INR",
      },
      error: null,
    };
  } catch (error) {
    console.error(
      "Delhivery rate calculation error:",
      error.response?.data || error.message
    );
    return {
      data: null,
      error:
        error.response?.data?.message || "Failed to calculate shipping cost",
    };
  }
};

/**
 * Create shipment
 * Creates a B2C shipment/order in Delhivery
 *
 * @param {Object} shipmentData - Shipment details
 * @returns {Promise<Object>} { data: shipmentInfo, error: null } or { data: null, error: errorMessage }
 */
export const createShipment = async (shipmentData) => {
  try {
    getDelhiveryInstance();

    const {
      orderNumber,
      orderDate,
      pickupLocation,
      shippingName,
      shippingAddress,
      shippingAddress2 = "",
      shippingCity,
      shippingState,
      shippingPincode,
      shippingCountry = "India",
      shippingPhone,
      shippingEmail,
      items,
      paymentMode = "Prepaid",
      totalAmount,
      weight = 0.5,
      length = 10,
      breadth = 10,
      height = 10,
      sellerName,
      sellerAddress,
      sellerPhone,
      sellerGst = "",
    } = shipmentData;

    // Validate required fields
    if (
      !orderNumber ||
      !shippingName ||
      !shippingAddress ||
      !shippingCity ||
      !shippingState ||
      !shippingPincode ||
      !shippingPhone ||
      !items ||
      !totalAmount
    ) {
      return {
        data: null,
        error: "Missing required shipment fields",
      };
    }

    console.log("🔄 Creating Delhivery shipment for order:", orderNumber);

    // Prepare shipment data in Delhivery format
    const shipmentPayload = {
      shipments: [
        {
          name: shippingName,
          add:
            shippingAddress + (shippingAddress2 ? ", " + shippingAddress2 : ""),
          pin: shippingPincode,
          city: shippingCity,
          state: shippingState,
          country: shippingCountry,
          phone: shippingPhone,
          order: orderNumber,
          payment_mode: paymentMode,
          return_pin: "", // Add pickup pincode if return is needed
          return_city: "",
          return_phone: "",
          return_add: "",
          return_state: "",
          return_country: "",
          products_desc: items
            .map((item) => `${item.name} x ${item.quantity}`)
            .join(", "),
          hsn_code: "",
          cod_amount: paymentMode === "COD" ? totalAmount : 0,
          order_date: orderDate || new Date().toISOString().split("T")[0],
          total_amount: totalAmount,
          seller_add: sellerAddress || "",
          seller_name: sellerName || DELHIVERY_CLIENT_NAME || "",
          seller_inv: "",
          quantity: items.reduce((sum, item) => sum + item.quantity, 0),
          waybill: "",
          shipment_width: breadth,
          shipment_height: height,
          weight: weight * 1000, // Convert to grams
          seller_gst_tin: sellerGst,
          shipping_mode: "Surface",
          address_type: "home",
        },
      ],
      pickup_location: {
        name: pickupLocation || DELHIVERY_CLIENT_NAME,
      },
    };

    const axiosInstance = createAxiosInstance();
    const response = await axiosInstance.post(
      "/cmu/create.json",
      JSON.stringify(shipmentPayload),
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.data || response.data.success !== true) {
      throw new Error(
        response.data?.rmk || "Failed to create shipment in Delhivery"
      );
    }

    const waybill =
      response.data.waybill || response.data.packages?.[0]?.waybill;

    console.log("✅ Delhivery shipment created successfully");
    console.log("Waybill:", waybill);

    return {
      data: {
        waybill: waybill,
        orderNumber: orderNumber,
        status: response.data.upload_wbn || "Manifest",
        referenceId: response.data.packages?.[0]?.refnum || "",
        success: true,
      },
      error: null,
    };
  } catch (error) {
    console.error(
      "Delhivery shipment creation error:",
      error.response?.data || error.message
    );
    return {
      data: null,
      error: error.response?.data?.rmk || "Failed to create shipment",
    };
  }
};

/**
 * Track shipment
 * Tracks shipment status using waybill number
 *
 * @param {string} waybill - Waybill/AWB number
 * @returns {Promise<Object>} { data: trackingInfo, error: null } or { data: null, error: errorMessage }
 */
export const trackShipment = async (waybill) => {
  try {
    getDelhiveryInstance();

    if (!waybill) {
      return {
        data: null,
        error: "Waybill number is required for tracking",
      };
    }

    console.log("🔄 Tracking Delhivery shipment:", waybill);

    const axiosInstance = createAxiosInstance();
    const response = await axiosInstance.get("/v1/packages/json/", {
      params: {
        waybill: waybill,
      },
    });

    const shipmentData = response.data?.ShipmentData?.[0];

    if (!shipmentData || !shipmentData.Shipment) {
      return {
        data: null,
        error: "Shipment not found",
      };
    }

    const shipment = shipmentData.Shipment;
    const scans = shipmentData.Scans || [];

    console.log("✅ Shipment tracked successfully");
    console.log("Status:", shipment.Status?.Status);

    return {
      data: {
        waybill: shipment.AWB,
        orderNumber: shipment.ReferenceNo,
        status: shipment.Status?.Status || "Unknown",
        statusCode: shipment.Status?.StatusCode || "",
        origin: shipment.Origin,
        destination: shipment.Destination,
        currentLocation: scans[0]?.ScannedLocation || "",
        expectedDelivery: shipment.ExpectedDeliveryDate || "",
        actualDelivery: shipment.DispatchedDate || "",
        scans: scans.map((scan) => ({
          location: scan.ScannedLocation,
          status: scan.ScanDetail?.Scan || "",
          date: scan.ScanDateTime,
          instructions: scan.ScanDetail?.Instructions || "",
        })),
      },
      error: null,
    };
  } catch (error) {
    console.error(
      "Delhivery tracking error:",
      error.response?.data || error.message
    );
    return {
      data: null,
      error: error.response?.data?.message || "Failed to track shipment",
    };
  }
};

/**
 * Cancel shipment
 * Cancels a shipment before dispatch
 *
 * @param {string} waybill - Waybill/AWB number
 * @returns {Promise<Object>} { data: cancellationInfo, error: null } or { data: null, error: errorMessage }
 */
export const cancelShipment = async (waybill) => {
  try {
    getDelhiveryInstance();

    if (!waybill) {
      return {
        data: null,
        error: "Waybill number is required for cancellation",
      };
    }

    console.log("🔄 Cancelling Delhivery shipment:", waybill);

    const axiosInstance = createAxiosInstance();
    const response = await axiosInstance.post("/p/edit", {
      waybill: waybill,
      cancellation: true,
    });

    console.log("✅ Shipment cancelled successfully");

    return {
      data: {
        success: response.data?.success || true,
        message: response.data?.message || "Shipment cancelled successfully",
        waybill: waybill,
      },
      error: null,
    };
  } catch (error) {
    console.error(
      "Delhivery cancellation error:",
      error.response?.data || error.message
    );
    return {
      data: null,
      error: error.response?.data?.message || "Failed to cancel shipment",
    };
  }
};

/**
 * Generate shipping label
 * Generates and retrieves shipping label PDF for a waybill
 *
 * @param {string} waybill - Waybill/AWB number
 * @returns {Promise<Object>} { data: labelInfo, error: null } or { data: null, error: errorMessage }
 */
export const generateLabel = async (waybill) => {
  try {
    getDelhiveryInstance();

    if (!waybill) {
      return {
        data: null,
        error: "Waybill number is required for label generation",
      };
    }

    console.log("🔄 Generating Delhivery shipping label for:", waybill);

    // Delhivery label URL format
    const labelUrl = `${DELHIVERY_BASE_URL}/api/p/packing_slip?wbns=${waybill}&pdf=true`;

    console.log("✅ Label URL generated successfully");

    return {
      data: {
        labelUrl: labelUrl,
        waybill: waybill,
      },
      error: null,
    };
  } catch (error) {
    console.error("Delhivery label generation error:", error.message);
    return {
      data: null,
      error: "Failed to generate shipping label",
    };
  }
};

/**
 * Create pickup request
 * Creates a pickup request for shipments
 *
 * @param {Object} pickupData - Pickup details
 * @param {string} pickupData.pickupLocation - Pickup location name
 * @param {string} pickupData.pickupDate - Pickup date (YYYY-MM-DD)
 * @param {string} pickupData.pickupTime - Pickup time slot
 * @param {number} pickupData.expectedPackages - Expected number of packages
 * @returns {Promise<Object>} { data: pickupInfo, error: null } or { data: null, error: errorMessage }
 */
export const createPickupRequest = async (pickupData) => {
  try {
    getDelhiveryInstance();

    const {
      pickupLocation,
      pickupDate,
      pickupTime = "10:00-14:00",
      expectedPackages = 1,
    } = pickupData;

    if (!pickupLocation || !pickupDate) {
      return {
        data: null,
        error: "Missing required fields for pickup request",
      };
    }

    console.log("🔄 Creating Delhivery pickup request for:", pickupLocation);

    const axiosInstance = createAxiosInstance();
    const response = await axiosInstance.post("/fm/request/new/", {
      pickup_location: pickupLocation,
      pickup_date: pickupDate,
      pickup_time: pickupTime,
      expected_package_count: expectedPackages,
    });

    console.log("✅ Pickup request created successfully");

    return {
      data: {
        success: true,
        pickupRequestId: response.data?.pickup_request_id || "",
        message: "Pickup request created successfully",
      },
      error: null,
    };
  } catch (error) {
    console.error(
      "Delhivery pickup request error:",
      error.response?.data || error.message
    );
    return {
      data: null,
      error: error.response?.data?.message || "Failed to create pickup request",
    };
  }
};

export default {
  checkServiceability,
  calculateShippingCost,
  createShipment,
  trackShipment,
  cancelShipment,
  generateLabel,
  createPickupRequest,
};
