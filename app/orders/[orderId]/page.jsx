'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import orderService from '@/lib/services/orderService';
import shiprocketService from '@/lib/services/shiprocketService';
import { toast } from 'react-toastify';
import Image from 'next/image';
import { Check, Package, Truck, MapPin, X, RotateCcw } from 'lucide-react';
import '@/styles/orders.scss';

export default function OrderDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading: authLoading } = useAuth();
  
  const [order, setOrder] = useState(null);
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [returnReason, setReturnReason] = useState('');

  const orderId = params?.orderId;

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      router.push('/auth/login');
      return;
    }
    
    if (orderId) {
      fetchOrderDetails();
    }
  }, [user, authLoading, orderId, router]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      const { data, error } = await orderService.getOrder(orderId);

      if (error) {
        console.error('Error fetching order:', error);
        toast.error('Failed to load order details');
        return;
      }

      if (!data) {
        toast.error('Order not found');
        router.push('/orders');
        return;
      }

      setOrder(data);

      // Fetch tracking data if AWB code exists
      if (data.awb_code) {
        fetchTrackingData(data.awb_code);
      }
    } catch (error) {
      console.error('Error in fetchOrderDetails:', error);
      toast.error('An error occurred while loading order details');
    } finally {
      setLoading(false);
    }
  };

  const fetchTrackingData = async (awbCode) => {
    try {
      const { data, error } = await shiprocketService.trackShipment(awbCode);
      if (!error && data) {
        setTrackingData(data);
      }
    } catch (error) {
      console.error('Error fetching tracking data:', error);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      toast.error('Please provide a cancellation reason');
      return;
    }

    setActionLoading(true);
    try {
      // Cancel in Shiprocket if AWB exists
      if (order.awb_code) {
        const { error: shiprocketError } = await shiprocketService.cancelShipment([order.awb_code]);
        if (shiprocketError) {
          console.error('Shiprocket cancellation error:', shiprocketError);
          // Continue with order cancellation even if Shiprocket fails
        }
      }

      // Cancel in database
      const { error } = await orderService.cancelOrder(order.order_id, cancelReason);
      
      if (error) {
        toast.error('Failed to cancel order');
        return;
      }

      toast.success('Order cancelled successfully');
      setShowCancelModal(false);
      fetchOrderDetails(); // Refresh order data
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error('An error occurred while cancelling the order');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestReturn = async () => {
    if (!returnReason.trim()) {
      toast.error('Please provide a return reason');
      return;
    }

    setActionLoading(true);
    try {
      // Request return in Shiprocket
      if (order.shiprocket_order_id) {
        const { error: shiprocketError } = await shiprocketService.requestReturn(order.shiprocket_order_id);
        if (shiprocketError) {
          console.error('Shiprocket return request error:', shiprocketError);
          // Continue with order return even if Shiprocket fails
        }
      }

      // Update order in database
      const { error } = await orderService.requestOrderReturn(order.order_id, returnReason);
      
      if (error) {
        toast.error('Failed to request return');
        return;
      }

      toast.success('Return request submitted successfully');
      setShowReturnModal(false);
      fetchOrderDetails(); // Refresh order data
    } catch (error) {
      console.error('Error requesting return:', error);
      toast.error('An error occurred while requesting return');
    } finally {
      setActionLoading(false);
    }
  };

  const formatPrice = (priceInPaise) => {
    return `₹${(priceInPaise / 100).toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimelineSteps = () => {
    const steps = [
      {
        id: 'ordered',
        label: 'Order Placed',
        icon: Package,
        date: order?.order_date,
        completed: true
      },
      {
        id: 'confirmed',
        label: 'Order Confirmed',
        icon: Check,
        date: order?.payment_date,
        completed: order?.payment_status === 'paid'
      },
      {
        id: 'shipped',
        label: 'Shipped',
        icon: Truck,
        date: order?.shipped_date,
        completed: ['shipped', 'delivered'].includes(order?.status)
      },
      {
        id: 'delivered',
        label: 'Delivered',
        icon: MapPin,
        date: order?.delivered_date,
        completed: order?.status === 'delivered'
      }
    ];

    // Handle cancelled orders
    if (order?.status === 'cancelled') {
      return [
        steps[0],
        {
          id: 'cancelled',
          label: 'Order Cancelled',
          icon: X,
          date: order?.cancelled_date,
          completed: true,
          isCancelled: true
        }
      ];
    }

    return steps;
  };

  if (loading) {
    return (
      <div className="order-details-page">
        <div className="container">
          <div className="loading-state">
            <div className="loader"></div>
            <p>Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-details-page">
        <div className="container">
          <div className="empty-state">
            <h2>Order not found</h2>
            <button className="btn-primary" onClick={() => router.push('/orders')}>
              Back to Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  const timelineSteps = getTimelineSteps();
  const canCancel = order.status === 'pending' || order.status === 'confirmed';
  const canReturn = order.status === 'delivered';

  return (
    <div className="order-details-page">
      <div className="container">
        <button className="back-button" onClick={() => router.push('/orders')}>
          ← Back to Orders
        </button>

        <div className="order-details-header">
          <div>
            <h1>Order #{order.order_id}</h1>
            <p className="order-date">Placed on {formatDate(order.order_date)}</p>
          </div>
          <span className={`status-badge status-${order.status}`}>
            {order.status}
          </span>
        </div>

        {/* Order Timeline */}
        <div className="order-timeline-card">
          <h2>Order Status</h2>
          <div className="timeline">
            {timelineSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.id}
                  className={`timeline-step ${step.completed ? 'completed' : ''} ${step.isCancelled ? 'cancelled' : ''}`}
                >
                  <div className="step-indicator">
                    <Icon size={20} />
                  </div>
                  <div className="step-content">
                    <p className="step-label">{step.label}</p>
                    <p className="step-date">{formatDate(step.date)}</p>
                  </div>
                  {index < timelineSteps.length - 1 && <div className="step-connector" />}
                </div>
              );
            })}
          </div>

          {/* Tracking information */}
          {order.awb_code && (
            <div className="tracking-info">
              <div className="tracking-row">
                <span className="label">Tracking Number:</span>
                <span className="value">{order.awb_code}</span>
              </div>
              {order.courier_name && (
                <div className="tracking-row">
                  <span className="label">Courier:</span>
                  <span className="value">{order.courier_name}</span>
                </div>
              )}
              {trackingData && (
                <div className="tracking-row">
                  <span className="label">Current Status:</span>
                  <span className="value">{trackingData.current_status}</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="order-details-grid">
          {/* Order Items */}
          <div className="order-items-card">
            <h2>Order Items</h2>
            <div className="items-list">
              {order.items?.map((item, index) => (
                <div key={index} className="item-row">
                  <Image
                    src={item.image || '/placeholder-plant.jpg'}
                    alt={item.name}
                    width={80}
                    height={80}
                    className="item-image"
                  />
                  <div className="item-details">
                    <h3>{item.name}</h3>
                    <p className="item-price">{formatPrice(item.price)}</p>
                    <p className="item-quantity">Quantity: {item.quantity}</p>
                  </div>
                  <div className="item-total">
                    {formatPrice(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            <div className="order-summary">
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping:</span>
                <span>{formatPrice(order.shipping_charges)}</span>
              </div>
              {order.tax > 0 && (
                <div className="summary-row">
                  <span>Tax:</span>
                  <span>{formatPrice(order.tax)}</span>
                </div>
              )}
              {order.discount > 0 && (
                <div className="summary-row discount">
                  <span>Discount:</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="summary-row total">
                <span>Total:</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Delivery & Payment Info */}
          <div className="order-info-sidebar">
            {/* Delivery Address */}
            <div className="info-card">
              <h3>Delivery Address</h3>
              <div className="address-content">
                <p className="name">{order.customer_name}</p>
                <p>{order.shipping_address?.line1}</p>
                {order.shipping_address?.line2 && <p>{order.shipping_address.line2}</p>}
                <p>{order.shipping_address?.locality}</p>
                <p>
                  {order.shipping_address?.city}, {order.shipping_address?.state} {order.shipping_address?.pincode}
                </p>
                <p className="phone">{order.customer_phone}</p>
              </div>
            </div>

            {/* Payment Information */}
            <div className="info-card">
              <h3>Payment Information</h3>
              <div className="payment-content">
                <div className="payment-row">
                  <span>Method:</span>
                  <span>{order.payment_method || 'Razorpay'}</span>
                </div>
                <div className="payment-row">
                  <span>Status:</span>
                  <span className={`payment-status ${order.payment_status}`}>
                    {order.payment_status}
                  </span>
                </div>
                {order.razorpay_payment_id && (
                  <div className="payment-row">
                    <span>Payment ID:</span>
                    <span className="payment-id">{order.razorpay_payment_id.slice(0, 20)}...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Order Actions */}
            <div className="order-actions">
              {canCancel && (
                <button
                  className="btn-danger"
                  onClick={() => setShowCancelModal(true)}
                  disabled={actionLoading}
                >
                  <X size={18} />
                  Cancel Order
                </button>
              )}
              {canReturn && (
                <button
                  className="btn-secondary"
                  onClick={() => setShowReturnModal(true)}
                  disabled={actionLoading}
                >
                  <RotateCcw size={18} />
                  Request Return
                </button>
              )}
              <button
                className="btn-primary"
                onClick={() => window.print()}
              >
                Print Invoice
              </button>
            </div>

            {/* Cancellation/Return Reason */}
            {order.cancellation_reason && (
              <div className="info-card reason-card">
                <h3>Cancellation Reason</h3>
                <p>{order.cancellation_reason}</p>
              </div>
            )}
            {order.return_reason && (
              <div className="info-card reason-card">
                <h3>Return Reason</h3>
                <p>{order.return_reason}</p>
              </div>
            )}
          </div>
        </div>

        {/* Cancel Order Modal */}
        {showCancelModal && (
          <div className="modal-overlay" onClick={() => setShowCancelModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Cancel Order</h2>
              <p>Please provide a reason for cancellation:</p>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Enter cancellation reason..."
                rows={4}
              />
              <div className="modal-actions">
                <button
                  className="btn-secondary"
                  onClick={() => setShowCancelModal(false)}
                  disabled={actionLoading}
                >
                  Close
                </button>
                <button
                  className="btn-danger"
                  onClick={handleCancelOrder}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Return Order Modal */}
        {showReturnModal && (
          <div className="modal-overlay" onClick={() => setShowReturnModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Request Return</h2>
              <p>Please provide a reason for return:</p>
              <textarea
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                placeholder="Enter return reason..."
                rows={4}
              />
              <div className="modal-actions">
                <button
                  className="btn-secondary"
                  onClick={() => setShowReturnModal(false)}
                  disabled={actionLoading}
                >
                  Close
                </button>
                <button
                  className="btn-primary"
                  onClick={handleRequestReturn}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Submitting...' : 'Submit Return Request'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
