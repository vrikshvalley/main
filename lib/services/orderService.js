import { db } from "../firebaseConfig";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  getDocs,
  updateDoc,
} from "firebase/firestore";

/**
 * Order Service
 * Handles order CRUD operations with Firebase Firestore
 * Integrates with Delhivery for shipping and tracking
 */

/**
 * Create a new order in the database
 * @param {Object} orderData - Order details
 * @returns {Promise<Object>} Created order with { data, error }
 */
export async function createOrder(orderData) {
  try {
    const order = {
      user_id: orderData.userId,
      order_id: orderData.orderId, // Unique order ID (e.g., ORD-1234567890)
      status: orderData.status || "pending", // pending, confirmed, shipped, delivered, cancelled, returned
      payment_status: orderData.paymentStatus || "pending", // pending, paid, failed, refunded
      payment_method: orderData.paymentMethod || "razorpay",
      razorpay_order_id: orderData.razorpayOrderId || null,
      razorpay_payment_id: orderData.razorpayPaymentId || null,
      razorpay_signature: orderData.razorpaySignature || null,

      // Delhivery details
      delhivery_waybill: orderData.delhiveryWaybill || null,
      delhivery_shipment_id: orderData.delhiveryShipmentId || null,
      awb_code: orderData.awbCode || null,
      courier_name: orderData.courierName || null,
      courier_id: orderData.courierId || null,

      // Order details
      items: orderData.items, // Array of { product_id, name, price, quantity, image }
      subtotal: orderData.subtotal,
      shipping_charges: orderData.shippingCharges || 0,
      tax: orderData.tax || 0,
      discount: orderData.discount || 0,
      total: orderData.total,

      // Customer details
      customer_name: orderData.customerName,
      customer_email: orderData.customerEmail,
      customer_phone: orderData.customerPhone,

      // Shipping address
      shipping_address: orderData.shippingAddress, // Object with line1, line2, locality, city, state, pincode

      // Timestamps
      order_date: orderData.orderDate || new Date().toISOString(),
      payment_date: orderData.paymentDate || null,
      shipped_date: orderData.shippedDate || null,
      delivered_date: orderData.deliveredDate || null,
      cancelled_date: orderData.cancelledDate || null,

      // Additional info
      notes: orderData.notes || null,
      cancellation_reason: orderData.cancellationReason || null,
      return_reason: orderData.returnReason || null,
    };

    const docRef = doc(db, "orders", order.order_id);
    await setDoc(docRef, {
      ...order,
      createdAt: new Date().toISOString(),
    });

    console.log("Order created in database:", order.order_id);
    return { data: order, error: null };
  } catch (error) {
    console.error("Order creation error:", error);
    return {
      data: null,
      error: { message: error.message || "Failed to create order" },
    };
  }
}

/**
 * Get order by order ID
 * @param {string} orderId - Unique order ID (e.g., ORD-1234567890)
 * @returns {Promise<Object>} Order details
 */
export async function getOrder(orderId) {
  try {
    const docRef = doc(db, "orders", orderId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { data: { id: docSnap.id, ...docSnap.data() }, error: null };
    } else {
      throw new Error("Order not found");
    }
  } catch (error) {
    console.error("Get order error:", error);
    return {
      data: null,
      error: { message: error.message || "Failed to fetch order" },
    };
  }
}

/**
 * Get all orders for a user
 * @param {string} userId - User ID
 * @param {number} limit - Number of orders to fetch (optional)
 * @param {string} status - Filter by status (optional)
 * @returns {Promise<Object>} Array of orders
 */
export async function getUserOrders(userId, limitCount = null, status = null) {
  try {
    const ordersRef = collection(db, "orders");
    let q = query(
      ordersRef,
      where("user_id", "==", userId),
      orderBy("order_date", "desc"),
    );

    if (status) {
      q = query(
        ordersRef,
        where("user_id", "==", userId),
        where("status", "==", status),
        orderBy("order_date", "desc"),
      );
    }

    if (limitCount) {
      q = query(q, firestoreLimit(limitCount));
    }

    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { data: data || [], error: null };
  } catch (error) {
    console.error("Get user orders error:", error);
    return {
      data: [],
      error: { message: error.message || "Failed to fetch orders" },
    };
  }
}

/**
 * Update order status
 * @param {string} orderId - Order ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated order
 */
export async function updateOrder(orderId, updates) {
  try {
    const docRef = doc(db, "orders", orderId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });

    // Return updated document
    const updatedDoc = await getDoc(docRef);
    console.log("Order updated:", orderId);
    return { data: { id: updatedDoc.id, ...updatedDoc.data() }, error: null };
  } catch (error) {
    console.error("Order update error:", error);
    return {
      data: null,
      error: { message: error.message || "Failed to update order" },
    };
  }
}

/**
 * Update order payment status
 * @param {string} orderId - Order ID
 * @param {string} paymentStatus - Payment status
 * @param {Object} paymentDetails - Razorpay payment details
 * @returns {Promise<Object>} Updated order
 */
