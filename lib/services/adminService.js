import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  startAfter,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";

// ==================== PRODUCTS ====================

/**
 * Get products with pagination and filters
 */
export async function getAdminProducts({
  page = 1,
  pageSize = 10,
  category = null,
  searchQuery = null,
  sortBy = "createdAt",
  sortOrder = "desc",
} = {}) {
  try {
    const productsRef = collection(db, "products");
    let q = query(productsRef);

    // Add filters
    if (category) {
      q = query(q, where("category", "==", category));
    }

    // Add sorting
    q = query(q, orderBy(sortBy, sortOrder));

    // Add pagination
    q = query(q, firestoreLimit(pageSize));

    const snapshot = await getDocs(q);

    let products = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Client-side search if query provided
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      products = products.filter(
        (p) =>
          p.name?.toLowerCase().includes(searchLower) ||
          p.slug?.toLowerCase().includes(searchLower) ||
          p.category?.toLowerCase().includes(searchLower)
      );
    }

    // Get total count (approximation for pagination)
    const totalSnapshot = await getDocs(collection(db, "products"));
    const totalCount = totalSnapshot.size;

    return {
      success: true,
      data: products,
      pagination: {
        currentPage: page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
        hasNext: snapshot.docs.length === pageSize,
        hasPrev: page > 1,
      },
    };
  } catch (error) {
    console.error("Error fetching admin products:", error);
    return {
      success: false,
      error: error.message,
      data: [],
      pagination: null,
    };
  }
}

/**
 * Get single product by ID
 */
