# Firebase Migration Status

## ✅ Completed

### Core Infrastructure

- [x] Created `lib/firebaseConfig.js` with Firebase app initialization
- [x] Set up Firebase Auth and Firestore exports
- [x] Created `.env.local.example` with required environment variables
- [x] Created `FIREBASE_SETUP.md` with comprehensive setup instructions

### Authentication Services

- [x] Migrated `lib/authHandlers.js` to Firebase
  - Google OAuth login with popup
  - Email magic link authentication
  - Email link verification handler
  - Proper error handling maintained

### Database Services

- [x] Migrated `lib/services/userService.js` (100% complete)

  - getProfile: Firestore document read
  - createProfile: Firestore document creation with timestamps
  - updateProfile: Firestore document update
  - Address management (add, update, delete) - uses getProfile/updateProfile
  - Wishlist management (add, remove, toggle) - uses getProfile/updateProfile

- [x] Migrated `lib/services/orderService.js` (100% complete)
  - createOrder: Firestore setDoc
  - getOrder: Firestore getDoc
  - getUserOrders: Firestore query with filtering and ordering
  - updateOrder: Firestore updateDoc
  - updatePaymentStatus: Delegates to updateOrder
  - updateShippingDetails: Delegates to updateOrder
  - markAsDelivered: Delegates to updateOrder
  - cancelOrder: Delegates to updateOrder
  - requestOrderReturn: Delegates to updateOrder
  - getOrderStats: Firestore aggregation queries
  - All helper functions preserved (generateOrderId, formatItemsForShiprocket, calculateOrderTotals)

### UI Components

- [x] Migrated `components/auth/ProfileIcon.jsx`

  - Firebase onAuthStateChanged listener
  - User state management

- [x] Migrated `app/auth/callback/page.jsx`

  - Firebase auth state handling
  - Profile creation on first login
  - Proper redirect logic

- [x] Migrated `app/profile/page.jsx`

  - Firebase auth state listener
  - User profile management
  - Account deactivation (Firestore document delete)
  - Logout with Firebase signOut

- [x] Migrated `components/general/AutoLogoutProvider.jsx`
  - Firebase auth state monitoring
  - Auto-logout with Firebase signOut

### Utility Files

- [x] Migrated `lib/autoLogout.js`
  - Firebase signOut integration
  - Session validity check with Firebase auth

### Cart Management (100% Complete)

- [x] `lib/cartUtils.js` - Migrated all functions to Firebase Firestore
  - Cart stored in single document per user: `carts/{userId}`
  - Local storage for guest users
  - Auto-sync when user logs in (merges guest + user carts)
- [x] `lib/slices/cartSlice.js` - Updated to use Firebase functions
- [x] `components/cart/CartModal.jsx` - Firebase auth integration
- [x] `components/cart/Cart.jsx` - Firebase auth integration
- [x] `components/cart/AddToCartButton.jsx` - Firebase auth integration

**Strategy Implemented**:

- Guest users: Cart stored in localStorage
- Logged-in users: Cart synced to Firestore (`carts` collection)
- On login: Guest cart automatically merged with user's Firestore cart

### Wishlist

- [x] `components/general/WishlistButton.jsx` - Updated to use Firebase auth

### Global Authentication Context (NEW)

- [x] `lib/AuthContext.jsx` - Created global auth provider with React Context
  - Single source of truth for user state
  - Automatic auth state updates across entire app
  - `useAuth()` hook available in any component
- [x] `app/providers.jsx` - Integrated AuthProvider with Redux

### Pages (All User-Facing Pages Complete)

- [x] `app/page.jsx` - Removed redundant Supabase auth check
- [x] `app/checkout/page.jsx` - Uses global `useAuth()` hook
- [x] `app/orders/page.jsx` - Uses global `useAuth()` hook
- [x] `app/orders/[orderId]/page.jsx` - Uses global `useAuth()` hook

### Profile & Security

- [x] `components/profile/SecuritySettings.jsx` - Firebase password reset email

## ⚠️ Remaining Work (Admin Only - Low Priority)

The following files are admin-related and still use Supabase. These are optional and can be migrated later:

