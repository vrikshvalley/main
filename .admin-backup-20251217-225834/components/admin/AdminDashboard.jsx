'use client';

import { useState, useEffect } from 'react';
import { getDashboardStats } from '@/lib/services/adminService';
import { Package, ShoppingCart, Users, DollarSign, TrendingUp, Clock } from 'lucide-react';
import '@/styles/adminDashboard.scss';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const result = await getDashboardStats();
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard-loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Dashboard Overview</h1>
        <p className="dashboard-subtitle">Welcome to your admin panel</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {/* Total Products */}
        <div className="stat-card">
          <div className="stat-icon products">
            <Package size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Total Products</div>
            <div className="stat-value">{stats?.products?.total || 0}</div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="stat-card">
          <div className="stat-icon orders">
            <ShoppingCart size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Total Orders</div>
            <div className="stat-value">{stats?.orders?.total || 0}</div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="stat-card">
          <div className="stat-icon revenue">
            <DollarSign size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Total Revenue</div>
            <div className="stat-value">₹{stats?.revenue?.total?.toFixed(2) || '0.00'}</div>
          </div>
        </div>

        {/* Total Users */}
        <div className="stat-card">
          <div className="stat-icon users">
            <Users size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Total Users</div>
            <div className="stat-value">{stats?.users?.total || 0}</div>
          </div>
        </div>
      </div>

      {/* Order Status Breakdown */}
      <div className="dashboard-section">
        <h2>Order Status Breakdown</h2>
        <div className="order-status-grid">
          <div className="status-card pending">
            <div className="status-icon">
              <Clock size={20} />
            </div>
            <div className="status-content">
              <div className="status-label">Pending</div>
              <div className="status-value">{stats?.orders?.pending || 0}</div>
            </div>
          </div>

          <div className="status-card processing">
            <div className="status-icon">
              <TrendingUp size={20} />
            </div>
            <div className="status-content">
              <div className="status-label">Processing</div>
              <div className="status-value">{stats?.orders?.processing || 0}</div>
            </div>
          </div>

          <div className="status-card completed">
            <div className="status-icon">
              <Package size={20} />
            </div>
            <div className="status-content">
              <div className="status-label">Completed</div>
              <div className="status-value">{stats?.orders?.completed || 0}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="dashboard-section">
        <h2>Quick Actions</h2>
        <div className="quick-actions">
          <a href="/admin/profile/products" className="action-card">
            <Package size={24} />
            <span>Manage Products</span>
          </a>
          <a href="/admin/profile/orders" className="action-card">
            <ShoppingCart size={24} />
            <span>View Orders</span>
          </a>
          <a href="/admin/profile/create-product" className="action-card">
            <Package size={24} />
            <span>Add New Product</span>
          </a>
        </div>
      </div>
    </div>
  );
}
