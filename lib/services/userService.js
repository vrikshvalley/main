import { db } from "../firebaseConfig";
import { doc, getDoc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";

/**
 * User service: wraps Firebase Firestore operations for profile, addresses, orders, wishlist, payments
 * Keep methods small and testable. Returns { data, error } for consistent error handling.
 */

export async function getProfile(userId) {
  if (!userId) return { data: null, error: new Error("Missing userId") };
  try {
    const docRef = doc(db, "profiles", userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { data: { id: docSnap.id, ...docSnap.data() }, error: null };
    } else {
      return { data: null, error: new Error("Profile not found") };
    }
  } catch (error) {
    return { data: null, error };
  }
}

export async function createProfile(profileData) {
  try {
    const { id, ...data } = profileData;
    const docRef = doc(db, "profiles", id);
    await setDoc(docRef, {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return { data: [{ id, ...data }], error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function updateProfile(userId, changes) {
  try {
    const docRef = doc(db, "profiles", userId);
    await updateDoc(docRef, {
      ...changes,
      updatedAt: new Date().toISOString(),
    });

    // Return updated document
    const updatedDoc = await getDoc(docRef);
    return { data: [{ id: updatedDoc.id, ...updatedDoc.data() }], error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function addAddress(userId, newAddress) {
  const { data: profile, error: pError } = await getProfile(userId);
  if (pError) return { data: null, error: pError };
  const addresses = [...(profile.address || []), newAddress];
  return await updateProfile(userId, { address: addresses });
}

export async function updateAddress(userId, updatedAddress) {
  const { data: profile, error: pError } = await getProfile(userId);
  if (pError) return { data: null, error: pError };
  const addresses = (profile.address || []).map((a) =>
    a.id === updatedAddress.id ? updatedAddress : a
  );
  return await updateProfile(userId, { address: addresses });
}

export async function deleteAddress(userId, addressId) {
  const { data: profile, error: pError } = await getProfile(userId);
  if (pError) return { data: null, error: pError };
  const addresses = (profile.address || []).filter((a) => a.id !== addressId);
  return await updateProfile(userId, { address: addresses });
}

// For now orders and wishlist are mocked if no dedicated tables exist
export async function getRecentOrders(userId, limit = 5) {
  // Placeholder: if you have an orders table, fetch from there.
  // Return a mock response for UI purposes
  const mock = [
    {
      id: "ORD-1001",
      date: new Date().toISOString(),
      total: 599,
      status: "Delivered",
      items: [{ id: "p1", name: "Snake Plant", image: "/hero1.jpg", qty: 1 }],
    },
    {
      id: "ORD-1000",
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
      total: 349,
      status: "In Transit",
      items: [{ id: "p2", name: "Money Plant", image: "/hero2.jpg", qty: 2 }],
    },
  ];
  return { data: mock.slice(0, limit), error: null };
}

export async function getWishlist(userId) {
  const { data: profile, error } = await getProfile(userId);
  if (error) return { data: [], error };
  return { data: profile.wishlist || [], error: null };
}

export async function addWishlistItem(userId, item) {
  const { data: profile, error: pError } = await getProfile(userId);
  if (pError) return { data: null, error: pError };
  const currentWishlist = profile.wishlist || [];
  // Don't add if already exists
  if (currentWishlist.some((i) => i.id === item.id)) {
    return { data: profile, error: null };
  }
  const wishlist = [...currentWishlist, item];
  return await updateProfile(userId, { wishlist });
}

export async function removeWishlistItem(userId, itemId) {
  const { data: profile, error: pError } = await getProfile(userId);
  if (pError) return { data: null, error: pError };
  const wishlist = (profile.wishlist || []).filter((i) => i.id !== itemId);
  return await updateProfile(userId, { wishlist });
}

export async function toggleWishlistItem(userId, item) {
  const { data: profile, error: pError } = await getProfile(userId);
  if (pError) return { data: null, error: pError };
  const currentWishlist = profile.wishlist || [];
  const exists = currentWishlist.some((i) => i.id === item.id);

  if (exists) {
    return await removeWishlistItem(userId, item.id);
  } else {
    return await addWishlistItem(userId, item);
  }
}

/**
 * Delete user profile
 * @param {string} userId
 * @returns {Promise<Object>}
 */
export async function deleteProfile(userId) {
  try {
    const profileRef = doc(db, "profiles", userId);
    await deleteDoc(profileRef);
    return { data: { success: true }, error: null };
  } catch (error) {
    console.error("Error deleting profile:", error);
    return { data: null, error };
  }
}

export default {
  getProfile,
  createProfile,
  updateProfile,
  addAddress,
  updateAddress,
  deleteAddress,
  deleteProfile,
  getRecentOrders,
  getWishlist,
  addWishlistItem,
  removeWishlistItem,
  toggleWishlistItem,
};
