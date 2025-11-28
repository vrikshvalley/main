# Firebase Authentication & Data Storage Guide

## 🔐 How User Authentication Works

### Authentication Providers

Firebase Authentication supports multiple sign-in methods. Here's how each provider stores user data:

### 1. **Email/Password Authentication**

When a user signs up with email and password:

```javascript
// Firebase Auth creates a user with:
{
  uid: "auto_generated_unique_id",
  email: "user@example.com",
  displayName: null, // Can be set later
  photoURL: null,
  emailVerified: false, // Becomes true after email verification
  phoneNumber: null,
  providerId: "password",
  providerData: [{
    uid: "user@example.com",
    email: "user@example.com",
    providerId: "password"
  }]
}
```

**Storage Location:**

- ✅ **Firebase Authentication** - Primary authentication data
- ✅ **Firestore `/users/{uid}`** - User profile data
- ✅ **Firestore `/profiles/{uid}`** - Extended profile information

### 2. **Google Sign-In**

When a user signs in with Google:

```javascript
// Firebase Auth creates a user with:
{
  uid: "auto_generated_unique_id",
  email: "user@gmail.com",
  displayName: "John Doe",
  photoURL: "https://lh3.googleusercontent.com/...",
  emailVerified: true, // Always true for Google
  phoneNumber: null,
  providerId: "google.com",
  providerData: [{
    uid: "google_user_id",
    email: "user@gmail.com",
    displayName: "John Doe",
    photoURL: "https://lh3.googleusercontent.com/...",
    providerId: "google.com"
  }]
}
```

**Storage Location:**

- ✅ **Firebase Authentication** - Primary authentication data (includes Google profile)
- ✅ **Firestore `/users/{uid}`** - User profile data (synced from Google)
- ✅ **Firestore `/profiles/{uid}`** - Extended profile information

### 3. **Facebook Sign-In**

When a user signs in with Facebook:

```javascript
// Firebase Auth creates a user with:
{
  uid: "auto_generated_unique_id",
  email: "user@facebook.com",
  displayName: "John Doe",
  photoURL: "https://graph.facebook.com/.../picture",
  emailVerified: true,
  phoneNumber: null,
  providerId: "facebook.com",
  providerData: [{
    uid: "facebook_user_id",
    email: "user@facebook.com",
    displayName: "John Doe",
    photoURL: "https://graph.facebook.com/.../picture",
    providerId: "facebook.com"
  }]
}
```

**Storage Location:**

- ✅ **Firebase Authentication** - Primary authentication data (includes Facebook profile)
- ✅ **Firestore `/users/{uid}`** - User profile data (synced from Facebook)
- ✅ **Firestore `/profiles/{uid}`** - Extended profile information

---

## 📊 Complete Data Storage Architecture

### Firebase Authentication (Built-in)

```
Firebase Auth Users
├── uid (unique identifier)
├── email
├── displayName
├── photoURL
├── emailVerified
├── phoneNumber
├── providerId (password, google.com, facebook.com)
└── providerData[] (array of provider-specific data)
```

### Firestore Collections

#### 1. **users** Collection

```javascript
/users/{uid}
{
  uid: "firebase_auth_uid",
  email: "user@example.com",
  displayName: "John Doe",
  photoURL: "https://...",
  phoneNumber: "+919876543210",
  emailVerified: true,
  provider: "google.com", // or "password", "facebook.com"
  created_at: "2025-11-28T10:00:00Z",
  updated_at: "2025-11-28T10:00:00Z",
  last_login: "2025-11-28T10:00:00Z",
  is_active: true,
  role: "customer", // or "admin"
  preferences: {
    newsletter: true,
    notifications: true,
    theme: "light"
  }
}
```

#### 2. **profiles** Collection

```javascript
/profiles/{uid}
{
  user_id: "firebase_auth_uid",
  first_name: "John",
  last_name: "Doe",
  phone: "+919876543210",
  default_address: {...},
  addresses: [{...}],
  preferred_courier: {
    courier_id: "1",
    courier_name: "Delhivery"
  },
  total_orders: 5,
  total_spent: 499900, // in paise
  created_at: "2025-11-28T10:00:00Z",
  updated_at: "2025-11-28T10:00:00Z"
}
```

#### 3. **orders** Collection

```javascript
/orders/{order_id}
{
  order_id: "ORD20251128001",
  user_id: "firebase_auth_uid",
  status: "pending",
  payment_status: "pending",
  items: [{...}],
  pricing: {...},
  shipping_address: {...},
  payment_method: "phonepe",
  shiprocket_order_id: null,
  awb_code: null,
  // ... more fields
}
```

#### 4. **reviews** Collection

