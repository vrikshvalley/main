'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getProductBySlug } from '@/lib/productHelpers';
import TheLoader from '@/components/general/TheLoader';
import ProductPage from '@/components/products/ProductPage';
import RelatedProducts from '@/components/products/RelatedProducts';
import Ads from '@/components/general/Ads';

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  const fetchProduct = async () => {
    setLoading(true);
    const productData = await getProductBySlug(slug);
    setProduct(productData);
    setLoading(false);
  };

  if (loading) {
    return <TheLoader fullscreen />;
  }

  if (!product) {
    return (
      <div className="product-not-found">
        <h1>Product Not Found</h1>
        <p>The product you're looking for doesn't exist.</p>
        <a href="/products" className="back-to-products">Back to Products</a>
      </div>
    );
  }

  return (
    <div className="product-detail-container">
      <div className="product-page-wrapper">
        <ProductPage product={product} />
      </div>
      
      {/* Related Products Section */}
      <RelatedProducts category={product?.category} currentProductId={product?.id} />
      
      {/* Ads Section */}
      <div className="ads-banner">
        <Ads 
          items={['Bring nature home, one leaf at a time']}
          bgColor="dark"
          textColor="light"
          speed={15}
        />
      </div>
    </div>
  );
}
