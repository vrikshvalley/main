'use client';
import React from 'react'
import Link from 'next/link';
import { motion } from 'framer-motion';

import AddToCartButton from '@/components/cart/AddToCartButton';
import "@/styles/featuredProductCard.scss";

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

    const products = [
    { id: "p1", image:"/indoor.jpg", title: "Snake Plant", price: 499 },
    { id: "p2", image:"/outdoor.jpg", title: "Peace Lily", price: 699 },
    { id: "p3", image:"/flowering.jpg", title: "Areca Palm", price: 1199 },
    { id: "p4", image:"/herbs.jpg", title: "ZZ Plant", price: 899 },  
  ];
  return (
      <>
       {products.map((product) => (
          <motion.div 
            className="product-card" 
            key={product.id}
            variants={cardVariants}
          >
            <Link href={`/product/${product.slug}`}>
              <div className="product-image">
                <img 
                  src={product.image}
                  alt={product.title}
                  loading="lazy"
                />
              </div>
              <h3>{product.title}</h3>
              <p className="price">₹{product.price}</p>
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
      </>
  )
}

export default ProductCard