```javascript
/reviews/{review_id}
{
  product_id: "product_001",
  user_id: "firebase_auth_uid",
  user_name: "John Doe",
  rating: 5,
  comment: "Great product!",
  is_approved: true,
  // ... more fields
}
```

### Realtime Database Structure

#### 1. **products** Node

```javascript
/products/{product_id}
{
  id: "product_001",
  name: "Money Plant",
  price: 29900,
  category: "Indoor Plants",
  // ... more fields (see firebase-products.json)
}
```

#### 2. **categories** Node

```javascript
/categories/{category_id}
{
  id: "category_001",
  name: "Indoor Plants",
  slug: "indoor-plants",
  icon: "🪴",
  // ... more fields
}
```

#### 3. **carts** Node (User-specific)

```javascript
/carts/{user_id}
{
  user_id: "firebase_auth_uid",
  items: {
    "product_001": {
      product_id: "product_001",
      name: "Money Plant",
      price: 29900,
      quantity: 2,
      added_at: "2025-11-28T10:30:00Z"
    }
  },
  updated_at: "2025-11-28T10:30:00Z",
  created_at: "2025-11-28T10:00:00Z"
}
```

#### 4. **wishlists** Node (User-specific)

```javascript
/wishlists/{user_id}
{
  user_id: "firebase_auth_uid",
  items: {
    "product_001": {
      product_id: "product_001",
      added_at: "2025-11-28T10:30:00Z"
    }
  },
  updated_at: "2025-11-28T10:30:00Z"
}
```

---

## 🔄 Authentication Flow

### Sign-Up Flow

```
1. User signs up (Email/Google/Facebook)
   ↓
2. Firebase Auth creates authentication record
   ↓
3. App creates /users/{uid} document in Firestore
   ↓
4. App creates /profiles/{uid} document in Firestore
   ↓
5. App creates /carts/{uid} node in Realtime Database
   ↓
6. User is signed in and redirected
```

### Sign-In Flow

```
1. User signs in (Email/Google/Facebook)
   ↓
2. Firebase Auth validates credentials
   ↓
3. App updates last_login in /users/{uid}
   ↓
4. App loads user profile from /profiles/{uid}
   ↓
5. App loads cart from /carts/{uid}
   ↓
6. User is signed in and sees their data
```

---

## 📂 Data Upload Instructions

### Step 1: Upload Categories to Realtime Database

1. Open Firebase Console → Realtime Database
2. Click on "Import JSON"
3. Copy and paste this JSON:

```json
{
  "categories": {
    "category_001": {
      "id": "category_001",
      "name": "Indoor Plants",
      "slug": "indoor-plants",
      "description": "Beautiful plants perfect for indoor spaces",
      "icon": "🪴",
      "image": "https://res.cloudinary.com/ddnlg9tkj/image/upload/v1/categories/indoor-plants",
      "product_count": 0,
      "is_active": true,
      "created_at": "2025-01-15T00:00:00Z",
      "updated_at": "2025-01-15T00:00:00Z"
    },
    "category_002": {
      "id": "category_002",
      "name": "Outdoor Plants",
      "slug": "outdoor-plants",
      "description": "Hardy plants for gardens and outdoor spaces",
      "icon": "🌳",
      "image": "https://res.cloudinary.com/ddnlg9tkj/image/upload/v1/categories/outdoor-plants",
      "product_count": 0,
      "is_active": true,
      "created_at": "2025-01-15T00:00:00Z",
      "updated_at": "2025-01-15T00:00:00Z"
    },
    "category_003": {
      "id": "category_003",
      "name": "Seeds",
      "slug": "seeds",
      "description": "Quality seeds for growing your own plants",
      "icon": "🌱",
      "image": "https://res.cloudinary.com/ddnlg9tkj/image/upload/v1/categories/seeds",
      "product_count": 0,
      "is_active": true,
      "created_at": "2025-01-15T00:00:00Z",
      "updated_at": "2025-01-15T00:00:00Z"
    },
    "category_004": {
      "id": "category_004",
      "name": "Pots & Planters",
      "slug": "pots-planters",
      "description": "Stylish pots and planters for your plants",
      "icon": "🏺",
      "image": "https://res.cloudinary.com/ddnlg9tkj/image/upload/v1/categories/pots",
      "product_count": 0,
      "is_active": true,
      "created_at": "2025-01-15T00:00:00Z",
      "updated_at": "2025-01-15T00:00:00Z"
    },
    "category_005": {
      "id": "category_005",
      "name": "Soil & Fertilizers",
      "slug": "soil-fertilizers",
      "description": "Premium soil mixes and organic fertilizers",
      "icon": "🌾",
      "image": "https://res.cloudinary.com/ddnlg9tkj/image/upload/v1/categories/soil",
      "product_count": 0,
      "is_active": true,
      "created_at": "2025-01-15T00:00:00Z",
      "updated_at": "2025-01-15T00:00:00Z"
    },
    "category_006": {
      "id": "category_006",
      "name": "Garden Tools",
      "slug": "garden-tools",
      "description": "Essential tools for gardening",
      "icon": "🔧",
      "image": "https://res.cloudinary.com/ddnlg9tkj/image/upload/v1/categories/tools",
      "product_count": 0,
      "is_active": true,
      "created_at": "2025-01-15T00:00:00Z",
      "updated_at": "2025-01-15T00:00:00Z"
    }
  }
}
```

