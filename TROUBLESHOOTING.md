# 🚨 Troubleshooting Quick Reference

## Most Common Issues & Instant Fixes

### 1. Payment Fails to Initiate ❌

**Symptoms:**

- Error: "Payment initiation failed"
- No payment URL received
- Button stays loading

**Instant Fix:**

```bash
# Check environment variables
cat .env.local | grep PHONEPE
```

**Verify these exist:**

- ✓ NEXT_PUBLIC_PHONEPE_CLIENT_ID
- ✓ PHONEPE_CLIENT_SECRET
- ✓ PHONEPE_MERCHANT_ID
- ✓ NEXT_PUBLIC_BASE_URL

**If missing:** Add to `.env.local` and restart server

---

### 2. Shipping Creation Fails ❌

**Symptoms:**

- Error: "Authentication failed"
- Error: "Failed to create order"
- No shipment ID received

**Instant Fix:**

```bash
# Check Shiprocket credentials
cat .env.local | grep SHIPROCKET
```

**Verify these exist:**

- ✓ SHIPROCKET_EMAIL
- ✓ SHIPROCKET_PASSWORD

**If wrong:** Update in `.env.local` and restart

---

### 3. "No Couriers Available" ⚠️

**Symptoms:**

- Shipment created but no AWB code
- availableCouriers: 0

**Instant Fixes:**

1. **Use valid pincode**: 700001, 110001, 400001
2. **Check pickup location** in Shiprocket dashboard
3. **Try different pincode**

**Example working address:**

```
City: Kolkata
State: West Bengal
Pincode: 700001
```

---

### 4. Page Not Loading 🌐

**Symptoms:**

- Blank page
- 404 error
- "Cannot GET /sample-order"

**Instant Fixes:**

1. **Restart server:**
   ```bash
   # Stop: Ctrl+C
   npm run dev
   ```
2. **Clear cache:** Ctrl+Shift+R (hard refresh)
3. **Check port:** Ensure port 3000 is free

---

### 5. Network Request Fails 🔴

**Symptoms:**

- Red errors in Network tab
- 500 Internal Server Error
- CORS errors

**Instant Checks:**

1. **Open browser console:** F12
2. **Check Network tab:** Look for red requests
3. **Click failed request:** View response
4. **Check terminal:** Look for server errors

**Common causes:**

- Environment variable not loaded → Restart server
- Invalid credentials → Check .env.local
- Service down → Check API status

---

### 6. Payment Redirect Loop 🔄

**Symptoms:**

- Keeps redirecting back to payment
- Never reaches shipping step
- sessionStorage not working

**Instant Fixes:**

1. **Clear storage:**
   ```javascript
   // Browser console
   sessionStorage.clear();
   ```
2. **Check query params:** URL should have `?paymentComplete=true`
3. **Try "Skip to Shipping"** button instead

---

### 7. Environment Variables Not Working 🔧

**Symptoms:**

- undefined in API routes
- Missing credentials errors
- NEXT_PUBLIC variables null

**Instant Fixes:**

1. **Restart dev server** (variables loaded at startup)
2. **Check variable names** (must start with NEXT_PUBLIC for client-side)
3. **No quotes needed** in .env.local:

   ```env
   # ❌ Wrong
   PHONEPE_CLIENT_SECRET="3561a973-7e32-4f2e-9381-d94f7339b16b"

   # ✓ Correct
   PHONEPE_CLIENT_SECRET=3561a973-7e32-4f2e-9381-d94f7339b16b
   ```

---

## 🔍 Debugging Tools

### Browser Console

```javascript
// Check environment variables (client-side)
console.log(process.env.NEXT_PUBLIC_PHONEPE_CLIENT_ID);
console.log(process.env.NEXT_PUBLIC_BASE_URL);

// Check sessionStorage
console.log(sessionStorage.getItem("paymentSuccess"));

// Clear and retry
sessionStorage.clear();
location.reload();
```

### Network Tab (F12)

