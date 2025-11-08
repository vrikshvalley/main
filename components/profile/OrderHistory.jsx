"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getRecentOrders } from '@/lib/services/userService';

export default function OrderHistory({ userId }) {
  const [orders, setOrders] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getRecentOrders(userId, 5).then(res => {
      if (!mounted) return;
      setOrders(res.data || []);
      setLoading(false);
    });
    return () => { mounted = false };
  }, [userId]);

  if (loading) return <div className="card">Loading orders…</div>;

  return (
    <section className="orders card">
      <div className="section-header">
        <h3>Recent Orders</h3>
        <Link href="/orders"><a className="link">View All Orders</a></Link>
      </div>

      {orders && orders.length > 0 ? (
        <ul className="orders-list">
          {orders.map(o => (
            <li key={o.id} className="order-item">
              <div className="order-thumbnail">
                <img src={o.items?.[0]?.image || '/hero1.jpg'} alt="product" width={72} height={72} />
              </div>
              <div className="order-meta">
                <div className="order-id">{o.id}</div>
                <div className="order-name">{o.items?.[0]?.name || 'Order item'}</div>
                <div className="order-date muted">{new Date(o.date).toLocaleDateString()}</div>
              </div>
              <div className="order-right">
                <div className="order-total">₹{o.total}</div>
                <div className={`order-status status-${o.status.replace(/\s+/g,'').toLowerCase()}`}>{o.status}</div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="muted">No recent orders.</p>
      )}
    </section>
  );
}
