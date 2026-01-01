# Quick Start Guide - Razorpay & Delhivery Integration

## 🚀 Getting Started

### Step 1: Install Dependencies

```bash
npm install
```

The Razorpay package has already been installed.

### Step 2: Setup Environment Variables

1. Copy the environment template:

```bash
cp .env.template .env.local
```

2. Fill in the required values in `.env.local`:

#### Razorpay Setup (Required)

1. Go to https://dashboard.razorpay.com/signup
2. Complete registration and KYC
3. Navigate to **Settings → API Keys**
4. Click **Generate Test Keys** (for development)
5. Copy **Key ID** and **Key Secret** to `.env.local`:

   ```env
   RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
   RAZORPAY_KEY_SECRET=your_secret_key
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
   ```

6. For webhooks:
   - Go to **Settings → Webhooks**
   - Add URL: `https://yourdomain.com/api/sample-order/payment-callback`
   - Select events: `payment.captured`, `payment.failed`, `order.paid`
   - Copy webhook secret to `.env.local`

#### Delhivery Setup (Required)

1. Contact Delhivery sales for API access
2. Get your API token from Delhivery panel
3. Register your warehouse/pickup location
4. Add to `.env.local`:
   ```env
   DELHIVERY_API_KEY=your_api_token
   DELHIVERY_CLIENT_NAME=Vriksh Valley
   DELHIVERY_SELLER_ADDRESS=Your Warehouse Address
   DELHIVERY_SELLER_PHONE=+919999999999
   ```

### Step 3: Test the Integration

#### Test Razorpay Payment

1. Start dev server:

   ```bash
   npm run dev
   ```

2. Navigate to sample order page: http://localhost:3000/sample-order

3. Use Razorpay test card:

   - Card Number: `4111 1111 1111 1111`
   - CVV: Any 3 digits
   - Expiry: Any future date
   - OTP: 123456 (for test mode)

4. Check browser console for payment response

#### Test Delhivery Pincode Check

1. In browser console or API testing tool:

   ```javascript
   fetch("/api/shipping/check-pincode", {
     method: "POST",
     headers: { "Content-Type": "application/json" },
     body: JSON.stringify({ pincode: "110001" }),
   });
   ```

2. Verify serviceability response

### Step 4: Frontend Integration

#### Add Razorpay Checkout to Your Page

```javascript
// pages/checkout.jsx or components/checkout/Payment.jsx

import { useEffect } from "react";

function loadRazorpay() {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

async function handlePayment(orderDetails) {
  // Load Razorpay script
  const loaded = await loadRazorpay();
  if (!loaded) {
    alert("Failed to load Razorpay");
    return;
  }

  // Create order on backend
  const response = await fetch("/api/payment/create-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      amount: orderDetails.amount * 100, // Convert to paise
      receipt: orderDetails.orderId,
      customerName: orderDetails.name,
      customerEmail: orderDetails.email,
    }),
  });

  const order = await response.json();

  // Open Razorpay checkout
  const options = {
    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    amount: order.amount,
    currency: order.currency,
    name: "Vriksh Valley",
    description: "Plant Order Payment",
    order_id: order.orderId,
    handler: async function (response) {
      // Verify payment on backend
      const verifyResponse = await fetch("/api/payment/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        }),
      });

      const result = await verifyResponse.json();

      if (result.success) {
        alert("Payment successful!");
        // Redirect to order confirmation page
        window.location.href = `/orders/${result.orderId}`;
      } else {
        alert("Payment verification failed");
      }
    },
    prefill: {
      name: orderDetails.name,
      email: orderDetails.email,
      contact: orderDetails.phone,
    },
    theme: {
      color: "#073b22", // Your brand color
    },
  };

  const razorpay = new window.Razorpay(options);
  razorpay.open();
}

export default function CheckoutPage() {
  // Your component code...

  return <button onClick={() => handlePayment(orderDetails)}>Pay Now</button>;
}
```

### Step 5: Production Deployment

#### Before Going Live:

1. **Switch to Live Keys**:

   ```env
   RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
   RAZORPAY_KEY_SECRET=live_secret_key
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
   ```

2. **Update Webhook URLs**:

   - Point to production domain
   - Test webhook delivery

3. **Delhivery Production**:

   - Get production API credentials
   - Verify warehouse addresses
   - Test with real pincodes

4. **Test Complete Flow**:
   - Place test order
   - Complete payment
   - Verify shipment creation
   - Check tracking

## 📚 Additional Resources

### API Endpoints

#### Payment APIs

- `POST /api/payment/create-order` - Create Razorpay order
- `POST /api/payment/verify` - Verify payment signature
- `POST /api/sample-order/create-payment` - Sample order payment
- `GET /api/sample-order/payment-status` - Check payment status

#### Shipping APIs

- `POST /api/shipping/create-order` - Create Delhivery shipment
- `POST /api/shipping/check-serviceability` - Check pincode
- `POST /api/shipping/calculate-rate` - Get shipping cost

### Common Issues

#### Razorpay Integration Issues

1. **"Key ID is required"**

   - Check `NEXT_PUBLIC_RAZORPAY_KEY_ID` in .env.local
   - Restart dev server after adding env vars

2. **Signature verification fails**

   - Verify `RAZORPAY_KEY_SECRET` is correct
   - Check signature generation algorithm

3. **Webhook not received**
   - Verify webhook URL is publicly accessible
   - Check webhook secret matches

#### Delhivery Integration Issues

1. **"Invalid API token"**

   - Verify `DELHIVERY_API_KEY` is correct
   - Check if token has expired

2. **"Pincode not serviceable"**

   - Use `checkServiceability` API before order
   - Some pincodes may not be covered

3. **Shipment creation fails**
   - Verify all required fields are provided
   - Check warehouse is registered

### Testing Data

#### Razorpay Test Cards

- **Success**: 4111 1111 1111 1111
- **Failure**: 4111 1111 1111 1234
- **International**: 5104 0600 0000 0008

#### Test Pincodes (India)

- Delhi: 110001
- Mumbai: 400001
- Bangalore: 560001

## 🆘 Need Help?

- **Razorpay Docs**: https://razorpay.com/docs/
- **Delhivery Docs**: https://one.delhivery.com/developer-portal/
- **Migration Summary**: See `MIGRATION_SUMMARY.md`
- **Environment Template**: See `.env.template`

## 📝 Checklist

- [ ] Install dependencies (`npm install`)
- [ ] Setup `.env.local` with Razorpay keys
- [ ] Setup `.env.local` with Delhivery credentials
- [ ] Test payment with test card
- [ ] Test pincode serviceability
- [ ] Integrate Razorpay checkout in frontend
- [ ] Test complete order flow
- [ ] Setup webhooks in Razorpay dashboard
- [ ] Update database schema for orders
- [ ] Test in production environment

---

**Ready to go! 🚀**

If you have any questions, refer to the detailed migration summary or check the official documentation.
