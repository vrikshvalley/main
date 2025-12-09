'use client';

import { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import ProductListCard from '@/components/products/ProductListCard';
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
          slidesPerView={1}
          spaceBetween={12}
          navigation
          autoplay={{
            delay: 3500,
            disableOnInteraction: false,
          }}
          breakpoints={{
            320: {
              slidesPerView: 1,
              spaceBetween: 10,
            },
            640: {
              slidesPerView: 2,
              spaceBetween: 12,
            },
            900: {
              slidesPerView: 3,
              spaceBetween: 16,
            },
            1200: {
              slidesPerView: 4,
              spaceBetween: 20,
            },
          }}
          className="related-products-swiper"
        >
          {relatedProducts.map((product) => (
            <SwiperSlide key={product.id}>
              <ProductListCard product={product} viewMode="grid" />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
