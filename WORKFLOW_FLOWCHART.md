# Order Workflow Flowchart

```
┌─────────────────────────────────────────────────────────────────┐
│                      SAMPLE ORDER TEST PAGE                      │
│                   http://localhost:3000/sample-order             │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                     STEP 1: ORDER DETAILS                        │
├─────────────────────────────────────────────────────────────────┤
│  • Sample Products (Pre-filled)                                  │
│    - Money Plant: ₹299 x 2 = ₹598                               │
│    - Jade Plant: ₹399 x 1 = ₹399                                │
│                                                                  │
│  • Customer Information                                          │
│    - Name, Email, Phone                                          │
│                                                                  │
│  • Shipping Address                                              │
│    - Full address with pincode                                   │
│                                                                  │
│  • Order Summary                                                 │
│    - Subtotal: ₹997                                              │
│    - Shipping: ₹50                                               │
│    - Total: ₹1,047                                               │
└─────────────────────────────────────────────────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
                    ▼                         ▼
    ┌───────────────────────┐   ┌──────────────────────────┐
    │  Proceed to Payment   │   │  Skip to Shipping Test   │
    └───────────────────────┘   └──────────────────────────┘
                    │                         │
                    │                         │ (Simulates success)
                    ▼                         │
┌─────────────────────────────────────────────┼──────────────────┐
│              STEP 2: PAYMENT                │                   │
├─────────────────────────────────────────────┘                   │
│                                                                  │
│  POST /api/sample-order/create-payment                           │
│  ┌────────────────────────────────────────────────────┐         │
│  │ 1. Generate unique order ID                         │         │
│  │ 2. Convert amount to paisa (₹1,047 → 104,700)      │         │
│  │ 3. Call PhonePe createPaymentOrder()                │         │
│  │ 4. Receive payment URL                              │         │
│  └────────────────────────────────────────────────────┘         │
│                         │                                        │
│                         ▼                                        │
│  ┌────────────────────────────────────────────────────┐         │
│  │         Redirect to PhonePe Payment Page            │         │
│  │   (https://api-preprod.phonepe.com/...)            │         │
│  └────────────────────────────────────────────────────┘         │
│                         │                                        │
│                         ▼                                        │
│  ┌────────────────────────────────────────────────────┐         │
│  │           User Completes Payment                    │         │
│  │    (Uses PhonePe sandbox test cards)                │         │
│  └────────────────────────────────────────────────────┘         │
│                         │                                        │
│                         ▼                                        │
│  ┌────────────────────────────────────────────────────┐         │
│  │     PhonePe Sends Webhook (Optional)                │         │
│  │   POST /api/sample-order/payment-callback           │         │
│  └────────────────────────────────────────────────────┘         │
│                         │                                        │
│                         ▼                                        │
│  ┌────────────────────────────────────────────────────┐         │
│  │     Redirect Back to Your Application               │         │
│  │   /sample-order/payment-status?orderId=xxx          │         │
│  └────────────────────────────────────────────────────┘         │
│                         │                                        │
│                         ▼                                        │
│  ┌────────────────────────────────────────────────────┐         │
│  │         Verify Payment Status                       │         │
│  │   GET /api/sample-order/payment-status              │         │
│  │   - Calls PhonePe checkOrderStatus()                │         │
│  │   - Returns PAYMENT_SUCCESS/PENDING/DECLINED        │         │
│  └────────────────────────────────────────────────────┘         │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                                 │
                                 │ (On Success)
                                 ▼
                    ┌────────────────────────┐
                    │  Save to sessionStorage │
                    │  Redirect to step 3     │
                    └────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                     STEP 3: SHIPPING                             │
├─────────────────────────────────────────────────────────────────┤
│  • Display Payment Success                                       │
│    - Order ID: ORDER-xxx                                         │
│    - Transaction ID: TXN-xxx                                     │
│    - Amount: ₹1,047                                              │
│                                                                  │
│  • Button: "Create Shipment"                                     │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
                  POST /api/sample-order/create-shipping
┌─────────────────────────────────────────────────────────────────┐
│                    SHIPROCKET INTEGRATION                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Step 1: Authenticate                                            │
│  ┌────────────────────────────────────────────────────┐         │
│  │ • POST /v1/external/auth/signin                     │         │
│  │ • Get auth token (cached for 9 days)                │         │
│  │ • Token used for all subsequent requests            │         │
│  └────────────────────────────────────────────────────┘         │
│                         │                                        │
│                         ▼                                        │
│  Step 2: Create Order                                            │
│  ┌────────────────────────────────────────────────────┐         │
│  │ • POST /v1/external/orders/create/adhoc             │         │
│  │ • Send order details, items, address                │         │
│  │ • Receive: order_id, shipment_id                    │         │
│  └────────────────────────────────────────────────────┘         │
│                         │                                        │
│                         ▼                                        │
│  Step 3: Check Serviceability                                    │
│  ┌────────────────────────────────────────────────────┐         │
│  │ • GET /v1/external/courier/serviceability           │         │
│  │ • Check pickup pincode → delivery pincode           │         │
│  │ • Get list of available couriers                    │         │
│  │ • Returns: courier_company_id, name, rate, etc.     │         │
│  └────────────────────────────────────────────────────┘         │
│                         │                                        │
│                         ▼                                        │
│  Step 4: Assign Courier                                          │
│  ┌────────────────────────────────────────────────────┐         │
│  │ • POST /v1/external/courier/assign/awb              │         │
│  │ • Select best courier (first available)             │         │
│  │ • Assign to shipment_id                             │         │
│  │ • Receive: awb_code, courier_name                   │         │
│  └────────────────────────────────────────────────────┘         │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                     STEP 4: SUCCESS                              │
├─────────────────────────────────────────────────────────────────┤
│  ✅ Order Complete!                                              │
│                                                                  │
│  Payment Details:                                                │
│  ├─ Order ID: ORDER-1702901234567-abc123                        │
│  ├─ Transaction ID: TXN-xxx                                      │
│  └─ Amount Paid: ₹1,047                                          │
│                                                                  │
│  Shipping Details:                                               │
│  ├─ Shiprocket Order ID: 12345678                               │
│  ├─ Shipment ID: 87654321                                       │
│  ├─ AWB Code: AWBXXX123456789                                   │
│  └─ Courier: Blue Dart                                           │
│                                                                  │
│  [Test Another Order]                                            │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

```
┌──────────────┐
│   Browser    │
└──────┬───────┘
       │ 1. Fill form & submit
       │
       ▼
