# Firebase Setup Guide

This project has been migrated from Supabase to Firebase for authentication and database operations.

## Prerequisites

- A Google account
- Node.js installed on your system

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project" or "Create a project"
3. Enter your project name (e.g., "vriksh-valley")
4. Disable Google Analytics (optional)
5. Click "Create project"

## Step 2: Register Your Web App

1. In your Firebase project dashboard, click the web icon (`</>`)
2. Register your app with a nickname (e.g., "Vriksh Valley Web")
3. Click "Register app"
4. Copy the Firebase configuration object
5. Click "Continue to console"

## Step 3: Set Up Authentication

1. In the Firebase Console, navigate to **Build > Authentication**
2. Click "Get started"
3. Enable the following sign-in providers:
   - **Google**:
     - Click on Google provider
     - Enable it
     - Enter your support email
     - Save
   - **Facebook**:
     - Click on Facebook provider
     - Enable it
     - Go to [Facebook Developers](https://developers.facebook.com)
     - Create a new app or use existing one
     - Add "Facebook Login" product
     - In Settings → Basic, copy App ID and App Secret
     - Paste App ID and App Secret in Firebase
     - Copy the OAuth redirect URI from Firebase
     - In Facebook app, go to Facebook Login → Settings
     - Add the OAuth redirect URI to "Valid OAuth Redirect URIs"
     - Save changes in both consoles
   - **Email Link (passwordless sign-in)**:
     - Click on Email/Password provider
     - Enable "Email link (passwordless sign-in)"
     - Save

## Step 4: Set Up Firestore Database

1. In the Firebase Console, navigate to **Build > Firestore Database**
2. Click "Create database"
3. Choose "Start in production mode" (we'll configure rules next)
4. Select your Firestore location (choose closest to your users)
5. Click "Enable"

### Configure Firestore Security Rules

Replace the default rules with:

\`\`\`javascript
rules_version = '2';
service cloud.firestore {
match /databases/{database}/documents {
// Profiles collection
match /profiles/{userId} {
// Users can read and write their own profile
allow read, write: if request.auth != null && request.auth.uid == userId;
}

    // Orders collection
    match /orders/{orderId} {
      // Users can read their own orders
      allow read: if request.auth != null && request.auth.uid == resource.data.user_id;
      // Users can create orders
      allow create: if request.auth != null && request.auth.uid == request.resource.data.user_id;
      // Only the user can update their own orders
      allow update: if request.auth != null && request.auth.uid == resource.data.user_id;
    }

    // Products collection (read-only for users, write for admin)
    match /products/{productId} {
      allow read: if true; // Anyone can read products
      // Add admin write rules here if needed
    }

}
}
\`\`\`

Click "Publish" to save the rules.

## Step 5: Configure Environment Variables

1. Copy `.env.local.example` to `.env.local`:
   \`\`\`bash
   cp .env.local.example .env.local
   \`\`\`

2. Fill in your Firebase configuration values from Step 2:
   \`\`\`env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   \`\`\`

## Step 6: Configure Authorized Domains

1. In Firebase Console, go to **Authentication > Settings > Authorized domains**
2. Add your domains:
   - `localhost` (for development - should already be there)
   - Your production domain (e.g., `yourdomain.com`)
   - Any other domains you'll use

## Step 7: Test the Setup

1. Start your development server:
   \`\`\`bash
   npm run dev
   \`\`\`

2. Navigate to `/auth/login-signup`
3. Test Google sign-in
4. Test email link sign-in (check your email for the magic link)

## Firestore Collections Structure

### carts

\`\`\`javascript
{
user_id: "user_uid",
items: {
"product_123": {
product_id: "product_123",
quantity: 2,
added_at: "2024-01-01T00:00:00.000Z"
},
"product_456": {
product_id: "product_456",
quantity: 1,
added_at: "2024-01-02T00:00:00.000Z"
}
},
created_at: "2024-01-01T00:00:00.000Z",
updated_at: "2024-01-02T00:00:00.000Z"
}
\`\`\`

**Note**: Cart data is stored in a single document per user. Guest users' carts are stored in localStorage and automatically merged when they log in.

### profiles

\`\`\`javascript
{
id: "user_uid",
email: "user@example.com",
full_name: "User Name",
avatar_url: "https://...",
phone: "+1234567890",
address: [
{
id: "addr_123",
type: "home",
street: "123 Main St",
city: "City",
state: "State",
postal_code: "12345",
country: "Country",
is_default: true
}
],
wishlist: [
{
id: "product_id",
name: "Product Name",
price: 599,
image: "/path/to/image.jpg"
}
],
createdAt: "2024-01-01T00:00:00.000Z",
updatedAt: "2024-01-01T00:00:00.000Z"
}
\`\`\`

### orders

\`\`\`javascript
{
order_id: "ORD-1234567890",
user_id: "user_uid",
user_email: "user@example.com",
items: [...],
subtotal: 1000,
tax: 0,
shipping_charges: 50,
discount: 0,
total: 1050,
status: "pending", // pending, confirmed, shipped, delivered, cancelled, returned
payment_status: "pending", // pending, paid, failed, refunded
payment_method: "phonepe",
shipping_address: {...},
billing_address: {...},
order_date: "2024-01-01T00:00:00.000Z",
createdAt: "2024-01-01T00:00:00.000Z",
updatedAt: "2024-01-01T00:00:00.000Z"
}
\`\`\`

## Migration Notes

### What Changed:

- **Authentication**: Supabase Auth → Firebase Authentication
- **Database**: Supabase PostgreSQL → Cloud Firestore
- **Auth Methods**: Google OAuth & Email Magic Links (both supported)
- **Data Structure**: Similar structure maintained for easy migration

### Files Migrated:

- `lib/firebaseConfig.js` - Firebase initialization
- `lib/authHandlers.js` - Authentication logic
- `lib/services/userService.js` - User profile operations
- `lib/services/orderService.js` - Order management
- `components/auth/ProfileIcon.jsx` - Auth state monitoring
- `app/auth/callback/page.jsx` - OAuth callback handling
- `app/profile/page.jsx` - Profile management
- `lib/autoLogout.js` - Auto-logout functionality
- `components/general/AutoLogoutProvider.jsx` - Activity monitoring

### Still Using Supabase (Need Manual Update):

- Cart-related components (cartSlice, CartModal, AddToCartButton)
- Admin pages (if applicable)
- Any custom components with direct Supabase imports

## Troubleshooting

### "Firebase: Error (auth/unauthorized-domain)"

- Add your domain to Authorized domains in Firebase Console

### "Missing or insufficient permissions"

- Check your Firestore Security Rules
- Ensure user is authenticated before accessing protected data

### Email link not working

- Check that your domain is authorized in Firebase Console
- Verify email link settings in Authentication > Sign-in method

### Import errors

- Make sure `.env.local` file exists with all Firebase config values
- Restart your development server after adding env variables

## Support

For issues specific to Firebase setup, refer to:

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Authentication Guide](https://firebase.google.com/docs/auth)
- [Cloud Firestore Guide](https://firebase.google.com/docs/firestore)
