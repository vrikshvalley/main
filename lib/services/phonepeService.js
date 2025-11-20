/**
 * PhonePe Payment Gateway Service
 *
 * Service module for PhonePe payment gateway integration
 * Handles OAuth authentication, payment creation, status checks, and refunds
 *
 * API Documentation: https://developer.phonepe.com/payment-gateway/website-integration/standard-checkout/api-integration
 */

import axios from "axios";

// Environment configuration
const PHONEPE_BASE_URL =
  process.env.NEXT_PUBLIC_PHONEPE_BASE_URL ||
  "https://api-preprod.phonepe.com/apis/pg-sandbox";
const PHONEPE_AUTH_URL =
  process.env.PHONEPE_AUTH_URL ||
  "https://api-preprod.phonepe.com/apis/pg-sandbox/v1/oauth/token";
const PHONEPE_CLIENT_ID = process.env.PHONEPE_CLIENT_ID;
const PHONEPE_CLIENT_SECRET = process.env.PHONEPE_CLIENT_SECRET;
const PHONEPE_CLIENT_VERSION = process.env.PHONEPE_CLIENT_VERSION;
const PHONEPE_MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID;

// Token caching
let cachedToken = null;
let tokenExpiry = null;

/**
 * Ensure this service only runs server-side
 */
const getPhonePeInstance = () => {
  if (typeof window !== "undefined") {
    throw new Error("PhonePe service can only be used server-side");
  }
  return true;
};

/**
 * Generate OAuth authorization token
 * Token is cached and refreshed when expired
 *
 * @returns {Promise<Object>} { data: token, error: null } or { data: null, error: errorMessage }
 */
export const authenticate = async () => {
  try {
    getPhonePeInstance();

    // Return cached token if still valid
    if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
      console.log("Using cached PhonePe auth token");
      return { data: cachedToken, error: null };
    }

    console.log("Generating new PhonePe auth token...");

    const response = await axios.post(
      PHONEPE_AUTH_URL,
      new URLSearchParams({
        client_id: PHONEPE_CLIENT_ID,
        client_version: PHONEPE_CLIENT_VERSION,
        client_secret: PHONEPE_CLIENT_SECRET,
        grant_type: "client_credentials",
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const { access_token, expires_at } = response.data;

    // Cache the token
    cachedToken = access_token;
    // Set expiry 5 minutes before actual expiry for safety
    tokenExpiry = expires_at * 1000 - 5 * 60 * 1000;

    console.log("PhonePe auth token generated successfully");
    console.log(`Token expires at: ${new Date(tokenExpiry).toISOString()}`);

    return { data: access_token, error: null };
  } catch (error) {
    console.error(
      "PhonePe authentication error:",
      error.response?.data || error.message
    );
    return {
      data: null,
      error:
        error.response?.data?.message || "Failed to authenticate with PhonePe",
    };
  }
};

/**
 * Create a payment order
 *
 * @param {Object} paymentData - Payment details
 * @param {string} paymentData.merchantOrderId - Unique order ID from your system
 * @param {number} paymentData.amount - Amount in paisa (e.g., ₹10 = 1000 paisa)
 * @param {string} paymentData.redirectUrl - URL to redirect after payment
 * @param {Object} paymentData.metaInfo - Optional metadata (udf1-udf15)
 * @param {number} paymentData.expireAfter - Optional expiry time in seconds (300-3600)
 * @returns {Promise<Object>} { data: paymentOrder, error: null } or { data: null, error: errorMessage }
 */
export const createPaymentOrder = async (paymentData) => {
  try {
    getPhonePeInstance();

    const { data: token, error: authError } = await authenticate();
    if (authError) {
      return { data: null, error: authError };
    }

    const {
      merchantOrderId,
      amount,
      redirectUrl,
      metaInfo = {},
      expireAfter = 1200, // 20 minutes default
    } = paymentData;

    // Validate required fields
    if (!merchantOrderId || !amount || !redirectUrl) {
      return {
        data: null,
        error:
          "Missing required fields: merchantOrderId, amount, or redirectUrl",
      };
    }

    // Amount must be minimum 100 paisa (₹1)
    if (amount < 100) {
      return {
        data: null,
        error: "Amount must be at least 100 paisa (₹1)",
      };
    }

    const requestBody = {
      merchantOrderId,
      amount,
      expireAfter,
      metaInfo,
      paymentFlow: {
        type: "PG_CHECKOUT",
        message: "Complete your payment for Vriksh Valley",
        merchantUrls: {
          redirectUrl,
        },
      },
    };

    console.log("Creating PhonePe payment order:", merchantOrderId);

    const response = await axios.post(
      `${PHONEPE_BASE_URL}/checkout/v2/pay`,
      requestBody,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `O-Bearer ${token}`,
        },
      }
    );

    const { orderId, state, expireAt, redirectUrl: paymentUrl } = response.data;

    console.log("PhonePe payment order created successfully");
    console.log(`Order ID: ${orderId}, State: ${state}`);

    return {
      data: {
        orderId, // PhonePe's internal order ID
        merchantOrderId, // Your order ID
        state, // PENDING
        expireAt,
        redirectUrl: paymentUrl, // URL to redirect user for payment
        amount,
      },
      error: null,
    };
  } catch (error) {
    console.error(
      "PhonePe create payment error:",
      error.response?.data || error.message
    );
    return {
      data: null,
      error:
        error.response?.data?.message ||
        "Failed to create PhonePe payment order",
    };
  }
};