1. Open DevTools (F12)
2. Go to Network tab
3. Reload page
4. Click on failed requests (red)
5. Check:
   - Request URL
   - Request Headers
   - Response Body
   - Status Code

### Terminal Logs

Watch for:

- ✓ "Payment order created successfully"
- ✓ "Shiprocket order created successfully"
- ❌ Any error messages
- ❌ Authentication failures

---

## ⚡ Quick Diagnostics

### Test 1: Check API Routes

```bash
# From terminal
curl http://localhost:3000/api/sample-order/create-payment -X POST

# Should not return 404
```

### Test 2: Check PhonePe Service

```javascript
// Create test file: test-phonepe.js
import { authenticate } from "./lib/services/phonePeService.js";

const result = await authenticate();
console.log(result); // Should have data.access_token
```

### Test 3: Check Shiprocket Service

```javascript
// Create test file: test-shiprocket.js
import { authenticate } from "./lib/services/shiprocketService.js";

const token = await authenticate();
console.log(token); // Should return token string
```

---

## 📊 Error Code Reference

### HTTP Status Codes

- **200**: Success ✓
- **400**: Bad Request (check request body)
- **401**: Unauthorized (check credentials)
- **404**: Not Found (check URL/route)
- **500**: Server Error (check logs)

### PhonePe Error Codes

- `PAYMENT_SUCCESS`: Payment completed ✓
- `PAYMENT_PENDING`: Still processing
- `PAYMENT_DECLINED`: Payment failed
- `PAYMENT_ERROR`: Technical error

### Common Error Messages

| Error                       | Meaning                | Fix               |
| --------------------------- | ---------------------- | ----------------- |
| "Missing required fields"   | Form validation failed | Fill all fields   |
| "Authentication failed"     | Invalid credentials    | Check .env.local  |
| "Payment initiation failed" | PhonePe error          | Check credentials |
| "Failed to create order"    | Shiprocket error       | Check order data  |
| "No couriers available"     | Invalid pincode        | Use valid pincode |

---

## 🛠️ Emergency Fixes

### Nuclear Option 1: Fresh Start

```bash
# Stop server
Ctrl+C

# Clear node modules (if needed)
rm -rf node_modules
npm install

# Restart
npm run dev
```

### Nuclear Option 2: Clear Everything

```javascript
// Browser console
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### Nuclear Option 3: Check File Permissions

```bash
# Ensure files are readable
ls -la app/sample-order/
ls -la app/api/sample-order/
```

---

## 📞 When All Else Fails

1. **Check Documentation:**

   - README_SAMPLE_ORDER.md
   - QUICK_TEST_GUIDE.md
   - SAMPLE_ORDER_GUIDE.md

2. **Check API Docs:**

   - PhonePe: https://developer.phonepe.com/
   - Shiprocket: https://apidocs.shiprocket.in/

3. **Check Logs:**

   - Browser console (F12)
   - Terminal where server runs
   - Network tab responses

4. **Test Step by Step:**

   - Use "Skip to Shipping" to isolate issues
   - Test payment separately
   - Test shipping separately

5. **Verify Setup:**
   - All files created?
   - .env.local has all variables?
   - Server running on port 3000?
   - No firewall blocking?

---

## ✅ Working Configuration Example

This setup is known to work:

```env
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_PHONEPE_CLIENT_ID=SU2511231301094205481369
PHONEPE_CLIENT_SECRET=3561a973-7e32-4f2e-9381-d94f7339b16b
PHONEPE_CLIENT_VERSION=1
NEXT_PUBLIC_PHONEPE_BASE_URL=https://api-preprod.phonepe.com/apis/pg-sandbox
PHONEPE_MERCHANT_ID=M23BMAVB7Y17W
SHIPROCKET_EMAIL=vrikshvalley@gmail.com
SHIPROCKET_PASSWORD=your_password_here
```

**Test data that works:**

- Name: Test Customer
- Email: test@vrikshvalley.com
- Phone: 9999999999
- City: Kolkata
- State: West Bengal
- Pincode: 700001

---

**Still stuck?** Review the complete guide in `SAMPLE_ORDER_GUIDE.md`
