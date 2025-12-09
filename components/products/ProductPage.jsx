'use client';

import { useState } from 'react';
import Image from 'next/image';
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

export default function ProductPage({ product }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user } = useAuth();
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState(product?.sizes?.[0] || null);
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0] || null);
  const [selectedVariant, setSelectedVariant] = useState(product?.variants?.[0] || null);
  const [quantity, setQuantity] = useState(1);

  // Get current price based on selected variant
  const currentPrice = selectedVariant ? selectedVariant.price : product?.price || 0;

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
      quantity: quantity,
      color: selectedColor,
      size: selectedSize,
      variant: selectedVariant?.name || null,
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
      quantity: quantity,
      color: selectedColor,
      size: selectedSize,
      variant: selectedVariant?.name || null,
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
                    <Image src={src} alt={`Thumbnail ${index}`} width={100} height={100} />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>

        {/* Right: Product Details */}
        <div className="product-details">
          <div className="category-badge">{product.category}</div>
          <h1>{product.name}</h1>
          <p className="description">{product.description}</p>
          
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
              {selectedVariant && (
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
              <label>Size:</label>
              <div className="options">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    className={selectedSize === size ? 'active' : ''}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color selection */}
          {product.colors && product.colors.length > 0 && (
            <div className="option-group">
              <label>Color:</label>
              <div className="options">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    className={selectedColor === color ? 'active' : ''}
                    onClick={() => setSelectedColor(color)}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Variant selection (for products with price variants) */}
          {product.variants && product.variants.length > 0 && (
            <div className="option-group">
              <label>Select Variant:</label>
              <div className="options">
                {product.variants.map((variant) => (
                  <button
                    key={variant.name}
                    className={selectedVariant?.name === variant.name ? 'active' : ''}
                    onClick={() => setSelectedVariant(variant)}
                  >
                    {variant.label} - ₹{variant.price}
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
              <a 
                href="https://wa.me/919204745612?text=Hi, I'm interested in customizing this product"
                className="contact-customize"
                target="_blank"
                rel="noopener noreferrer"
              >
                Contact for Customization
              </a>
            ) : (
              <>
                <button 
                  className="add-to-cart" 
                  onClick={handleAddToCart}
                  disabled={(product.stock || product.quantity) === 0}
                >
                  Add to Cart
                </button>
                <button 
                  className="buy-now"
                  onClick={handleBuyNow}
                  disabled={(product.stock || product.quantity) === 0}
                >
                  Buy Now
                </button>
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
