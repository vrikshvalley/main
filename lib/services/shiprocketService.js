import axios from "axios";

/**
 * Shiprocket API Service
 * Handles authentication, order creation, tracking, courier selection, and label generation
 * Official API Docs: https://apidocs.shiprocket.in/
 */

const SHIPROCKET_BASE_URL =
  process.env.NEXT_PUBLIC_SHIPROCKET_BASE_URL || "https://apiv2.shiprocket.in";
const SHIPROCKET_EMAIL = process.env.SHIPROCKET_EMAIL;
const SHIPROCKET_PASSWORD = process.env.SHIPROCKET_PASSWORD;
const DEFAULT_COURIER_ID = process.env.SHIPROCKET_COURIER_ID;

let cachedToken = null;
let tokenExpiry = null;

/**
 * Authenticate with Shiprocket and get access token
 * Token is cached until expiry
 */
export async function authenticate() {
  // Return cached token if still valid
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  try {
    const response = await axios.post(
      `${SHIPROCKET_BASE_URL}/v1/external/auth/login`,
      {
        email: SHIPROCKET_EMAIL,
        password: SHIPROCKET_PASSWORD,
      }
    );

    if (response.data && response.data.token) {
      cachedToken = response.data.token;
      // Token typically valid for 10 days, cache for 9 days to be safe
      tokenExpiry = Date.now() + 9 * 24 * 60 * 60 * 1000;
      return cachedToken;
    }

    throw new Error("Authentication failed: No token received");
  } catch (error) {
    console.error(
      "Shiprocket authentication error:",
      error.response?.data || error.message
    );
    throw new Error("Failed to authenticate with Shiprocket");
  }
}

/**
 * Create an order on Shiprocket
 * @param {Object} orderData - Order details
 * @returns {Promise<Object>} Order creation response with order_id and shipment_id
 */
