'use client';
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion';

import ProductListCard from '@/components/products/ProductListCard';
import { getProducts } from '@/lib/services/productService';
import "@/styles/products.scss";

const cardVariants = {
  hidden: { 
    opacity: 0, 
    y: 50,
    scale: 0.8
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10,
      mass: 0.5
    }
  }
};

function ProductCard({ sortBy }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const sort = sortBy || 'featured';

  useEffect(() => {
    async function fetchProducts() {
      try {
        // Simplified query to avoid needing complex Firestore index
        const { data: allProducts } = await getProducts({ 
          sortBy: sort,
          pageSize: 4,
          inStock: false
        });
        // Get first 4 products for featured section
        setProducts(allProducts || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="product-card skeleton">
            <div className="product-image skeleton-img">
              <div className="skeleton-wishlist"></div>
            </div>
            <div className="skeleton-text title"></div>
            <div className="skeleton-text price"></div>
            <div className="skeleton-buttons">
              <div className="skeleton-button"></div>
              <div className="skeleton-button"></div>
            </div>
          </div>
        ))}
      </>
    );
  }
  return (
      <>
        {products.map((product) => (
          <motion.div 
            key={product.id}
            variants={cardVariants}
            className="product-card-wrapper"
          >
            <ProductListCard product={product} viewMode="grid" />
          </motion.div>
        ))}
      </>
  )
}

export default ProductCard
