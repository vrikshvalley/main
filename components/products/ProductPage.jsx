'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Thumbs, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';
import 'swiper/css/autoplay';
import AddToCartButton from '@/components/cart/AddToCartButton';
import '@/styles/productPage.scss';

export default function ProductPage() {
  const { id } = useParams();

  // Mock product (replace with API fetch)
  const product = {
    id,
    name: 'Aloe Vera Plant',
    price: 499,
    images: [
      '/plants/plant1.jpg',
      '/plants/plant2.jpg',
      '/plants/plant3.jpg',
    ],
    category: {
      options: {
        size: ['Small', 'Medium', 'Large'],
        color: ['Green', 'Variegated'],
      },
    },
  };

  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState(product.category.options.size[0]);
  const [selectedColor, setSelectedColor] = useState(product.category.options.color[0]);

  return (
    <section className="product-page">
      {/* Left: Image Gallery */}
      <div className="product-gallery">
        <Swiper
          modules={[Navigation, Thumbs, Autoplay]}
          spaceBetween={10}
          navigation
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          thumbs={{ swiper: thumbsSwiper }}
          onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
          className="main-swiper"
        >
          {product.images.map((src, index) => (
            <SwiperSlide key={index}>
              <Image src={src} alt={product.name} width={500} height={500} />
            </SwiperSlide>
          ))}
        </Swiper>

        <Swiper
          modules={[Thumbs]}
          onSwiper={setThumbsSwiper}
          spaceBetween={10}
          slidesPerView={3}
          watchSlidesProgress
          className="thumbs-swiper"
        >
          {product.images.map((src, index) => (
            <SwiperSlide key={index}>
              <div className="thumb-wrapper">
                <Image src={src} alt={`Thumbnail ${index}`} width={100} height={100} />
                {activeIndex === index && <div className="overlay"></div>}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Right: Product Details */}
      <div className="product-details">
        <h1>{product.name}</h1>
        <p className="price">₹{product.price}</p>

        {/* Size selection */}
        {product.category.options.size && (
          <div className="option-group">
            <label>Size:</label>
            <div className="options">
              {product.category.options.size.map((size) => (
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
        {product.category.options.color && (
          <div className="option-group">
            <label>Color:</label>
            <div className="options">
              {product.category.options.color.map((color) => (
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

        {/* Buttons */}
        <div className="actions">
          <AddToCartButton product={product} />
          <button className="buy-now">Buy Now</button>
        </div>
      </div>
    </section>
  );
}
