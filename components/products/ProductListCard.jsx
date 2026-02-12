'use client';

import Link from 'next/link';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { addItem } from '@/lib/slices/cartSlice';
import { createPortal } from 'react-dom';
import ProductPage from '@/components/products/ProductPage';
import { motion, AnimatePresence } from 'framer-motion';

const getImageSrc = (img) => {
  if (!img) return '';
  return typeof img === 'string' ? img : (img.src || img.url || '');
};

// Generate a consistent random discount between 10-60% based on product ID
const getProductDiscount = (productId) => {
  if (!productId) return 0;
  // Use product ID to seed the random number for consistency
  const hash = productId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const discountOptions = [10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60];
  return discountOptions[hash % discountOptions.length];
};

const calculateOriginalPrice = (currentPrice, discountPercent) => {
  return Math.round(currentPrice / (1 - discountPercent / 100));
};

// Generate a consistent random review count between 15-250 based on product ID
const getProductReviewCount = (productId) => {
  if (!productId) return 15;
  const hash = productId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  // Generate review count between 15-250
  return 15 + (hash % 236);
};

export default function ProductListCard({ product, viewMode = 'grid' }) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dispatch = useDispatch();

  const primaryImage = getImageSrc(product.images?.[0]);
  const secondaryImage = product.images?.[1] ? getImageSrc(product.images[1]) : primaryImage;

  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (isModalOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isModalOpen]);

  useEffect(() => {
    if (!isModalOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const productPrice = typeof product.price === 'number' ? product.price : (product.variants?.[0]?.price || 0);
    
    dispatch(addItem({
      id: product.id,
      name: product.name,
      price: productPrice,
      image: getImageSrc(product.images?.[0]),
      qty: 1,
      quantity: 1,
    }));
  };

  const toggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} size={14} fill="currentColor" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<Star key={i} size={14} fill="currentColor" className="half-star" />);
      } else {
        stars.push(<Star key={i} size={14} />);
      }
    }
    return stars;
  };

  // Tag Logic
  // Determine if this product is a plant (by category, tags or explicit type)
  const categoryStr = (product.category || '').toString().toLowerCase();
  const tags = (product.tags || []).map(t => (typeof t === 'string' ? t.toLowerCase() : ''));
  const isPlantProduct = categoryStr.includes('plant') || tags.includes('plant') || (product.type || '').toString().toLowerCase() === 'plant' || (product.productType || '').toString().toLowerCase() === 'plant';

  // Tag Logic - only apply these badges for plant products
  const isPetFriendly = isPlantProduct && (product.petFriendly === 'Yes' || product.petFriendly === true || product.petFriendly === 'true' || tags.includes('pet-friendly') || tags.includes('pet friendly'));
  // Mock Low Light based on ID if not present (for demo) but only for plants
  const isLowLight = isPlantProduct && (product.light === 'Low' || product.light === 'low' || tags.includes('low-light') || tags.includes('low light') || (!product.light && (product.id || '').charCodeAt(0) % 3 === 0));

  return (
    <>
    <Link
      href={`/products/${product.slug}`}
      className={`product-list-card ${viewMode}`}
      onClick={(e) => {
        e.preventDefault();
        setIsModalOpen(true);
      }}
    >
      <motion.div 
        className="product-image-wrapper"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        whileHover={{ scale: 1.05, rotate: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        style={{ overflow: 'hidden', transformOrigin: 'center center' }} // Ensure overflow hidden for zoom
      >
        {primaryImage ? (
           <>
            <motion.img 
              src={primaryImage} 
              alt={product.name} 
              className="product-image"
              style={{ position: 'relative', zIndex: 1 }}
              transition={{ duration: 0.3 }}
            />
            {/* Secondary Image Cross-fade */}
            {secondaryImage && secondaryImage !== primaryImage && (
              <motion.img
                 src={secondaryImage}
                 alt={`${product.name} view 2`}
                 className="product-image"
                 style={{ 
                   position: 'absolute', 
                   top: 0, 
                   left: 0, 
                   zIndex: 2,
                   opacity: 0
                 }}
                 animate={{ opacity: isHovering ? 1 : 0 }}
                 transition={{ duration: 0.4 }}
              />
            )}
           </>
        ) : (
          <div className="product-image-placeholder">
            <span>🌿</span>
          </div>
        )}
        
        {product.stock === 0 && (
          <div className="out-of-stock-badge">Out of Stock</div>
        )}
        
        {product.featured && product.stock > 0 && (
          <div className="featured-badge">Featured</div>
        )}

        {product.new_arrivals && product.stock > 0 && (
          <div className="new-arrivals-badge">New Arrival</div>
        )}

        {/* Dynamic Glowing Tags */}
        <div style={{ position: 'absolute', bottom: '10px', left: '10px', zIndex: 5, display: 'flex', gap: '5px', flexDirection: 'column', alignItems: 'flex-start' }}>
            {isPetFriendly && (
              <motion.div 
                animate={{ boxShadow: ["0 0 0px rgba(28, 158, 91, 0)", "0 0 10px rgba(28, 158, 91, 0.6)", "0 0 0px rgba(28, 158, 91, 0)"] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ 
                    background: 'rgba(28, 158, 91, 0.9)', color: 'white', 
                    padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem',
                    backdropFilter: 'blur(4px)', fontWeight: '500'
                }}
              >
               🐾 Pet Friendly
              </motion.div>
            )}
             {isLowLight && (
              <motion.div 
                animate={{ boxShadow: ["0 0 0px rgba(13, 110, 253, 0)", "0 0 10px rgba(13, 110, 253, 0.6)", "0 0 0px rgba(13, 110, 253, 0)"] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                style={{ 
                    background: 'rgba(13, 110, 253, 0.9)', color: 'white', 
                    padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem',
                    backdropFilter: 'blur(4px)', fontWeight: '500'
                }}
              >
               🌑 Low Light
              </motion.div>
            )}
        </div>

        <button 
          className={`wishlist-button ${isWishlisted ? 'active' : ''}`}
          onClick={toggleWishlist}
          title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
        </button>
      </motion.div>

      <div className="product-info">
        <div className="product-category">{product.category}</div>
        <h3 className="product-name">{product.name}</h3>
        <p className="product-description">{product.description}</p>

        <div className="product-rating">
          <div className="stars">{renderStars(product.rating || 4.5)}</div>
          <span className="rating-text">
            {(product.rating || 4.5).toFixed(1)} ({getProductReviewCount(product.id)})
          </span>
        </div>

        <div className="product-footer">
          <div className="product-price">
            {product.priceOnCustomization ? (
              <span className="price-label">Price on Customization</span>
            ) : (
              <>
                {(() => {
                  const currentPrice = typeof product.price === 'number' ? product.price : (product.variants?.[0]?.price || 0);
                  const discount = getProductDiscount(product.id);
                  const originalPrice = calculateOriginalPrice(currentPrice, discount);
                  
                  return (
                    <div className="price-container">
                      <div className="price-row">
                        <span className="current-price">₹{currentPrice}</span>
                        <span className="original-price">₹{originalPrice}</span>
                        <span className="discount-badge">{discount}% OFF</span>
                      </div>
                      {product.variants && product.variants.length > 1 && <span className="price-suffix">onwards</span>}
                    </div>
                  );
                })()}
              </>
            )}
          </div>

          {product.priceOnCustomization ? (
            <button
              className="contact-customize-button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const url = `https://wa.me/919204745612?text=${encodeURIComponent(
                  `Hi, I'm interested in customizing this product -- ${product.name || ''}`
                )}`;
                window.open(url, '_blank', 'noopener');
              }}
              aria-label={`Contact to customize ${product.name || ''}`}
            >
              Contact for Customization
            </button>
          ) : product.stock > 0 ? (
            <button 
              className="add-to-cart-button"
              onClick={handleAddToCart}
              title="Add to cart"
            >
              <ShoppingCart size={18} />
              {viewMode === 'list' && <span>Add to Cart</span>}
            </button>
          ) : (
            <button className="add-to-cart-button disabled" disabled>
              Out of Stock
            </button>
          )}
        </div>

        {viewMode === 'list' && (
          <div className="product-meta">
            {product.maintenanceLevel && (
              <div className="meta-item">
                <strong>Maintenance:</strong> {product.maintenanceLevel}
              </div>
            )}
            {product.petFriendly && (
              <div className="meta-item">
                <strong>Pet-Friendly:</strong> {product.petFriendly}
              </div>
            )}
            {product.size && (
              <div className="meta-item">
                <strong>Size:</strong> {product.size}
              </div>
            )}
            {product.color && (
              <div className="meta-item">
                <strong>Color:</strong> {product.color}
              </div>
            )}
            {product.colors && product.colors.length > 0 && (
              <div className="meta-item">
                <strong>Colors:</strong> {product.colors.join(', ')}
              </div>
            )}
            {product.sizes && product.sizes.length > 0 && (
              <div className="meta-item">
                <strong>Sizes:</strong> {product.sizes.join(', ')}
              </div>
            )}
            {product.stock > 0 && product.stock < 10 && (
              <div className="meta-item stock-warning">
                Only {product.stock} left in stock!
              </div>
            )}
          </div>
        )}
      </div>
    </Link>

    {isModalOpen && typeof document !== 'undefined' && createPortal(
      <div className="product-modal-overlay" onClick={() => setIsModalOpen(false)}>
        <div className="product-modal" onClick={(e) => e.stopPropagation()}>
          <button
            className="product-modal-close"
            onClick={() => setIsModalOpen(false)}
            aria-label="Close product details"
          >
            ✕
          </button>
          <div className="product-modal-content">
            <div className="product-modal-header">
              <Link href={`/products/${product.slug}`} className="product-modal-link">
                Open full page
              </Link>
            </div>
            <ProductPage product={product} />
          </div>
        </div>
      </div>,
      document.body
    )}
    </>
  );
}