export async function updatePaymentStatus(
  orderId,
  paymentStatus,
  paymentDetails = {},
) {
  try {
    const updates = {
      payment_status: paymentStatus,
      payment_date: paymentStatus === "paid" ? new Date().toISOString() : null,
      ...paymentDetails,
    };

    return await updateOrder(orderId, updates);
  } catch (error) {
    console.error("Payment status update error:", error);
    return {
      data: null,
      error: { message: error.message || "Failed to update payment status" },
    };
  }
}

/**
 * Update order shipping details
 * @param {string} orderId - Order ID
 * @param {Object} shippingDetails - Delhivery shipping details
 * @returns {Promise<Object>} Updated order
 */
export async function updateShippingDetails(orderId, shippingDetails) {
  try {
    const updates = {
      status: "shipped",
      shipped_date: new Date().toISOString(),
      ...shippingDetails,
    };

    return await updateOrder(orderId, updates);
  } catch (error) {
    console.error("Shipping details update error:", error);
    return {
      data: null,
      error: { message: error.message || "Failed to update shipping details" },
    };
  }
}

/**
 * Mark order as delivered
 * @param {string} orderId - Order ID
 * @returns {Promise<Object>} Updated order
 */
export async function markAsDelivered(orderId) {
  try {
    const updates = {
      status: "delivered",
      delivered_date: new Date().toISOString(),
    };

    return await updateOrder(orderId, updates);
  } catch (error) {
    console.error("Mark delivered error:", error);
    return {
      data: null,
      error: { message: error.message || "Failed to mark order as delivered" },
    };
  }
}

/**
 * Cancel order
 * @param {string} orderId - Order ID
 * @param {string} reason - Cancellation reason
 * @returns {Promise<Object>} Updated order
 */
export async function cancelOrder(orderId, reason = null) {
  try {
    const updates = {
      status: "cancelled",
      cancelled_date: new Date().toISOString(),
      cancellation_reason: reason,
    };

    return await updateOrder(orderId, updates);
  } catch (error) {
    console.error("Cancel order error:", error);
    return {
      data: null,
      error: { message: error.message || "Failed to cancel order" },
    };
  }
}

/**
 * Request order return
 * @param {string} orderId - Order ID
 * @param {string} reason - Return reason
 * @returns {Promise<Object>} Updated order
 */
export async function requestOrderReturn(orderId, reason = null) {
  try {
    const updates = {
      status: "returned",
      return_reason: reason,
    };

    return await updateOrder(orderId, updates);
  } catch (error) {
    console.error("Return order error:", error);
    return {
      data: null,
      error: { message: error.message || "Failed to request return" },
    };
  }
}

/**
 * Get order statistics for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Order statistics
 */
export async function getOrderStats(userId) {
  try {
    const ordersRef = collection(db, "orders");
    const q = query(ordersRef, where("user_id", "==", userId));
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map((doc) => doc.data());

    const stats = {
      total: data.length,
      pending: data.filter((o) => o.status === "pending").length,
      confirmed: data.filter((o) => o.status === "confirmed").length,
      shipped: data.filter((o) => o.status === "shipped").length,
      delivered: data.filter((o) => o.status === "delivered").length,
      cancelled: data.filter((o) => o.status === "cancelled").length,
      returned: data.filter((o) => o.status === "returned").length,
      totalSpent: data.reduce((sum, o) => sum + (o.total || 0), 0),
    };

    return { data: stats, error: null };
  } catch (error) {
    console.error("Get order stats error:", error);
    return {
      data: null,
      error: { message: error.message || "Failed to fetch order stats" },
    };
  }
}

/**
 * Generate unique order ID
 * @returns {string} Unique order ID (e.g., ORD-1731043200000)
 */
export function generateOrderId() {
  return `ORD-${Date.now()}`;
}

/**
 * Format order items for Delhivery
 * @param {Array} cartItems - Cart items
 * @returns {Array} Formatted items for Delhivery API
 */
export function formatItemsForDelhivery(cartItems) {
  return cartItems.map((item, index) => ({
    name: item.name,
    sku: item.id || `SKU-${index + 1}`,
    units: item.quantity,
    selling_price: item.price, // Price already in rupees
    discount: 0,
    tax: 0,
    hsn: item.hsn || 0,
  }));
}

/**
 * Calculate order totals
 * @param {Array} items - Cart items
 * @param {number} shippingCharges - Shipping charges in paise
 * @param {number} discount - Discount in paise
 * @returns {Object} Order totals { subtotal, tax, total }
 */
export function calculateOrderTotals(items, shippingCharges = 0, discount = 0) {
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const tax = Math.round(subtotal * 0); // 0% tax for now, adjust as needed
  const total = subtotal + shippingCharges + tax - discount;

  return {
    subtotal,
    tax,
    shippingCharges,
    discount,
    total,
  };
}

export default {
  createOrder,
  getOrder,
  getUserOrders,
  updateOrder,
  updatePaymentStatus,
  updateShippingDetails,
  markAsDelivered,
  cancelOrder,
  requestOrderReturn,
  getOrderStats,
  generateOrderId,
  formatItemsForDelhivery,
  calculateOrderTotals,
};
