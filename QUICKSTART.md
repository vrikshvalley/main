# Quick Start - Firebase Migration

## What's Been Done

Your app has been migrated from Supabase to Firebase for:

- ✅ User authentication (Google, Facebook, Email Magic Links)
- ✅ User profiles and settings
- ✅ Order management
- ✅ Address management
- ✅ Wishlist functionality
- ✅ Cart system (local + Firebase sync)
- ✅ Global auth context
- ✅ Cloudinary integration ready

## Immediate Setup Steps

### 1. Create Firebase Project (10 minutes)

1. Go to https://console.firebase.google.com
2. Create a new project
3. Enable Google Sign-In in Authentication
4. Enable Facebook Login in Authentication (see FIREBASE_SETUP.md for Facebook app setup)
5. Enable Email/Password (with passwordless) in Authentication
6. Create a Firestore database

### 2. Configure Environment Variables (2 minutes)

Copy `.env.local.example` to `.env.local` and fill in your Firebase credentials:

\`\`\`bash
cp .env.local.example .env.local
\`\`\`

Get your config from Firebase Console → Project Settings → Your apps → Config

### 3. Set Firestore Security Rules (2 minutes)

Copy these rules into Firestore Rules tab:

\`\`\`javascript
rules_version = '2';
service cloud.firestore {
match /databases/{database}/documents {
match /profiles/{userId} {
allow read, write: if request.auth != null && request.auth.uid == userId;
}
match /orders/{orderId} {
allow read: if request.auth != null && request.auth.uid == resource.data.user_id;
allow create: if request.auth != null && request.auth.uid == request.resource.data.user_id;
allow update: if request.auth != null && request.auth.uid == resource.data.user_id;
}
}
}
\`\`\`

### 4. Start Development Server

\`\`\`bash
npm install
npm run dev
\`\`\`

### 5. Setup Cloudinary (Optional - 5 minutes)

For image and video storage:

1. Create account at https://cloudinary.com
2. Get credentials from dashboard
3. Create an unsigned upload preset
4. Add to `.env.local`:
   \`\`\`env
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
   NEXT_PUBLIC_CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_preset_name
   \`\`\`

See `CLOUDINARY_SETUP.md` for detailed instructions.

### 6. Test Authentication

1. Visit `http://localhost:3000/auth/login`
2. Try Google login
3. Try Facebook login
4. Try email magic link

## What Still Needs Work

### Optional: Admin Pages

Location: `app/admin/`, `components/admin/`

Admin pages still use Supabase. These may need Firebase Admin SDK for backend operations if you want to migrate them.

## Detailed Documentation

- **Full Firebase Setup**: See `FIREBASE_SETUP.md` (includes Facebook OAuth)
- **Cloudinary Setup**: See `CLOUDINARY_SETUP.md` (image/video storage)
- **Global Auth Guide**: See `GLOBAL_AUTH.md` (useAuth hook, AuthContext)
- **Cart System**: See `CART_MIGRATION.md` (local + Firebase sync strategy)
- **Migration Status**: See `MIGRATION_STATUS.md` (complete checklist)

## Quick Troubleshooting

**"Firebase: Error (auth/unauthorized-domain)"**
→ Add your domain in Firebase Console → Authentication → Settings → Authorized domains

**"Missing or insufficient permissions"**
→ Check Firestore Security Rules are properly configured

**"Cannot find module '@/lib/firebaseConfig'"**
→ Ensure `.env.local` exists with all Firebase config values, then restart dev server

## Support

- Firebase Docs: https://firebase.google.com/docs
- Firebase Auth: https://firebase.google.com/docs/auth
- Firestore: https://firebase.google.com/docs/firestore

---

**Need help?** Check `MIGRATION_STATUS.md` for detailed migration patterns or `FIREBASE_SETUP.md` for step-by-step Firebase setup.
