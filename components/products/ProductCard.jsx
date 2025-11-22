'use client';
import React from 'react'
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

import AddToCartButton from '@/components/cart/AddToCartButton';
import WishlistButton from '@/components/general/WishlistButton';
import { sampleProducts } from '@/lib/sampleProducts';
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
  // Get featured products
  // const products = sampleProducts.filter(p => p.featured).slice(0, 4);
  const products = sampleProducts.slice(0, 4);
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
              <p className="price">₹{(product.price / 100).toFixed(2)}</p>
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