/**
 * Check order status
 *
 * @param {string} merchantOrderId - The order ID from your system
 * @param {boolean} details - Return all attempt details (default: false)
 * @param {boolean} errorContext - Include error context for failed payments (default: false)
 * @returns {Promise<Object>} { data: orderStatus, error: null } or { data: null, error: errorMessage }
 */
export const checkOrderStatus = async (
  merchantOrderId,
  details = false,
  errorContext = false
) => {
  try {
    getPhonePeInstance();

    const { data: token, error: authError } = await authenticate();
    if (authError) {
      return { data: null, error: authError };
    }

    console.log("Checking PhonePe order status:", merchantOrderId);

    const response = await axios.get(
      `${PHONEPE_BASE_URL}/checkout/v2/order/${merchantOrderId}/status`,
      {
        params: { details, errorContext },
        headers: {
          "Content-Type": "application/json",
          Authorization: `O-Bearer ${token}`,
        },
      }
    );

    const orderStatus = response.data;

    console.log(`PhonePe order status: ${orderStatus.state}`);

    // Extract payment details if available
    if (orderStatus.paymentDetails && orderStatus.paymentDetails.length > 0) {
      const latestPayment = orderStatus.paymentDetails[0];
      console.log(
        `Payment mode: ${latestPayment.paymentMode}, Transaction state: ${latestPayment.state}`
      );
    }

    return { data: orderStatus, error: null };
  } catch (error) {
    console.error(
      "PhonePe check status error:",
      error.response?.data || error.message
    );

    // Handle invalid order ID error
    if (error.response?.data?.code === "INVALID_MERCHANT_ORDER_ID") {
      return {
        data: null,
        error: "Order not found",
      };
    }

    return {
      data: null,
      error:
        error.response?.data?.message || "Failed to check PhonePe order status",
    };
  }
};

/**
 * Verify payment completion
 * Checks if payment is completed successfully
 *
 * @param {string} merchantOrderId - The order ID from your system
 * @returns {Promise<Object>} { data: verificationResult, error: null } or { data: null, error: errorMessage }
 */
export const verifyPayment = async (merchantOrderId) => {
  try {
    getPhonePeInstance();

    const { data: orderStatus, error } = await checkOrderStatus(
      merchantOrderId,
      false,
      true
    );

    if (error) {
      return { data: null, error };
    }

    // Check if order is completed
    const isCompleted = orderStatus.state === "COMPLETED";

    // Extract transaction details
    const paymentDetails =
      orderStatus.paymentDetails && orderStatus.paymentDetails.length > 0
        ? orderStatus.paymentDetails[0]
        : null;

    const verificationResult = {
      success: isCompleted,
      orderId: orderStatus.orderId,
      merchantOrderId: orderStatus.merchantOrderId || merchantOrderId,
      state: orderStatus.state,
      amount: orderStatus.amount,
      transactionId: paymentDetails?.transactionId || null,
      paymentMode: paymentDetails?.paymentMode || null,
      timestamp: paymentDetails?.timestamp || null,
      metaInfo: orderStatus.metaInfo || {},
      errorCode: orderStatus.errorCode || null,
      errorContext: orderStatus.errorContext || null,
    };

    if (!isCompleted) {
      console.log(`Payment not completed. State: ${orderStatus.state}`);

      if (orderStatus.state === "FAILED") {
        const errorMsg =
          orderStatus.errorContext?.description ||
          orderStatus.errorCode ||
          "Payment failed";
        return {
          data: verificationResult,
          error: errorMsg,
        };
      }

      return {
        data: verificationResult,
        error: "Payment not completed yet",
      };
    }

    console.log("Payment verified successfully");
    return { data: verificationResult, error: null };
  } catch (error) {
    console.error("PhonePe verification error:", error);
    return {
      data: null,
      error: "Failed to verify payment",
    };
  }
};

