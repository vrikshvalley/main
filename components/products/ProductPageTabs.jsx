'use client';

import { useState } from 'react';
import Image from 'next/image';
import '@/styles/productPageTabs.scss';

export default function ProductPageTabs({ product }) {
  const [activeTab, setActiveTab] = useState('additional-info');

  if (!product) return null;

  return (
    <div className="product-page-tabs">
      {/* Tab Navigation */}
      <div className="tabs-navigation">
        <button
          className={`tab-button ${activeTab === 'additional-info' ? 'active' : ''}`}
          onClick={() => setActiveTab('additional-info')}
        >
          Additional Info
        </button>
        <button
          className={`tab-button ${activeTab === 'reviews' ? 'active' : ''}`}
          onClick={() => setActiveTab('reviews')}
        >
          Reviews ({product.reviews_count || 0})
        </button>
        <button
          className={`tab-button ${activeTab === 'gallery' ? 'active' : ''}`}
          onClick={() => setActiveTab('gallery')}
        >
          Product Gallery
        </button>
      </div>

      {/* Tab Content */}
      <div className="tabs-content">
        {/* Additional Info Tab */}
        {activeTab === 'additional-info' && (
          <div className="tab-panel additional-info-panel">
            <h3>Product Details</h3>
            {product.long_description && (
              <div className="description-section">
                <p>{product.long_description}</p>
              </div>
            )}

            {product.additional_info && (
              <div className="info-grid">
                {Object.entries(product.additional_info).map(([key, value]) => (
                  <div key={key} className="info-item">
                    <span className="info-label">
                      {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}:
                    </span>
                    <span className="info-value">
                      {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="tab-panel reviews-panel">
            <div className="reviews-header">
              <h3>Customer Reviews</h3>
              <div className="rating-summary">
                <div className="average-rating">
                  <span className="rating-number">{product.rating || 0}</span>
                  <div className="stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={star <= Math.round(product.rating || 0) ? 'star filled' : 'star'}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="review-count">Based on {product.reviews_count || 0} reviews</span>
                </div>
              </div>
            </div>

            {/* Reviews List Placeholder */}
            <div className="reviews-list">
              <div className="no-reviews">
                <p>Reviews are currently disabled. Enable Supabase to see customer reviews!</p>
              </div>
            </div>

            {/* Review Form Placeholder */}
            <div className="review-form">
              <h4>Write a Review</h4>
              <p className="form-note">Sign in to leave a review for this product.</p>
            </div>
          </div>
        )}

        {/* Product Gallery Tab */}
        {activeTab === 'gallery' && (
          <div className="tab-panel gallery-panel">
            <h3>Product Images</h3>
            <div className="gallery-grid">
              {product.images && product.images.length > 0 ? (
                product.images.map((image, index) => (
                  <div key={index} className="gallery-item">
                    <Image
                      src={image}
                      alt={`${product.name} - Image ${index + 1}`}
                      width={400}
                      height={400}
                      className="gallery-image"
                    />
                  </div>
                ))
              ) : (
                <div className="no-images">
                  <span className="placeholder-icon">🌿</span>
                  <p>No images available</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
