'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Thumbs, Autoplay } from 'swiper/modules';
import { useDispatch } from 'react-redux';
import { addItem } from '@/lib/slices/cartSlice';
import { showSuccessToast, showWarningToast } from '@/lib/toastHelpers';
import ProductPageTabs from '@/components/products/ProductPageTabs';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';
import 'swiper/css/autoplay';
import '@/styles/productPage.scss';

export default function ProductPage({ product }) {
  const dispatch = useDispatch();
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState(product?.sizes?.[0] || null);
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0] || null);
  const [quantity, setQuantity] = useState(1);

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
      price: product.price,
      image: product.images?.[0],
      quantity: quantity,
      color: selectedColor,
      size: selectedSize,
    }));
    showSuccessToast(`${product.name} added to cart! 🌿`);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    showSuccessToast('Redirecting to checkout... 🛒');
    setTimeout(() => {
      window.location.href = '/cart';
    }, 500);
  };

  return (
    <>
      <section className="product-page">
        {/* Left: Image Gallery */}
        <div className="product-gallery">
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
          <p className="price">₹{(product.price / 100).toFixed(2)}</p>

          {/* Stock Info */}
          <div className={`stock-info ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
            {product.stock > 0 ? (
              <>
                <span className="stock-badge">In Stock</span>
                {product.stock < 10 && <span className="low-stock">Only {product.stock} left!</span>}
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
            <button 
              className="add-to-cart" 
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              Add to Cart
            </button>
            <button 
              className="buy-now"
              onClick={handleBuyNow}
              disabled={product.stock === 0}
            >
              Buy Now
            </button>
          </div>

          {/* Product Meta */}
          {product.additional_info && (
            <div className="product-meta">
              {product.additional_info.light && (
                <div className="meta-item">
                  <strong>Light:</strong> {product.additional_info.light}
                </div>
              )}
              {product.additional_info.water && (
                <div className="meta-item">
                  <strong>Water:</strong> {product.additional_info.water}
                </div>
              )}
              {product.additional_info.pet_friendly !== undefined && (
                <div className="meta-item">
                  <strong>Pet Friendly:</strong> {product.additional_info.pet_friendly ? 'Yes' : 'No'}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Product Page Tabs - Additional Info, Reviews, Gallery */}
      <ProductPageTabs product={product} />
    </>
  );
}
