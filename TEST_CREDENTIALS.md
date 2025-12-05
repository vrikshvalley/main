# Test Credentials & Endpoints Reference

## 🔐 Current Configuration Status

### ✅ PhonePe Payment Gateway (Sandbox)

```env
CLIENT_ID: SU2511231301094205481369
MERCHANT_ID: M23BMAVB7Y17W
BASE_URL: https://api-preprod.phonepe.com/apis/pg-sandbox
```

**Status**: Ready for testing ✓
**Environment**: Sandbox (Test Mode)

### ✅ Shiprocket Shipping API

```env
EMAIL: vrikshvalley@gmail.com
BASE_URL: https://apiv2.shiprocket.in
```

**Status**: Ready for testing ✓
**Environment**: Production API (Creates test shipments)

## 🧪 Test Cards for PhonePe Sandbox

### Successful Payment

```
Card Type: Any test card from PhonePe sandbox
Result: PAYMENT_SUCCESS
```

### Test User Details

```
Name: Test User
Email: test@vrikshvalley.com
Phone: 9999999999
```

## 📍 Test Addresses

### Kolkata (Serviceable)

```
Address: 123 Test Street, Test Apartment
City: Kolkata
State: West Bengal
Pincode: 700001
Country: India
```

### Delhi (Serviceable)

```
Address: 456 Sample Road, Sample Building
City: New Delhi
State: Delhi
Pincode: 110001
Country: India
```

### Mumbai (Serviceable)

```
Address: 789 Demo Avenue, Demo Complex
City: Mumbai
State: Maharashtra
Pincode: 400001
Country: India
```

## 🔗 API Endpoints

### Local Development

```
Base URL: http://localhost:3000
```

### Sample Order Page

```
Test Page: http://localhost:3000/sample-order
Payment Status: http://localhost:3000/sample-order/payment-status
```

### API Routes

```
POST /api/sample-order/create-payment
POST /api/sample-order/payment-callback
GET  /api/sample-order/payment-status?transactionId=xxx
POST /api/sample-order/create-shipping
```

## 📦 Sample Order Data

### Pre-configured Products

```javascript
[
  {
    id: "SAMPLE-001",
    name: "Sample Plant - Money Plant",
    price: 299,
    quantity: 2,
    sku: "PLANT-MP-001",
  },
  {
    id: "SAMPLE-002",
    name: "Sample Plant - Jade Plant",
    price: 399,
    quantity: 1,
    sku: "PLANT-JP-002",
  },
];
```

### Order Summary

```
Subtotal: ₹997 (₹598 + ₹399)
Shipping: ₹50
Total: ₹1,047
```

## 🎯 Expected Test Results

### Payment Creation Response

```json
{
  "success": true,
  "orderId": "ORDER-1702901234567-abc123",
  "paymentUrl": "https://api-preprod.phonepe.com/...",
  "amount": 997
}
```

### Shipping Creation Response

```json
{
  "success": true,
  "shiprocketOrderId": 12345678,
  "shipmentId": 87654321,
  "awbCode": "AWBXXX123456789",
  "courierName": "Blue Dart",
  "courierId": 5,
  "availableCouriers": 3
}
```

## 🔍 Verification Steps

### PhonePe Payment Verification

1. Check PhonePe dashboard for test transactions
2. Verify order ID matches
3. Confirm amount is correct (in paisa: 99700)
4. Check payment status: PAYMENT_SUCCESS

### Shiprocket Shipment Verification

1. Login to Shiprocket dashboard
2. Navigate to "Orders" section
3. Search for order ID
4. Verify shipment details
5. Check AWB code assignment
6. Confirm courier selection

## 🚨 Important Notes

### PhonePe Sandbox

- ✓ No real money charged
- ✓ Use only test credentials
- ✓ Payment state simulated
- ✓ Safe for unlimited testing

### Shiprocket Testing

- ⚠️ Uses real API (not sandbox)
- ⚠️ Creates actual test shipments
- ⚠️ May count towards API limits
- ℹ️ Cancel test shipments after testing

## 🔄 Reset Instructions

### Clear Test Data

```javascript
// Browser Console
sessionStorage.clear();
localStorage.clear();
```

### Cancel Shiprocket Test Orders

1. Login to Shiprocket dashboard
2. Go to Orders
3. Select test orders
4. Click "Cancel Shipment"

### Reset Payment Test

- Simply reload `/sample-order` page
- Or click "Test Another Order" button

## 📊 Testing Checklist

Before testing, ensure:

- [ ] Dev server running (`npm run dev`)
- [ ] `.env.local` file has all credentials
- [ ] Port 3000 is accessible
- [ ] Internet connection stable
- [ ] Browser console open for debugging

During testing, verify:

- [ ] No console errors
- [ ] Network requests successful (200 status)
- [ ] Payment URL generated
- [ ] Redirect to PhonePe works
- [ ] Return redirect works
- [ ] Shipment created successfully
- [ ] AWB code received

After testing, cleanup:

- [ ] Review test transactions
- [ ] Cancel test shipments if needed
- [ ] Clear session storage
- [ ] Document any issues found

## 🆘 Support Resources

### Documentation

- PhonePe: https://developer.phonepe.com/
- Shiprocket: https://apidocs.shiprocket.in/

### Local Files

- Detailed Guide: `SAMPLE_ORDER_GUIDE.md`
- Quick Guide: `QUICK_TEST_GUIDE.md`
- This File: `TEST_CREDENTIALS.md`

### Dashboard Access

- PhonePe Sandbox: Contact PhonePe support
- Shiprocket: https://app.shiprocket.in/

---

**Last Updated**: December 2025
**Environment**: Development/Testing
**Purpose**: Integration Testing Only
