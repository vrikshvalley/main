# Delhivery B2C API Integration Audit Report

**Date:** February 23, 2026  
**Project:** Vriksh Valley  
**API Documentation:** https://one.delhivery.com/developer-portal/documents/b2c

---

## Executive Summary

The Vriksh Valley platform has partially implemented the Delhivery B2C shipping API. While core shipping functionalities are present, several critical features are missing or improperly integrated. This report outlines all implemented features, gaps, and critical issues that need addressing.

---

## 📋 Delhivery B2C API Functionalities Status

### ✅ IMPLEMENTED FEATURES

#### 1. **Pincode Serviceability Check**

- **Location:** `lib/services/delhiveryService.js` → `checkServiceability()`
- **API Endpoint Used:** `GET /c/api/pin-codes/json/`
- **Status:** ✅ IMPLEMENTED
- **Details:** Validates if a pincode is serviceable; returns COD/Prepaid availability
- **Integration Points:**
  - Used in: `app/api/sample-order/create-shipping/route.js`

#### 2. **Calculate Shipping Cost**

- **Location:** `lib/services/delhiveryService.js` → `calculateShippingCost()`
- **API Endpoint Used:** `GET /api/kinko/v1/invoice/charges`
- **Status:** ✅ IMPLEMENTED
- **Details:** Estimates shipping charges based on weight, dimensions, pincodes
- **Returns:** Base freight, fuel surcharge, COD charges, GST amount
- **Integration Points:**
  - Used in: `app/api/sample-order/create-shipping/route.js`

#### 3. **Shipment Creation (Manifestation)**

- **Location:** `lib/services/delhiveryService.js` → `createShipment()`
- **API Endpoint Used:** `POST /cmu/create.json`
- **Status:** ✅ IMPLEMENTED
- **Description:** Creates a B2C shipment/order in Delhivery system
- **Returns:** Waybill number, reference ID, shipment status
- **Integration Points:**
  - Frontend: `app/checkout/page.jsx` (calls `/api/shipping/create-order`)
  - Backend Route: `app/api/shipping/create-order/route.js`
  - Sample Orders: `app/api/sample-order/create-shipping/route.js`

#### 4. **Shipment Tracking**

- **Location:** `lib/services/delhiveryService.js` → `trackShipment()`
- **API Endpoint Used:** `GET /v1/packages/json/`
- **Status:** ✅ IMPLEMENTED
- **Description:** Tracks shipment status using waybill number
- **Returns:** Current location, status, scans timeline, expected delivery
- **Integration Points:**
  - Component: `components/orders/ShipmentTracker.jsx`
  - Page: `app/orders/[orderId]/page.jsx`

#### 5. **Generate Shipping Label**

- **Location:** `lib/services/delhiveryService.js` → `generateLabel()`
- **API Endpoint Used:** Dynamic label URL generation
- **Status:** ✅ IMPLEMENTED
- **Description:** Generates shipping label PDF for a waybill
- **Returns:** Label URL for PDF generation

#### 6. **Cancel Shipment**

- **Location:** `lib/services/delhiveryService.js` → `cancelShipment()`
- **API Endpoint Used:** `POST /p/edit`
- **Status:** ✅ IMPLEMENTED
- **Description:** Cancels shipment before dispatch
- **Integration Points:**
  - Used in: `app/orders/[orderId]/page.jsx` (handleCancelOrder)

---

### ❌ MISSING FEATURES

#### 1. **Fetch Waybill (Bulk Pre-fetch)**

- **API Endpoint:** `GET /api/p/fetch_waybill`
- **Status:** ❌ NOT IMPLEMENTED
- **Requirement:** Should pre-fetch bulk waybill numbers in advance
- **Impact:** Currently generates one waybill at a time; no bulk pre-allocation
- **Recommended Implementation:**
  ```javascript
  export const fetchWaybills = async (quantity = 100) => {
    // Fetch bulk waybill numbers for pre-allocation
  };
  ```

#### 2. **Shipment Updation API**

- **API Endpoint:** `POST /p/edit`
- **Status:** ❌ NOT IMPLEMENTED (partially used for cancellation)
- **Requirement:** Update shipment details after creation (address, items, etc.)
- **Missing Methods:**
  - Update shipping address
  - Update item details
  - Update delivery instructions
  - Update COD amount
  - Modify payment mode

