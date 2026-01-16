'use client';

import Link from 'next/link';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { addItem } from '@/lib/slices/cartSlice';

const getImageSrc = (img) => {
  if (!img) return '';
  return typeof img === 'string' ? img : (img.src || img.url || '');
};

export default function ProductListCard({ product, viewMode = 'grid' }) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const intervalRef = useRef(null);
  const dispatch = useDispatch();

  // Auto-rotate images on hover
  useEffect(() => {
    if (isHovering && product.images && product.images.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      setCurrentImageIndex(0);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isHovering, product.images]);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const productPrice = typeof product.price === 'number' ? product.price : (product.variants?.[0]?.price || 0);
    
    dispatch(addItem({
      id: product.id,
      name: product.name,
      price: productPrice,
      image: getImageSrc(product.images?.[0]),
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

  return (
    <Link href={`/products/${product.slug}`} className={`product-list-card ${viewMode}`}>
      <div 
        className="product-image-wrapper"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {product.images && product.images[0] ? (
          <img 
            src={getImageSrc(product.images[currentImageIndex]) || getImageSrc(product.images[0])} 
            alt={product.name} 
            className="product-image" 
          />
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

        <button 
          className={`wishlist-button ${isWishlisted ? 'active' : ''}`}
          onClick={toggleWishlist}
          title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="product-info">
        <div className="product-category">{product.category}</div>
        <h3 className="product-name">{product.name}</h3>
        <p className="product-description">{product.description}</p>

        <div className="product-rating">
          <div className="stars">{renderStars(product.rating || 0)}</div>
          <span className="rating-text">
            {product.rating?.toFixed(1)} ({product.reviews_count || 0})
          </span>
        </div>

        <div className="product-footer">
          <div className="product-price">
            {product.priceOnCustomization ? (
              <span className="price-label">Price on Customization</span>
            ) : (
              <>
                ₹{typeof product.price === 'number' ? product.price : (product.variants?.[0]?.price || 0)}
                {product.variants && product.variants.length > 1 && <span className="price-suffix"> onwards</span>}
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
  );
}
