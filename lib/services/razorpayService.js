/**
 * Razorpay Payment Gateway Service
 *
 * Service module for Razorpay payment gateway integration
 * Handles payment order creation, verification, refunds, and webhooks
 *
 * API Documentation: https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/
 */

import Razorpay from "razorpay";
import { isValidPaymentSignature, isValidWebhookSignature } from "../payments/signature.js";

// Environment configuration (read dynamically so runtime env updates take effect)
const getKeyId = () => process.env.RAZORPAY_KEY_ID;
const getKeySecret = () => process.env.RAZORPAY_KEY_SECRET;
const getWebhookSecret = () => process.env.RAZORPAY_WEBHOOK_SECRET;

/**
 * Ensure this service only runs server-side
 */
const getRazorpayInstance = () => {
  if (typeof window !== "undefined") {
    throw new Error("Razorpay service can only be used server-side");
  }

  const keyId = getKeyId();
  const keySecret = getKeySecret();
  if (!keyId || !keySecret) {
    throw new Error("Razorpay credentials not configured");
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
};

/**
 * Create a payment order
 * Creates an order on Razorpay which can be used to initiate payment
 *
 * @param {Object} orderData - Order details
 * @param {number} orderData.amount - Amount in smallest currency unit (paise for INR)
 * @param {string} orderData.currency - Currency code (default: INR)
 * @param {string} orderData.receipt - Receipt ID/Order ID from your system
 * @param {Object} orderData.notes - Optional metadata/notes (key-value pairs)
 * @returns {Promise<Object>} { data: order, error: null } or { data: null, error: errorMessage }
 */
export const createOrder = async (orderData) => {
  try {
    const razorpayInstance = getRazorpayInstance();

    const { amount, currency = "INR", receipt, notes = {} } = orderData;

    // Validate required fields
    if (!Number.isInteger(amount) || !receipt) {
      return {
        data: null,
        error: "Missing or invalid required fields: amount or receipt",
      };
    }

    // Amount must be minimum 100 paise (₹1)
    if (!Number.isFinite(amount) || amount < 100) {
      return {
        data: null,
        error: "Amount must be at least 100 paise (₹1)",
      };
    }

    console.log("🔄 Creating Razorpay order:", receipt);

    const options = {
      amount: amount, // amount in smallest currency unit (paise)
      currency: currency,
      receipt: receipt,
      notes: notes,
      payment_capture: 1, // Auto-capture payment
    };

    const order = await razorpayInstance.orders.create(options);

    console.log("✅ Razorpay order created successfully");
    console.log("Order ID:", order.id);

    return {
      data: {
        id: order.id,
        entity: order.entity,
        amount: order.amount,
        amountPaid: order.amount_paid,
        amountDue: order.amount_due,
        currency: order.currency,
        receipt: order.receipt,
        status: order.status,
        attempts: order.attempts,
        notes: order.notes,
        createdAt: order.created_at,
      },
      error: null,
    };
  } catch (error) {
    console.error(
      "Razorpay order creation error:",
      error.error || error.message
    );
    return {
      data: null,
      error: error.error?.description || "Failed to create Razorpay order",
    };
  }
};

/**
 * Verify payment signature
 * Verifies the authenticity of payment response using signature verification
 *
 * @param {Object} paymentData - Payment response data
 * @param {string} paymentData.razorpay_order_id - Order ID from Razorpay
 * @param {string} paymentData.razorpay_payment_id - Payment ID from Razorpay
 * @param {string} paymentData.razorpay_signature - Signature from Razorpay
 * @returns {Promise<Object>} { data: verificationResult, error: null } or { data: null, error: errorMessage }
 */
export const verifyPaymentSignature = async (paymentData) => {
  try {
    if (typeof window !== "undefined") {
      throw new Error("Razorpay service can only be used server-side");
    }
    const keySecret = getKeySecret();
    if (!keySecret) {
      throw new Error("Razorpay credentials not configured");
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      paymentData;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return {
        data: null,
        error: "Missing required payment verification fields",
      };
    }

    // Constant-time HMAC comparison (see lib/payments/signature.js)
    const isValid = isValidPaymentSignature({
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      signature: razorpay_signature,
      secret: keySecret,
    });

    if (!isValid) {
      console.error("❌ Payment signature verification failed");
      return {
        data: {
          verified: false,
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id,
        },
        error: "Payment signature verification failed",
      };
    }

    console.log("✅ Payment signature verified successfully");

    return {
      data: {
        verified: true,
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
      },
      error: null,
    };
  } catch (error) {
    console.error("Razorpay signature verification error:", error.message);
    return {
      data: null,
      error: "Failed to verify payment signature",
    };
  }
};

/**
 * Fetch payment details
 * Retrieves payment details from Razorpay
 *
 * @param {string} paymentId - Payment ID from Razorpay
 * @returns {Promise<Object>} { data: payment, error: null } or { data: null, error: errorMessage }
 */
export const fetchPayment = async (paymentId) => {
  try {
    const razorpayInstance = getRazorpayInstance();

    if (!paymentId) {
      return {
        data: null,
        error: "Payment ID is required",
      };
    }

    console.log("🔄 Fetching Razorpay payment details:", paymentId);

    const payment = await razorpayInstance.payments.fetch(paymentId);

    console.log("✅ Payment details fetched successfully");
    console.log("Status:", payment.status);

    return {
      data: {
        id: payment.id,
        entity: payment.entity,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        orderId: payment.order_id,
        method: payment.method,
        captured: payment.captured,
        email: payment.email,
        contact: payment.contact,
        fee: payment.fee,
        tax: payment.tax,
        errorCode: payment.error_code,
        errorDescription: payment.error_description,
        createdAt: payment.created_at,
        notes: payment.notes,
      },
      error: null,
    };
  } catch (error) {
    console.error(
      "Razorpay fetch payment error:",
      error.error || error.message
    );
    return {
      data: null,
      error: error.error?.description || "Failed to fetch payment details",
    };
  }
};

/**
 * Fetch order details
 * Retrieves order details from Razorpay
 *
 * @param {string} orderId - Order ID from Razorpay
 * @returns {Promise<Object>} { data: order, error: null } or { data: null, error: errorMessage }
 */
export const fetchOrder = async (orderId) => {
  try {
    const razorpayInstance = getRazorpayInstance();

    if (!orderId) {
      return {
        data: null,
        error: "Order ID is required",
      };
    }

    console.log("🔄 Fetching Razorpay order details:", orderId);

    const order = await razorpayInstance.orders.fetch(orderId);

    console.log("✅ Order details fetched successfully");
    console.log("Status:", order.status);

    return {
      data: {
        id: order.id,
        entity: order.entity,
        amount: order.amount,
        amountPaid: order.amount_paid,
        amountDue: order.amount_due,
        currency: order.currency,
        receipt: order.receipt,
        status: order.status,
        attempts: order.attempts,
        notes: order.notes,
        createdAt: order.created_at,
      },
      error: null,
    };
  } catch (error) {
    console.error("Razorpay fetch order error:", error.error || error.message);
    return {
      data: null,
      error: error.error?.description || "Failed to fetch order details",
    };
  }
};

/**
 * Capture payment
 * Manually captures an authorized payment (if auto-capture is not enabled)
 *
 * @param {string} paymentId - Payment ID from Razorpay
 * @param {number} amount - Amount to capture in smallest currency unit
 * @param {string} currency - Currency code (default: INR)
 * @returns {Promise<Object>} { data: payment, error: null } or { data: null, error: errorMessage }
 */
export const capturePayment = async (paymentId, amount, currency = "INR") => {
  try {
    const razorpayInstance = getRazorpayInstance();

    if (!paymentId || !Number.isInteger(amount) || amount < 100) {
      return {
        data: null,
        error: "Payment ID and valid integer amount (>= 100 paise) are required",
      };
    }

    console.log("🔄 Capturing Razorpay payment:", paymentId);

    const payment = await razorpayInstance.payments.capture(
      paymentId,
      amount,
      currency
    );

    console.log("✅ Payment captured successfully");

    return {
      data: {
        id: payment.id,
        amount: payment.amount,
        status: payment.status,
        captured: payment.captured,
      },
      error: null,
    };
  } catch (error) {
    console.error(
      "Razorpay capture payment error:",
      error.error || error.message
    );
    return {
      data: null,
      error: error.error?.description || "Failed to capture payment",
    };
  }
};

/**
 * Initiate refund
 * Creates a refund for a payment
 *
 * @param {Object} refundData - Refund details
 * @param {string} refundData.paymentId - Payment ID to refund
 * @param {number} refundData.amount - Refund amount in smallest currency unit (optional, full refund if not specified)
 * @param {string} refundData.notes - Optional notes for refund
 * @returns {Promise<Object>} { data: refund, error: null } or { data: null, error: errorMessage }
 */
export const initiateRefund = async (refundData) => {
  try {
    const razorpayInstance = getRazorpayInstance();

    const { paymentId, amount, notes = {} } = refundData;

    if (!paymentId) {
      return {
        data: null,
        error: "Payment ID is required for refund",
      };
    }

    console.log("🔄 Initiating Razorpay refund for payment:", paymentId);

    const refundOptions = {
      notes: notes,
    };

    // If amount is explicitly provided, validate it (never treat 0 as a full refund)
    if (amount !== undefined && amount !== null) {
      if (!Number.isInteger(amount) || amount < 100) {
        return {
          data: null,
          error: "Refund amount must be a positive integer (>= 100 paise)",
        };
      }
      refundOptions.amount = amount;
    }

    const refund = await razorpayInstance.payments.refund(
      paymentId,
      refundOptions
    );

    console.log("✅ Refund initiated successfully");
    console.log("Refund ID:", refund.id);

    return {
      data: {
        id: refund.id,
        entity: refund.entity,
        amount: refund.amount,
        currency: refund.currency,
        paymentId: refund.payment_id,
        status: refund.status,
        speedRequested: refund.speed_requested,
        speedProcessed: refund.speed_processed,
        notes: refund.notes,
        createdAt: refund.created_at,
      },
      error: null,
    };
  } catch (error) {
    console.error("Razorpay refund error:", error.error || error.message);
    return {
      data: null,
      error: error.error?.description || "Failed to initiate refund",
    };
  }
};

/**
 * Fetch refund details
 * Retrieves refund details from Razorpay
 *
 * @param {string} refundId - Refund ID from Razorpay
 * @returns {Promise<Object>} { data: refund, error: null } or { data: null, error: errorMessage }
 */
export const fetchRefund = async (refundId) => {
  try {
    const razorpayInstance = getRazorpayInstance();

    if (!refundId) {
      return {
        data: null,
        error: "Refund ID is required",
      };
    }

    console.log("🔄 Fetching Razorpay refund details:", refundId);

    const refund = await razorpayInstance.refunds.fetch(refundId);

    console.log("✅ Refund details fetched successfully");
    console.log("Status:", refund.status);

    return {
      data: {
        id: refund.id,
        entity: refund.entity,
        amount: refund.amount,
        currency: refund.currency,
        paymentId: refund.payment_id,
        status: refund.status,
        notes: refund.notes,
        createdAt: refund.created_at,
      },
      error: null,
    };
  } catch (error) {
    console.error("Razorpay fetch refund error:", error.error || error.message);
    return {
      data: null,
      error: error.error?.description || "Failed to fetch refund details",
    };
  }
};

/**
 * Verify webhook signature
 * Verifies the authenticity of webhook events from Razorpay
 *
 * @param {string} webhookBody - Raw webhook body as string
 * @param {string} webhookSignature - X-Razorpay-Signature header value
 * @returns {boolean} True if signature is valid, false otherwise
 */
export const verifyWebhookSignature = (webhookBody, webhookSignature) => {
  try {
    const webhookSecret = getWebhookSecret();
    if (!webhookSecret) {
      console.error("Razorpay webhook secret not configured");
      return false;
    }

    return isValidWebhookSignature({ rawBody: webhookBody, signature: webhookSignature, secret: webhookSecret });
  } catch (error) {
    console.error("Webhook signature verification error:", error.message);
    return false;
  }
};

/**
 * Convert rupees to paise
 *
 * @param {number} rupees - Amount in rupees
 * @returns {number} Amount in paise
 */
export const rupeesToPaise = (rupees) => {
  const n = Number(rupees);
  if (!Number.isFinite(n) || n < 0) return NaN;
  return Math.round(n * 100);
};

/**
 * Convert paise to rupees
 *
 * @param {number} paise - Amount in paise
 * @returns {number} Amount in rupees
 */
export const paiseToRupees = (paise) => {
  return paise / 100;
};

export default {
  createOrder,
  verifyPaymentSignature,
  fetchPayment,
  fetchOrder,
  capturePayment,
  initiateRefund,
  fetchRefund,
  verifyWebhookSignature,
  rupeesToPaise,
  paiseToRupees,
};
