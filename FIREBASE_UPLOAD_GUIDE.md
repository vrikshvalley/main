# Firebase Data Upload Guide

## 📦 Quick Upload Instructions

### Step 1: Upload Categories to Firebase Realtime Database

1. **Open Firebase Console**: https://console.firebase.google.com
2. Select your project: **vriksh-valley**
3. Navigate to: **Realtime Database** (in left sidebar)
4. Click the **⋮** (three dots) menu at the top
5. Select **"Import JSON"**
6. Click **"Browse"** and select: `firebase-categories.json`
7. Choose path: `/categories`
8. Click **"Import"**

✅ **Result**: 6 categories will be imported under `/categories` node

---

### Step 2: Upload Products to Firebase Realtime Database

1. Stay in **Realtime Database**
2. Click the **⋮** (three dots) menu at the top
3. Select **"Import JSON"**
4. Click **"Browse"** and select: `firebase-products.json`
5. Choose path: `/products`
6. Click **"Import"**

✅ **Result**: 374 products will be imported under `/products` node

---

### Step 3: Apply Firestore Security Rules

1. Navigate to: **Firestore Database** → **Rules** tab
2. **Copy the Firestore rules** from `firebase-security-rules.json`:

```javascript
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return request.auth.uid == userId;
    }

    function isAdmin() {
      return isSignedIn() && exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }

    // Users Collection
    match /users/{userId} {
      allow read: if isOwner(userId) || isAdmin();
      allow create: if isSignedIn() && isOwner(userId);
      allow update: if isOwner(userId) || isAdmin();
      allow delete: if isAdmin();
    }

    // Profiles Collection
    match /profiles/{userId} {
      allow read: if isOwner(userId) || isAdmin();
      allow create: if isSignedIn() && isOwner(userId);
      allow update: if isOwner(userId) || isAdmin();
      allow delete: if isAdmin();
    }

    // Orders Collection
    match /orders/{orderId} {
      allow read: if isSignedIn() &&
                     (resource.data.user_id == request.auth.uid || isAdmin());
      allow create: if isSignedIn() &&
                       request.resource.data.user_id == request.auth.uid;
      allow update: if isAdmin() ||
                       (isOwner(resource.data.user_id) &&
                        request.resource.data.status == 'cancelled');
      allow delete: if isAdmin();
    }

    // Reviews Collection
    match /reviews/{reviewId} {
      allow read: if resource.data.is_approved == true ||
                     isOwner(resource.data.user_id) ||
                     isAdmin();
      allow create: if isSignedIn() &&
                       request.resource.data.user_id == request.auth.uid &&
                       request.resource.data.is_verified_purchase == true;
      allow update: if isOwner(resource.data.user_id) || isAdmin();
      allow delete: if isOwner(resource.data.user_id) || isAdmin();
    }

    // Contact Submissions
    match /contact_submissions/{submissionId} {
      allow read: if isAdmin();
      allow create: if true;
      allow update: if isAdmin();
      allow delete: if isAdmin();
    }

    // Newsletter Subscribers
    match /newsletter_subscribers/{subscriberId} {
      allow read: if isAdmin();
      allow create: if true;
      allow update: if isAdmin();
      allow delete: if isAdmin();
    }

    // Notifications
    match /notifications/{notificationId} {
      allow read: if isOwner(resource.data.user_id) || isAdmin();
      allow create: if isAdmin();
      allow update: if isOwner(resource.data.user_id) || isAdmin();
      allow delete: if isOwner(resource.data.user_id) || isAdmin();
    }

    // Blog Posts
    match /blog_posts/{postId} {
      allow read: if resource.data.is_published == true || isAdmin();
      allow create: if isAdmin();
      allow update: if isAdmin();
      allow delete: if isAdmin();
    }

    // Admins Collection
    match /admins/{adminId} {
      allow read: if isAdmin();
      allow create: if isAdmin();
      allow update: if isAdmin();
      allow delete: if isAdmin();
    }

    // Deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

3. Click **"Publish"**

✅ **Result**: Firestore security rules applied

---

### Step 4: Apply Realtime Database Security Rules

1. Navigate to: **Realtime Database** → **Rules** tab
2. **Replace existing rules** with these:

```json
{
  "rules": {
    ".read": false,
    ".write": false,

    "products": {
      ".read": true,
      ".write": "auth != null && root.child('admins').child(auth.uid).exists()",
      ".indexOn": ["category", "price", "stock_status", "is_featured"]
    },

    "categories": {
      ".read": true,
      ".write": "auth != null && root.child('admins').child(auth.uid).exists()",
      ".indexOn": ["name", "is_active"]
    },

    "carts": {
      "$uid": {
        ".read": "auth != null && auth.uid === $uid",
        ".write": "auth != null && auth.uid === $uid",
        ".validate": "newData.hasChildren(['user_id', 'items', 'updated_at'])",
        "user_id": {
          ".validate": "newData.val() === $uid"
        },
        "items": {
          "$product_id": {
            ".validate": "newData.hasChildren(['product_id', 'name', 'price', 'quantity'])"
          }
        },
        "updated_at": {
          ".validate": "newData.isString()"
        },
        "created_at": {
          ".validate": "newData.isString()"
        }
      }
    },

    "wishlists": {
      "$uid": {
        ".read": "auth != null && auth.uid === $uid",
        ".write": "auth != null && auth.uid === $uid",
        ".validate": "newData.hasChildren(['user_id', 'items'])",
        "user_id": {
          ".validate": "newData.val() === $uid"
        },
        "items": {
          "$product_id": {
            ".validate": "newData.hasChildren(['product_id', 'added_at'])"
          }
        },
        "updated_at": {
          ".validate": "newData.isString()"
        }
      }
    },

    "admins": {
      ".read": "auth != null && root.child('admins').child(auth.uid).exists()",
      ".write": "auth != null && root.child('admins').child(auth.uid).exists()"
    }
  }
}
```

3. Click **"Publish"**

✅ **Result**: Realtime Database security rules applied

---

### Step 5: Create Firestore Composite Indexes

1. Navigate to: **Firestore Database** → **Indexes** tab
2. Click **"Create Index"** and add each of these:

#### Index 1: Orders by User and Date

- **Collection ID**: `orders`
- **Fields**:
  - `user_id` → Ascending
  - `order_date` → Descending
- **Query scope**: Collection
- Click **"Create"**

#### Index 2: Orders by User, Status, and Date

- **Collection ID**: `orders`
- **Fields**:
  - `user_id` → Ascending
  - `status` → Ascending
  - `order_date` → Descending
- **Query scope**: Collection
- Click **"Create"**

#### Index 3: Reviews by Product and Approval

- **Collection ID**: `reviews`
- **Fields**:
  - `product_id` → Ascending
  - `is_approved` → Ascending
  - `created_at` → Descending
- **Query scope**: Collection
- Click **"Create"**

#### Index 4: Reviews by Product and Rating

- **Collection ID**: `reviews`
- **Fields**:
  - `product_id` → Ascending
  - `rating` → Descending
- **Query scope**: Collection
- Click **"Create"**

#### Index 5: Notifications by User and Read Status

- **Collection ID**: `notifications`
- **Fields**:
  - `user_id` → Ascending
  - `is_read` → Ascending
  - `created_at` → Descending
- **Query scope**: Collection
- Click **"Create"**

#### Index 6: Blog Posts by Published Status

- **Collection ID**: `blog_posts`
- **Fields**:
  - `is_published` → Ascending
  - `published_at` → Descending
- **Query scope**: Collection
- Click **"Create"**

✅ **Result**: All composite indexes created (may take a few minutes to build)

---

### Step 6: Add Your Email as Admin (IMPORTANT!)

1. Navigate to: **Realtime Database**
2. Click the **+** button next to the root
3. Enter:
   - **Name**: `admins`
   - **Value**: (leave empty, we'll add child)
4. Click **Add**
5. Click the **+** button next to `admins`
6. Enter:
   - **Name**: Your Firebase Auth UID (get this from Authentication → Users after signing in)
   - **Value**:
   ```json
   {
     "email": "your-email@example.com",
     "name": "Your Name",
     "role": "super_admin",
     "is_active": true
   }
   ```
7. Click **Add**

**To get your Firebase Auth UID:**

1. Sign in to your app once with your email
2. Go to Firebase Console → Authentication → Users
3. Find your email and copy the **User UID**
4. Use that UID in step 6 above

✅ **Result**: You now have admin access to the app

---

## 🎯 Verification Checklist

After completing all steps, verify:

- [ ] **Categories**: Go to Realtime Database and check `/categories` has 6 entries
- [ ] **Products**: Go to Realtime Database and check `/products` has 374 entries
- [ ] **Firestore Rules**: Go to Firestore → Rules and verify rules are active
- [ ] **Realtime DB Rules**: Go to Realtime Database → Rules and verify rules are active
- [ ] **Indexes**: Go to Firestore → Indexes and check all 6 indexes are "Enabled"
- [ ] **Admin Access**: Check `/admins/{your_uid}` exists in Realtime Database

---

## 📁 Files Reference

- **firebase-categories.json** - 6 product categories for upload
- **firebase-products.json** - 374 products for upload
- **firebase-schemas.json** - Complete schema documentation
- **firebase-security-rules.json** - Complete security rules
- **FIREBASE_AUTH_STORAGE_GUIDE.md** - Authentication and storage guide
- **FIREBASE_SETUP.md** - Original setup instructions

---

## 🆘 Troubleshooting

### Products not showing in app?

1. Check Realtime Database has `/products` node
2. Verify security rules allow read access
3. Check console for any Firebase errors

### Can't create orders?

1. Verify you're signed in
2. Check Firestore rules are published
3. Create indexes if queries fail

### Admin features not working?

1. Verify your UID is in `/admins` node
2. Check admin role is set correctly
3. Re-sign in to refresh authentication

---

## ✅ You're Done!

Once all steps are complete, your Firebase database is fully configured with:

- ✅ 374 products ready to browse
- ✅ 6 categories for filtering
- ✅ Secure user authentication
- ✅ Protected user data
- ✅ Order management system
- ✅ Review system
- ✅ Admin access

**Your app is now ready to use!** 🎉
