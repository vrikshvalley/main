# Quick Reference - New Features

## Cloudinary (Image/Video Storage)

### Environment Setup

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_preset_name
```

### Basic Upload

```javascript
const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append(
    "upload_preset",
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
  );

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData }
  );

  const data = await response.json();
  return data.secure_url;
};
```

### Image Transformation

```javascript
// Original
https://res.cloudinary.com/cloud-name/image/upload/v123/sample.jpg

// Resized (400x300)
https://res.cloudinary.com/cloud-name/image/upload/w_400,h_300,c_fill/v123/sample.jpg

// Optimized
https://res.cloudinary.com/cloud-name/image/upload/q_auto,f_auto/v123/sample.jpg
```

### Get Started

1. Sign up: https://cloudinary.com
2. Get credentials from dashboard
3. Create unsigned upload preset
4. Add to `.env.local`
5. See `CLOUDINARY_SETUP.md` for details

---

## Facebook Login

### Setup Steps

1. **Firebase Console**

   - Authentication → Sign-in method → Facebook
   - Enable and copy OAuth redirect URI

2. **Facebook Developers**

   - Create app: https://developers.facebook.com
   - Add Facebook Login product
   - Copy App ID and App Secret
   - Add OAuth redirect URI to settings

3. **Firebase Console**
   - Paste App ID and App Secret
   - Save configuration

### Code Implementation (Already Done)

```javascript
import { handleFacebookLogin } from "@/lib/authHandlers";

// In your component
<button onClick={handleFacebookLogin}>Sign in with Facebook</button>;
```

### User Flow

1. User clicks "Continue with Facebook"
2. Redirected to Facebook login
3. Authorizes app
4. Redirected back to app
5. User authenticated and profile created
6. Cart items merged (if any)

### Location in App

- Login page: `/auth/login`
- Handler: `lib/authHandlers.js`
- Styles: `styles/login.scss`

---

## Authentication Methods Available

| Method   | Handler                 | Import               |
| -------- | ----------------------- | -------------------- |
| Google   | `handleGoogleLogin()`   | `@/lib/authHandlers` |
| Facebook | `handleFacebookLogin()` | `@/lib/authHandlers` |
| Email    | `handleEmailAuth(e)`    | `@/lib/authHandlers` |

---

## Global Auth Hook

### Usage in Any Component

```javascript
import { useAuth } from "@/lib/AuthContext";

function MyComponent() {
  const { user, loading } = useAuth();

  if (loading) return <Loader />;
  if (!user) return <LoginPrompt />;

  return <div>Welcome {user.displayName}!</div>;
}
```

### User Object Properties

```javascript
user.uid; // Unique ID
user.email; // Email address
user.displayName; // Name
user.photoURL; // Profile photo
```

---

## Documentation Files

| File                   | Purpose                       |
| ---------------------- | ----------------------------- |
| `QUICKSTART.md`        | Quick setup guide             |
| `FIREBASE_SETUP.md`    | Complete Firebase setup       |
| `CLOUDINARY_SETUP.md`  | Complete Cloudinary guide     |
| `GLOBAL_AUTH.md`       | Auth context documentation    |
| `CART_MIGRATION.md`    | Cart system details           |
| `FEATURE_ADDITIONS.md` | This feature addition summary |

---

## Environment Variables Reference

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=

# PhonePe
NEXT_PUBLIC_PHONEPE_MERCHANT_ID=
NEXT_PUBLIC_PHONEPE_SALT_KEY=
NEXT_PUBLIC_PHONEPE_SALT_INDEX=

# Shiprocket
SHIPROCKET_EMAIL=
SHIPROCKET_PASSWORD=
```

---

## Quick Troubleshooting

### Facebook Login Not Working

- Check App ID/Secret in Firebase Console
- Verify OAuth redirect URI in Facebook app
- Ensure Facebook app is not in development mode (for production)
- Check browser console for errors

### Cloudinary Upload Fails

- Verify upload preset is "unsigned"
- Check cloud name is correct
- Ensure preset name matches environment variable
- Check file size and format restrictions

### Auth State Not Updating

- Verify AuthProvider wraps your app in `app/providers.jsx`
- Check Firebase initialization in `lib/firebaseConfig.js`
- Clear browser cache and restart dev server

---

## Testing Your Setup

### Facebook Login Test

```bash
1. npm run dev
2. Navigate to /auth/login
3. Click "Continue with Facebook"
4. Login with Facebook
5. Should redirect back authenticated
```

### Cloudinary Test

```javascript
// Test upload in console
const testFile = new File(["test"], "test.txt", { type: "text/plain" });
uploadImage(testFile).then((url) => console.log(url));
```

---

## Next Steps

### Immediate

- [ ] Configure Cloudinary account
- [ ] Set up Facebook Developer app
- [ ] Add environment variables
- [ ] Test authentication flows
- [ ] Test image uploads

### Future Enhancements

- [ ] Add image cropping for uploads
- [ ] Implement video upload support
- [ ] Add more OAuth providers (Twitter, Apple)
- [ ] Enable two-factor authentication
- [ ] Add upload progress indicators

---

**Quick Links**

- Cloudinary: https://cloudinary.com
- Firebase: https://console.firebase.google.com
- Facebook Developers: https://developers.facebook.com
