'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, useScroll, useTransform } from 'framer-motion';
import Topbar from '@/components/general/Topbar';
import Navbar from '@/components/general/Navbar';
import Footer from '@/components/general/Footer';
import WhatsAppButton from '@/components/general/WhatsAppButton';
import Breadcrumbs from '@/components/general/Breadcrumbs';
import { setStickyHeaderData } from '@/lib/stickyHeaderStore';
import ProductListCard from '@/components/products/ProductListCard';
import TheLoader from '@/components/general/TheLoader';
import { searchProducts } from '@/lib/searchService';
import { getCategories } from '@/lib/services/productService';
import { Search, X, Grid, List } from 'lucide-react';
import '@/styles/products.scss';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Framer Motion scroll hook for parallax effect
  const { scrollY } = useScroll();
  const headerY = useTransform(scrollY, [0, 500], [0, 150]);
  
  // Debug parallax
  useEffect(() => {
    const unsubscribe = headerY.on('change', (latest) => {
      console.log('Search Page - headerY:', latest);
    });
    return () => unsubscribe();
  }, [headerY]);
  const query = searchParams.get('q') || '';

  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [filters, setFilters] = useState({
    category: '',
    inStock: false,
  });
  const [showFilters, setShowFilters] = useState(false);

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

  // Fetch search results
  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      
      try {
        const results = await searchProducts(query, filters);
        setSearchResults(results);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    };

    if (query) {
      fetchResults();
    } else {
      setLoading(false);
    }
  }, [query, filters]);

  // Update sticky header based on search results
  useEffect(() => {
    const title = searchResults.length === 0 ? "No Results Found" : "Search Results";
    const subtitle = searchResults.length === 0 
      ? `for "${query}"` 
      : `${searchResults.length} result${searchResults.length !== 1 ? 's' : ''}`;
    
    setStickyHeaderData({ title, subtitle });
    return () => setStickyHeaderData({ title: null, subtitle: null });
  }, [searchResults, query]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleClearFilters = () => {
    setFilters({ category: '', inStock: false });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.category) count++;
    if (filters.inStock) count++;
    return count;
  };

  if (loading) {
    return <TheLoader />;
  }

  return (
    <>
      <Topbar />
      <Navbar />
      
      <div className="products-page">
        <Breadcrumbs 
          items={[
            { label: 'Home', href: '/' },
            { label: 'Search', href: '/search' },
            { label: query }
          ]} 
        />

        {/* Search Header */}
        <div
          className={`products-header search-header ${searchResults.length === 0 ? 'no-results-header' : ''}`}
          style={{
            minHeight: '250px',
            '--search-hero-desktop': `url(${"/SearchDesktop.png"})`,
            '--search-hero-mobile': `url(${"/SearchMobile.png"})`
          }}
        >
          <motion.div 
            className="header-content"
            style={{ y: headerY }}
          >
            <div className="search-icon-large">
              <Search size={56} strokeWidth={1.5} />
            </div>
            {searchResults.length === 0 ? (
              <>
                <h1 style={{ color: 'white' }}>No Results Found</h1>
                <p style={{ color: 'white' }}>
                  No results found for "{query}"
                </p>
              </>
            ) : (
              <>
                <h1>Search Results</h1>
                <p>
                  Found {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'} for "{query}"
                </p>
              </>
            )}
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
                  {filters.category && (
                    <span className="filter-tag">
                      {categories.find(c => c.slug === filters.category)?.name || filters.category}
                      <X size={14} onClick={() => handleFilterChange('category', '')} />
                    </span>
                  )}
                  {filters.inStock && (
                    <span className="filter-tag">
                      In Stock Only
                      <X size={14} onClick={() => handleFilterChange('inStock', false)} />
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
                      checked={filters.category === cat.slug}
                      onChange={() => handleFilterChange('category', filters.category === cat.slug ? '' : cat.slug)}
                    />
                    <span className="category-icon">{cat.icon}</span>
                    <span className="category-name">{cat.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Availability Filter */}
            <div className="filter-section">
              <h4>Availability</h4>
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={filters.inStock}
                  onChange={(e) => handleFilterChange('inStock', e.target.checked)}
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
                  <img src="/hamMenu.png" alt="Filters" width={18} height={18} />
                  Filters {getActiveFiltersCount() > 0 && `(${getActiveFiltersCount()})`}
                </button>
                <p className="results-count">
                  Showing <strong>{searchResults.length}</strong> result{searchResults.length !== 1 ? 's' : ''} for "{query}"
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
              </div>
            </div>

            {/* Products Grid/List */}
            {searchResults.length === 0 ? (
              <div className="no-results">
                <Search size={64} />
                <h2>No products found</h2>
                <p>Try searching with different keywords or browse our categories</p>
                <button 
                  className="browse-btn"
                  onClick={() => router.push('/products')}
                >
                  Browse All Products
                </button>
                <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(0, 128, 128, 0.05)', borderRadius: '12px', border: '1px solid rgba(0, 128, 128, 0.2)' }}>
                  <p style={{ fontStyle: 'italic', marginBottom: '1rem', color: 'white' }}>
                    Can't find it in our Garden? Contact our Farmers, and they will curate the plant for you. No Extra Charges!!!
                  </p>
                  <a 
                    href="https://wa.me/919204745612?text=Hi,%20I%20can't%20find%20a%20specific%20plant.%20Can%20you%20help%20me%20find%20it?" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ display: 'inline-block', padding: '0.75rem 1.5rem', background: '#25D366', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: '600' }}
                  >
                    Contact on WhatsApp
                  </a>
                </div>
              </div>
            ) : (
              <div className={`products-grid ${viewMode}`}>
                {searchResults.map(product => (
                  <ProductListCard key={product.id} product={product} viewMode={viewMode} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      <Footer />
      <WhatsAppButton />
    </>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<TheLoader />}>
      <SearchContent />
    </Suspense>
  );
}
