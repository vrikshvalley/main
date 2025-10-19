import React from 'react'
import Link from 'next/link';
import AddToCartButton from '@/components/cart/AddToCartButton';
import "@/styles/productCard.scss";

function ProductCard() {

    const products = [
    { id: "p1", title: "Snake Plant", price: 499 },
    { id: "p2", title: "Peace Lily", price: 699 },
    { id: "p3", title: "Areca Palm", price: 1199 },
    { id: "p4", title: "ZZ Plant", price: 899 },
  ];
  return (
      <>
       {products.map((product) => (
          <div className="product-card" key={product.id}>
            <Link href={`/product/${product.slug}`}>
              <div className="product-image">
                {/* Uncomment when images are ready */}
                {/* <Image
                  src={product.image}
                  alt={product.name}
                  width={200}
                  height={200}
                  loading="lazy"
                /> */}
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
