'use client';

import Link from 'next/link';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addItem } from '@/lib/slices/cartSlice';

export default function ProductListCard({ product, viewMode = 'grid' }) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const dispatch = useDispatch();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    dispatch(addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
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
      <div className="product-image-wrapper">
        {product.images && product.images[0] ? (
          <img src={product.images[0]} alt={product.name} className="product-image" />
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
            ₹{product.price}
          </div>

          {product.stock > 0 ? (
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
