'use client';

import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import Topbar from '@/components/general/Topbar';
import Navbar from '@/components/general/Navbar';
import Footer from '@/components/general/Footer';
import WhatsAppButton from '@/components/general/WhatsAppButton';
import Breadcrumbs from '@/components/general/Breadcrumbs';
import { getProducts, getPriceRange } from '@/lib/productHelpers';
import { getCategories } from '@/lib/services/productService';
import { ChevronDown, X, SlidersHorizontal, Grid, List } from 'lucide-react';
import TheLoader from '@/components/general/TheLoader';
import ProductListCard from '@/components/products/ProductListCard';
import 'swiper/css';
import 'swiper/css/navigation';
import '@/styles/products.scss';

export default function CategoryPage() {
  const params = useParams();
  const categorySlug = params.category;
  const productsContainerRef = useRef(null);
  
  const [category, setCategory] = useState(null);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  
  // Fetch category data
  useEffect(() => {
    async function fetchCategory() {
      try {
        const { data: categories } = await getCategories();
        const foundCategory = categories.find(c => c.slug === categorySlug);
        setCategory(foundCategory);
      } catch (error) {
        console.error('Error fetching category:', error);
      }
    }
    fetchCategory();
  }, [categorySlug]);
  
  // Filter states
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
      const range = await getPriceRange(categorySlug);
      setMaxPossiblePrice(range.max);
      setPriceRange([range.min, range.max]);
    };
    fetchPriceRange();
  }, [categorySlug]);

  // Fetch products when filters change
  useEffect(() => {
    fetchProducts();
  }, [categorySlug, priceRange, inStockOnly, sortBy, sortOrder, currentPage]);

  // Scroll to top immediately on page change (before paint)
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  const fetchProducts = async () => {
    setLoading(true);
    const result = await getProducts({
      category: categorySlug,
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

  const handlePriceChange = (index, value) => {
    const newRange = [...priceRange];
    newRange[index] = parseInt(value);
    setPriceRange(newRange);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setPriceRange([0, maxPossiblePrice]);
    setInStockOnly(false);
    setSortBy('created_at');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
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

  if (!category) {
    return (
      <>
        <Topbar />
        <Navbar />
        <div className="category-not-found">
          <h1>Category Not Found</h1>
          <p>The category you're looking for doesn't exist.</p>
          <a href="/products" className="back-to-products">View All Products</a>
        </div>
        <Footer />
        <WhatsAppButton />
      </>
    );
  }

  return (
    <>
      <Topbar />
      <Navbar />
      <div className="products-page">
        <Breadcrumbs 
          items={[
            { label: 'Products', href: '/products' },
            { label: category.name }
          ]} 
        />
        
        {/* Category Header */}
        <div 
          className="products-header"
          style={{
            backgroundImage: category.imageUrl?.desktop 
              ? `url(${category.imageUrl.desktop})` 
              : 'none',
          }}
        >
          <style jsx>{`
            @media (max-width: 768px) {
              .products-header {
                background-image: ${category.imageUrl?.mobile 
                  ? `url(${category.imageUrl.mobile})` 
                  : 'none'} !important;
              }
            }
          `}</style>
          <div className="header-content">
            <div className="category-icon">{category.icon}</div>
            <h1>{category.name}</h1>
            <p>{category.description || `Browse our collection of ${category.name.toLowerCase()}`}</p>
            <p className="products-count">{category.productsCount || totalProducts} products available</p>
          </div>
        </div>

       

        <div className="main-products-container" ref={productsContainerRef}>
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
                      onClick={() => {
                        setCurrentPage(prev => Math.max(1, prev - 1));
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
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

                    <button
                      onClick={() => {
                        setCurrentPage(prev => Math.min(totalPages, prev + 1));
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
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
                <p>No products found in this category.</p>
                <button onClick={handleClearFilters} className="clear-filters-button">
                  Clear Filters
                </button>
              </div>
            )}
          </main>
        </div>
 {/* Subcategories Section */}
        {category.subcategories && category.subcategories.length > 0 && (
          <div className="subcategories-section">
            <h2>Shop by Type</h2>
            <Swiper
              modules={[Navigation, Autoplay]}
              spaceBetween={20}
              slidesPerView={'auto'}
              navigation
              autoplay={{
                delay: 3000,
                disableOnInteraction: false,
              }}
              breakpoints={{
                320: {
                  slidesPerView: 2,
                  spaceBetween: 15,
                },
                480: {
                  slidesPerView: 3,
                  spaceBetween: 15,
                },
                768: {
                  slidesPerView: 4,
                  spaceBetween: 20,
                },
                1024: {
                  slidesPerView: 5,
                  spaceBetween: 20,
                },
                1280: {
                  slidesPerView: 6,
                  spaceBetween: 25,
                },
              }}
              className="subcategories-slider"
            >
              {category.subcategories.map((subcat) => (
                <SwiperSlide key={subcat.slug}>
                  <Link 
                    href={`/category/${categorySlug}/${subcat.slug}`}
                    className="subcategory-card"
                  >
                    {(subcat.imageUrl?.desktop || subcat.imageUrl?.mobile) && (
                      <div className="subcat-image">
                        <picture>
                          {subcat.imageUrl?.mobile && (
                            <source media="(max-width: 768px)" srcSet={subcat.imageUrl.mobile} />
                          )}
                          <img 
                            src={subcat.imageUrl.desktop || subcat.imageUrl.mobile} 
                            alt={subcat.name}
                            width={200}
                            height={200}
                          />
                        </picture>
                      </div>
                    )}
                    <h3>{subcat.name}</h3>
                  </Link>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}

      </div>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
