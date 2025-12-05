'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Topbar from '@/components/general/Topbar';
import Navbar from '@/components/general/Navbar';
import Footer from '@/components/general/Footer';
import WhatsAppButton from '@/components/general/WhatsAppButton';
import Breadcrumbs from '@/components/general/Breadcrumbs';
import ProductCard from '@/components/products/ProductCard';
import TheLoader from '@/components/general/TheLoader';
import { searchProducts } from '@/lib/searchService';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import '@/styles/products.scss';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';

  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    priceRange: null,
    inStock: false,
  });
  const [showFilters, setShowFilters] = useState(false);

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

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
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
        <div className="products-header" style={{ minHeight: '200px' }}>
          <div className="header-content">
            <Search size={48} />
            <h1>Search Results</h1>
            <p>
              {searchResults.length > 0 
                ? `Found ${searchResults.length} ${searchResults.length === 1 ? 'result' : 'results'} for "${query}"`
                : `No results found for "${query}"`
              }
            </p>
          </div>
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

            <div className="filter-section">
              <h4>Category</h4>
              <select 
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="">All Categories</option>
                <option value="Plants">Plants</option>
                <option value="Seeds">Seeds</option>
                <option value="Planters">Planters</option>
                <option value="Decor">Decor</option>
                <option value="Accessories">Accessories</option>
              </select>
            </div>

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

            <button 
              className="clear-filters"
              onClick={() => setFilters({ category: '', priceRange: null, inStock: false })}
            >
              Clear All Filters
            </button>
          </aside>

          {/* Results Grid */}
          <div className="products-grid-container">
            <div className="products-controls">
              <div className="results-info">
                <p>{searchResults.length} {searchResults.length === 1 ? 'Product' : 'Products'}</p>
              </div>
              
              <button 
                className="toggle-filters-btn"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal size={18} />
                Filters
              </button>
            </div>

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
              </div>
            ) : (
              <div className="products-grid">
                {searchResults.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
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
