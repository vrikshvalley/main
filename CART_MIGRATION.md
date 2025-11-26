# Cart System - Firebase Migration Complete ✅

## Overview

The cart system has been successfully migrated from Supabase to Firebase Firestore while maintaining the same user experience:

- **Guest users**: Cart stored in localStorage
- **Logged-in users**: Cart synced to Firebase Firestore
- **Automatic merge**: When a guest user logs in, their local cart is automatically merged with their Firestore cart

## Files Updated

### Core Cart Logic

1. **`lib/cartUtils.js`** - Complete rewrite

   - `addToCartFirebase()` - Add/update items in Firestore
   - `updateCartItemFirebase()` - Update item quantities
   - `removeFromCartFirebase()` - Remove items from Firestore
   - `loadCartFromFirebase()` - Load user's cart from Firestore
   - `clearCartFromFirebase()` - Clear entire cart
   - `mergeAndSyncCart()` - Merge guest cart with user cart on login
   - `syncCartToFirebase()` - Bulk sync entire cart to Firestore
   - Local storage functions unchanged (still used for guest users)

2. **`lib/slices/cartSlice.js`** - Redux slice updated
   - Changed all async thunks to use Firebase functions
   - `loadUserCart` - Uses `loadCartFromFirebase()`
   - `addItemAsync` - Uses `addToCartFirebase()`
   - `updateItemAsync` - Uses `updateCartItemFirebase()`
   - `removeItemAsync` - Uses `removeFromCartFirebase()`
   - `clearCartAsync` - Uses `clearCartFromFirebase()`

### UI Components

3. **`components/cart/AddToCartButton.jsx`**

   - Replaced Supabase auth with Firebase `onAuthStateChanged()`
   - Uses `user.uid` instead of `user.id`

4. **`components/cart/CartModal.jsx`**

   - Combined auth state listener with cart initialization
   - Automatic cart merge on login
   - Uses Firebase auth throughout

5. **`components/cart/Cart.jsx`**
   - Same updates as CartModal
   - Firebase auth integration
   - Cart sync on auth state changes

### Related Components

6. **`components/general/WishlistButton.jsx`**
   - Updated to use Firebase auth
   - Uses `user.uid` for wishlist operations

## Firestore Structure

### Collection: `carts`

Document ID: User's UID (`{userId}`)

```javascript
{
  user_id: "firebase_user_uid",
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
```

**Key Design Decision**: Each user has ONE document containing all their cart items as a nested object. This is more efficient than having separate documents for each cart item.

## Security Rules

Add to your Firestore security rules:

```javascript
// Carts collection
match /carts/{userId} {
  // Users can read and write their own cart
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
```

## How It Works

### Guest User Flow

1. User adds items to cart
2. Items stored in localStorage (`vriksh_cart` key)
3. Redux manages state
4. Cart persists across page refreshes

### Logged-In User Flow

1. User adds items to cart
2. Items stored in BOTH:
   - Firestore (cloud database)
   - Redux state (for immediate UI updates)
3. Cart syncs across devices automatically

### Login Flow (Cart Merge)

1. Guest user has items in localStorage
2. User logs in
3. System automatically:
   - Loads user's Firestore cart
   - Merges with guest cart (quantities are added if same product exists)
   - Saves merged cart to Firestore
   - Clears localStorage
   - Updates Redux state

### Logout Flow

1. User logs out
2. Cart from Redux state is saved to localStorage
3. User continues as guest with same cart

## Testing Checklist

- [x] Guest user can add items to cart
- [x] Guest cart persists on page refresh
- [x] Logged-in user can add items to cart
- [x] Logged-in user's cart syncs to Firestore
- [x] Cart merges correctly on login
- [x] Cart persists on logout (becomes guest cart)
- [x] Increment/decrement works for both guest and logged-in
- [x] Remove item works for both guest and logged-in
- [x] Cart badge shows correct count
- [x] Cart modal displays items correctly

## Migration Benefits

### Before (Supabase)

- Required separate `cart_items` table
- Each cart item was a database row
- Multiple database operations for single cart update
- Had to manage relationships between users and cart items

### After (Firebase)

- Single document per user containing all cart items
- One read/write operation for entire cart
- Simpler data structure
- Better performance (fewer database calls)
- Easier to implement atomic updates

## Performance Optimizations

1. **Batch Updates**: All cart items stored in one document = one read/write
2. **Local-First**: Redux + localStorage for immediate UI updates
3. **Background Sync**: Firestore operations happen async (non-blocking)
4. **Merge on Login**: Efficient one-time operation when user authenticates

## API Changes Summary

| Old (Supabase)             | New (Firebase)             | Notes                       |
| -------------------------- | -------------------------- | --------------------------- |
| `addToCartSupabase()`      | `addToCartFirebase()`      | Now updates single document |
| `updateCartItemSupabase()` | `updateCartItemFirebase()` | Uses `updateDoc()`          |
| `removeFromCartSupabase()` | `removeFromCartFirebase()` | Removes from items object   |
| `loadCartFromSupabase()`   | `loadCartFromFirebase()`   | Reads single document       |
| `clearCartFromSupabase()`  | `clearCartFromFirebase()`  | Uses `deleteDoc()`          |
| `user.id`                  | `user.uid`                 | Firebase auth property      |

## Known Limitations

1. **No real-time sync**: Cart doesn't automatically update if changed in another tab/device (would need Firestore listeners)
2. **No abandoned cart recovery**: No backend process to recover guest carts
3. **No cart expiry**: Carts persist indefinitely (could add TTL if needed)

## Future Enhancements (Optional)

- [ ] Add real-time listeners for cross-tab sync
- [ ] Implement cart expiry (e.g., 30 days)
- [ ] Add cart analytics (track abandoned carts)
- [ ] Store product details in cart (price, name, image) for checkout
- [ ] Implement cart quantity limits
- [ ] Add "Save for later" functionality

## Troubleshooting

**Cart not syncing to Firestore?**

- Check Firebase console for proper security rules
- Ensure user is authenticated (`user` is not null)
- Check browser console for Firebase errors

**Cart lost on login?**

- Verify `mergeAndSyncCart()` is being called
- Check if localStorage is being cleared too early

**Items duplicating on login?**

- This is expected behavior - quantities are added
- Example: Guest has 2x Product A, User cart has 1x Product A → Result: 3x Product A

**Firestore permission denied?**

- Verify security rules match documentation
- Ensure user is authenticated before cart operations
- Check that `userId` in document path matches `request.auth.uid`

---

**Migration Completed**: November 25, 2025
**Strategy**: Local storage for guests, Firestore sync for authenticated users
**Status**: ✅ Fully functional, no breaking changes to user experience