/**
 * Initiate refund
 *
 * @param {Object} refundData - Refund details
 * @param {string} refundData.merchantRefundId - Unique refund ID from your system
 * @param {string} refundData.merchantOrderId - Original order ID
 * @param {number} refundData.amount - Refund amount in paisa
 * @param {string} refundData.reason - Reason for refund (optional)
 * @returns {Promise<Object>} { data: refund, error: null } or { data: null, error: errorMessage }
 */
export const initiateRefund = async (refundData) => {
  try {
    getPhonePeInstance();

    const { data: token, error: authError } = await authenticate();
    if (authError) {
      return { data: null, error: authError };
    }

    const {
      merchantRefundId,
      merchantOrderId,
      amount,
      reason = "Customer requested refund",
    } = refundData;

    // Validate required fields
    if (!merchantRefundId || !merchantOrderId || !amount) {
      return {
        data: null,
        error:
          "Missing required fields: merchantRefundId, merchantOrderId, or amount",
      };
    }

    // First check the order status to get the transaction ID
    const { data: orderStatus, error: statusError } = await checkOrderStatus(
      merchantOrderId
    );
    if (statusError) {
      return { data: null, error: statusError };
    }

    if (orderStatus.state !== "COMPLETED") {
      return {
        data: null,
        error: "Cannot refund a payment that is not completed",
      };
    }

    const transactionId = orderStatus.paymentDetails?.[0]?.transactionId;
    if (!transactionId) {
      return {
        data: null,
        error: "Transaction ID not found for this order",
      };
    }

    const requestBody = {
      merchantRefundId,
      transactionId,
      amount,
      reason,
    };

    console.log("Initiating PhonePe refund:", merchantRefundId);

    const response = await axios.post(
      `${PHONEPE_BASE_URL}/payments/v2/refund`,
      requestBody,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `O-Bearer ${token}`,
        },
      }
    );

    console.log("PhonePe refund initiated successfully");

    return { data: response.data, error: null };
  } catch (error) {
    console.error(
      "PhonePe refund error:",
      error.response?.data || error.message
    );
    return {
      data: null,
      error: error.response?.data?.message || "Failed to initiate refund",
    };
  }
};

/**
 * Check refund status
 *
 * @param {string} merchantRefundId - The refund ID from your system
 * @returns {Promise<Object>} { data: refundStatus, error: null } or { data: null, error: errorMessage }
 */
export const checkRefundStatus = async (merchantRefundId) => {
  try {
    getPhonePeInstance();

    const { data: token, error: authError } = await authenticate();
    if (authError) {
      return { data: null, error: authError };
    }

    console.log("Checking PhonePe refund status:", merchantRefundId);

    const response = await axios.get(
      `${PHONEPE_BASE_URL}/payments/v2/refund/${merchantRefundId}/status`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `O-Bearer ${token}`,
        },
      }
    );

    console.log(`Refund status: ${response.data.state}`);

    return { data: response.data, error: null };
  } catch (error) {
    console.error(
      "PhonePe check refund status error:",
      error.response?.data || error.message
    );
    return {
      data: null,
      error: error.response?.data?.message || "Failed to check refund status",
    };
  }
};

/**
 * Format amount from rupees to paisa
 *
 * @param {number} rupees - Amount in rupees
 * @returns {number} Amount in paisa
 */
export const rupeesToPaisa = (rupees) => {
  return Math.round(rupees * 100);
};

/**
 * Format amount from paisa to rupees
 *
 * @param {number} paisa - Amount in paisa
 * @returns {number} Amount in rupees
 */
export const paisaToRupees = (paisa) => {
  return paisa / 100;
};

export default {
  authenticate,
  createPaymentOrder,
  checkOrderStatus,
  verifyPayment,
  initiateRefund,
  checkRefundStatus,
  rupeesToPaisa,
  paisaToRupees,
};
