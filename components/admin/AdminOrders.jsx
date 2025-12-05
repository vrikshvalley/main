'use client';

import { useState, useEffect } from 'react';
import { getAdminOrders, getAdminOrder, updateOrderStatus } from '@/lib/services/adminService';
import { showSuccessToast, showErrorToast } from '@/lib/toastHelpers';
import { Eye, Package, Clock, CheckCircle, XCircle, Search, Filter } from 'lucide-react';
import AdminOrderModal from './AdminOrderModal';
import '@/styles/adminOrders.scss';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Modal state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const result = await getAdminOrders({
        page,
        pageSize: 10,
        status: statusFilter || null
      });

      if (result.success) {
        setOrders(result.data);
        setPagination(result.pagination);
      } else {
        showErrorToast(result.error || 'Failed to fetch orders');
        setOrders([]);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      showErrorToast('Failed to fetch orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = async (orderId) => {
    try {
      const result = await getAdminOrder(orderId);
      if (result.success) {
        setSelectedOrder(result.data);
        setModalOpen(true);
      } else {
        showErrorToast(result.error || 'Failed to fetch order details');
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      showErrorToast('Failed to fetch order details');
    }
  };

  const handleStatusChange = async (orderId, newStatus, notes = '') => {
    try {
      const result = await updateOrderStatus(orderId, newStatus, notes);
      if (result.success) {
        showSuccessToast('Order status updated successfully');
        fetchOrders();
        if (selectedOrder?.id === orderId) {
          setModalOpen(false);
        }
      } else {
        showErrorToast(result.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Status update error:', error);
      showErrorToast('Failed to update status');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock size={16} />;
      case 'processing':
        return <Package size={16} />;
      case 'completed':
        return <CheckCircle size={16} />;
      case 'cancelled':
        return <XCircle size={16} />;
      default:
        return <Package size={16} />;
    }
  };

  const getStatusClass = (status) => {
    return `status-badge status-${status}`;
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

  const filteredOrders = searchQuery
    ? orders.filter(order =>
        order.order_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.user?.email?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : orders;

  return (
    <div className="admin-orders-container">
      <div className="admin-orders-header">
        <h1>Orders Management</h1>
        <div className="order-stats">
          <div className="stat">
            <span className="stat-label">Total Orders</span>
            <span className="stat-value">{pagination?.totalCount || 0}</span>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="admin-orders-controls">
        <div className="search-form">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search by order ID, customer name, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <button 
          className={`btn-filters ${showFilters ? 'active' : ''}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter size={18} />
          Filters
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="filter-panel">
          <div className="filter-group">
            <label>Status</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <button className="btn-clear-filters" onClick={() => setStatusFilter('')}>
            Clear Filters
          </button>
        </div>
      )}

      {/* Orders Table */}
      <div className="admin-orders-table">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="empty-state">
            <Package size={48} />
            <p>No orders found</p>
          </div>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th className="col-order-id">Order ID</th>
                  <th className="col-customer">Customer</th>
                  <th className="col-date">Date</th>
                  <th className="col-items">Items</th>
                  <th className="col-total">Total</th>
                  <th className="col-status">Status</th>
                  <th className="col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="col-order-id">
                      <span className="order-id">#{order.order_id || order.id.slice(0, 8)}</span>
                    </td>
                    <td className="col-customer">
                      <div className="customer-info">
                        <div className="customer-name">{order.user?.name || 'N/A'}</div>
                        <div className="customer-email">{order.user?.email || 'N/A'}</div>
                      </div>
                    </td>
                    <td className="col-date">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="col-items">
                      <span className="items-count">{order.items?.length || 0} items</span>
                    </td>
                    <td className="col-total">
                      <span className="order-total">₹{order.totals?.total?.toFixed(2) || '0.00'}</span>
                    </td>
                    <td className="col-status">
                      <span className={getStatusClass(order.status)}>
                        {getStatusIcon(order.status)}
                        {order.status}
                      </span>
                    </td>
                    <td className="col-actions">
                      <button
                        className="btn-action view"
                        onClick={() => handleViewOrder(order.id)}
                        title="View order details"
                      >
                        <Eye size={16} />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {pagination && (
              <div className="admin-pagination">
                <div className="pagination-info">
                  Showing {filteredOrders.length} of {pagination.totalCount} orders
                </div>
                <div className="pagination-controls">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={!pagination.hasPrev || loading}
                    className="btn-page"
                  >
                    Previous
                  </button>
                  <span className="page-info">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={!pagination.hasNext || loading}
                    className="btn-page"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Order Details Modal */}
      {modalOpen && selectedOrder && (
        <AdminOrderModal
          order={selectedOrder}
          onClose={() => {
            setModalOpen(false);
            setSelectedOrder(null);
          }}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}
