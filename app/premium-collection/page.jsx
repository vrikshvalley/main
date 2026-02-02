'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import ProductListCard from '@/components/products/ProductListCard';
import { getProducts } from '@/lib/services/productService';
import AnimatedText from '@/components/general/AnimatedText';
import '@/styles/premiumCollection.scss';

export default function PremiumCollectionPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const { data: premiumProducts } = await getProducts({
          priceRange: { min: 500 },
          sortBy: 'price-desc',
          pageSize: 60
        });
        setProducts(premiumProducts || []);
      } catch (error) {
        console.error('Error fetching premium products:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  return (
    <div className="premium-collection-page">
      <motion.div
        className="premium-hero"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="hero-content">
          <p className="cursive-subtitle">Luxury Greens</p>
          <AnimatedText
            as="h1"
            text="Premium Collection"
            className="hero-title"
            delay={0.1}
            stagger={0.05}
          />
          <AnimatedText
            as="p"
            text="A curated selection of premium plants and planters above ₹500"
            className="hero-subtitle"
            delay={0.2}
            stagger={0.02}
          />
        </div>
      </motion.div>

      <div className="premium-container">
        {loading ? (
          <div className="loading">Loading premium products...</div>
        ) : products.length > 0 ? (
          <div className="premium-grid">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                className="premium-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <ProductListCard product={product} viewMode="grid" />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="no-results">No premium products available</div>
        )}
      </div>
    </div>
  );
}
