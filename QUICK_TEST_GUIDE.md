# Quick Test Guide - Sample Order Page

## 🚀 How to Test

### 1. Start the Development Server

```bash
npm run dev
```

### 2. Navigate to Test Page

```
http://localhost:3000/sample-order
```

### 3. Test Flow Options

#### Option A: Full PhonePe Payment Test

1. Fill in all order details
2. Click **"Proceed to Payment"**
3. Complete payment on PhonePe sandbox
4. You'll be redirected back after payment
5. Click **"Create Shipment"**
6. View complete order details

#### Option B: Skip to Shipping Test

1. Fill in order details
2. Click **"Skip to Shipping Test"**
3. Click **"Create Shipment"**
4. View shipment details

## ✅ What to Check

### Payment Success Indicators

- [ ] Payment URL received
- [ ] Redirected to PhonePe page
- [ ] Payment completed successfully
- [ ] Redirected back to your site
- [ ] Order ID displayed
- [ ] Transaction ID displayed

### Shipping Success Indicators

- [ ] Shiprocket Order ID received
- [ ] Shipment ID generated
- [ ] AWB Code assigned (tracking number)
- [ ] Courier name displayed
- [ ] Available couriers count > 0

## ⚙️ Environment Check

Run this checklist before testing:

```bash
# Check if .env.local has required variables
# PhonePe
✓ NEXT_PUBLIC_BASE_URL
✓ NEXT_PUBLIC_PHONEPE_CLIENT_ID
✓ PHONEPE_CLIENT_SECRET
✓ PHONEPE_CLIENT_VERSION
✓ NEXT_PUBLIC_PHONEPE_BASE_URL
✓ PHONEPE_AUTH_URL
✓ PHONEPE_MERCHANT_ID

# Shiprocket
✓ NEXT_PUBLIC_SHIPROCKET_BASE_URL
✓ SHIPROCKET_EMAIL
✓ SHIPROCKET_PASSWORD
```

## 🐛 Common Issues & Fixes

### Issue 1: "Payment initiation failed"

**Fix:**

1. Check PhonePe credentials in `.env.local`
2. Verify `NEXT_PUBLIC_BASE_URL` is set to `http://localhost:3000`
3. Check console for detailed error message

### Issue 2: "Shiprocket authentication failed"

**Fix:**

1. Verify `SHIPROCKET_EMAIL` and `SHIPROCKET_PASSWORD`
2. Check if Shiprocket account is active
3. Try logging into Shiprocket dashboard to confirm credentials

### Issue 3: "No couriers available"

**Fix:**

1. Change delivery pincode to a valid Indian pincode (e.g., 700001, 110001)
2. Ensure pickup location is configured in Shiprocket dashboard
3. Check if the pincode is serviceable

### Issue 4: Page not loading

**Fix:**

1. Restart dev server: `npm run dev`
2. Clear browser cache
3. Check if port 3000 is already in use

## 📊 Expected Results

### Successful Payment Response

```json
{
  "success": true,
  "orderId": "ORDER-1234567890-abc123",
  "paymentUrl": "https://api-preprod.phonepe.com/...",
  "amount": 997
}
```

### Successful Shipping Response

```json
{
  "success": true,
  "shiprocketOrderId": 12345,
  "shipmentId": 67890,
  "awbCode": "AWBXXX123456",
  "courierName": "Blue Dart",
  "availableCouriers": 3
}
```

## 🎯 Test Data

### Sample Customer

```
Name: Test Customer
Email: test@vrikshvalley.com
Phone: 9999999999
```

### Sample Address

```
Line 1: 123 Test Street
Line 2: Test Apartment, Near Park
City: Kolkata
State: West Bengal
Pincode: 700001
Country: India
```

### Sample Products (Pre-filled)

```
1. Money Plant - ₹299 x 2 = ₹598
2. Jade Plant - ₹399 x 1 = ₹399
Shipping: ₹50
Total: ₹997
```

## 📞 Where to Look for Errors

1. **Browser Console**: F12 → Console tab
2. **Network Tab**: F12 → Network tab → Look for failed requests
3. **Terminal**: Check server logs where `npm run dev` is running
4. **Response Bodies**: Click on API calls in Network tab to see error details

## 🔄 Reset Test

To start fresh:

1. Reload the page
2. Or click "Test Another Order" at the end
3. Or navigate back to `/sample-order`

## 📝 Notes

- **Sandbox Environment**: No real money is charged
- **Test Credentials**: Use PhonePe test cards from their dashboard
- **Shipping**: Real Shiprocket test account creates actual test shipments
- **Cleanup**: Test orders in Shiprocket can be cancelled later

## 🎉 Success!

If you see:

- ✅ Green checkmark icons
- ✅ Order ID, Transaction ID, Shipment ID
- ✅ AWB tracking code
- ✅ Courier name

**Congratulations!** Your integration is working correctly.

---

**Need Help?** Check `SAMPLE_ORDER_GUIDE.md` for detailed documentation.
