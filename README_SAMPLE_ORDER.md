# 🧪 Sample Order Test Page - Quick Reference

## What This Is

A complete testing interface for your **PhonePe Payment Gateway** and **Shiprocket Shipping** integration. Test the entire order workflow from payment to shipping in a controlled environment.

## 🎯 Quick Start (3 Steps)

1. **Start Server**

   ```bash
   npm run dev
   ```

2. **Open Test Page**

   ```
   http://localhost:3000/sample-order
   ```

3. **Test Flow**
   - Fill form → Pay → Ship → Done! ✓

## 📂 Documentation Files

| File                      | Purpose                | When to Use     |
| ------------------------- | ---------------------- | --------------- |
| **QUICK_TEST_GUIDE.md**   | Fast testing steps     | ⭐ Start here   |
| **SAMPLE_ORDER_GUIDE.md** | Complete documentation | Deep dive       |
| **TEST_CREDENTIALS.md**   | API keys & endpoints   | Reference       |
| **WORKFLOW_FLOWCHART.md** | Visual diagrams        | Understand flow |

## 🔑 What's Already Configured

✅ PhonePe sandbox environment  
✅ Shiprocket production API  
✅ Test products pre-filled  
✅ Complete UI with 4 steps  
✅ Error handling built-in  
✅ Payment verification  
✅ Shipping creation  
✅ Success confirmation

## 📋 Test Workflow

```
Step 1: Order Details
  ↓ (Fill form)
Step 2: Payment
  ↓ (Pay via PhonePe)
Step 3: Shipping
  ↓ (Create shipment)
Step 4: Success!
```

## 🧪 Two Testing Modes

### Mode A: Full Payment Flow

Test complete integration including PhonePe redirect

```
Fill Form → Proceed to Payment → Pay on PhonePe → Return → Create Shipping
```

### Mode B: Skip to Shipping

Test only shipping without payment

```
Fill Form → Skip to Shipping Test → Create Shipping
```

## ✅ Success Indicators

You'll see:

- ✅ Green checkmarks
- ✅ Order ID: `ORDER-xxx`
- ✅ Transaction ID: `TXN-xxx`
- ✅ Shipment ID: `123456`
- ✅ AWB Code: `AWBXXX123`
- ✅ Courier Name: `Blue Dart`

## 🚨 Common Issues

### "Payment initiation failed"

→ Check `.env.local` has PhonePe credentials

### "Authentication failed" (Shiprocket)

→ Verify email/password in `.env.local`

### "No couriers available"

→ Use valid pincode (e.g., 700001)

### Page not loading

→ Restart: `npm run dev`

## 🔍 Where to Debug

1. **Browser Console**: F12 → Console
2. **Network Tab**: F12 → Network
3. **Terminal**: Where `npm run dev` is running
4. **API Responses**: Click requests in Network tab

## 📞 Need Help?

1. Check **QUICK_TEST_GUIDE.md** for step-by-step
2. Review **SAMPLE_ORDER_GUIDE.md** for troubleshooting
3. See **WORKFLOW_FLOWCHART.md** for visual flow
4. Look at browser console errors

## 🎉 What You Can Test

- ✓ Payment gateway integration
- ✓ Payment success/failure flows
- ✓ Payment callback handling
- ✓ Order creation in Shiprocket
- ✓ Courier assignment
- ✓ AWB generation
- ✓ Complete order workflow
- ✓ Error handling
- ✓ UI/UX flow

## 🔒 Safety Notes

- ✓ Sandbox environment (no real charges)
- ✓ Test credentials only
- ✓ Safe for unlimited testing
- ⚠️ Shiprocket creates real test shipments (cancel after testing)

## 📊 Files Created

```
app/
  sample-order/
    page.jsx                  # Main test page
    payment-status/page.jsx   # Payment return page
  api/sample-order/
    create-payment/route.js   # Payment creation
    payment-callback/route.js # Payment webhook
    payment-status/route.js   # Status check
    create-shipping/route.js  # Shipping creation

styles/
  sampleOrder.scss           # Page styling
  paymentStatus.scss         # Status page styling

Documentation:
  SAMPLE_ORDER_GUIDE.md      # Complete guide
  QUICK_TEST_GUIDE.md        # Quick start
  TEST_CREDENTIALS.md        # Credentials
  WORKFLOW_FLOWCHART.md      # Flowcharts
  README_SAMPLE_ORDER.md     # This file
```

## 🚀 Production Checklist

Before going live:

- [ ] Update PhonePe to production URL
- [ ] Change to production credentials
- [ ] Update NEXT_PUBLIC_BASE_URL
- [ ] Test with real payment methods
- [ ] Set up proper webhooks
- [ ] Configure database integration
- [ ] Set up monitoring/logging
- [ ] Test error scenarios
- [ ] Configure proper pickup location

## 💡 Tips

- Use "Skip to Shipping" for faster testing
- Keep browser console open
- Test different pincodes
- Try error scenarios
- Cancel test shipments regularly
- Document any issues found

---

**Ready to test?** → Start with `QUICK_TEST_GUIDE.md`

**Need details?** → Read `SAMPLE_ORDER_GUIDE.md`

**Visual learner?** → See `WORKFLOW_FLOWCHART.md`

---

🎯 **Goal**: Verify PhonePe + Shiprocket integration works correctly before production deployment.
