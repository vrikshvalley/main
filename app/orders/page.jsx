'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { orderService } from '@/lib/services/orderService';
import { toast } from 'react-toastify';
import Image from 'next/image';
import '@/styles/orders.scss';

export default function OrdersPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  // Status badge configuration
  const statusConfig = {
    pending: { label: 'Pending', color: 'yellow' },
    confirmed: { label: 'Confirmed', color: 'blue' },
    shipped: { label: 'Shipped', color: 'purple' },
    delivered: { label: 'Delivered', color: 'green' },
    cancelled: { label: 'Cancelled', color: 'red' },
    returned: { label: 'Returned', color: 'orange' }
  };

  // Filter tabs
  const filters = [
    { id: 'all', label: 'All Orders' },
    { id: 'pending', label: 'Pending' },
    { id: 'shipped', label: 'Shipped' },
    { id: 'delivered', label: 'Delivered' },
    { id: 'cancelled', label: 'Cancelled' }
  ];

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user, activeFilter]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/auth/login');
      return;
    }
    setUser(user);
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const filterStatus = activeFilter === 'all' ? null : activeFilter;
      const { data, error } = await orderService.getUserOrders(
        user.id,
        null, // no limit, fetch all
        filterStatus
      );

      if (error) {
        console.error('Error fetching orders:', error);
        toast.error('Failed to load orders');
        setOrders([]);
      } else {
        setOrders(data || []);
      }
    } catch (error) {
      console.error('Error in fetchOrders:', error);
      toast.error('An error occurred while loading orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (priceInPaise) => {
    return `₹${(priceInPaise / 100).toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getOrderItemsPreview = (items) => {
    if (!items || items.length === 0) return 'No items';
    if (items.length === 1) return items[0].name;
    return `${items[0].name} +${items.length - 1} more`;
  };

  const handleViewOrder = (orderId) => {
    router.push(`/orders/${orderId}`);
  };

  if (loading) {
    return (
      <div className="orders-page">
        <div className="container">
          <div className="loading-state">
            <div className="loader"></div>
            <p>Loading your orders...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="container">
        <div className="orders-header">
          <h1>My Orders</h1>
          <p className="subtitle">Track, manage, and view your order history</p>
        </div>

        {/* Filter tabs */}
        <div className="filters">
          {filters.map((filter) => (
            <button
              key={filter.id}
              className={`filter-tab ${activeFilter === filter.id ? 'active' : ''}`}
              onClick={() => setActiveFilter(filter.id)}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Orders list */}
        {orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h2>No orders found</h2>
            <p>
              {activeFilter === 'all'
                ? "You haven't placed any orders yet"
                : `You don't have any ${activeFilter} orders`}
            </p>
            <button className="btn-primary" onClick={() => router.push('/products')}>
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order.id} className="order-card">
                <div className="order-card-header">
                  <div className="order-info">
                    <span className="order-id">Order #{order.order_id}</span>
                    <span className="order-date">{formatDate(order.order_date)}</span>
                  </div>
                  <span className={`status-badge status-${order.status}`}>
                    {statusConfig[order.status]?.label || order.status}
                  </span>
                </div>

                <div className="order-card-body">
                  <div className="order-items-preview">
                    {order.items && order.items.length > 0 && (
                      <div className="items-images">
                        {order.items.slice(0, 3).map((item, idx) => (
                          <div key={idx} className="item-image-wrapper">
                            <Image
                              src={item.image || '/placeholder-plant.jpg'}
                              alt={item.name}
                              width={60}
                              height={60}
                              className="item-image"
                            />
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <div className="more-items">
                            +{order.items.length - 3}
                          </div>
                        )}
                      </div>
                    )}
                    <div className="items-text">
                      <p className="items-description">
                        {getOrderItemsPreview(order.items)}
                      </p>
                      <p className="items-count">
                        {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  <div className="order-details">
                    <div className="detail-row">
                      <span className="label">Total Amount:</span>
                      <span className="value total-amount">{formatPrice(order.total)}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Payment:</span>
                      <span className={`value payment-status ${order.payment_status}`}>
                        {order.payment_status}
                      </span>
                    </div>
                    {order.awb_code && (
                      <div className="detail-row">
                        <span className="label">Tracking:</span>
                        <span className="value tracking-code">{order.awb_code}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="order-card-footer">
                  <button
                    className="btn-view-order"
                    onClick={() => handleViewOrder(order.order_id)}
                  >
                    View Details
                  </button>
                  {order.status === 'delivered' && (
                    <button className="btn-secondary">
                      Write Review
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
