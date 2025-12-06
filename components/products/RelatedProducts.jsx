'use client';

import { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import ProductCard from '@/components/products/ProductCard';
import { getRelatedProducts } from '@/lib/productHelpers';
import 'swiper/css';
import 'swiper/css/navigation';
import '@/styles/relatedProducts.scss';

export default function RelatedProducts({ category, currentProductId }) {
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (category && currentProductId) {
      fetchRelatedProducts();
    }
  }, [category, currentProductId]);

  const fetchRelatedProducts = async () => {
    setLoading(true);
    try {
      const products = await getRelatedProducts(category, currentProductId, 8);
      setRelatedProducts(products);
    } catch (error) {
      console.error('Error fetching related products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || relatedProducts.length === 0) {
    return null;
  }

  return (
    <section className="related-products-section">
      <div className="related-products-container">
        <h2 className="section-title">Related Products</h2>
        <p className="section-subtitle">You might also like these</p>

        <Swiper
          modules={[Navigation, Autoplay]}
          spaceBetween={20}
          slidesPerView={1}
          navigation
          autoplay={{
            delay: 3500,
            disableOnInteraction: false,
          }}
          breakpoints={{
            480: {
              slidesPerView: 2,
              spaceBetween: 15,
            },
            768: {
              slidesPerView: 3,
              spaceBetween: 20,
            },
            1024: {
              slidesPerView: 4,
              spaceBetween: 25,
            },
          }}
          className="related-products-swiper"
        >
          {relatedProducts.map((product) => (
            <SwiperSlide key={product.id}>
              <ProductCard product={product} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
