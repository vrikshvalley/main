import React from 'react'
import Link from 'next/link';

import AddToCartButton from '@/components/cart/AddToCartButton';
import "@/styles/featuredProductCard.scss";

function ProductCard() {

    const products = [
    { id: "p1", image:"/indoor.jpg", title: "Snake Plant", price: 499 },
    { id: "p2", image:"/outdoor.jpg", title: "Peace Lily", price: 699 },
    { id: "p3", image:"/flowering.jpg", title: "Areca Palm", price: 1199 },
    { id: "p4", image:"/herbs.jpg", title: "ZZ Plant", price: 899 },  
  ];
  return (
      <>
       {products.map((product) => (
          <div className="product-card" key={product.id}>
            <Link href={`/product/${product.slug}`}>
              <div className="product-image">
                <img src={product.image}
                  alt={product.title}
                  width={280}
                  height={300}
                  loading="lazy"
                />
              </div>
              <h3>{product.title}</h3>
              <p className="price">₹{product.price}</p>
            </Link>
            <AddToCartButton product={product} />
          </div>
        ))}
      </>
  )
}

export default ProductCard
