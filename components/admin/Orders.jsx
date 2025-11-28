'use client';
import { useEffect, useState } from 'react';
import { collection, query, orderBy, limit as firestoreLimit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';
import "@/styles/adminOrders.scss";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const limit = 10;

  useEffect(() => {
    fetchOrders();
  }, [page]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const ordersRef = collection(db, 'orders');
      const q = query(
        ordersRef,
        orderBy('created_at', 'desc'),
        firestoreLimit(limit)
      );
      
      const snapshot = await getDocs(q);
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="orders-list">
      <h2>Orders</h2>
      {loading ? (
        <div className="loading">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="no-orders">No orders present.</div>
      ) : (
        orders.map((o) => (
          <div key={o.id} className="order-item">
            <span>Order #{o.order_id || o.id}</span>
            <span className={`status status-${o.status}`}>{o.status}</span>
            <span>₹{o.totals?.total || 0}</span>
          </div>
        ))
      )}
      <div className="pagination">
        <button onClick={() => setPage(page - 1)} disabled={page === 1 || loading}>Prev</button>
        <button onClick={() => setPage(page + 1)} disabled={orders.length < limit || loading}>Next</button>
      </div>
    </div>
  );
}