#### 3. **E-waybill Management**

- **API Endpoint:** Not specified in partial docs
- **Status:** ❌ NOT IMPLEMENTED
- **Requirement:** Manage e-waybill for B2B shipments (GST compliance)
- **Impact:** No e-invoice/e-waybill generation for business orders

#### 4. **Pickup Request Creation**

- **API Endpoint:** Likely `POST /api/p/pickup_request`
- **Status:** ❌ NOT IMPLEMENTED
- **Requirement:** Create pickup requests to collect shipments from seller
- **Impact:** Shipments are created but no automated pickup scheduling
- **Recommended for:** Seller-initiated pickups for bulk orders

#### 5. **Warehouse/Client Warehouse Management**

- **API Endpoints:**
  - `POST /api/warehouse/create` (Client Warehouse Creation)
  - `POST /api/warehouse/update` (Client Warehouse Updation)
- **Status:** ❌ NOT IMPLEMENTED
- **Requirement:** Register/update warehouse or pickup locations
- **Current Limitation:** Using hardcoded `DELHIVERY_PICKUP_LOCATION` env variable
- **Impact:** Cannot dynamically manage multiple warehouse locations

#### 6. **Webhook Functionality**

- **Purpose:** Receive real-time shipment status updates from Delhivery
- **Status:** ❌ NOT IMPLEMENTED
- **Missing:**
  - Webhook endpoint to receive updates
  - Database sync for shipment status changes
  - Real-time notifications to customers
- **Required Webhook API Calls:**
  - Set up webhook registration
  - Handle shipment status callbacks
  - Verify webhook signatures

#### 7. **Download Document API**

- **API Endpoint:** `GET /api/document/download`
- **Status:** ❌ NOT IMPLEMENTED
- **Requirement:** Download shipping documents, invoices, labels
- **Missing:**
  - Invoice document retrieval
  - E-waybill documents
  - Packing slip download

#### 8. **RVP QC 3.0 (Reverse Pickup with Quality Checks)**

- **Status:** ❌ NOT IMPLEMENTED
- **Requirement:** Create reverse pickup shipments with mandatory quality checks
- **Impact:** No built-in return management with quality verification

#### 9. **NDR API (Non-Delivery Request)**

- **Status:** ❌ NOT IMPLEMENTED
- **Requirement:** Handle NDR (delivery attempt failures) with action options
- **Missing Functionality:**
  - Mark as reattempt
  - Request return
  - Schedule new delivery
  - Provide delivery instructions

---

## 🚨 CRITICAL ISSUES & BUGS

### Issue 1: Incorrect API Endpoint in Checkout Flow

**Severity:** 🔴 HIGH  
**File:** `app/checkout/page.jsx:295`  
**Problem:**

```javascript
// Line 295 - WRONG ENDPOINT!
await fetch("/api/shipping/create-shipment", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ orderId, order: createdOrder }),
});
```

**Actual Route:** `app/api/shipping/create-order/route.js`  
**Actual Endpoint:** `/api/shipping/create-order`  
**Impact:** Shipment creation fails silently during checkout  
**Fix:**

```javascript
await fetch("/api/shipping/create-order", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ orderId, order: createdOrder }),
});
```

### Issue 2: No Pincode Validation During Checkout

**Severity:** 🔴 HIGH  
**File:** `app/checkout/page.jsx`  
**Problem:** Address form accepts any pincode without Delhivery serviceability check  
**Impact:**

- Orders placed to non-serviceable areas
- Shipment creation fails after payment
- Poor customer experience
  **Required Fix:**

```javascript
// In checkout address form validation:
const { data: serviceability } =
  await delhiveryService.checkServiceability(pincode);
if (!serviceability || !serviceability.delivery) {
  showErrorToast("This pincode is not serviceable");
  return;
}
```

### Issue 3: Hardcoded Shipping Charges (Always ₹0)

**Severity:** 🟡 MEDIUM  
**File:** `app/checkout/page.jsx:331`  
**Problem:**

```javascript
const totals = orderService.calculateOrderTotals(cartItems, 0, 0);
// Second parameter (shippingCharges) is hardcoded to 0
```

**Impact:**

