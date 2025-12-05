'use client';
import React, { useState, useEffect } from 'react'
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

import AddToCartButton from '@/components/cart/AddToCartButton';
import WishlistButton from '@/components/general/WishlistButton';
import { getProducts } from '@/lib/services/productService';
import "@/styles/featuredProductCard.scss";
import "@/styles/wishlistButton.scss";

const cardVariants = {
  hidden: { 
    opacity: 0, 
    y: 40,
    scale: 0.95
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

function ProductCard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        // Simplified query to avoid needing complex Firestore index
        const { data: allProducts } = await getProducts({ 
          sortBy: 'newest',
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
            className="product-card" 
            key={product.id}
            variants={cardVariants}
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
              <p className="price">₹{product.price}</p>
            </Link>
            <div className="product-actions">
              <AddToCartButton product={product} />
              <button className="buy-now-btn" disabled>
                Buy Now
                {/* <span className="coming-soon-badge">Coming Soon</span> */}
              </button>
            </div>
          </motion.div>
        ))}
      </>
  )
}

export default ProductCard