### Step 2: Upload Products (Already Done)

Products are already in `firebase-products.json` - import this file to Realtime Database.

### Step 3: Apply Security Rules

#### Firestore Rules:

1. Go to Firebase Console → Firestore Database → Rules
2. Copy the rules from `firebase-security-rules.json` (firestore section)
3. Click "Publish"

#### Realtime Database Rules:

1. Go to Firebase Console → Realtime Database → Rules
2. Copy the rules from `firebase-security-rules.json` (realtimeDatabase section)
3. Click "Publish"

### Step 4: Create Firestore Indexes

1. Go to Firebase Console → Firestore Database → Indexes
2. Click "Create Index"
3. Add these composite indexes:

**Orders by User and Date:**

- Collection: `orders`
- Fields: `user_id` (Ascending), `order_date` (Descending)

**Orders by User, Status, and Date:**

- Collection: `orders`
- Fields: `user_id` (Ascending), `status` (Ascending), `order_date` (Descending)

**Reviews by Product:**

- Collection: `reviews`
- Fields: `product_id` (Ascending), `is_approved` (Ascending), `created_at` (Descending)

**Notifications by User:**

- Collection: `notifications`
- Fields: `user_id` (Ascending), `is_read` (Ascending), `created_at` (Descending)

---

## 🔧 Code Integration

### Creating User Profile on Sign-Up

```javascript
// In your auth handler (lib/authHandlers.js or similar)
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { ref, set } from "firebase/database";
import { db, realtimeDb } from "./firebaseClient";

async function createUserProfile(user) {
  const { uid, email, displayName, photoURL, phoneNumber, providerData } = user;

  // Create Firestore user document
  await setDoc(doc(db, "users", uid), {
    uid,
    email,
    displayName: displayName || "",
    photoURL: photoURL || "",
    phoneNumber: phoneNumber || "",
    emailVerified: user.emailVerified,
    provider: providerData[0]?.providerId || "password",
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
    last_login: serverTimestamp(),
    is_active: true,
    role: "customer",
    preferences: {
      newsletter: true,
      notifications: true,
      theme: "light",
    },
  });

  // Create Firestore profile document
  await setDoc(doc(db, "profiles", uid), {
    user_id: uid,
    first_name: displayName?.split(" ")[0] || "",
    last_name: displayName?.split(" ").slice(1).join(" ") || "",
    phone: phoneNumber || "",
    addresses: [],
    total_orders: 0,
    total_spent: 0,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  });

  // Create Realtime Database cart
  await set(ref(realtimeDb, `carts/${uid}`), {
    user_id: uid,
    items: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
}
```

### Updating Last Login

```javascript
async function updateLastLogin(uid) {
  await setDoc(
    doc(db, "users", uid),
    {
      last_login: serverTimestamp(),
    },
    { merge: true }
  );
}
```

---

## 📋 Summary

### ✅ Firestore (Document Database)

- **users** - User authentication data
- **profiles** - Extended user profiles with addresses
- **orders** - Order history with all details
- **reviews** - Product reviews
- **contact_submissions** - Contact form submissions
- **newsletter_subscribers** - Email subscribers
- **notifications** - User notifications
- **blog_posts** - Blog content
- **admins** - Admin user data

### ✅ Realtime Database (JSON Tree)

- **products** - Product catalog (374 products)
- **categories** - Product categories (6 categories)
- **carts/{uid}** - User shopping carts
- **wishlists/{uid}** - User wishlists

### ✅ Firebase Authentication

- **Email/Password** - Traditional sign-up
- **Google** - OAuth with Google profile
- **Facebook** - OAuth with Facebook profile

All user data is synced across these systems with the `uid` as the primary key.

---

**Files to Reference:**

- `firebase-schemas.json` - Complete data schemas
- `firebase-security-rules.json` - Security rules for both databases
- `firebase-products.json` - Product data ready for import
- `FIREBASE_SETUP.md` - Firebase setup instructions