- No shipping cost calculation shown to users
- Revenue loss from uncalculated shipping
- Actual logistics costs not reimbursed
  **Required Fix:** Call `calculateShippingCost()` API before displaying totals

### Issue 4: Frontend Calling Server-Side Only Functions

**Severity:** 🟡 MEDIUM  
**File:** `app/orders/[orderId]/page.jsx:76`  
**Problem:**

```javascript
const { data, error } = await delhiveryService.trackShipment(waybill);
```

This is a client component calling a server-side service directly.  
**Impact:**

- Potential API key exposure to browser
- CORS issues
- Service may fail silently
  **Fix:** Create API route `/api/shipping/track` instead

### Issue 5: No Error Handling for Shipment Creation Failure

**Severity:** 🟡 MEDIUM  
**File:** `app/checkout/page.jsx:295-300`  
**Problem:** Shipment creation errors are not caught or reported to user  
**Impact:** Silent failures leave order without tracking info  
**Fix:**

```javascript
const shipmentResponse = await fetch('/api/shipping/create-order', {...});
const shipmentData = await shipmentResponse.json();
if (!shipmentData.success) {
  showErrorToast('Shipment creation failed: ' + shipmentData.error?.message);
  // Trigger refund or manual intervention
}
```

### Issue 6: TrackOrder Page Not Connected to Delhivery

**Severity:** 🟡 MEDIUM  
**File:** `app/track-order/page.jsx`  
**Problem:** Track order page has placeholder form but no actual tracking integration  
**Impact:** Users cannot track orders from public URL  
**Missing:**

- API endpoint for public tracking
- Waybill to order lookup
- Real-time tracking display

### Issue 7: Missing API Route for Client-Side Tracking

**Severity:** 🟡 MEDIUM  
**Problem:** No `/api/shipping/track` endpoint for client-side tracking requests  
**Impact:**

- Direct API key exposure if tried on client
- No proper server-side abstraction
  **Fix Needed:**

```javascript
// app/api/shipping/track/route.js
export async function POST(request) {
  const { waybill } = await request.json();
  const { data, error } = await delhiveryService.trackShipment(waybill);
  return NextResponse.json({ data, error });
}
```

### Issue 8: Incomplete Shipment Data Payload

**Severity:** 🟡 MEDIUM  
**File:** `app/api/shipping/create-order/route.js:25-45`  
**Problem:** Missing required Delhivery shipment fields:

- `weight` hardcoded to 0.5 kg (incorrect for plant orders)
- `length`, `breadth`, `height` hardcoded to 15 cm
- No `hsn_code`, `seller_inv`, `seller_gst_tin`
- No `return_` fields for return shipments
  **Impact:**
- Inaccurate shipping calculations
- Potential GST compliance issues
- Returns not handled properly

### Issue 9: No Webhook Setup for Real-Time Updates

**Severity:** 🟡 MEDIUM  
**Problem:** No webhook endpoint to receive Delhivery status updates  
**Impact:**

- No real-time shipment status updates
- Users only see stale data
- Cannot auto-trigger notifications
  **Fix Needed:** Implement webhook handler at `/api/webhooks/delhivery`

### Issue 10: Sample Orders API Not Protected

**Severity:** 🟠 LOW  
**File:** `app/api/sample-order/create-shipping/route.js`  
**Problem:** Sample order creation endpoint accessible without authentication  
**Impact:** Test orders can trigger real shipment creation  
**Fix:** Add authentication checks

---

## 📊 Feature Coverage Summary

| Feature                 | Status | Integration       | Priority |
| ----------------------- | ------ | ----------------- | -------- |
| Pincode Serviceability  | ✅     | Partial           | HIGH     |
| Calculate Shipping Cost | ✅     | Unused            | HIGH     |
| Create Shipment         | ✅     | Broken endpoint   | HIGH     |
| Track Shipment          | ✅     | Client-side issue | HIGH     |
| Generate Label          | ✅     | Not integrated    | MEDIUM   |
| Cancel Shipment         | ✅     | Implemented       | MEDIUM   |
| Fetch Waybill (Bulk)    | ❌     | N/A               | MEDIUM   |
| Shipment Update         | ❌     | N/A               | MEDIUM   |
| E-waybill Management    | ❌     | N/A               | LOW      |
| Pickup Requests         | ❌     | N/A               | MEDIUM   |
| Warehouse Management    | ❌     | N/A               | MEDIUM   |
| Webhooks                | ❌     | N/A               | HIGH     |
| Download Documents      | ❌     | N/A               | LOW      |
| RVP QC 3.0              | ❌     | N/A               | LOW      |
| NDR API                 | ❌     | N/A               | MEDIUM   |

