'use client';
import Image from 'next/image';
import Link from 'next/link';
import "@/styles/categoryCircles.scss";

export default function CategoryCircles() {
  return (
    <section className="category-circles">
      <div className="circle-container">

        <Link href="/category/indoor-plants" className="circle-item">
          <div className="circle-image">
            <Image
              src="/indoor.jpg"
              alt="Indoor Plants"
              width={100}
              height={100}
              loading="lazy"
              style={{ borderRadius: '50%' }}
            />
          </div>
          <p>Indoor Plants</p>
        </Link>

        <Link href="/category/outdoor-plants" className="circle-item">
          <div className="circle-image">
            <Image
              src="/outdoor.jpg"
              alt="Outdoor Plants"
              width={100}
              height={100}
              loading="lazy"
              style={{ borderRadius: '50%' }}
            />
          </div>
          <p>Outdoor Plants</p>
        </Link>

        <Link href="/category/succulents" className="circle-item">
          <div className="circle-image">
            <Image
              src="/succulents.jpg"
              alt="Succulents"
              width={100}
              height={100}
              loading="lazy"
              style={{ borderRadius: '50%' }}
            />
          </div>
          <p>Succulents</p>
        </Link>

        <Link href="/category/flowering" className="circle-item">
          <div className="circle-image">
            <Image
              src="/flowering.jpg"
              alt="Flowering"
              width={100}
              height={100}
              loading="lazy"
              style={{ borderRadius: '50%' }}
            />
          </div>
          <p>Flowering</p>
        </Link>

        <Link href="/category/herbs" className="circle-item">
          <div className="circle-image">
            <Image
              src="/herbs.jpg"
              alt="Herbs"
              width={100}
              height={100}
              loading="lazy"
              style={{ borderRadius: '50%' }}
            />
          </div>
          <p>Herbs</p>
        </Link>

      </div>
    </section>
  );
}
