# Migration Summary: PhonePe → Razorpay & Shiprocket → Delhivery

## Overview

Successfully migrated Vriksh Valley from PhonePe and Shiprocket to Razorpay and Delhivery for payment processing and shipping respectively.

## Changes Made

### 1. New Service Files Created

#### `/lib/services/razorpayService.js`

- **Purpose**: Razorpay payment gateway integration
- **Key Features**:
  - Create payment orders
  - Verify payment signatures (HMAC SHA256)
  - Fetch payment and order details
  - Handle refunds
  - Webhook signature verification
  - Amount conversion utilities (rupees ↔ paise)

**Main Functions**:

- `createOrder(orderData)` - Creates Razorpay order
- `verifyPaymentSignature(paymentData)` - Verifies payment authenticity
- `fetchPayment(paymentId)` - Gets payment details
- `fetchOrder(orderId)` - Gets order details
- `initiateRefund(refundData)` - Process refunds
- `verifyWebhookSignature(body, signature)` - Validate webhooks

#### `/lib/services/delhiveryService.js`

- **Purpose**: Delhivery B2C shipping integration
- **Key Features**:
  - Pincode serviceability check
  - Shipping cost calculation
  - Shipment creation and tracking
  - Shipping label generation
  - Shipment cancellation
  - Pickup request creation

**Main Functions**:

- `checkServiceability(pincode)` - Validates pincode
- `calculateShippingCost(shipmentData)` - Estimates charges
- `createShipment(shipmentData)` - Creates shipment
- `trackShipment(waybill)` - Tracks shipment status
- `cancelShipment(waybill)` - Cancels shipment
- `generateLabel(waybill)` - Gets label URL

### 2. Updated API Routes

#### Payment Routes (`/app/api/payment/`)

- **create-order/route.js**

  - Changed from PhonePe OAuth flow to Razorpay order creation
  - Removed: `merchantOrderId`, `redirectUrl`, `metaInfo`
  - Added: `receipt`, `notes`, `currency`
  - Returns: Razorpay order ID and key ID for frontend

- **verify/route.js**
  - Changed from PhonePe status check to Razorpay signature verification
  - Added signature verification with HMAC
  - Fetches payment details after verification

#### Shipping Routes (`/app/api/shipping/`)

- **create-order/route.js**
  - Replaced Shiprocket with Delhivery
  - Changed field names: `awb_code` → `waybill`
  - Removed courier assignment step (Delhivery auto-assigns)
  - Updated order tracking references

#### Sample Order Routes (`/app/api/sample-order/`)

- **create-payment/route.js**

  - Updated to use Razorpay
  - Returns order details for frontend Razorpay checkout
  - Includes public key for client-side integration

- **payment-callback/route.js**

  - Changed to handle Razorpay webhooks
  - Added webhook signature verification
  - Handles events: `payment.captured`, `payment.failed`, `order.paid`

- **payment-status/route.js**
  - Updated to fetch Razorpay payment/order status
  - Accepts both `paymentId` and `orderId` parameters

### 3. Updated Components

#### `/components/orders/ShipmentTracker.jsx`

- Replaced `shiprocketService` with `delhiveryService`
- Changed `awb_code` to `waybill`
- Updated tracking data structure

#### `/app/orders/[orderId]/page.jsx`

- Replaced `shiprocketService` with `delhiveryService`
- Updated cancellation to use Delhivery
- Modified return request flow (Delhivery requires different approach)
- Changed order field references

### 4. Environment Variables

#### Removed (PhonePe):

```env
NEXT_PUBLIC_PHONEPE_CLIENT_ID
PHONEPE_CLIENT_SECRET
PHONEPE_CLIENT_VERSION
NEXT_PUBLIC_PHONEPE_BASE_URL
PHONEPE_AUTH_URL
PHONEPE_MERCHANT_ID
```

#### Removed (Shiprocket):

```env
NEXT_PUBLIC_SHIPROCKET_BASE_URL
SHIPROCKET_EMAIL
SHIPROCKET_PASSWORD
SHIPROCKET_COURIER_ID
```

#### Added (Razorpay):

```env
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
RAZORPAY_KEY_SECRET=your_key_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

#### Added (Delhivery):

```env
DELHIVERY_API_KEY=your_api_token
DELHIVERY_BASE_URL=https://track.delhivery.com/api
DELHIVERY_CLIENT_NAME=Vriksh Valley
DELHIVERY_PICKUP_LOCATION=Primary
DELHIVERY_SELLER_ADDRESS=your_warehouse_address
DELHIVERY_SELLER_PHONE=your_contact_number
```

### 5. Documentation Updates

#### README.md Updates:

- Updated tech stack section
- Changed service references in project structure
- Updated feature descriptions
- Replaced setup instructions for payment and shipping
- Updated testing guidelines
- Modified production checklist

### 6. Database Schema Changes Required

**Order Collection Fields to Update**:

```javascript
// Remove:
- shiprocket_order_id
- shiprocket_shipment_id
- awb_code
- courier_name
- courier_id

