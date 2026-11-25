import { FieldValue } from "firebase-admin/firestore";
import { adminAuth, adminDb } from "./firebaseAdmin";
import { mergeAddress } from "@/lib/payments/address";

/**
 * Guest checkout → real customer account.
 *
 * Shoppers never log in to buy. After a payment is VERIFIED, the order's email
 * is matched to a Firebase Auth user (created if new) and the order is
 * attached to that uid. When they later sign in with Google or an email link
 * using the same address, Firebase resolves to this same account (keep
 * "Link accounts that use the same email" selected in Authentication >
 * Settings > User account linking), so their orders, saved addresses and cart
 * are all there.
 *
 * Accounts are created only after a paid order, never on an unauthenticated
 * request, so the public checkout endpoint cannot be used to mass-create users.
 * We never sign the buyer in automatically: the email was typed, not proven,
 * so that would let anyone take over an account by typing its address.
 */

async function findOrCreateAuthUser({ email, name }) {
  const auth = adminAuth();
  try {
    return { user: await auth.getUserByEmail(email), created: false };
  } catch (e) {
    if (e.code !== "auth/user-not-found") throw e;
  }
  try {
    const user = await auth.createUser({ email, displayName: name || undefined, emailVerified: false });
    return { user, created: true };
  } catch (e) {
    // Two checkouts for a new email at the same moment: the other one won.
    if (e.code === "auth/email-already-exists") return { user: await auth.getUserByEmail(email), created: false };
    throw e;
  }
}

/** Creates or updates profiles/{uid} (the document the account pages already read). */
export async function upsertProfile(uid, { email, name, phone, address, saveAddress, verifiedUser = false }) {
  const ref = adminDb().collection("profiles").doc(uid);
  await adminDb().runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const now = new Date().toISOString();
    if (!snap.exists) {
      tx.set(ref, {
        email,
        name: name || "",
        phone: phone || "",
        avatar_url: "",
        address: saveAddress && address ? mergeAddress([], address) : [],
        source: "checkout",
        createdAt: now,
        updatedAt: now,
      });
      return;
    }
    // Never let an unverified guest checkout overwrite or append to an existing customer's profile.
    if (!verifiedUser) return;
    const p = snap.data();
    const updates = { updatedAt: now };
    if (!p.name && name) updates.name = name;
    if (!p.phone && phone) updates.phone = phone;
    if (!p.email && email) updates.email = email;
    if (saveAddress && address) {
      const merged = mergeAddress(p.address, address);
      if (merged.length !== (p.address || []).length) updates.address = merged;
    }
    tx.update(ref, updates);
  });
}

/**
 * Resolves the customer for a paid order.
 * @returns {{ uid: string, created: boolean }}
 */
export async function attachCustomerForOrder(order) {
  const email = order.customer_email;
  if (!email) throw new Error("Order has no email");

  const hadAuthenticatedUser = Boolean(order.user_id);
  let uid = order.user_id;
  let created = false;
  if (!uid) {
    const found = await findOrCreateAuthUser({ email, name: order.customer_name });
    uid = found.user.uid;
    created = found.created;
  }

  await upsertProfile(uid, {
    email,
    name: order.customer_name,
    phone: order.customer_phone,
    address: order.shipping_address,
    saveAddress: order.save_address !== false,
    verifiedUser: hadAuthenticatedUser || created,
  });

  return { uid, created };
}

export { FieldValue };
