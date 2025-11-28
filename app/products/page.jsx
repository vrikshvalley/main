'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Topbar from '@/components/general/Topbar';
import Navbar from '@/components/general/Navbar';
import Footer from '@/components/general/Footer';
import WhatsAppButton from '@/components/general/WhatsAppButton';
import Breadcrumbs from '@/components/general/Breadcrumbs';
import { getProducts, getPriceRange } from '@/lib/productHelpers';
import { categories } from '@/lib/sampleProducts';
import { ChevronDown, X, SlidersHorizontal, Grid, List } from 'lucide-react';
import TheLoader from '@/components/general/TheLoader';
import ProductListCard from '@/components/products/ProductListCard';
import '@/styles/products.scss';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [maxPossiblePrice, setMaxPossiblePrice] = useState(10000);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const productsPerPage = 12;
  
  // UI states
  const [showFilters, setShowFilters] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Fetch price range on mount
  useEffect(() => {
    const fetchPriceRange = async () => {
      const range = await getPriceRange(selectedCategory);
      setMaxPossiblePrice(range.max);
      setPriceRange([range.min, range.max]);
    };
    fetchPriceRange();
  }, [selectedCategory]);

  // Fetch products when filters change
  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, priceRange, inStockOnly, sortBy, sortOrder, currentPage]);

  const fetchProducts = async () => {
    setLoading(true);
    const result = await getProducts({
      category: selectedCategory,
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
      inStock: inStockOnly ? true : null,
      sortBy,
      sortOrder,
      page: currentPage,
      limit: productsPerPage,
    });

    setProducts(result.products);
    setTotalPages(result.totalPages);
    setTotalProducts(result.total);
    setLoading(false);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category === selectedCategory ? null : category);
    setCurrentPage(1);
  };

  const handlePriceChange = (index, value) => {
    const newRange = [...priceRange];
    newRange[index] = parseInt(value);
    setPriceRange(newRange);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSelectedCategory(null);
    setPriceRange([0, maxPossiblePrice]);
    setInStockOnly(false);
    setSortBy('created_at');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (selectedCategory) count++;
    if (priceRange[0] > 0 || priceRange[1] < maxPossiblePrice) count++;
    if (inStockOnly) count++;
    return count;
  };

  const handleSortChange = (newSortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder(newSortBy === 'price' ? 'asc' : 'desc');
    }
    setShowSortDropdown(false);
    setCurrentPage(1);
  };

  const getSortLabel = () => {
    const labels = {
      'created_at': 'Newest First',
      'name': 'Name',
      'price': sortOrder === 'asc' ? 'Price: Low to High' : 'Price: High to Low',
      'rating': 'Highest Rated',
    };
    return labels[sortBy] || 'Sort By';
  };

  return (
    <>
      <div className="products-page">
        <Breadcrumbs items={[{ label: 'Products' }]} />
      {/* Page Header */}
      <div className="products-header">
        <div className="header-content">
          <h1>Our Products</h1>
          <p>Discover our curated collection of plants, seeds, and gardening essentials</p>
        </div>
      </div>

      <div className="main-products-container">
        {/* Filters Sidebar */}
        <aside className={`filters-sidebar ${showFilters ? 'show' : 'hide'}`}>
          <div className="filters-header">
            <h3>
              <SlidersHorizontal size={20} />
              Filters
            </h3>
            <button 
              className="toggle-filters-mobile"
              onClick={() => setShowFilters(!showFilters)}
            >
              <X size={20} />
            </button>
          </div>

          {/* Active Filters */}
          {getActiveFiltersCount() > 0 && (
            <div className="active-filters">
              <div className="active-filters-header">
                <span>{getActiveFiltersCount()} active filter{getActiveFiltersCount() > 1 ? 's' : ''}</span>
                <button onClick={handleClearFilters} className="clear-all">
                  Clear all
                </button>
              </div>
              <div className="active-filter-tags">
                {selectedCategory && (
                  <span className="filter-tag">
                    {categories.find(c => c.slug === selectedCategory)?.name}
                    <X size={14} onClick={() => setSelectedCategory(null)} />
                  </span>
                )}
                {(priceRange[0] > 0 || priceRange[1] < maxPossiblePrice) && (
                  <span className="filter-tag">
                    ₹{priceRange[0]/100} - ₹{priceRange[1]/100}
                    <X size={14} onClick={() => setPriceRange([0, maxPossiblePrice])} />
                  </span>
                )}
                {inStockOnly && (
                  <span className="filter-tag">
                    In Stock Only
                    <X size={14} onClick={() => setInStockOnly(false)} />
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Category Filter */}
          <div className="filter-section">
            <h4>Categories</h4>
            <div className="category-list">
              {categories.map((cat) => (
                <label key={cat.slug} className="category-item">
                  <input
                    type="checkbox"
                    checked={selectedCategory === cat.slug}
                    onChange={() => handleCategoryChange(cat.slug)}
                  />
                  <span className="category-icon">{cat.icon}</span>
                  <span className="category-name">{cat.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Filter */}
          <div className="filter-section">
            <h4>Price Range</h4>
            <div className="price-inputs">
              <div className="price-input-group">
                <label>Min</label>
                <input
                  type="number"
                  value={priceRange[0]}
                  onChange={(e) => handlePriceChange(0, e.target.value)}
                  min="0"
                  max={priceRange[1]}
                />
              </div>
              <span className="price-separator">-</span>
              <div className="price-input-group">
                <label>Max</label>
                <input
                  type="number"
                  value={priceRange[1]}
                  onChange={(e) => handlePriceChange(1, e.target.value)}
                  min={priceRange[0]}
                  max={maxPossiblePrice}
                />
              </div>
            </div>
            <input
              type="range"
              min="0"
              max={maxPossiblePrice}
              value={priceRange[1]}
              onChange={(e) => handlePriceChange(1, e.target.value)}
              className="price-slider"
            />
            <div className="price-range-display">
              ₹{(priceRange[0]/100).toFixed(0)} - ₹{(priceRange[1]/100).toFixed(0)}
            </div>
          </div>

          {/* Availability Filter */}
          <div className="filter-section">
            <h4>Availability</h4>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
              />
              <span>In Stock Only</span>
            </label>
          </div>
        </aside>

        {/* Main Content */}
        <main className="products-main">
          {/* Toolbar */}
          <div className="products-toolbar">
            <div className="toolbar-left">
              <button 
                className="mobile-filter-toggle"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal size={18} />
                Filters {getActiveFiltersCount() > 0 && `(${getActiveFiltersCount()})`}
              </button>
              <p className="results-count">
                Showing <strong>{products.length}</strong> of <strong>{totalProducts}</strong> products
              </p>
            </div>
            
            <div className="toolbar-right">
              {/* View Toggle */}
              <div className="view-toggle">
                <button
                  className={viewMode === 'grid' ? 'active' : ''}
                  onClick={() => setViewMode('grid')}
                  title="Grid View"
                >
                  <Grid size={18} />
                </button>
                <button
                  className={viewMode === 'list' ? 'active' : ''}
                  onClick={() => setViewMode('list')}
                  title="List View"
                >
                  <List size={18} />
                </button>
              </div>

              {/* Sort Dropdown */}
              <div className="sort-dropdown">
                <button
                  className="sort-button"
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                >
                  {getSortLabel()}
                  <ChevronDown size={16} />
                </button>
                {showSortDropdown && (
                  <div className="sort-options">
                    <button onClick={() => handleSortChange('created_at')}>
                      Newest First
                    </button>
                    <button onClick={() => handleSortChange('name')}>
                      Name (A-Z)
                    </button>
                    <button onClick={() => handleSortChange('price')}>
                      Price: Low to High
                    </button>
                    <button onClick={() => handleSortChange('price')}>
                      Price: High to Low
                    </button>
                    <button onClick={() => handleSortChange('rating')}>
                      Highest Rated
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Products Grid/List */}
          {loading ? (
            <div className="products-loading">
              <TheLoader />
            </div>
          ) : products.length > 0 ? (
            <>
              <div className={`products-grid ${viewMode}`}>
                {products.map((product) => (
                  <ProductListCard key={product.id} product={product} viewMode={viewMode} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="pagination-button"
                  >
                    Previous
                  </button>
                  
                  <div className="page-numbers">
                    {[...Array(totalPages)].map((_, index) => {
                      const page = index + 1;
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={currentPage === page ? 'active' : ''}
                          >
                            {page}
                          </button>
                        );
                      } else if (page === currentPage - 2 || page === currentPage + 2) {
                        return <span key={page}>...</span>;
                      }
                      return null;
                    })}
                  </div>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="pagination-button"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="no-products">
              <p>No products found matching your criteria.</p>
              <button onClick={handleClearFilters} className="clear-filters-button">
                Clear Filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
    </>
  );
}