---

## 🎯 Recommended Action Items

### CRITICAL (Do First)

1. **Fix checkout shipment endpoint** → `/api/shipping/create-order`
2. **Add pincode validation** during address entry
3. **Create `/api/shipping/track` endpoint** for proper client-side tracking
4. **Calculate real shipping costs** instead of hardcoding ₹0
5. **Add webhook endpoint** for real-time Delhivery updates

### HIGH PRIORITY (Next)

6. **Implement Fetch Waybill API** for bulk pre-allocation
7. **Create warehouse management system** for multiple locations
8. **Add shipment update functionality** for address/details changes
9. **Implement error handling** for shipment creation failures
10. **Fix TrackOrder page** to query by waybill/order ID

### MEDIUM PRIORITY (Soon)

11. **Implement NDR API** for handling delivery failures
12. **Add pickup request creation** for seller orders
13. **Implement RVP QC 3.0** for returns management
14. **Add e-waybill management** for B2B orders
15. **Create document download API** for labels/invoices

### LOW PRIORITY (Enhancement)

16. **Add bulk shipment creation** API endpoint
17. **Implement real-time notifications** via webhooks
18. **Add shipment analytics** dashboard
19. **Create customer tracking widget** for website embedding
20. **Add export/import** for shipment batch operations

---

## 🔧 Environment Variables Verification

**Required .env variables:**

```
DELHIVERY_API_KEY=                    ✅ Present
DELHIVERY_BASE_URL=                   ✅ Present
DELHIVERY_CLIENT_NAME=                ✅ Present
DELHIVERY_PICKUP_LOCATION=            ✅ Present
DELHIVERY_SELLER_ADDRESS=             ✅ Present
DELHIVERY_SELLER_PHONE=               ✅ Present
```

**Status:** All basic environment variables configured.

---

## 📁 File Structure Reference

```
Shipping-related files:
├── lib/services/delhiveryService.js        ← Core API service (6/15 features)
├── app/api/shipping/
│   ├── create-order/route.js              ← Shipment creation (broken endpoint)
│   ├── track/route.js                     ← MISSING (needs creation)
│   ├── calculate-cost/route.js            ← MISSING
│   ├── check-pincode/route.js             ← MISSING
│   └── webhooks/route.js                  ← MISSING
├── app/checkout/page.jsx                  ← Uses incorrect endpoint
├── app/orders/[orderId]/page.jsx          ← Client-side tracking issue
├── app/track-order/page.jsx               ← Not integrated
├── components/orders/ShipmentTracker.jsx  ← Component (working)
└── app/api/sample-order/create-shipping/  ← Test implementation
```

---

## ✅ Testing Recommendations

1. **Pincode Validation Tests**
   - Test serviceable pincode (e.g., 110001 - Delhi)
   - Test non-serviceable pincode
   - Test COD vs Prepaid availability

2. **Shipping Cost Tests**
   - Calculate cost for various weights
   - Test different payment modes
   - Verify GST calculation

3. **Shipment Creation Tests**
   - Create shipment with complete order
   - Verify waybill generation
   - Check Delhivery response format
   - Test error scenarios

4. **Tracking Tests**
   - Track in-transit shipment
   - Track delivered shipment
   - Verify timeline events display
   - Test label generation

5. **Webhook Tests**
   - Send test status updates
   - Verify database sync
   - Test real-time notifications

---

## 📚 API Documentation Reference

- **Main Docs:** https://one.delhivery.com/developer-portal/documents/b2c/
- **Tracking API:** `/v1/packages/json/`
- **Create Shipment:** `/cmu/create.json`
- **Pincode Check:** `/c/api/pin-codes/json/`
- **Rate Calculation:** `/api/kinko/v1/invoice/charges`

---

**Report Generated:** February 23, 2026  
**Status:** Audit Complete  
**Next Review:** After implementing critical fixes
