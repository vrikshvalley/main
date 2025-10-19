'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import "@/styles/adminOrders.scss";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    fetchOrders();
  }, [page]);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, products(name, image))')
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (!error) setOrders(data);
  };

  return (
    <div className="orders-list">
      <h2>Orders</h2>
        {orders.length === 0 ? (
    <div className="no-orders">No orders present.</div>
  ) : (
    orders.map((o) => (
      <div key={o.id} className="order-item">
        <span>Order #{o.id}</span>
        <span>{o.status}</span>
      </div>
    ))
  )}
      <div className="pagination">
        <button onClick={() => setPage(page - 1)} disabled={page === 1}>Prev</button>
        <button onClick={() => setPage(page + 1)} disabled={orders.length < limit}>Next</button>
      </div>
    </div>
  );
}