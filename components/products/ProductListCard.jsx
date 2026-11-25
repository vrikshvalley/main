'use client';

import Link from 'next/link';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { addItem } from '@/lib/slices/cartSlice';
import { createPortal } from 'react-dom';
import ProductPage from '@/components/products/ProductPage';
import { priceWithOffer } from '@/lib/offers';
import { defaultOptions } from '@/lib/cartItems';
import { getReviewSummary } from '@/lib/reviews';
import { parseCareDetails } from '@/lib/productCare';
import { motion, AnimatePresence } from 'framer-motion';

const getImageSrc = (img) => {
  if (!img) return '';
  return typeof img === 'string' ? img : (img.src || img.url || '');
};

// Real pricing only: a strikethrough price is shown solely when the product
// record carries an actual MRP / compare-at price above the selling price.
// (Previously a random 10-60% "discount" and a random review count were
// generated from the product ID, which is misleading to customers.)
const getReferencePrice = (product, currentPrice) => {
  const ref = Number(product?.mrp ?? product?.compareAtPrice ?? product?.originalPrice);
  return Number.isFinite(ref) && ref > currentPrice ? ref : null;
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
    
    const options = defaultOptions(product);
    const chosenVariant = options.variant && Array.isArray(product.variants)
      ? product.variants.find((v) => v && (v.label || v.name) === options.variant)
      : null;
    const basePrice = Number(chosenVariant?.price ?? product.price ?? 0);
    const { price: productPrice, regularPrice, offer } = priceWithOffer(product, basePrice);

    dispatch(addItem({
      id: product.id,
      slug: product.slug || null,
      name: product.name,
      price: productPrice,
      regularPrice: offer ? regularPrice : null,
      offerBadge: offer ? offer.badge : null,
      image: getImageSrc(product.images?.[0]),
      qty: 1,
      quantity: 1,
      ...options,
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
  const petText = String(product.petFriendly || '');
  const isPetFriendly = isPlantProduct && (product.petFriendly === true || (/pet[- ]?friendly|yes/i.test(petText) && !/not/i.test(petText)) || tags.includes('pet-friendly') || tags.includes('pet friendly'));
  // Low light only when the product's own care data says so
  const sunlight = parseCareDetails(product.additionalDetails).find((r) => r.key === 'light')?.value || product.light || '';
  const isLowLight = isPlantProduct && (/low/i.test(sunlight) || tags.includes('low-light') || tags.includes('low light'));

  const { price: offerPrice, regularPrice, offer } = priceWithOffer(product);
  const reviewSummary = getReviewSummary(product.slug);

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
        
        {offer && product.stock > 0 ? (
          <div className="featured-badge offer-ribbon">{offer.badge}</div>
        ) : (
          product.featured && product.stock > 0 && <div className="featured-badge">Featured</div>
        )}

        {product.new_arrivals && product.stock > 0 && (
          <div className="new-arrivals-badge">New Arrival</div>
        )}

        {/* Care tags (CSS glow, no per-card JS animation) */}
        {(isPetFriendly || isLowLight) && (
          <div className="card-care-tags">
            {isPetFriendly && <span className="card-care-tag card-care-tag--pet">🐾 Pet friendly</span>}
            {isLowLight && <span className="card-care-tag card-care-tag--low">🌑 Low light</span>}
          </div>
        )}

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

        {reviewSummary && (
          <div className="product-rating" aria-label={`Rated ${reviewSummary.average} out of 5 from ${reviewSummary.count} reviews`}>
            <div className="stars">{renderStars(reviewSummary.average)}</div>
            <span className="rating-text">
              {reviewSummary.average.toFixed(1)} ({reviewSummary.count})
            </span>
          </div>
        )}

        <div className="product-footer">
          <div className="product-price">
            {product.priceOnCustomization ? (
              <span className="price-label">Price on Customization</span>
            ) : (
              <>
                {(() => {
                  // Strikethrough = real regular price when an offer applies,
                  // otherwise a catalogue MRP if the product record has one.
                  const mrp = getReferencePrice(product, regularPrice);
                  const strike = offer ? regularPrice : mrp;
                  const pct = strike ? Math.round((1 - offerPrice / strike) * 100) : 0;

                  return (
                    <div className="price-container">
                      <div className="price-row">
                        <span className="current-price">₹{offerPrice}</span>
                        {strike && strike > offerPrice && <span className="original-price">₹{strike}</span>}
                        {pct > 0 && <span className="discount-badge">{pct}% OFF</span>}
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
            <ProductPage product={product} variant="quickview" />
          </div>
        </div>
      </div>,
      document.body
    )}
    </>
  );
}
