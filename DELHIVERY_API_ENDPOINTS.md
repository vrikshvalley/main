# Delhivery API Endpoints - Quick Reference

## Base URL

```
http://localhost:3000/api/shipping/
http://localhost:3000/api/webhooks/
```

---

## 1. Check Pincode Serviceability

**Endpoint:** `POST /api/shipping/check-pincode`

**Request:**

```json
{
  "pincode": "110001"
}
```

**Response Success:**

```json
{
  "success": true,
  "data": {
    "pincode": "110001",
    "city": "New Delhi",
    "state": "DL",
    "prepaid": true,
    "cod": true,
    "pickup": true,
    "delivery": true
  }
}
```

**Response Error:**

```json
{
  "error": {
    "message": "Invalid pincode. Must be 6 digits."
  }
}
```

---

## 2. Calculate Shipping Cost

**Endpoint:** `POST /api/shipping/calculate-cost`

**Request:**

```json
{
  "originPin": "110001",
  "destinationPin": "560001",
  "weight": 2.5,
  "paymentMode": "Prepaid",
  "declaredValue": 5000
}
```

**Response Success:**

```json
{
  "success": true,
  "data": {
    "totalAmount": 250.5,
    "baseFreight": 200,
    "fuelSurcharge": 30.5,
    "codCharges": 0,
    "gstAmount": 20,
    "currency": "INR"
  }
}
```

---

## 3. Track Shipment

**Endpoint:** `POST /api/shipping/track`

**Request:**

```json
{
  "waybill": "9876543210"
}
```

**Response Success:**

```json
{
  "success": true,
  "data": {
    "waybill": "9876543210",
    "orderNumber": "VV123456",
    "status": "Delivered",
    "statusCode": "DL",
    "origin": "Delhi",
    "destination": "Bangalore",
    "currentLocation": "Bangalore Sorting Center",
    "expectedDelivery": "2026-02-25",
    "actualDelivery": "2026-02-24",
    "scans": [
      {
        "location": "Delhi Hub",
        "status": "Picked Up",
        "date": "2026-02-23T10:00:00Z",
        "instructions": ""
      },
      {
        "location": "NCR Hub",
        "status": "In Transit",
        "date": "2026-02-23T14:00:00Z",
        "instructions": ""
      },
      {
        "location": "Bangalore Hub",
        "status": "Delivered",
        "date": "2026-02-24T15:00:00Z",
        "instructions": "Delivered at gate"
      }
    ]
  }
}
```

---

## 4. Create Shipment

**Endpoint:** `POST /api/shipping/create-order` (existing)

**Request:**

```json
{
  "orderId": "VV123456",
  "order": {
    "customer_name": "John Doe",
    "customer_phone": "9876543210",
    "customer_email": "john@example.com",
    "shipping_address": {
      "line1": "123 Main Street",
      "line2": "Apt 4B",
      "city": "New Delhi",
      "state": "DL",
      "pincode": "110001"
    },
    "items": [
      {
        "name": "Money Plant",
        "quantity": 2,
        "price": 500
      }
    ],
    "total": 1000
  }
}
```

**Response Success:**

```json
{
  "success": true,
  "waybill": "9876543210",
  "orderNumber": "VV123456",
  "status": "Manifest"
}
```

---

## 5. Cancel Shipment

**Endpoint:** `POST /api/shipping/cancel`

**Request:**

```json
{
  "waybill": "9876543210"
}
```

**Response Success:**

```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Shipment cancelled successfully",
    "waybill": "9876543210"
  }
}
```

---

## 6. Create Return (RVP QC 3.0)

**Endpoint:** `POST /api/shipping/returns`

**Request:**

```json
{
  "originalWaybill": "9876543210",
  "reason": "Damaged in transit",
  "customerName": "John Doe",
  "customerPhone": "9876543210",
  "returnAddress": "123 Main Street, Apt 4B",
  "returnCity": "New Delhi",
  "returnState": "DL",
  "returnPin": "110001"
}
```

**Response Success:**

```json
{
  "success": true,
  "data": {
    "rvpWaybill": "9876543211",
    "originalWaybill": "9876543210",
    "status": "initiated",
    "estimatedPickupDate": "2026-02-25",
    "qcScheduledDate": "2026-02-26",
    "trackingUrl": "https://track.delhivery.com/..."
  }
}
```

---

## 7. Handle NDR (Non-Delivery Request)

**Endpoint:** `POST /api/shipping/ndr`