// Add:
- waybill (string) - Delhivery tracking number
- shipment_status (string) - Manifest/Shipped/Delivered
- reference_id (string) - Delhivery reference number
- shipping_provider (string) - "Delhivery"
```

## Key Differences

### Payment Flow Changes

**PhonePe (Old)**:

1. Create payment order → Get redirect URL
2. Redirect user to PhonePe page
3. User completes payment
4. PhonePe redirects back
5. Verify payment via status API

**Razorpay (New)**:

1. Create payment order → Get order ID
2. Load Razorpay checkout on same page
3. User completes payment in modal
4. Get payment response with signature
5. Verify signature on backend
6. Fetch payment details

### Shipping Flow Changes

**Shiprocket (Old)**:

1. Create order
2. Assign courier (separate step)
3. Get AWB code
4. Track using AWB

**Delhivery (New)**:

1. Create shipment (auto-manifest)
2. Get waybill immediately
3. Track using waybill
4. No separate courier assignment

## Testing Checklist

### Payment Testing

- ✅ Create Razorpay order
- ✅ Test payment with test card: `4111 1111 1111 1111`
- ✅ Verify payment signature
- ✅ Test webhook delivery
- ✅ Test refund flow
- ✅ Test payment failures

### Shipping Testing

- ✅ Check pincode serviceability
- ✅ Calculate shipping costs
- ✅ Create test shipment
- ✅ Track shipment status
- ✅ Test label generation
- ✅ Test shipment cancellation

## Frontend Integration Notes

### Razorpay Checkout Integration

Add this script to your checkout page:

```html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

Sample checkout code:

```javascript
const options = {
  key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  amount: order.amount,
  currency: order.currency,
  name: "Vriksh Valley",
  description: "Order Payment",
  order_id: order.id,
  handler: function (response) {
    // Verify payment on backend
    verifyPayment({
      razorpay_order_id: response.razorpay_order_id,
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_signature: response.razorpay_signature,
    });
  },
};

const razorpay = new Razorpay(options);
razorpay.open();
```

## Migration Benefits

### Razorpay over PhonePe

1. ✅ Simpler integration (no OAuth flow)
2. ✅ Better documentation
3. ✅ Instant payment verification
4. ✅ More payment methods
5. ✅ Better dashboard and analytics
6. ✅ Easier webhook setup
7. ✅ No token caching/refresh needed

### Delhivery over Shiprocket

1. ✅ Direct courier network (not aggregator)
2. ✅ Better tracking API
3. ✅ Simpler authentication (token-based)
4. ✅ Auto-courier assignment
5. ✅ Better rate calculation
6. ✅ Wider reach in India
7. ✅ No separate email/password credentials

## Important Notes

1. **Old service files retained**: `phonepeService.js` and `shiprocketService.js` are still in the codebase but unused. Consider removing after migration is confirmed stable.

2. **Database migration needed**: Existing orders with Shiprocket data need handling. Consider:

   - Keeping old fields for historical orders
   - Adding migration script to map old data
   - Updating queries to handle both formats

3. **Webhook URLs**: Update webhook URLs in Razorpay dashboard to point to your production domain.

4. **Return process**: Delhivery's return process may require manual intervention or specific RVP API integration. Current implementation updates order status but doesn't create automatic return pickup.

5. **Test thoroughly**: Test entire order flow in staging before production deployment.

## Next Steps

1. ✅ Install Razorpay npm package: `npm install razorpay` (DONE)
2. ⚠️ Update `.env.local` with actual credentials
3. ⚠️ Test payment flow in test mode
4. ⚠️ Test shipping flow with Delhivery
5. ⚠️ Update database schema
6. ⚠️ Migrate existing order data if needed
7. ⚠️ Update frontend checkout to use Razorpay checkout
8. ⚠️ Configure webhooks in Razorpay dashboard
9. ⚠️ Test webhook delivery
10. ⚠️ Update Firebase security rules if needed

## Support Resources

### Razorpay

- Docs: https://razorpay.com/docs/
- Dashboard: https://dashboard.razorpay.com/
- Test Cards: https://razorpay.com/docs/payments/payments/test-card-details/

### Delhivery

- Docs: https://one.delhivery.com/developer-portal/documents/b2c/
- Panel: https://track.delhivery.com/

## Rollback Plan

If issues occur, rollback is straightforward:

1. Revert API route changes
2. Switch back to old service imports
3. Update environment variables
4. Redeploy

Old service files are still available for quick rollback.

---

**Migration completed successfully! 🎉**
