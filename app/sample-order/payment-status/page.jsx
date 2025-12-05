// Payment Status Page - User lands here after PhonePe payment
"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Loader2, Clock } from "lucide-react";
import "../../styles/paymentStatus.scss";

function PaymentStatusContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [status, setStatus] = useState("checking"); // checking, success, failed, pending
  const [paymentData, setPaymentData] = useState(null);

  useEffect(() => {
    if (orderId) {
      checkPaymentStatus();
    }
  }, [orderId]);

  const checkPaymentStatus = async () => {
    try {
      const response = await fetch(
        `/api/sample-order/payment-status?transactionId=${orderId}`
      );
      const data = await response.json();

      if (data.success) {
        // Check PhonePe status codes
        if (data.status === "PAYMENT_SUCCESS") {
          setStatus("success");
          setPaymentData(data.data);
        } else if (data.status === "PAYMENT_PENDING") {
          setStatus("pending");
          setPaymentData(data.data);
        } else {
          setStatus("failed");
          setPaymentData(data.data);
        }
      } else {
        setStatus("failed");
      }
    } catch (error) {
      console.error("Payment status error:", error);
      setStatus("failed");
    }
  };

  const handleContinue = () => {
    if (status === "success") {
      // Store payment success in sessionStorage and redirect
      if (paymentData) {
        sessionStorage.setItem('paymentSuccess', JSON.stringify({
          orderId,
          transactionId: paymentData.transactionId,
          amount: paymentData.amount
        }));
      }
      router.push("/sample-order?paymentComplete=true");
    } else {
      // Redirect to retry payment
      router.push("/sample-order");
    }
  };

  return (
    <div className="payment-status-page">
      <div className="status-container">
        {status === "checking" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="status-card checking"
          >
            <Loader2 className="status-icon spinner" size={64} />
            <h1>Verifying Payment...</h1>
            <p>Please wait while we confirm your payment status</p>
          </motion.div>
        )}

        {status === "success" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="status-card success"
          >
            <CheckCircle className="status-icon" size={64} />
            <h1>Payment Successful!</h1>
            <p>Your payment has been processed successfully</p>

            {paymentData && (
              <div className="payment-details">
                <div className="detail-row">
                  <span className="label">Order ID:</span>
                  <span className="value">{orderId}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Transaction ID:</span>
                  <span className="value">
                    {paymentData.transactionId || "N/A"}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Amount:</span>
                  <span className="value">
                    ₹{(paymentData.amount / 100).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            <button onClick={handleContinue} className="btn-primary">
              Continue to Shipping
            </button>
          </motion.div>
        )}

        {status === "pending" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="status-card pending"
          >
            <Clock className="status-icon" size={64} />
            <h1>Payment Pending</h1>
            <p>Your payment is being processed. Please check back in a few minutes.</p>

            <button onClick={checkPaymentStatus} className="btn-secondary">
              Check Again
            </button>
            <button onClick={() => router.push("/sample-order")} className="btn-outline">
              Back to Order
            </button>
          </motion.div>
        )}

        {status === "failed" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="status-card failed"
          >
            <XCircle className="status-icon" size={64} />
            <h1>Payment Failed</h1>
            <p>
              We couldn't process your payment. Please try again or contact support.
            </p>

            <button onClick={handleContinue} className="btn-primary">
              Retry Payment
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function PaymentStatusPage() {
  return (
    <Suspense fallback={<div className="payment-status-page"><div className="status-container"><Loader2 className="spinner" size={64} /></div></div>}>
      <PaymentStatusContent />
    </Suspense>
  );
}