### Action: Reattempt

```json
{
  "waybill": "9876543210",
  "action": "reattempt",
  "reason": "Customer not available",
  "actionDetails": {
    "reattemptDate": "2026-02-25",
    "timeSlot": "09:00-18:00"
  }
}
```

### Action: Return

```json
{
  "waybill": "9876543210",
  "action": "return",
  "reason": "Undeliverable",
  "actionDetails": {
    "returnAddress": "123 Main Street",
    "returnReason": "Recipient refused"
  }
}
```

### Action: Reschedule

```json
{
  "waybill": "9876543210",
  "action": "reschedule",
  "reason": "Customer requested new date",
  "actionDetails": {
    "newDate": "2026-02-26",
    "instructions": "Ring bell twice"
  }
}
```

### Action: Instructions

```json
{
  "waybill": "9876543210",
  "action": "instructions",
  "reason": "Adding delivery instructions",
  "actionDetails": {
    "instructions": "Leave at front gate",
    "gateCode": "1234",
    "alternatePhone": "9999999999"
  }
}
```

**Response Success:**

```json
{
  "success": true,
  "data": {
    "waybill": "9876543210",
    "action": "reattempt",
    "status": "processed",
    "nextAttemptDate": "2026-02-25",
    "message": "NDR action processed"
  }
}
```

---

## 8. Get NDR Status

**Endpoint:** `GET /api/shipping/ndr?waybill=9876543210`

**Response Success:**

```json
{
  "success": true,
  "data": {
    "waybill": "9876543210",
    "hasNDR": true,
    "ndrReason": "Customer not available",
    "ndrAttempts": 2,
    "lastAttemptDate": "2026-02-24",
    "nextScheduledDate": "2026-02-25",
    "actionRequired": true,
    "availableActions": ["reattempt", "return", "reschedule"]
  }
}
```

---

## 9. Webhook: Delhivery Status Update

**Endpoint:** `POST /api/webhooks/delhivery`

**Delhivery will POST (example):**

```json
{
  "waybill": "9876543210",
  "order_number": "VV123456",
  "status": "Delivered",
  "scans": [
    {
      "location": "Delhi Hub",
      "status": "Picked Up",
      "date": "2026-02-23T10:00:00Z"
    },
    {
      "location": "Bangalore Hub",
      "status": "Delivered",
      "date": "2026-02-24T15:00:00Z"
    }
  ],
  "current_location": "Bangalore",
  "expected_delivery_date": "2026-02-24",
  "delivered_date": "2026-02-24"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Webhook processed successfully",
  "waybill": "9876543210",
  "status": "delivered"
}
```

**Health Check:**

```
GET /api/webhooks/delhivery
```

Response:

```json
{
  "success": true,
  "message": "Delhivery webhook endpoint is active",
  "timestamp": "2026-02-23T15:30:00Z"
}
```

---

## Common Error Responses

### 400 Bad Request

```json
{
  "error": {
    "message": "Missing required fields: originPin, destinationPin, weight, declaredValue"
  }
}
```

### 401 Unauthorized (if auth added)

```json
{
  "error": {
    "message": "Unauthorized access"
  }
}
```

### 500 Internal Server Error

```json
{
  "error": {
    "message": "Internal server error"
  }
}
```

---

## Implementation Examples

### JavaScript/Fetch

```javascript
// Check if pincode is serviceable
const response = await fetch("/api/shipping/check-pincode", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ pincode: "110001" }),
});
const result = await response.json();

if (result.success) {
  console.log("Delivery available:", result.data.delivery);
} else {
  console.error("Pincode check failed:", result.error.message);
}
```

### React Hook

```javascript
const [trackingData, setTrackingData] = useState(null);
const [loading, setLoading] = useState(false);

const trackShipment = async (waybill) => {
  setLoading(true);
  try {
    const response = await fetch("/api/shipping/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ waybill }),
    });
    const result = await response.json();
    if (result.success) {
      setTrackingData(result.data);
    }
  } finally {
    setLoading(false);
  }
};
```

---

## Rate Limits & Best Practices

- No hard rate limits (check Delhivery docs)
- Cache shipping cost calculations for 5 minutes
- Use webhook for status updates (don't poll)
- Validate all inputs server-side
- Always handle API errors gracefully
- Log all API interactions for debugging

---

**Last Updated:** February 23, 2026  
**Version:** 1.0  
**Status:** Production Ready
