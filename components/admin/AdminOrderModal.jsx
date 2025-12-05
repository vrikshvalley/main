'use client';

import { useState } from 'react';
import { X, MapPin, Phone, Mail, User, Package } from 'lucide-react';
import '@/styles/adminOrderModal.scss';

export default function AdminOrderModal({ order, onClose, onStatusChange }) {
  const [newStatus, setNewStatus] = useState(order.status);
  const [statusNotes, setStatusNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const handleStatusUpdate = async () => {
    setUpdating(true);
    await onStatusChange(order.id, newStatus, statusNotes);
    setUpdating(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="admin-order-modal-overlay" onClick={onClose}>
      <div className="admin-order-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="admin-order-modal-header">
          <h2>Order Details</h2>
          <button className="btn-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="admin-order-modal-body">
          {/* Order Info */}
          <div className="order-info-section">
            <div className="order-header-info">
              <div className="info-item">
                <span className="label">Order ID:</span>
                <span className="value">#{order.order_id || order.id.slice(0, 8)}</span>
              </div>
              <div className="info-item">
                <span className="label">Date:</span>
                <span className="value">{formatDate(order.created_at)}</span>
              </div>
              <div className="info-item">
                <span className="label">Status:</span>
                <span className={`status-badge status-${order.status}`}>{order.status}</span>
              </div>
            </div>
          </div>

          {/* Customer Details */}
          {order.user && (
            <div className="section customer-section">
              <h3><User size={20} /> Customer Information</h3>
              <div className="customer-details">
                <div className="detail-row">
                  <span className="detail-label">Name:</span>
                  <span className="detail-value">{order.user.name || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <Mail size={16} />
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{order.user.email || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <Phone size={16} />
                  <span className="detail-label">Phone:</span>
                  <span className="detail-value">{order.user.phone || 'N/A'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Shipping Address */}
          {order.shipping_address && (
            <div className="section address-section">
              <h3><MapPin size={20} /> Shipping Address</h3>
              <div className="address-details">
                <p>{order.shipping_address.address_line1}</p>
                {order.shipping_address.address_line2 && (
                  <p>{order.shipping_address.address_line2}</p>
                )}
                <p>
                  {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.pincode}
                </p>
              </div>
            </div>
          )}

          {/* Order Items */}
          <div className="section items-section">
            <h3><Package size={20} /> Order Items ({order.items?.length || 0})</h3>
            <div className="items-list">
              {order.items?.map((item, index) => (
                <div key={index} className="order-item">
                  <div className="item-image">
                    <img 
                      src={item.product?.image || item.product?.images?.[0] || '/placeholder.png'} 
                      alt={item.product?.name || 'Product'}
                    />
                  </div>
                  <div className="item-details">
                    <div className="item-name">{item.product?.name || item.name || 'Unknown Product'}</div>
                    <div className="item-meta">
                      <span className="item-quantity">Qty: {item.quantity}</span>
                      {item.size && <span className="item-size">Size: {item.size}</span>}
                      {item.color && <span className="item-color">Color: {item.color}</span>}
                    </div>
                  </div>
                  <div className="item-price">
                    <div className="unit-price">₹{item.price?.toFixed(2)}</div>
                    <div className="total-price">₹{(item.price * item.quantity).toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Totals */}
          {order.totals && (
            <div className="section totals-section">
              <h3>Order Summary</h3>
              <div className="totals-list">
                <div className="total-row">
                  <span className="total-label">Subtotal:</span>
                  <span className="total-value">₹{order.totals.subtotal?.toFixed(2) || '0.00'}</span>
                </div>
                {order.totals.discount > 0 && (
                  <div className="total-row">
                    <span className="total-label">Discount:</span>
                    <span className="total-value discount">-₹{order.totals.discount?.toFixed(2)}</span>
                  </div>
                )}
                {order.totals.shipping > 0 && (
                  <div className="total-row">
                    <span className="total-label">Shipping:</span>
                    <span className="total-value">₹{order.totals.shipping?.toFixed(2)}</span>
                  </div>
                )}
                {order.totals.tax > 0 && (
                  <div className="total-row">
                    <span className="total-label">Tax:</span>
                    <span className="total-value">₹{order.totals.tax?.toFixed(2)}</span>
                  </div>
                )}
                <div className="total-row total-final">
                  <span className="total-label">Total:</span>
                  <span className="total-value">₹{order.totals.total?.toFixed(2) || '0.00'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Update Status */}
          <div className="section status-update-section">
            <h3>Update Order Status</h3>
            <div className="status-update-form">
              <div className="form-group">
                <label>New Status</label>
                <select 
                  value={newStatus} 
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="status-select"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="form-group">
                <label>Status Notes (optional)</label>
                <textarea
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  placeholder="Add any notes about this status change..."
                  rows={3}
                />
              </div>

              <button
                className="btn-update-status"
                onClick={handleStatusUpdate}
                disabled={updating || newStatus === order.status}
              >
                {updating ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>

          {/* Status History */}
          {order.status_notes && (
            <div className="section notes-section">
              <h3>Status Notes</h3>
              <p className="status-notes">{order.status_notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