┌──────────────────────────────────────┐
│   /api/sample-order/create-payment   │
└──────┬───────────────────────────────┘
       │ 2. Request payment order
       │
       ▼
┌─────────────────────┐
│  PhonePe Service    │
│  (phonePeService)   │
└──────┬──────────────┘
       │ 3. Authenticate (OAuth)
       │
       ▼
┌─────────────────────────────────┐
│  PhonePe API                    │
│  (api-preprod.phonepe.com)      │
└──────┬──────────────────────────┘
       │ 4. Return payment URL
       │
       ▼
┌──────────────┐
│   Browser    │ 5. Redirect to PhonePe
└──────┬───────┘
       │ 6. Complete payment
       │
       ▼
┌─────────────────────────────────┐
│  PhonePe Payment Page           │
└──────┬──────────────────────────┘
       │ 7. Payment successful
       │
       ▼
┌──────────────┐
│   Browser    │ 8. Redirect back
└──────┬───────┘
       │ 9. Check payment status
       │
       ▼
┌───────────────────────────────────┐
│  /api/sample-order/payment-status │
└──────┬────────────────────────────┘
       │ 10. Verify with PhonePe
       │
       ▼
┌──────────────┐
│   Browser    │ 11. Show success, proceed to shipping
└──────┬───────┘
       │ 12. Create shipment
       │
       ▼
┌───────────────────────────────────┐
│  /api/sample-order/create-shipping│
└──────┬────────────────────────────┘
       │ 13. Create Shiprocket order
       │
       ▼
┌─────────────────────┐
│  Shiprocket Service │
│  (shiprocketService)│
└──────┬──────────────┘
       │ 14. Authenticate
       │
       ▼
┌─────────────────────────────────┐
│  Shiprocket API                 │
│  (apiv2.shiprocket.in)          │
└──────┬──────────────────────────┘
       │ 15a. Create order → order_id, shipment_id
       │ 15b. Check serviceability → available couriers
       │ 15c. Assign courier → AWB code
       │
       ▼
┌──────────────┐
│   Browser    │ 16. Display complete order details
└──────────────┘
```

## Error Handling Flow

```
┌─────────────────┐
│  Any API Call   │
└────────┬────────┘
         │
         ▼
    ┌─────────┐
    │ Success? │
    └────┬────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
   Yes        No
    │         │
    │         ▼
    │    ┌──────────────┐
    │    │ Catch Error   │
    │    └──────┬───────┘
    │           │
    │           ▼
    │    ┌──────────────────────┐
    │    │ Log to Console        │
    │    │ (error.response.data) │
    │    └──────┬───────────────┘
    │           │
    │           ▼
    │    ┌──────────────────────┐
    │    │ Return Error Object   │
    │    │ { success: false,     │
    │    │   error: "message" }  │
    │    └──────┬───────────────┘
    │           │
    ▼           ▼
┌────────────────────────┐
│  Display to User       │
│  - Error banner (red)  │
│  - Error message       │
│  - Retry option        │
└────────────────────────┘
```

## State Management

```
┌─────────────────────────────────┐
│      Component State            │
├─────────────────────────────────┤
│ step: 1 | 2 | 3 | 4             │
│ loading: boolean                │
│ error: string | null            │
│ orderData: { ... }              │
│ paymentResponse: { ... }        │
│ shippingResponse: { ... }       │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│     Session Storage             │
├─────────────────────────────────┤
│ paymentSuccess: {               │
│   orderId: string               │
│   transactionId: string         │
│   amount: number                │
│ }                               │
└─────────────────────────────────┘
```

## API Authentication Flow

### PhonePe OAuth

```
Request:
POST /v1/oauth/token
Body: client_id, client_secret, grant_type
↓
Response:
{ access_token, expires_at }
↓
Cache token until expiry
↓
Use in subsequent requests:
Authorization: O-Bearer {token}
```

### Shiprocket Token

```
Request:
POST /v1/external/auth/signin
Body: { email, password }
↓
Response:
{ token }
↓
Cache token for 9 days
↓
Use in subsequent requests:
Authorization: Bearer {token}
```

---

**Visual Guide Version**: 1.0
**Last Updated**: December 2025
