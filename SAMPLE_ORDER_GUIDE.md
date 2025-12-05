# Sample Order Testing Guide 🧪

This page allows you to test the complete order workflow including PhonePe payment gateway and Shiprocket shipping integration.

## 🚀 Quick Start

1. **Navigate to the test page:**

   ```
   http://localhost:3000/sample-order
   ```

2. **Complete the test flow:**
   - Fill in order details
   - Process payment via PhonePe (Sandbox)
   - Create shipment via Shiprocket
   - View complete order summary

## 📋 Test Flow Steps

### Step 1: Order Details

- **Pre-filled sample products** with test data
- **Customer information** form (name, email, phone)
- **Shipping address** form (complete address details)
- **Order summary** with subtotal and shipping charges

### Step 2: Payment Processing

Two options available:

- **Real PhonePe Flow**: Redirects to PhonePe sandbox payment page
- **Skip to Shipping**: Simulates successful payment for direct shipping testing

### Step 3: Shipping Creation

- Creates order in Shiprocket
- Checks courier serviceability
- Assigns best available courier
- Generates AWB (Airway Bill) code
- Returns shipment tracking details

### Step 4: Success

- Displays complete order summary
- Shows payment details (Order ID, Transaction ID, Amount)
- Shows shipping details (Shiprocket Order ID, Shipment ID, AWB Code, Courier)
- Option to test another order

## 🔧 Configuration

### Environment Variables Required

#### PhonePe Configuration

```env
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_PHONEPE_CLIENT_ID=your_client_id
PHONEPE_CLIENT_SECRET=your_client_secret
PHONEPE_CLIENT_VERSION=1
NEXT_PUBLIC_PHONEPE_BASE_URL=https://api-preprod.phonepe.com/apis/pg-sandbox
PHONEPE_AUTH_URL=https://api-preprod.phonepe.com/apis/pg-sandbox/v1/oauth/token
PHONEPE_MERCHANT_ID=your_merchant_id
```

#### Shiprocket Configuration

```env
NEXT_PUBLIC_SHIPROCKET_BASE_URL=https://apiv2.shiprocket.in
SHIPROCKET_EMAIL=your_shiprocket_email
SHIPROCKET_PASSWORD=your_shiprocket_password
SHIPROCKET_COURIER_ID=your_preferred_courier_id (optional)
```

## 📁 File Structure

```
app/
├── sample-order/
│   ├── page.jsx                    # Main test page UI
│   └── payment-status/
│       └── page.jsx                # Payment return/callback page
└── api/
    └── sample-order/
        ├── create-payment/
        │   └── route.js            # PhonePe payment creation
        ├── payment-callback/
        │   └── route.js            # PhonePe webhook handler
        ├── payment-status/
        │   └── route.js            # Check payment status
        └── create-shipping/
            └── route.js            # Shiprocket shipment creation

lib/services/
├── phonePeService.js               # PhonePe API integration
└── shiprocketService.js            # Shiprocket API integration

styles/
├── sampleOrder.scss                # Test page styling
└── paymentStatus.scss              # Payment status page styling
```

## 🔐 API Endpoints

### 1. Create Payment

**POST** `/api/sample-order/create-payment`

**Request:**

```json
{
  "amount": 997,
  "customer": {
    "name": "Test Customer",
    "email": "test@example.com",
    "phone": "9999999999"
  },
  "items": [
    {
      "id": "SAMPLE-001",
      "name": "Sample Plant",
      "price": 299,
      "quantity": 2,
      "sku": "PLANT-001"
    }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "orderId": "ORDER-1234567890-abc123",
  "paymentUrl": "https://phonepe.com/pay/...",
  "amount": 997,
  "paymentOrder": { ... }
}
```

### 2. Payment Status

**GET** `/api/sample-order/payment-status?transactionId=ORDER-123`

**Response:**

```json
{
  "success": true,
  "status": "PAYMENT_SUCCESS",
  "data": {
    "transactionId": "TXN-123",
    "amount": 99700,
    "state": "PAYMENT_SUCCESS"
  }
}
```

### 3. Create Shipping

**POST** `/api/sample-order/create-shipping`

**Request:**

```json
{
  "orderId": "ORDER-123",
  "customer": {
    "name": "Test Customer",
    "email": "test@example.com",
    "phone": "9999999999"
  },
  "address": {
    "line1": "123 Test Street",
    "line2": "Test Apartment",
    "city": "Kolkata",
    "state": "West Bengal",
    "pincode": "700001",
    "country": "India"
  },
  "items": [ ... ],
  "amount": 997
}
```

**Response:**

```json
{
  "success": true,
  "shiprocketOrderId": 12345,
  "shipmentId": 67890,
  "awbCode": "AWBXXX123456",
  "courierName": "Blue Dart",
  "courierId": 5,
  "availableCouriers": 3,
  "message": "Shipment created successfully"
}
```