export async function getAdminProduct(productId) {
  try {
    const productRef = doc(db, "products", productId);
    const productSnap = await getDoc(productRef);

    if (!productSnap.exists()) {
      return { success: false, error: "Product not found" };
    }

    return {
      success: true,
      data: {
        id: productSnap.id,
        ...productSnap.data(),
      },
    };
  } catch (error) {
    console.error("Error fetching product:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Create new product
 */
export async function createProduct(productData) {
  try {
    const productsRef = collection(db, "products");

    const newProduct = {
      ...productData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      priceType:
        productData.price === "Price on Customization" ? "custom" : "fixed",
      priceValue:
        productData.price === "Price on Customization"
          ? null
          : parseFloat(productData.price),
      searchKeywords: generateSearchKeywords(productData),
    };

    const docRef = await addDoc(productsRef, newProduct);

    return {
      success: true,
      data: { id: docRef.id, ...newProduct },
    };
  } catch (error) {
    console.error("Error creating product:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Update existing product
 */
export async function updateProduct(productId, updates) {
  try {
    const productRef = doc(db, "products", productId);

    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString(),
      priceType:
        updates.price === "Price on Customization" ? "custom" : "fixed",
      priceValue:
        updates.price === "Price on Customization"
          ? null
          : parseFloat(updates.price),
      searchKeywords: generateSearchKeywords(updates),
    };

    await updateDoc(productRef, updateData);

    return { success: true };
  } catch (error) {
    console.error("Error updating product:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete product
 */
export async function deleteProduct(productId) {
  try {
    const productRef = doc(db, "products", productId);
    await deleteDoc(productRef);

    return { success: true };
  } catch (error) {
    console.error("Error deleting product:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Bulk update products
 */
export async function bulkUpdateProducts(productIds, updates) {
  try {
    const batch = writeBatch(db);

    productIds.forEach((productId) => {
      const productRef = doc(db, "products", productId);
      batch.update(productRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
    });

    await batch.commit();
    return { success: true };
  } catch (error) {
    console.error("Error bulk updating products:", error);
    return { success: false, error: error.message };
  }
}

// ==================== ORDERS ====================

/**
 * Get orders with pagination and filters
 */
export async function getAdminOrders({
  page = 1,
  pageSize = 10,
  status = null,
  userId = null,
  sortBy = "created_at",
  sortOrder = "desc",
} = {}) {
  try {
    const ordersRef = collection(db, "orders");
    let q = query(ordersRef);

    // Add filters
    if (status) {
      q = query(q, where("status", "==", status));
    }
    if (userId) {
      q = query(q, where("user_id", "==", userId));
    }

    // Add sorting
    q = query(q, orderBy(sortBy, sortOrder));

    // Add pagination
    q = query(q, firestoreLimit(pageSize));

    const snapshot = await getDocs(q);

    const orders = await Promise.all(
      snapshot.docs.map(async (orderDoc) => {
        const orderData = orderDoc.data();

        // Fetch user details
        let userData = null;
        if (orderData.user_id) {
          const userResult = await getUserDetails(orderData.user_id);
          userData = userResult.data;
        }

        return {
          id: orderDoc.id,
          ...orderData,
          user: userData,
        };
      })
    );

    // Get total count
    const totalSnapshot = await getDocs(collection(db, "orders"));
    const totalCount = totalSnapshot.size;

    return {
      success: true,
      data: orders,
      pagination: {
        currentPage: page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
        hasNext: snapshot.docs.length === pageSize,
        hasPrev: page > 1,
      },
    };
  } catch (error) {
    console.error("Error fetching admin orders:", error);
    return {
      success: false,
      error: error.message,
      data: [],
      pagination: null,
    };
  }
}

/**
 * Get single order with full details
 */
export async function getAdminOrder(orderId) {
  try {
    const orderRef = doc(db, "orders", orderId);
    const orderSnap = await getDoc(orderRef);

    if (!orderSnap.exists()) {
      return { success: false, error: "Order not found" };
    }

    const orderData = orderSnap.data();

    // Fetch user details
    let userData = null;
    if (orderData.user_id) {
      const userResult = await getUserDetails(orderData.user_id);
      userData = userResult.data;
    }

    // Fetch product details for each item
    const itemsWithProducts = await Promise.all(
      (orderData.items || []).map(async (item) => {
        const productResult = await getAdminProduct(item.product_id);
        return {
          ...item,
          product: productResult.data,
        };
      })
    );

    return {
      success: true,
      data: {
        id: orderSnap.id,
        ...orderData,
        user: userData,
        items: itemsWithProducts,
      },
    };
  } catch (error) {
    console.error("Error fetching order:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Update order status
 */
export async function updateOrderStatus(orderId, status, notes = "") {
  try {
    const orderRef = doc(db, "orders", orderId);

    await updateDoc(orderRef, {
      status,
      status_notes: notes,
      updated_at: new Date().toISOString(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating order status:", error);
    return { success: false, error: error.message };
  }
}

// ==================== USERS ====================

/**
 * Get user details
 */
export async function getUserDetails(userId) {
  try {
    const userRef = doc(db, "profiles", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return { success: false, error: "User not found", data: null };
    }

    return {
      success: true,
      data: {
        id: userSnap.id,
        ...userSnap.data(),
      },
    };
  } catch (error) {
    console.error("Error fetching user:", error);
    return { success: false, error: error.message, data: null };
  }
}

/**
 * Get all users with pagination
 */
export async function getAdminUsers({ page = 1, pageSize = 20 } = {}) {
  try {
    const usersRef = collection(db, "profiles");
    const q = query(
      usersRef,
      orderBy("created_at", "desc"),
      firestoreLimit(pageSize)
    );

    const snapshot = await getDocs(q);

    const users = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return {
      success: true,
      data: users,
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    return { success: false, error: error.message, data: [] };
  }
}

// ==================== HELPERS ====================

function generateSearchKeywords(productData) {
  const keywords = [
    productData.name?.toLowerCase(),
    productData.slug,
    productData.category?.toLowerCase(),
    ...(productData.subcategories || []).map((sub) => sub?.toLowerCase()),
    ...(productData.tags || []).map((tag) => tag?.toLowerCase()),
  ].filter(Boolean);

  return [...new Set(keywords)];
}

/**
 * Get dashboard statistics
 */
export async function getDashboardStats() {
  try {
    // Get products count
    const productsSnapshot = await getDocs(collection(db, "products"));
    const productsCount = productsSnapshot.size;

    // Get orders count by status
    const ordersSnapshot = await getDocs(collection(db, "orders"));
    const ordersCount = ordersSnapshot.size;

    let pendingOrders = 0;
    let processingOrders = 0;
    let completedOrders = 0;
    let totalRevenue = 0;

    ordersSnapshot.forEach((doc) => {
      const order = doc.data();
      if (order.status === "pending") pendingOrders++;
      if (order.status === "processing") processingOrders++;
      if (order.status === "completed") completedOrders++;
      if (order.totals?.total) totalRevenue += order.totals.total;
    });

    // Get users count
    const usersSnapshot = await getDocs(collection(db, "profiles"));
    const usersCount = usersSnapshot.size;

    return {
      success: true,
      data: {
        products: {
          total: productsCount,
        },
        orders: {
          total: ordersCount,
          pending: pendingOrders,
          processing: processingOrders,
          completed: completedOrders,
        },
        revenue: {
          total: totalRevenue,
        },
        users: {
          total: usersCount,
        },
      },
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return { success: false, error: error.message };
  }
}
