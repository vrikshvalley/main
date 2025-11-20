'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { getProducts, getPriceRange } from '@/lib/productHelpers';
import { categories } from '@/lib/sampleProducts';
import AddToCartButton from '@/components/cart/AddToCartButton';
import WishlistButton from '@/components/general/WishlistButton';
import '@/styles/productPage.scss';
import '@/styles/featuredProductCard.scss';
import '@/styles/breadcrumbs.scss';

export default function CategoryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const categorySlug = params.category;

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [sortBy, setSortBy] = useState('default');
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;

  // Get category details
  const category = categories.find(cat => cat.slug === categorySlug);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await getProducts({ category: categorySlug });
        const productsList = data.products || [];
        setProducts(productsList);
        setFilteredProducts(productsList);

        // Get price range for this category
        const { min, max } = await getPriceRange(categorySlug);
        setPriceRange([min, max]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (categorySlug) {
      fetchProducts();
    }
  }, [categorySlug]);

  // Apply filters
  useEffect(() => {
    let result = [...products];

    // Price filter
    result = result.filter(
      product => product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    // Color filter
    if (selectedColors.length > 0) {
      result = result.filter(product =>
        product.color?.some(c => selectedColors.includes(c))
      );
    }

    // Size filter
    if (selectedSizes.length > 0) {
      result = result.filter(product =>
        product.size?.some(s => selectedSizes.includes(s))
      );
    }

    // Sorting
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name-az':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-za':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        break;
    }

    setFilteredProducts(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [products, priceRange, selectedColors, selectedSizes, sortBy]);

  // Pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Get unique colors and sizes from products
  const availableColors = [...new Set(products.flatMap(p => p.color || []))];
  const availableSizes = [...new Set(products.flatMap(p => p.size || []))];

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error loading products</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="error-container">
        <h2>Category not found</h2>
        <p>The category you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="category-page">
      <div className="category-header">
        <nav className="breadcrumbs">
          <ul className="breadcrumbs-list">
            <li className="breadcrumb-item">
              <Link href="/">Home</Link>
            </li>
            <li className="breadcrumb-item">
              <span className="separator">/</span>
            </li>
            <li className="breadcrumb-item">
              <span className="current">{category.name}</span>
            </li>
          </ul>
        </nav>
        <h1>{category.name}</h1>
        {category.description && <p className="category-description">{category.description}</p>}
      </div>

      <div className="product-page-container">
        {/* Filters Sidebar */}
        <aside className="filters-sidebar">
          <div className="filter-section">
            <h3>Price Range</h3>
            <div className="price-inputs">
              <input
                type="number"
                value={priceRange[0]}
                onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                min="0"
              />
              <span>to</span>
              <input
                type="number"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 10000])}
                min="0"
              />
            </div>
          </div>

          {availableColors.length > 0 && (
            <div className="filter-section">
              <h3>Colors</h3>
              <div className="filter-options">
                {availableColors.map(color => (
                  <label key={color} className="filter-option">
                    <input
                      type="checkbox"
                      checked={selectedColors.includes(color)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedColors([...selectedColors, color]);
                        } else {
                          setSelectedColors(selectedColors.filter(c => c !== color));
                        }
                      }}
                    />
                    <span>{color}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {availableSizes.length > 0 && (
            <div className="filter-section">
              <h3>Sizes</h3>
              <div className="filter-options">
                {availableSizes.map(size => (
                  <label key={size} className="filter-option">
                    <input
                      type="checkbox"
                      checked={selectedSizes.includes(size)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedSizes([...selectedSizes, size]);
                        } else {
                          setSelectedSizes(selectedSizes.filter(s => s !== size));
                        }
                      }}
                    />
                    <span>{size}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <button
            className="clear-filters-btn"
            onClick={() => {
              setPriceRange([0, 10000]);
              setSelectedColors([]);
              setSelectedSizes([]);
              setSortBy('default');
            }}
          >
            Clear All Filters
          </button>
        </aside>

        {/* Products Grid */}
        <div className="products-section">
          <div className="products-header">
            <div className="results-info">
              <p>
                Showing {indexOfFirstProduct + 1}-{Math.min(indexOfLastProduct, filteredProducts.length)} of{' '}
                {filteredProducts.length} products
              </p>
            </div>

            <div className="sort-dropdown">
              <label>Sort by:</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="default">Default</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name-az">Name: A-Z</option>
                <option value="name-za">Name: Z-A</option>
              </select>
            </div>
          </div>

          {currentProducts.length === 0 ? (
            <div className="no-products">
              <p>No products found matching your filters.</p>
            </div>
          ) : (
            <>
              <div className="products-grid">
                {currentProducts.map(product => (
                  <motion.div 
                    className="product-card" 
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Link href={`/products/${product.slug}`}>
                      <div className="product-image">
                        <WishlistButton product={product} />
                        <Image 
                          src={product.images?.[0] || '/placeholder.jpg'}
                          alt={product.name}
                          width={300}
                          height={300}
                          loading="lazy"
                        />
                      </div>
                      <h3>{product.name}</h3>
                      <p className="price">₹{(product.price / 100).toFixed(2)}</p>
                    </Link>
                    <div className="product-actions">
                      <AddToCartButton product={product} />
                      <button className="buy-now-btn" disabled>
                        Buy Now
                        <span className="coming-soon-badge">Coming Soon</span>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="pagination-btn"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>

                  <div className="pagination-numbers">
                    {[...Array(totalPages)].map((_, index) => (
                      <button
                        key={index + 1}
                        className={`pagination-number ${currentPage === index + 1 ? 'active' : ''}`}
                        onClick={() => handlePageChange(index + 1)}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>

                  <button
                    className="pagination-btn"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