### Admin Pages (Optional)

- [ ] `app/admin/login/page.jsx` - Admin login
- [ ] `app/admin/profile/page.jsx` - Admin profile
- [ ] `components/admin/Products.jsx` - Product management
- [ ] `components/admin/Orders.jsx` - Order management

**Note**: Admin functionality may need a separate Firebase Admin SDK setup for backend operations.

## 🗑️ Files to Delete After Complete Migration

Once all components are migrated and tested:

- [ ] `lib/supabaseClient.js`
- [ ] Remove `@supabase/supabase-js` from `package.json`
- [ ] Remove `@supabase/ssr` from `package.json` (if present)

## 📋 Migration Patterns Reference

### Authentication

```javascript
// OLD (Supabase)
const { data: { user } } = await supabase.auth.getUser();
supabase.auth.onAuthStateChange(callback);
await supabase.auth.signOut();

// NEW (Firebase)
import { auth } from '@/lib/firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const unsubscribe = onAuthStateChanged(auth, (user) => { ... });
await signOut(auth);
```

### Database Reads

```javascript
// OLD (Supabase)
const { data, error } = await supabase
  .from("profiles")
  .select("*")
  .eq("id", userId)
  .single();

// NEW (Firebase)
import { db } from "@/lib/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

const docRef = doc(db, "profiles", userId);
const docSnap = await getDoc(docRef);
const data = docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
```

### Database Writes

```javascript
// OLD (Supabase)
const { data, error } = await supabase
  .from("profiles")
  .insert([profileData])
  .select();

// NEW (Firebase)
import { doc, setDoc } from "firebase/firestore";

const docRef = doc(db, "profiles", userId);
await setDoc(docRef, {
  ...profileData,
  createdAt: new Date().toISOString(),
});
```

### Database Updates

```javascript
// OLD (Supabase)
const { data, error } = await supabase
  .from("profiles")
  .update(updates)
  .eq("id", userId)
  .select();

// NEW (Firebase)
import { doc, updateDoc, getDoc } from "firebase/firestore";

const docRef = doc(db, "profiles", userId);
await updateDoc(docRef, {
  ...updates,
  updatedAt: new Date().toISOString(),
});
const updatedDoc = await getDoc(docRef);
```

### Queries with Filters

```javascript
// OLD (Supabase)
const { data, error } = await supabase
  .from("orders")
  .select("*")
  .eq("user_id", userId)
  .order("order_date", { ascending: false })
  .limit(10);

// NEW (Firebase)
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";

const ordersRef = collection(db, "orders");
const q = query(
  ordersRef,
  where("user_id", "==", userId),
  orderBy("order_date", "desc"),
  limit(10)
);
const querySnapshot = await getDocs(q);
const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
```

## 🚀 Next Steps

1. **Review cart strategy**: Decide if cart should be in Firestore or remain local
2. **Migrate cart components** based on decision above
3. **Update wishlist button** to use migrated userService
4. **Review and migrate product fetching** on homepage
5. **Migrate checkout page** for order creation
6. **Test authentication flow** end-to-end
7. **Test order creation** and management
8. **Setup Firebase project** following FIREBASE_SETUP.md
9. **Configure environment variables**
10. **Deploy and test** in production

## 📝 Testing Checklist

Before deleting Supabase:

- [ ] Google OAuth login works
- [ ] Email magic link login works
- [ ] Profile creation on first login
- [ ] Profile viewing and editing
- [ ] Address management (add, update, delete)
- [ ] Order creation
- [ ] Order viewing
- [ ] Order status updates
- [ ] Wishlist functionality
- [ ] Auto-logout works
- [ ] Manual logout works
- [ ] Protected routes redirect correctly

## 🔒 Security Considerations

1. **Firestore Security Rules**: Ensure rules are properly configured (see FIREBASE_SETUP.md)
2. **Environment Variables**: Never commit `.env.local` to git
3. **API Keys**: Firebase API keys are safe to expose in client-side code (protected by Firebase security rules and authorized domains)
4. **Admin Operations**: May need Firebase Admin SDK for server-side operations
