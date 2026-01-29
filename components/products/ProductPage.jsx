'use client';

import { useEffect, useState } from 'react';
import Image from '@/components/general/ImgWithLoader';
import { useRouter } from 'next/navigation';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Thumbs, Autoplay } from 'swiper/modules';
import { useDispatch } from 'react-redux';
import { addItem } from '@/lib/slices/cartSlice';
import { showSuccessToast, showWarningToast } from '@/lib/toastHelpers';
import { useAuth } from '@/lib/AuthContext';
import WishlistButton from '@/components/general/WishlistButton';
import ProductPageTabs from '@/components/products/ProductPageTabs';
import LightGuide from '@/components/products/LightGuide';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';
import 'swiper/css/autoplay';
import '@/styles/productPage.scss';
import '@/styles/wishlistButton.scss';
import Button from '@/components/general/Button';

export default function ProductPage({ product }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user } = useAuth();
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState(product?.sizes?.[0] || null);
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0] || null);
  // Filter out "default" variants and set first non-default variant
  const filteredVariants =
    product?.variants?.filter(
      (v) => (v.label || v.name || "").toLowerCase() !== "default"
    ) || [];
  const [selectedVariant, setSelectedVariant] = useState(filteredVariants[0] || null);
  const [quantity, setQuantity] = useState(1);
  const [expandDescription, setExpandDescription] = useState(false);

  // Get current price based on selected variant or base price
  const currentPrice = selectedVariant ? selectedVariant.price : product?.price || 0;

  // Reset option selections when product changes
  useEffect(() => {
    setSelectedSize(product?.sizes?.[0] || null);
    setSelectedColor(product?.colors?.[0] || null);
    setSelectedVariant(filteredVariants[0] || null);
    setQuantity(1);
  }, [product?.id]);

  if (!product) {
    return (
      <div className="product-not-found">
        <h1>Product Not Found</h1>
        <p>The product you're looking for doesn't exist.</p>
        <a href="/products" className="back-to-products">Back to Products</a>
      </div>
    );
  }

  const handleAddToCart = () => {
    dispatch(addItem({
      id: product.id,
      name: product.name,
      price: currentPrice,
      image: product.images?.[0],
      qty: quantity,
      quantity: quantity,
      color: selectedColor,
      size: selectedSize,
      variant: selectedVariant?.label || selectedVariant?.name || null,
    }));
    showSuccessToast(`${product.name} added to cart! 🌿`);
  };

  const handleBuyNow = () => {
    // Add item to cart first
    dispatch(addItem({
      id: product.id,
      name: product.name,
      price: currentPrice,
      image: product.images?.[0],
      qty: quantity,
      quantity: quantity,
      color: selectedColor,
      size: selectedSize,
      variant: selectedVariant?.label || selectedVariant?.name || null,
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

  return (
    <>
      <section className="product-page">
        {/* Left: Image Gallery */}
        <div className="product-gallery">
          <WishlistButton product={product} />
          <Swiper
            modules={[Navigation, Thumbs, Autoplay]}
            spaceBetween={10}
            navigation
            autoplay={{ delay: 3000, disableOnInteraction: false }}
            thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
            onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
            className="main-swiper"
          >
            {product.images?.map((src, index) => (
              <SwiperSlide key={index}>
                <Image src={src} alt={product.name} width={600} height={600} priority={index === 0} />
              </SwiperSlide>
            ))}
          </Swiper>

          {product.images?.length > 1 && (
            <Swiper
              modules={[Thumbs]}
              onSwiper={setThumbsSwiper}
              spaceBetween={10}
              slidesPerView={4}
              breakpoints={{
                320: {
                  slidesPerView: 3,
                  spaceBetween: 8,
                },
                480: {
                  slidesPerView: 4,
                  spaceBetween: 10,
                },
              }}
              watchSlidesProgress
              className="thumbs-swiper"
            >
              {product.images.map((src, index) => (
                <SwiperSlide key={index}>
                  <div className={`thumb-wrapper ${activeIndex === index ? 'active' : ''}`}>
                    <Image 
                      src={src || '/1.png'} 
                      alt={`Thumbnail ${index}`} 
                      width={100} 
                      height={100}
                      onError={(e) => {
                        e.target.src = '/1.png';
                      }}
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>

        {/* Right: Product Details */}
        <div className="product-details">
          <div className="product-badges">
            <div className="category-badge">{product.category}</div>
            {product.new_arrivals && (
              <div className="new-arrival-badge">New Arrival</div>
            )}
          </div>
          <h1>{product.name}</h1>
          
          {/* Description with Read More on Mobile */}
          <div className="description-wrapper">
            <p className={`description ${expandDescription ? 'expanded' : 'collapsed'}`}>
              {product.description}
            </p>
            {product.description && product.description.length > 120 && (
              <button 
                className="read-more-btn"
                onClick={() => setExpandDescription(!expandDescription)}
              >
                {expandDescription ? 'Read Less' : 'Read More'}
              </button>
            )}
          </div>
          
          {/* Price Display - Handle custom pricing */}
          {product.priceOnCustomization ? (
            <div className="price-custom">
              <p className="price-label">Price on Customization</p>
              <p className="price-description">
                This product requires customization. Contact us for a personalized quote.
              </p>
            </div>
          ) : (
            <div className="price-section">
              <p className="price">₹{currentPrice}</p>
              {selectedVariant && selectedVariant.label && !/option/i.test(selectedVariant.label) && (
                <p className="variant-label">({selectedVariant.label})</p>
              )}
            </div>
          )}

          {/* Stock Info */}
          <div className={`stock-info ${(product.stock || product.quantity) > 0 ? 'in-stock' : 'out-of-stock'}`}>
            {(product.stock || product.quantity) > 0 ? (
              <>
                <span className="stock-badge">In Stock</span>
                {(product.stock || product.quantity) < 10 && (
                  <span className="low-stock">Only {product.stock || product.quantity} left!</span>
                )}
              </>
            ) : (
              <span className="stock-badge">Out of Stock</span>
            )}
          </div>

          {/* Size selection */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="option-group">
              <label>Select Size:</label>
              <div className="size-options-grid">
                {product.sizes.map((size) => (
                  <label key={size} className="size-option-label">
                    <input
                      type="radio"
                      name="size"
                      value={size}
                      checked={selectedSize === size}
                      onChange={() => setSelectedSize(size)}
                      style={{ display: 'none' }}
                    />
                    <span className={`size-option-btn ${selectedSize === size ? 'active' : ''}`}>
                      {size}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Color selection */}
          {product.colors && product.colors.length > 0 && (
            <div className="option-group">
              <label>Select Color:</label>
              <div className="color-options-grid">
                {product.colors.map((color) => {
                  // Convert color name to hex or use as-is if it's already a hex code
                  const colorMap = {
                    'Red': '#EF4444',
                    'Blue': '#3B82F6',
                    'Green': '#10B981',
                    'Black': '#1F2937',
                    'White': '#F5F5F5',
                    'Yellow': '#FBBF24',
                    'Purple': '#8B5CF6',
                    'Pink': '#EC4899',
                    'Orange': '#F97316',
                    'Brown': '#92400E',
                    'Gray': '#9CA3AF',
                    'Navy': '#000080',
                    'Teal': '#14B8A6',
                    'Beige': '#F5F5DC',
                    'Cream': '#FFFDD0',
                    'Olive': '#6B7280',
                  };
                  const colorValue = colorMap[color] || color.toLowerCase().replace(/\\s+/g, '');

                  // determine readable text color for swatch (simple luminance check for hex)
                  let textColor = '#fff';
                  try {
                    if (typeof colorValue === 'string' && colorValue.startsWith('#')) {
                      const hex = colorValue.replace('#', '');
                      const r = parseInt(hex.substring(0, 2), 16);
                      const g = parseInt(hex.substring(2, 4), 16);
                      const b = parseInt(hex.substring(4, 6), 16);
                      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
                      textColor = luminance > 0.75 ? '#333' : '#fff';
                    } else if (colorValue === 'white' || colorValue === '#F5F5F5' || colorValue === '#FFFDD0' || colorValue === 'beige' || colorValue === 'cream') {
                      textColor = '#333';
                    }
                  } catch (e) {
                    textColor = '#fff';
                  }

                  return (
                    <label key={color} className="color-option-label">
                      <input
                        type="radio"
                        name="color"
                        value={color}
                        checked={selectedColor === color}
                        onChange={() => setSelectedColor(color)}
                        style={{ display: 'none' }}
                      />
                      <span
                        className={`color-swatch ${selectedColor === color ? 'active' : ''}`}
                        style={{
                          backgroundColor: colorValue,
                          color: textColor,
                          border: colorValue === '#F5F5F5' || colorValue === '#FFFDD0' ? '2px solid #ccc' : undefined
                        }}
                        title={color}
                      >
                        <span className="color-swatch-label">{color}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Variant selection (for products with price variants) - including all variants */}
          {filteredVariants && filteredVariants.length > 0 && (
            <div className="option-group">
              <label>Select Variant:</label>
              <div className="options variant-options">
                {filteredVariants.map((variant) => (
                  <button
                    key={variant.id || variant.name || variant.label}
                    className={`option-btn ${
                      selectedVariant?.id
                        ? selectedVariant.id === variant.id
                        : (selectedVariant?.name || selectedVariant?.label) ===
                          (variant.name || variant.label)
                    ? 'active'
                    : ''}`}
                    onClick={() => setSelectedVariant(variant)}
                  >
                    {(() => {
                      const displayLabel = (variant.label || variant.name || '').trim();
                      const showLabel = displayLabel && !/option/i.test(displayLabel);
                      return showLabel ? `${displayLabel} - ₹${variant.price}` : `₹${variant.price}`;
                    })()}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="option-group">
            <label>Quantity:</label>
            <div className="quantity-controls">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
              <input type="number" value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} />
              <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}>+</button>
            </div>
          </div>

          {/* Buttons */}
          <div className="actions">
            {product.priceOnCustomization ? (
              <>
                <a 
                  href={`https://wa.me/919204745612?text=${encodeURIComponent(
                    `Hi, I'm interested in customizing this product:\n\nProduct: ${product.name || ''}\nLink: ${typeof window !== 'undefined' ? window.location.href : ''}`
                  )}`}
                  className="contact-customize"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Contact for Customization
                </a>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => {
                    const orderText = `Hi, I'd like to place an order:\n\nProduct: ${product.name || ''}\nQuantity: ${quantity}\nLink: ${typeof window !== 'undefined' ? window.location.href : ''}`;
                    window.open(`https://wa.me/919204745612?text=${encodeURIComponent(orderText)}`, '_blank', 'noopener noreferrer');
                  }}
                >
                  Show Order on WhatsApp
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={(product.stock || product.quantity) === 0}
                >
                  Add to Cart
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={handleBuyNow}
                  disabled={(product.stock || product.quantity) === 0}
                >
                  Buy Now
                </Button>
              </>
            )}
          </div>

          {/* Product Meta */}
          {(product.maintenanceLevel || product.petFriendly || product.care_level || product.light || product.water || product.stock_status) && (
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
              {product.care_level && (
                <div className="meta-item">
                  <strong>Care Level:</strong> {product.care_level}
                </div>
              )}
              {product.light && (
                <div className="meta-item">
                  <strong>Light:</strong> {product.light}
                </div>
              )}
              {product.water && (
                <div className="meta-item">
                  <strong>Water:</strong> {product.water}
                </div>
              )}
              {product.stock_status && (
                <div className="meta-item">
                  <strong>Status:</strong> {product.stock_status.replace('_', ' ').toUpperCase()}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Light Guide - Only for plant category products */}
      {product.category?.toLowerCase() === 'plants' && <LightGuide />}

      {/* Product Page Tabs - Additional Info, Reviews, Gallery */}
      <ProductPageTabs product={product} />
    </>
  );
}