export async function createOrder(orderData) {
  try {
    const token = await authenticate();

    const shiprocketOrder = {
      order_id: orderData.order_id,
      order_date:
        orderData.order_date || new Date().toISOString().split("T")[0],
      pickup_location: orderData.pickup_location || "Primary",
      channel_id: orderData.channel_id || "",
      comment: orderData.comment || "Order from Vriksh Valley",
      billing_customer_name: orderData.billing_customer_name,
      billing_last_name: orderData.billing_last_name || "",
      billing_address: orderData.billing_address,
      billing_address_2: orderData.billing_address_2 || "",
      billing_city: orderData.billing_city,
      billing_pincode: orderData.billing_pincode,
      billing_state: orderData.billing_state,
      billing_country: orderData.billing_country || "India",
      billing_email: orderData.billing_email,
      billing_phone: orderData.billing_phone,
      shipping_is_billing: orderData.shipping_is_billing !== false,
      shipping_customer_name:
        orderData.shipping_customer_name || orderData.billing_customer_name,
      shipping_last_name:
        orderData.shipping_last_name || orderData.billing_last_name || "",
      shipping_address: orderData.shipping_address || orderData.billing_address,
      shipping_address_2:
        orderData.shipping_address_2 || orderData.billing_address_2 || "",
      shipping_city: orderData.shipping_city || orderData.billing_city,
      shipping_pincode: orderData.shipping_pincode || orderData.billing_pincode,
      shipping_country:
        orderData.shipping_country || orderData.billing_country || "India",
      shipping_state: orderData.shipping_state || orderData.billing_state,
      shipping_email: orderData.shipping_email || orderData.billing_email,
      shipping_phone: orderData.shipping_phone || orderData.billing_phone,
      order_items: orderData.order_items, // Array of { name, sku, units, selling_price, discount, tax }
      payment_method: orderData.payment_method || "Prepaid",
      shipping_charges: orderData.shipping_charges || 0,
      giftwrap_charges: orderData.giftwrap_charges || 0,
      transaction_charges: orderData.transaction_charges || 0,
      total_discount: orderData.total_discount || 0,
      sub_total: orderData.sub_total,
      length: orderData.length || 10,
      breadth: orderData.breadth || 10,
      height: orderData.height || 10,
      weight: orderData.weight || 0.5,
    };

    const response = await axios.post(
      `${SHIPROCKET_BASE_URL}/v1/external/orders/create/adhoc`,
      shiprocketOrder,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("Shiprocket order created:", response.data);
    return { data: response.data, error: null };
  } catch (error) {
    console.error(
      "Shiprocket order creation error:",
      error.response?.data || error.message
    );
    return {
      data: null,
      error: error.response?.data || {
        message: "Failed to create Shiprocket order",
      },
    };
  }
}

/**
 * Check courier serviceability and get rates
 * @param {string} pickupPincode - Pickup location pincode
 * @param {string} deliveryPincode - Delivery location pincode
 * @param {number} weight - Package weight in kg
 * @param {string} cod - '1' for COD, '0' for Prepaid
 * @returns {Promise<Object>} Available couriers with rates
 */
export async function checkServiceability(
  pickupPincode,
  deliveryPincode,
  weight = 0.5,
  cod = "0"
) {
  try {
    const token = await authenticate();

    const response = await axios.get(
      `${SHIPROCKET_BASE_URL}/v1/external/courier/serviceability`,
      {
        params: {
          pickup_postcode: pickupPincode,
          delivery_postcode: deliveryPincode,
          weight: weight,
          cod: cod,
        },
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return { data: response.data, error: null };
  } catch (error) {
    console.error(
      "Shiprocket serviceability error:",
      error.response?.data || error.message
    );
    return {
      data: null,
      error: error.response?.data || {
        message: "Failed to check serviceability",
      },
    };
  }
}

/**
 * Assign courier to shipment
 * @param {number} shipmentId - Shipment ID from order creation
 * @param {number} courierId - Courier ID (from .env or serviceability check)
 * @returns {Promise<Object>} AWB assignment response
 */
export async function assignCourier(shipmentId, courierId = null) {
  try {
    const token = await authenticate();
    const selectedCourierId = courierId || DEFAULT_COURIER_ID;

    if (!selectedCourierId) {
      throw new Error("Courier ID is required");
    }

    const response = await axios.post(
      `${SHIPROCKET_BASE_URL}/v1/external/courier/assign/awb`,
      {
        shipment_id: shipmentId,
        courier_id: parseInt(selectedCourierId),
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("Courier assigned:", response.data);
    return { data: response.data, error: null };
  } catch (error) {
    console.error(
      "Shiprocket courier assignment error:",
      error.response?.data || error.message
    );
    return {
      data: null,
      error: error.response?.data || { message: "Failed to assign courier" },
    };
  }
}

/**
 * Track shipment by AWB code
 * @param {string} awbCode - Air Waybill number
 * @returns {Promise<Object>} Tracking details
 */
export async function trackShipment(awbCode) {
  try {
    const token = await authenticate();

    const response = await axios.get(
      `${SHIPROCKET_BASE_URL}/v1/external/courier/track/awb/${awbCode}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return { data: response.data, error: null };
  } catch (error) {
    console.error(
      "Shiprocket tracking error:",
      error.response?.data || error.message
    );
    return {
      data: null,
      error: error.response?.data || { message: "Failed to track shipment" },
    };
  }
}

/**
 * Track shipment by Shiprocket shipment ID
 * @param {number} shipmentId - Shiprocket shipment ID
 * @returns {Promise<Object>} Tracking details
 */
export async function trackByShipmentId(shipmentId) {
  try {
    const token = await authenticate();

    const response = await axios.get(
      `${SHIPROCKET_BASE_URL}/v1/external/courier/track/shipment/${shipmentId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return { data: response.data, error: null };
  } catch (error) {
    console.error(
      "Shiprocket tracking error:",
      error.response?.data || error.message
    );
    return {
      data: null,
      error: error.response?.data || { message: "Failed to track shipment" },
    };
  }
}

/**
 * Generate shipping label
 * @param {number[]} shipmentIds - Array of shipment IDs
 * @returns {Promise<Object>} Label URL
 */
export async function generateLabel(shipmentIds) {
  try {
    const token = await authenticate();

    const response = await axios.post(
      `${SHIPROCKET_BASE_URL}/v1/external/courier/generate/label`,
      {
        shipment_id: Array.isArray(shipmentIds) ? shipmentIds : [shipmentIds],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return { data: response.data, error: null };
  } catch (error) {
    console.error(
      "Shiprocket label generation error:",
      error.response?.data || error.message
    );
    return {
      data: null,
      error: error.response?.data || { message: "Failed to generate label" },
    };
  }
}

/**
 * Generate invoice for shipment
 * @param {number[]} orderIds - Array of order IDs
 * @returns {Promise<Object>} Invoice URL
 */
export async function generateInvoice(orderIds) {
  try {
    const token = await authenticate();

    const response = await axios.post(
      `${SHIPROCKET_BASE_URL}/v1/external/orders/print/invoice`,
      {
        ids: Array.isArray(orderIds) ? orderIds : [orderIds],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return { data: response.data, error: null };
  } catch (error) {
    console.error(
      "Shiprocket invoice generation error:",
      error.response?.data || error.message
    );
    return {
      data: null,
      error: error.response?.data || { message: "Failed to generate invoice" },
    };
  }
}

/**
 * Cancel shipment
 * @param {number[]} awbCodes - Array of AWB codes to cancel
 * @returns {Promise<Object>} Cancellation response
 */
export async function cancelShipment(awbCodes) {
  try {
    const token = await authenticate();

    const response = await axios.post(
      `${SHIPROCKET_BASE_URL}/v1/external/orders/cancel`,
      {
        awbs: Array.isArray(awbCodes) ? awbCodes : [awbCodes],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return { data: response.data, error: null };
  } catch (error) {
    console.error(
      "Shiprocket cancellation error:",
      error.response?.data || error.message
    );
    return {
      data: null,
      error: error.response?.data || { message: "Failed to cancel shipment" },
    };
  }
}

/**
 * Request return/RTO
 * @param {number} orderId - Order ID
 * @returns {Promise<Object>} Return request response
 */
export async function requestReturn(orderId) {
  try {
    const token = await authenticate();

    const response = await axios.post(
      `${SHIPROCKET_BASE_URL}/v1/external/orders/create/return`,
      {
        order_id: orderId,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return { data: response.data, error: null };
  } catch (error) {
    console.error(
      "Shiprocket return request error:",
      error.response?.data || error.message
    );
    return {
      data: null,
      error: error.response?.data || { message: "Failed to request return" },
    };
  }
}

export default {
  authenticate,
  createOrder,
  checkServiceability,
  assignCourier,
  trackShipment,
  trackByShipmentId,
  generateLabel,
  generateInvoice,
  cancelShipment,
  requestReturn,
};
