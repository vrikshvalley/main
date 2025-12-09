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
            
            {/* Know About the Product */}
            {product.knowAboutProduct && (
              <div className="info-section">
                <h4>About This Product</h4>
                <p>{product.knowAboutProduct}</p>
              </div>
            )}

            {/* What's In The Box */}
            {product.whatsInTheBox && (
              <div className="info-section">
                <h4>What's In The Box?</h4>
                <p>{product.whatsInTheBox}</p>
              </div>
            )}

            {/* Additional Details */}
            {product.additionalDetails && (
              <div className="info-section">
                <h4>Care Instructions</h4>
                <p className="care-details">{product.additionalDetails}</p>
              </div>
            )}
            
            <div className="info-grid">
              {product.category && (
                <div className="info-item">
                  <span className="info-label">Category:</span>
                  <span className="info-value">{product.category}</span>
                </div>
              )}
              {product.subcategories && product.subcategories.length > 0 && product.subcategories[0] !== '-' && (
                <div className="info-item">
                  <span className="info-label">Type:</span>
                  <span className="info-value">{product.subcategories.join(', ')}</span>
                </div>
              )}
              {product.size && (
                <div className="info-item">
                  <span className="info-label">Size:</span>
                  <span className="info-value">{product.size}</span>
                </div>
              )}
              {product.color && (
                <div className="info-item">
                  <span className="info-label">Color:</span>
                  <span className="info-value">{product.color}</span>
                </div>
              )}
              {product.maintenanceLevel && (
                <div className="info-item">
                  <span className="info-label">Maintenance Level:</span>
                  <span className="info-value">{product.maintenanceLevel}</span>
                </div>
              )}
              {product.petFriendly && (
                <div className="info-item">
                  <span className="info-label">Pet-Friendly:</span>
                  <span className="info-value">{product.petFriendly}</span>
                </div>
              )}
              {product.care_level && (
                <div className="info-item">
                  <span className="info-label">Care Level:</span>
                  <span className="info-value">{product.care_level}</span>
                </div>
              )}
              {product.light && (
                <div className="info-item">
                  <span className="info-label">Light Requirements:</span>
                  <span className="info-value">{product.light}</span>
                </div>
              )}
              {product.water && (
                <div className="info-item">
                  <span className="info-label">Watering:</span>
                  <span className="info-value">{product.water}</span>
                </div>
              )}
              {product.stock !== undefined && (
                <div className="info-item">
                  <span className="info-label">Stock:</span>
                  <span className="info-value">{product.stock > 0 ? `${product.stock} available` : 'Out of Stock'}</span>
                </div>
              )}
              {product.stock_status && (
                <div className="info-item">
                  <span className="info-label">Availability:</span>
                  <span className="info-value">{product.stock_status.replace('_', ' ').toUpperCase()}</span>
                </div>
              )}
            </div>

            {product.searchTags && product.searchTags.length > 0 && (
              <div className="tags-section">
                <h4>Tags</h4>
                <div className="tags-list">
                  {product.searchTags.map((tag, index) => (
                    <span key={index} className="tag">{tag}</span>
                  ))}
                </div>
              </div>
            )}

            {product.tags && product.tags.length > 0 && product.tags[0] !== '-' && (
              <div className="tags-section">
                <h4>Product Tags</h4>
                <div className="tags-list">
                  {product.tags.map((tag, index) => (
                    <span key={index} className="tag">{tag}</span>
                  ))}
                </div>
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
                <p>Reviews are currently disabled. Customer reviews will be available soon!</p>
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
