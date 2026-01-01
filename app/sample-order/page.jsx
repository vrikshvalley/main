"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { 
  ShoppingCart, 
  CreditCard, 
  Package, 
  CheckCircle, 
  Loader2,
  AlertCircle
} from "lucide-react";
import "@/styles/sampleOrder.scss";

function SampleOrderContent() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1); // 1: Order Details, 2: Payment, 3: Shipping, 4: Success
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Check if returning from successful payment
  useEffect(() => {
    const paymentComplete = searchParams.get('paymentComplete');
    if (paymentComplete === 'true') {
      const paymentData = sessionStorage.getItem('paymentSuccess');
      if (paymentData) {
        const data = JSON.parse(paymentData);
        setPaymentResponse(data);
        setStep(3);
        sessionStorage.removeItem('paymentSuccess');
      }
    }
  }, [searchParams]);
  
  // Sample order data
  const [orderData, setOrderData] = useState({
    items: [
      {
        id: "SAMPLE-001",
        name: "Sample Plant - Money Plant",
        price: 299,
        quantity: 2,
        sku: "PLANT-MP-001"
      },
      {
        id: "SAMPLE-002",
        name: "Sample Plant - Jade Plant",
        price: 399,
        quantity: 1,
        sku: "PLANT-JP-002"
      }
    ],
    customer: {
      name: "Test Customer",
      email: "test@vrikshvalley.com",
      phone: "9999999999"
    },
    address: {
      line1: "123 Test Street",
      line2: "Test Apartment",
      city: "Kolkata",
      state: "West Bengal",
      pincode: "700001",
      country: "India"
    }
  });

  const [paymentResponse, setPaymentResponse] = useState(null);
  const [shippingResponse, setShippingResponse] = useState(null);

  // Calculate totals
  const subtotal = orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingCharges = 50;
  const total = subtotal + shippingCharges;

  // Handle form input changes
  const handleCustomerChange = (field, value) => {
    setOrderData(prev => ({
      ...prev,
      customer: { ...prev.customer, [field]: value }
    }));
  };

  const handleAddressChange = (field, value) => {
    setOrderData(prev => ({
      ...prev,
      address: { ...prev.address, [field]: value }
    }));
  };

  // Step 1: Create Order and Initiate Payment
  const handleInitiatePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/sample-order/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: total,
          customer: orderData.customer,
          items: orderData.items
        })
      });

      const data = await response.json();

      if (data.success) {
        setPaymentResponse(data);
        // Redirect to PhonePe payment page
        if (data.paymentUrl) {
          window.location.href = data.paymentUrl;
        }
      } else {
        setError(data.error || "Payment initiation failed");
      }
    } catch (err) {
      console.error("Payment error:", err);
      setError("Failed to initiate payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Create Shipping (after payment success)
  const handleCreateShipping = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/sample-order/create-shipping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: paymentResponse?.orderId || `TEST-${Date.now()}`,
          customer: orderData.customer,
          address: orderData.address,
          items: orderData.items,
          amount: total
        })
      });

      const data = await response.json();

      if (data.success) {
        setShippingResponse(data);
        setStep(4);
      } else {
        setError(data.error || "Shipping creation failed");
      }
    } catch (err) {
      console.error("Shipping error:", err);
      setError("Failed to create shipping. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Simulate payment success (for testing without actual payment)
  const handleSimulatePaymentSuccess = () => {
    setPaymentResponse({
      success: true,
      orderId: `TEST-${Date.now()}`,
      transactionId: `TXN-${Date.now()}`,
      amount: total
    });
    setStep(3);
  };

  return (
    <div className="sample-order-page">
      <div className="container">
        <h1 className="page-title">🧪 Test Order Workflow</h1>
        <p className="page-subtitle">
          Test Razorpay Payment Gateway & Delhivery Shipping Integration
        </p>

        {/* Progress Steps */}
        <div className="progress-steps">
          {[
            { num: 1, label: "Order Details", icon: ShoppingCart },
            { num: 2, label: "Payment", icon: CreditCard },
            { num: 3, label: "Shipping", icon: Package },
            { num: 4, label: "Complete", icon: CheckCircle }
          ].map((s) => (
            <div
              key={s.num}
              className={`step ${step >= s.num ? "active" : ""} ${
                step > s.num ? "completed" : ""
              }`}
            >
              <div className="step-icon">
                <s.icon size={20} />
              </div>
              <span className="step-label">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="error-banner"
          >
            <AlertCircle size={20} />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Step 1: Order Details */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="step-content"
          >
            <div className="section">
              <h2>Order Items</h2>
              <div className="order-items">
                {orderData.items.map((item, idx) => (
                  <div key={idx} className="order-item">
                    <div className="item-details">
                      <h3>{item.name}</h3>
                      <p className="item-sku">SKU: {item.sku}</p>
                    </div>
                    <div className="item-price">
                      <span className="quantity">x{item.quantity}</span>
                      <span className="price">₹{item.price * item.quantity}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="order-summary">
                <div className="summary-row">
                  <span>Subtotal:</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="summary-row">
                  <span>Shipping:</span>
                  <span>₹{shippingCharges}</span>
                </div>
                <div className="summary-row total">
                  <span>Total:</span>
                  <span>₹{total}</span>
                </div>
              </div>
            </div>

            <div className="section">
              <h2>Customer Details</h2>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={orderData.customer.name}
                  onChange={(e) => handleCustomerChange("name", e.target.value)}
                  placeholder="Enter your name"
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={orderData.customer.email}
                  onChange={(e) => handleCustomerChange("email", e.target.value)}
                  placeholder="Enter your email"
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={orderData.customer.phone}
                  onChange={(e) => handleCustomerChange("phone", e.target.value)}
                  placeholder="Enter 10-digit phone"
                />
              </div>
            </div>

            <div className="section">
              <h2>Shipping Address</h2>
              <div className="form-group">
                <label>Address Line 1</label>
                <input
                  type="text"
                  value={orderData.address.line1}
                  onChange={(e) => handleAddressChange("line1", e.target.value)}
                  placeholder="House/Flat no, Building name"
                />
              </div>
              <div className="form-group">
                <label>Address Line 2</label>
                <input
                  type="text"
                  value={orderData.address.line2}
                  onChange={(e) => handleAddressChange("line2", e.target.value)}
                  placeholder="Street, Area, Landmark"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    value={orderData.address.city}
                    onChange={(e) => handleAddressChange("city", e.target.value)}
                    placeholder="City"
                  />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input
                    type="text"
                    value={orderData.address.state}
                    onChange={(e) => handleAddressChange("state", e.target.value)}
                    placeholder="State"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Pincode</label>
                  <input
                    type="text"
                    value={orderData.address.pincode}
                    onChange={(e) => handleAddressChange("pincode", e.target.value)}
                    placeholder="6-digit pincode"
                  />
                </div>
                <div className="form-group">
                  <label>Country</label>
                  <input
                    type="text"
                    value={orderData.address.country}
                    onChange={(e) => handleAddressChange("country", e.target.value)}
                    placeholder="Country"
                  />
                </div>
              </div>
            </div>

            <div className="button-group">
              <button
                onClick={handleInitiatePayment}
                disabled={loading}
                className="btn-primary"
              >
                {loading ? (
                  <>
                    <Loader2 className="spinner" size={20} />
                    Initiating Payment...
                  </>
                ) : (
                  <>
                    <CreditCard size={20} />
                    Proceed to Payment
                  </>
                )}
              </button>
              <button
                onClick={handleSimulatePaymentSuccess}
                className="btn-secondary"
              >
                Skip to Shipping Test
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Payment Processing */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="step-content"
          >
            <div className="processing-state">
              <Loader2 className="spinner large" size={48} />
              <h2>Redirecting to PhonePe Payment Gateway...</h2>
              <p>Please complete the payment to proceed</p>
            </div>
          </motion.div>
        )}

        {/* Step 3: Create Shipping */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="step-content"
          >
            <div className="section success-section">
              <CheckCircle size={48} className="success-icon" />
              <h2>Payment Successful!</h2>
              {paymentResponse && (
                <div className="payment-details">
                  <p>
                    <strong>Order ID:</strong> {paymentResponse.orderId}
                  </p>
                  <p>
                    <strong>Transaction ID:</strong>{" "}
                    {paymentResponse.transactionId}
                  </p>
                  <p>
                    <strong>Amount:</strong> ₹{paymentResponse.amount}
                  </p>
                </div>
              )}
            </div>

            <div className="section">
              <h2>Create Delhivery Shipment</h2>
              <p>
                Now let's create a shipment and get tracking details from
                Delhivery.
              </p>

              <button
                onClick={handleCreateShipping}
                disabled={loading}
                className="btn-primary"
              >
                {loading ? (
                  <>
                    <Loader2 className="spinner" size={20} />
                    Creating Shipment...
                  </>
                ) : (
                  <>
                    <Package size={20} />
                    Create Shipment
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 4: Complete */}
        {step === 4 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="step-content"
          >
            <div className="success-state">
              <CheckCircle size={64} className="success-icon" />
              <h2>Order Complete!</h2>
              <p>Payment and shipping have been successfully processed</p>

              {paymentResponse && (
                <div className="details-card">
                  <h3>Payment Details</h3>
                  <div className="details-grid">
                    <div>
                      <span className="label">Order ID:</span>
                      <span className="value">{paymentResponse.orderId}</span>
                    </div>
                    <div>
                      <span className="label">Transaction ID:</span>
                      <span className="value">
                        {paymentResponse.transactionId}
                      </span>
                    </div>
                    <div>
                      <span className="label">Amount Paid:</span>
                      <span className="value">₹{total}</span>
                    </div>
                  </div>
                </div>
              )}

              {shippingResponse && (
                <div className="details-card">
                  <h3>Shipping Details</h3>
                  <div className="details-grid">
                    <div>
                      <span className="label">Order Number:</span>
                      <span className="value">
                        {shippingResponse.orderNumber}
                      </span>
                    </div>
                    <div>
                      <span className="label">Waybill:</span>
                      <span className="value">
                        {shippingResponse.waybill}
                      </span>
                    </div>
                    {shippingResponse.status && (
                      <div>
                        <span className="label">Status:</span>
                        <span className="value">{shippingResponse.status}</span>
                      </div>
                    )}
                    {shippingResponse.referenceId && (
                      <div>
                        <span className="label">Reference ID:</span>
                        <span className="value">
                          {shippingResponse.referenceId}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="button-group">
                <button
                  onClick={() => {
                    setStep(1);
                    setPaymentResponse(null);
                    setShippingResponse(null);
                    setError(null);
                  }}
                  className="btn-primary"
                >
                  Test Another Order
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function SampleOrderPage() {
  return (
    <Suspense fallback={
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <Loader2 className="animate-spin" size={48} />
      </div>
    }>
      <SampleOrderContent />
    </Suspense>
  );
}
