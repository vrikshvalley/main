'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Breadcrumbs from '@/components/general/Breadcrumbs';
import { getProducts, getPriceRange } from '@/lib/productHelpers';
import { getCategories } from '@/lib/services/productService';
import { ChevronDown, X, Grid, List, Search } from 'lucide-react';
import TheLoader from '@/components/general/TheLoader';
import Button from '@/components/general/Button';
import ProductListCard from '@/components/products/ProductListCard';
import WhyChooseUs from "@/components/products/WhyChooseUs";
import '@/styles/products.scss';

export default function ProductsPage() {
  // Read `filter` query param from `window.location.search` on the client
  const [filter, setFilter] = useState(null);

  useEffect(() => {
    const readFilter = () => {
      try {
        if (typeof window === 'undefined') return null;
        return new URLSearchParams(window.location.search).get('filter');
      } catch (e) {
        return null;
      }
    };

    setFilter(readFilter());

    const onPopstate = () => setFilter(readFilter());
    window.addEventListener('popstate', onPopstate);
    return () => window.removeEventListener('popstate', onPopstate);
  }, []);
  
  const [pageTitle, setPageTitle] = useState('Our Products');
  const [pageSubtitle, setPageSubtitle] = useState('Discover our curated collection');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [products, setProducts] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch categories
  useEffect(() => {
    async function fetchCategories() {
      try {
        const { data: fetchedCategories } = await getCategories();
        setCategories(fetchedCategories || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    }
    fetchCategories();
  }, []);
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedPlantType, setSelectedPlantType] = useState([]);
  const [selectedMaintenance, setSelectedMaintenance] = useState([]);
  const [selectedPetFriendly, setSelectedPetFriendly] = useState(null);
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [maxPossiblePrice, setMaxPossiblePrice] = useState(10000);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const productsPerPage = 12; // Show 12 products per page
  
  // UI states
  const [showFilters, setShowFilters] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Fetch price range on mount
  useEffect(() => {
    const fetchPriceRange = async () => {
      const range = await getPriceRange(selectedCategory);
      setMaxPossiblePrice(range.max);
      // Do not preselect the minimum price on load — keep min at 0
      setPriceRange([0, range.max]);
    };
    fetchPriceRange();
  }, [selectedCategory]);

  // Set sortBy based on filter query param
  useEffect(() => {
    if (filter === 'new-arrivals') {
      setSortBy('created_at');
      setSortOrder('desc');
      setPageTitle('New Arrivals');
      setPageSubtitle('Discover our latest additions');
    } else if (filter === 'featured') {
      setSortBy('featured');
      setSortOrder('desc');
      setPageTitle('Featured Products');
      setPageSubtitle('Handpicked favorites');
    } else {
      setPageTitle('Our Products');
      setPageSubtitle('Discover our curated collection');
    }
  }, [filter]);

  // Fetch products when filters change (but NOT currentPage)
  useEffect(() => {
    fetchProducts();
  }, [
    selectedCategory,
    (selectedPlantType || []).join('|'),
    (selectedMaintenance || []).join('|'),
    selectedPetFriendly,
    priceRange[0],
    priceRange[1],
    inStockOnly,
    sortBy,
    sortOrder,
    searchQuery,
  ]);

  // Separate effect for currentPage to control scroll timing
  useEffect(() => {
    if (currentPage === 1) {
      // Initial load, just fetch
      fetchProducts();
    } else {
      // Scroll to top FIRST (instant, no animation)
      window.scrollTo({ top: 0, behavior: 'instant' });
      // Then fetch products after a tiny delay to ensure scroll completes
      const timer = setTimeout(() => {
        fetchProducts();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [currentPage]);

  // Delayed loader animation for smooth UX
  useEffect(() => {
    let loaderTimer;
    if (loading) {
      // Show loader after 300ms for quick filters (better UX)
      loaderTimer = setTimeout(() => {
        setShowLoader(true);
      }, 300);
    } else {
      // Immediately hide loader when done
      setShowLoader(false);
    }
    return () => clearTimeout(loaderTimer);
  }, [loading]);

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
      searchQuery: searchQuery.trim() || null,
      featured: filter === 'featured' ? true : null,
      new_arrival: filter === 'new-arrivals' ? true : null,
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
    setSelectedPlantType([]);
    setSelectedMaintenance([]);
    setSelectedPetFriendly(null);
    setPriceRange([0, maxPossiblePrice]);
    setInStockOnly(false);
    setSortBy('created_at');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (selectedCategory) count++;
    if (selectedPlantType.length > 0) count++;
    if (selectedMaintenance.length > 0) count++;
    if (selectedPetFriendly) count++;
    if (priceRange[0] > 0 || priceRange[1] < maxPossiblePrice) count++;
    if (inStockOnly) count++;
    return count;
  };

  const handleSortChange = (newSortBy, order = null) => {
    if (sortBy === newSortBy) {
      if (order) {
        setSortOrder(order);
      } else {
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
      }
    } else {
      setSortBy(newSortBy);
      if (order) {
        setSortOrder(order);
      } else {
        setSortOrder(newSortBy === 'price' ? 'asc' : 'desc');
      }
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
        <div className="products-header"
        style={{
            backgroundImage: 'url(/ProductsDesktop.png)',
          }}>
          <style jsx>{`
            @media (max-width: 768px) {
              .products-header {
                background-image: url(/ProductsMobile.png);
              }
            }
          `}</style>
        <motion.div 
          className="header-content"
          
        >
          <h1>{pageTitle}</h1>
          <p>{pageSubtitle}</p>
        </motion.div>
      </div>

      <div className="main-products-container">
        {/* Backdrop Overlay */}
        {showFilters && (
          <div 
            className="filters-backdrop"
            onClick={() => setShowFilters(false)}
          />
        )}

        {/* Filters Sidebar */}
        <aside className={`filters-sidebar ${showFilters ? 'show' : 'hide'}`}>
          <div className="filters-header">
            <h3>
              <img src="/hamMenu.png" alt="Filters" width={16} height={16} />
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
                    ₹{priceRange[0]} - ₹{priceRange[1]}
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

          {/* Type of Plant Filter */}
          <div className="filter-section">
            <h4>Type of Plant</h4>
            <div className="checkbox-list">
              {['Indoor', 'Outdoor', 'Succulent', 'Flowering', 'Foliage', 'Herb'].map((type) => (
                <label key={type} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedPlantType.includes(type)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedPlantType([...selectedPlantType, type]);
                      } else {
                        setSelectedPlantType(selectedPlantType.filter(t => t !== type));
                      }
                      setCurrentPage(1);
                    }}
                  />
                  <span>{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Maintenance Filter */}
          <div className="filter-section">
            <h4>Maintenance</h4>
            <div className="checkbox-list">
              {['Low', 'Medium', 'High'].map((level) => (
                <label key={level} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedMaintenance.includes(level)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedMaintenance([...selectedMaintenance, level]);
                      } else {
                        setSelectedMaintenance(selectedMaintenance.filter(l => l !== level));
                      }
                      setCurrentPage(1);
                    }}
                  />
                  <span>{level} Maintenance</span>
                </label>
              ))}
            </div>
          </div>

          {/* Pet Friendly Filter */}
          <div className="filter-section">
            <h4>Pet Friendly</h4>
            <div className="checkbox-list">
              <label className="checkbox-label">
                <input
                  type="radio"
                  name="petFriendly"
                  checked={selectedPetFriendly === 'Yes'}
                  onChange={() => {
                    setSelectedPetFriendly('Yes');
                    setCurrentPage(1);
                  }}
                />
                <span>Pet Friendly</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="radio"
                  name="petFriendly"
                  checked={selectedPetFriendly === 'No'}
                  onChange={() => {
                    setSelectedPetFriendly('No');
                    setCurrentPage(1);
                  }}
                />
                <span>Not Pet Friendly</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="radio"
                  name="petFriendly"
                  checked={selectedPetFriendly === null}
                  onChange={() => {
                    setSelectedPetFriendly(null);
                    setCurrentPage(1);
                  }}
                />
                <span>All</span>
              </label>
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
              ₹{priceRange[0]} - ₹{priceRange[1]}
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
              <Button
                variant="outline"
                size="sm"
                className="mobile-filter-toggle"
                onClick={() => setShowFilters(!showFilters)}
              >
                <img src="/hamMenu.png" alt="Filters" width={18} height={18} />
                Filters {getActiveFiltersCount() > 0 && `(${getActiveFiltersCount()})`}
              </Button>
              <p className="results-count">
                Showing <strong>{products.length}</strong> of <strong>{totalProducts}</strong> products
              </p>
            </div>
            
            <div className="toolbar-center">
              <div className="toolbar-search">
                <Search size={18} />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  aria-label="Search products"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="clear-search"
                    onClick={() => {
                      setSearchQuery('');
                      setCurrentPage(1);
                    }}
                    aria-label="Clear search"
                    icon={X}
                  />
                )}
              </div>
            </div>
            
            <div className="toolbar-right">
              {/* View Toggle */}
              <div className="view-toggle">
                <Button
                  variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                  size="sm"
                  className={viewMode === 'grid' ? 'active' : ''}
                  onClick={() => setViewMode('grid')}
                  title="Grid View"
                  icon={Grid}
                />
                <Button
                  variant={viewMode === 'list' ? 'primary' : 'ghost'}
                  size="sm"
                  className={viewMode === 'list' ? 'active' : ''}
                  onClick={() => setViewMode('list')}
                  title="List View"
                  icon={List}
                />
              </div>

              {/* Sort Dropdown */}
              <div className="sort-dropdown">
                <Button
                  className="sort-button"
                  variant="outline"
                  size="md"
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                >
                  {getSortLabel()}
                  <ChevronDown size={16} />
                </Button>
                {showSortDropdown && (
                  <div className="sort-options">
                    <button onClick={() => handleSortChange('created_at')}>
                      Newest First
                    </button>
                    <button onClick={() => handleSortChange('name')}>
                      Name (A-Z)
                    </button>
                    <button onClick={() => handleSortChange('price', 'asc')}>
                      Price: Low to High
                    </button>
                    <button onClick={() => handleSortChange('price', 'desc')}>
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
          {showLoader ? (
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
                    <Button
                      variant="outline"
                      size="md"
                      onClick={() => {
                        setCurrentPage(prev => Math.max(1, prev - 1));
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      disabled={currentPage === 1}
                      className="pagination-button"
                    >
                      Previous
                    </Button>
                  
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
                            onClick={() => {
                              setCurrentPage(page);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
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

                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => {
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                          setCurrentPage(prev => Math.min(totalPages, prev + 1));
                    }}
                    disabled={currentPage === totalPages}
                    className="pagination-button"
                  >
                    Next
                  </Button>
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
            <WhyChooseUs />
        </main>
      </div>
    </div>
    </>
  );
}
