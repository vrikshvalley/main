'use client';

import { useState, useEffect, useLayoutEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion, useScroll, useTransform } from 'framer-motion';
import Breadcrumbs from '@/components/general/Breadcrumbs';
import { getProducts } from '@/lib/productHelpers';
import { ChevronDown, X, Grid, List, Search } from 'lucide-react';
import TheLoader from '@/components/general/TheLoader';
import ProductListCard from '@/components/products/ProductListCard';
import WhyChooseUs from "@/components/products/WhyChooseUs";
import '@/styles/products.scss';

export default function SubcategoryPage() {
  const params = useParams();
  const subcategory = params.subcategory?.replace(/-/g, ' ') || '';
  
  // Framer Motion scroll hook for parallax effect
  const { scrollY } = useScroll();
  const headerY = useTransform(scrollY, [0, 500], [0, 150]);
  
  // Debug parallax
  useEffect(() => {
    const unsubscribe = headerY.on('change', (latest) => {
      console.log('Subcategory Page - headerY:', latest);
    });
    return () => unsubscribe();
  }, [headerY]);
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const productsPerPage = 12;

  useEffect(() => {
    fetchProducts();
  }, [subcategory, sortBy, sortOrder, currentPage, searchQuery]);

  // Scroll to top on page change
  useLayoutEffect(() => {
    if (currentPage > 1) {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, [currentPage]);

  const fetchProducts = async () => {
    setLoading(true);
    const result = await getProducts({
      subcategory: subcategory,
      sortBy,
      sortOrder,
      page: currentPage,
      limit: productsPerPage,
      searchQuery: searchQuery.trim() || null,
    });

    setProducts(result.products);
    setTotalPages(result.totalPages);
    setTotalProducts(result.total);
    setLoading(false);
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
        <Breadcrumbs items={[
          { label: 'Products', href: '/products' },
          { label: subcategory.charAt(0).toUpperCase() + subcategory.slice(1) }
        ]} />

        {/* Page Header */}
        <div 
          className="products-header"
          style={{
            backgroundImage: 'url(/ProductsDesktop.png)',
          }}
        >
          <style jsx>{`
            @media (max-width: 768px) {
              .products-header {
                background-image: url(/ProductsMobile.png);
              }
            }
          `}</style>
          <motion.div 
            className="header-content"
            style={{ y: headerY }}
          >
            <h1>{subcategory.charAt(0).toUpperCase() + subcategory.slice(1)}</h1>
            <p>Explore our collection of {subcategory} plants and products</p>
          </motion.div>
        </div>

        <div className="main-products-container">
          {/* Main Content */}
          <main className="products-main" style={{ maxWidth: '100%', margin: '0 auto' }}>
            {/* Toolbar */}
            <div className="products-toolbar">
              <div className="toolbar-left">
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
                    <button
                      type="button"
                      className="clear-search"
                      onClick={() => {
                        setSearchQuery('');
                        setCurrentPage(1);
                      }}
                      aria-label="Clear search"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
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
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                          setCurrentPage(prev => Math.min(totalPages, prev + 1));
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
                <a href="/products" className="clear-filters-button">
                  Browse All Products
                </a>
              </div>
            )}
            <WhyChooseUs />
          </main>
        </div>
      </div>
    </>
  );
}