## 🧪 Testing Scenarios

### Scenario 1: Complete Flow Test

1. Fill order details with valid data
2. Click "Proceed to Payment"
3. Complete payment on PhonePe sandbox
4. Verify redirect to payment-status page
5. Click "Continue to Shipping"
6. Click "Create Shipment"
7. Verify shipping details displayed

### Scenario 2: Skip Payment Test

1. Fill order details
2. Click "Skip to Shipping Test"
3. Directly test Shiprocket integration
4. Verify shipment creation

### Scenario 3: Error Handling Test

1. Test with invalid pincode
2. Test with invalid phone number
3. Test with missing required fields
4. Verify error messages display

## 📱 PhonePe Integration Details

### Payment Flow

1. **Create Order**: Generate unique merchant order ID
2. **Initiate Payment**: Get payment URL from PhonePe
3. **User Payment**: Redirect to PhonePe payment page
4. **Callback**: PhonePe sends webhook to callback URL
5. **Redirect**: User returns to success/failure page
6. **Verify**: Check payment status via API

### Test Credentials

- Use PhonePe sandbox environment
- Test cards provided in PhonePe dashboard
- No real money transactions

### Payment States

- `PAYMENT_SUCCESS`: Payment completed successfully
- `PAYMENT_PENDING`: Payment in progress
- `PAYMENT_DECLINED`: Payment failed/declined
- `PAYMENT_ERROR`: Technical error occurred

## 🚚 Shiprocket Integration Details

### Shipment Flow

1. **Authenticate**: Get auth token (cached for 9 days)
2. **Create Order**: Submit order to Shiprocket
3. **Check Serviceability**: Find available couriers
4. **Assign Courier**: Select and assign courier
5. **Generate AWB**: Get tracking number
6. **Track**: Monitor shipment status

### Shipment Details

- **Pickup Location**: Primary (configured in Shiprocket)
- **Weight**: Default 1 kg (adjustable)
- **Dimensions**: 15x15x15 cm (adjustable)
- **Payment Method**: Prepaid (since paid via PhonePe)
- **Shipping Charges**: ₹50 (configurable)

### Courier Selection

- Automatically selects best available courier
- Based on serviceability check
- Considers delivery pincode and weight
- Returns AWB code for tracking

## 🔍 Troubleshooting

### PhonePe Issues

**Error: "Payment initiation failed"**

- Check CLIENT_ID and CLIENT_SECRET in .env.local
- Verify BASE_URL is correct
- Ensure OAuth token generation is working

**Error: "Invalid callback data"**

- Check callback URL is accessible
- Verify webhook signature verification
- Check network connectivity

### Shiprocket Issues

**Error: "Authentication failed"**

- Verify SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD
- Check if account is active
- Try regenerating credentials

**Error: "No couriers available"**

- Check pincode serviceability
- Verify pickup location configured
- Check if delivery pincode is valid

**Error: "Failed to create order"**

- Verify all required fields are provided
- Check order_items format
- Ensure billing details are complete

### General Issues

**Error: "Missing required fields"**

- Verify all form fields are filled
- Check validation rules
- Ensure data types are correct

**Error: "Internal server error"**

- Check server logs for detailed error
- Verify environment variables loaded
- Check API endpoints are accessible

## 📊 Success Indicators

### Payment Success

- ✅ Payment URL received
- ✅ Redirect to PhonePe completed
- ✅ Payment status = PAYMENT_SUCCESS
- ✅ Transaction ID generated
- ✅ Amount matches order total

### Shipping Success

- ✅ Shiprocket order ID received
- ✅ Shipment ID generated
- ✅ AWB code assigned
- ✅ Courier name displayed
- ✅ Available couriers > 0

## 🎯 Next Steps

After successful testing:

1. **Update Production URLs**

   - Change PhonePe BASE_URL to production
   - Update NEXT_PUBLIC_BASE_URL to your domain

2. **Configure Real Credentials**

   - Get production PhonePe credentials
   - Use production Shiprocket account

3. **Implement in Actual Checkout**

   - Integrate payment flow in `/cart` page
   - Add shipping to order confirmation
   - Set up webhook handlers

4. **Add Database Integration**

   - Store orders in Firestore
   - Save payment transactions
   - Track shipment status

5. **Set Up Monitoring**
   - Log payment events
   - Track shipping status
   - Monitor error rates

## 📚 API Documentation Links

- **PhonePe API Docs**: https://developer.phonepe.com/payment-gateway/website-integration
- **Shiprocket API Docs**: https://apidocs.shiprocket.in/

## 🆘 Support

If you encounter issues:

1. Check console logs for detailed errors
2. Verify environment variables are set
3. Review API documentation
4. Check network requests in browser DevTools
5. Test with different data sets

---

**Note**: This is a testing environment using sandbox/test credentials. No real payments or shipments are processed.
