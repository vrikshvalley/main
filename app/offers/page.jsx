'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Tag, TrendingDown, Sparkles } from 'lucide-react';
import ProductListCard from '@/components/products/ProductListCard';
import { getProducts } from '@/lib/services/productService';
import '@/styles/offers.scss';

// Generate discount based on product ID (same logic as ProductListCard)
const getProductDiscount = (productId) => {
  if (!productId) return 0;
  const hash = productId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const discountOptions = [10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60];
  return discountOptions[hash % discountOptions.length];
};

export default function OffersPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, high (40%+), medium (20-39%), low (10-19%)

  useEffect(() => {
    async function fetchProducts() {
      try {
        const { data: allProducts } = await getProducts({ 
          sortBy: 'featured',
          pageSize: 100,
          inStock: false
        });
        setProducts(allProducts || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  // Filter products by discount percentage
  const filteredProducts = products.filter(product => {
    const discount = getProductDiscount(product.id);
    
    if (filter === 'high') return discount >= 40;
    if (filter === 'medium') return discount >= 20 && discount < 40;
    if (filter === 'low') return discount >= 10 && discount < 20;
    return true;
  }).sort((a, b) => {
    // Sort by discount percentage descending
    return getProductDiscount(b.id) - getProductDiscount(a.id);
  });

  return (
    <div className="offers-page">
      <motion.div 
        className="offers-hero"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="hero-content">
          <Sparkles className="hero-icon" size={48} />
          <h1>Exclusive Offers</h1>
          <p>Grab amazing deals on your favorite plants - up to 60% OFF!</p>
        </div>
      </motion.div>

      <div className="offers-container">
        <motion.div 
          className="offers-filters"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="filter-label">
            <Tag size={18} />
            <span>Filter by Discount:</span>
          </div>
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All Offers
            </button>
            <button 
              className={`filter-btn ${filter === 'high' ? 'active' : ''}`}
              onClick={() => setFilter('high')}
            >
              <TrendingDown size={16} />
              40% & Above
            </button>
            <button 
              className={`filter-btn ${filter === 'medium' ? 'active' : ''}`}
              onClick={() => setFilter('medium')}
            >
              20% - 39%
            </button>
            <button 
              className={`filter-btn ${filter === 'low' ? 'active' : ''}`}
              onClick={() => setFilter('low')}
            >
              10% - 19%
            </button>
          </div>
        </motion.div>

        <div className="offers-grid">
          {loading ? (
            [...Array(8)].map((_, i) => (
              <div key={i} className="product-skeleton">
                <div className="skeleton-image"></div>
                <div className="skeleton-text"></div>
                <div className="skeleton-text short"></div>
              </div>
            ))
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <ProductListCard product={product} viewMode="grid" />
              </motion.div>
            ))
          ) : (
            <div className="no-offers">
              <p>No offers available in this range</p>
              <button onClick={() => setFilter('all')}>View All Offers</button>
            </div>
          )}
        </div>

        {!loading && filteredProducts.length > 0 && (
          <motion.div 
            className="offers-footer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <p>Found {filteredProducts.length} amazing {filter !== 'all' ? filter : ''} offers just for you!</p>
            <Link href="/products" className="browse-all-btn">
              Browse All Products
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
