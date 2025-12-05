"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import orderService from '@/lib/services/orderService';
import { toast } from 'react-toastify';

export default function OrderHistory({ userId }) {
  const [orders, setOrders] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    const fetchOrders = async () => {
      try {
        const { data, error } = await orderService.getUserOrders(userId, 5); // Get last 5 orders
        
        if (!mounted) return;
        
        if (error) {
          console.error('Error fetching orders:', error);
          toast.error('Failed to load orders');
          setOrders([]);
        } else {
          setOrders(data || []);
        }
      } catch (error) {
        console.error('Error in fetchOrders:', error);
        if (mounted) {
          setOrders([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchOrders();
    return () => { mounted = false };
  }, [userId]);

  const formatPrice = (price) => {
    return `₹${price.toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) return <div className="card">Loading orders…</div>;

  return (
    <section className="orders card">
      <div className="section-header">
        <h3>Recent Orders</h3>
        <Link href="/orders" className="link">View All Orders</Link>
      </div>

      {orders && orders.length > 0 ? (
        <ul className="orders-list">
          {orders.map(order => (
            <li key={order.id} className="order-item">
              <div className="order-thumbnail">
                <img 
                  src={order.items?.[0]?.image || '/hero1.jpg'} 
                  alt={order.items?.[0]?.name || 'Product'} 
                  width={72} 
                  height={72} 
                />
              </div>
              <div className="order-meta">
                <div className="order-id">#{order.order_id}</div>
                <div className="order-name">
                  {order.items?.[0]?.name || 'Order item'}
                  {order.items?.length > 1 && ` +${order.items.length - 1} more`}
                </div>
                <div className="order-date muted">{formatDate(order.order_date)}</div>
              </div>
              <div className="order-right">
                <div className="order-total">{formatPrice(order.total)}</div>
                <div className={`order-status status-${order.status.replace(/\s+/g,'').toLowerCase()}`}>
                  {order.status}
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="muted">No recent orders. <Link href="/products" className="link">Start shopping</Link></p>
      )}
    </section>
  );
}
