'use client';
import React, { useState, useEffect } from 'react'
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';

import AddToCartButton from '@/components/cart/AddToCartButton';
import WishlistButton from '@/components/general/WishlistButton';
import { addItem } from '@/lib/slices/cartSlice';
import { showSuccessToast } from '@/lib/toastHelpers';
import { useAuth } from '@/lib/AuthContext';
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

function ProductCard({ sortBy }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useAuth();
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

  const handleBuyNow = (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Ensure price is a number (for products with variants, use base price)
    const productPrice = typeof product.price === 'number' ? product.price : (product.variants?.[0]?.price || 0);
    
    // Add to cart
    dispatch(addItem({
      id: product.id,
      name: product.name,
      price: productPrice,
      image: product.images?.[0],
      quantity: 1,
    }));
    
    // Redirect based on auth status
    if (user) {
      showSuccessToast('Redirecting to checkout... 🛒');
      setTimeout(() => {
        router.push('/checkout');
      }, 500);
    } else {
      showSuccessToast('Please sign in to checkout 🔐');
      setTimeout(() => {
        router.push('/auth/signin?redirect=/checkout');
      }, 500);
    }
  };

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
              <p className="price">
                ₹{typeof product.price === 'number' ? product.price : (product.variants?.[0]?.price || 0)}
                {product.variants && product.variants.length > 1 && <span> onwards</span>}
              </p>
            </Link>
            <div className="product-actions">
              <AddToCartButton product={product} />
              <button 
                className="buy-now-btn" 
                onClick={(e) => handleBuyNow(product, e)}
              >
                Buy Now
              </button>
            </div>
          </motion.div>
        ))}
      </>
  )
}

export default ProductCard
