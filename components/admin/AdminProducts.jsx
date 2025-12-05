'use client';

import { useState, useEffect } from 'react';
import { getAdminProducts, deleteProduct } from '@/lib/services/adminService';
import { showSuccessToast, showErrorToast } from '@/lib/toastHelpers';
import AdminProductModal from './AdminProductModal';
import { Search, Edit2, Trash2, Plus, Filter, X } from 'lucide-react';
import '@/styles/adminProducts.scss';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  // Selected items for bulk actions
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, [page, categoryFilter, sortBy, sortOrder]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const result = await getAdminProducts({
        page,
        pageSize: 10,
        category: categoryFilter || null,
        searchQuery: searchQuery || null,
        sortBy,
        sortOrder
      });

      if (result.success) {
        setProducts(result.data);
        setPagination(result.pagination);
      } else {
        showErrorToast(result.error || 'Failed to fetch products');
        setProducts([]);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      showErrorToast('Failed to fetch products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const handleDelete = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const result = await deleteProduct(productId);
      if (result.success) {
        showSuccessToast('Product deleted successfully');
        fetchProducts();
      } else {
        showErrorToast(result.error || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Delete error:', error);
      showErrorToast('Failed to delete product');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setModalOpen(true);
  };

  const handleCreateNew = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingProduct(null);
    fetchProducts();
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === products.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(products.map(p => p.id));
    }
  };

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setCategoryFilter('');
    setSortBy('createdAt');
    setSortOrder('desc');
    setPage(1);
  };

  return (
    <div className="admin-products-container">
      <div className="admin-products-header">
        <h1>Products Management</h1>
        <button className="btn-create" onClick={handleCreateNew}>
          <Plus size={20} />
          Add New Product
        </button>
      </div>

      {/* Search and Filters */}
      <div className="admin-products-controls">
        <form onSubmit={handleSearch} className="search-form">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search products by name, slug, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="btn-search">Search</button>
        </form>

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
            <label>Category</label>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="">All Categories</option>
              <option value="Indoor Plants">Indoor Plants</option>
              <option value="Outdoor Plants">Outdoor Plants</option>
              <option value="Succulents">Succulents</option>
              <option value="Seeds">Seeds</option>
              <option value="Pots">Pots</option>
              <option value="Tools">Tools</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Sort By</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="createdAt">Date Created</option>
              <option value="name">Name</option>
              <option value="priceValue">Price</option>
              <option value="quantity">Stock</option>
              <option value="rating">Rating</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Order</label>
            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>

          <button className="btn-clear-filters" onClick={clearFilters}>
            <X size={16} />
            Clear Filters
          </button>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="bulk-actions">
          <span>{selectedIds.length} selected</span>
          <button className="btn-bulk">Bulk Edit</button>
          <button className="btn-bulk danger">Delete Selected</button>
        </div>
      )}

      {/* Products Table */}
      <div className="admin-products-table">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <p>No products found</p>
            <button onClick={handleCreateNew} className="btn-create-empty">
              Create your first product
            </button>
          </div>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th className="col-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === products.length}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="col-image">Image</th>
                  <th className="col-name">Name</th>
                  <th className="col-category">Category</th>
                  <th className="col-price">Price</th>
                  <th className="col-stock">Stock</th>
                  <th className="col-status">Status</th>
                  <th className="col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="col-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(product.id)}
                        onChange={() => toggleSelect(product.id)}
                      />
                    </td>
                    <td className="col-image">
                      <img 
                        src={product.image || product.images?.[0] || '/placeholder.png'} 
                        alt={product.name}
                        className="product-thumb"
                      />
                    </td>
                    <td className="col-name">
                      <div className="product-name">{product.name}</div>
                      <div className="product-slug">{product.slug}</div>
                    </td>
                    <td className="col-category">{product.category}</td>
                    <td className="col-price">
                      {product.priceType === 'custom' ? (
                        <span className="price-custom">Custom</span>
                      ) : (
                        <span className="price-value">₹{product.price}</span>
                      )}
                    </td>
                    <td className="col-stock">
                      <span className={`stock-badge ${product.quantity > 0 ? 'in-stock' : 'out-of-stock'}`}>
                        {product.quantity > 0 ? `${product.quantity} in stock` : 'Out of stock'}
                      </span>
                    </td>
                    <td className="col-status">
                      {product.featured && <span className="badge featured">Featured</span>}
                      {product.stock_status === 'in_stock' && <span className="badge available">Available</span>}
                    </td>
                    <td className="col-actions">
                      <div className="action-buttons">
                        <button 
                          className="btn-action edit"
                          onClick={() => handleEdit(product)}
                          title="Edit product"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          className="btn-action delete"
                          onClick={() => handleDelete(product.id)}
                          title="Delete product"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {pagination && (
              <div className="admin-pagination">
                <div className="pagination-info">
                  Showing {products.length} of {pagination.totalCount} products
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

      {/* Product Modal */}
      {modalOpen && (
        <AdminProductModal
          product={editingProduct}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}
