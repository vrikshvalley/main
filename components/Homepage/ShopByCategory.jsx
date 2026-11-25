'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import Image from '@/components/general/ImgWithLoader';
import AnimatedText from '@/components/general/AnimatedText';
import { observeOnce } from '@/lib/inView';
import '@/styles/shopByCategory.scss';

// Top-level categories are replaced by subcategories for the "Shop By Category" display

const getImageForSubcategory = (name) => {
  const imageMap = {
    'Indoor Plants': '/subcategories/IndoorPlantsMobile.webp',
    'Succulents': '/subcategories/SucculentsMobile.webp',
    'Flowering Plants': '/subcategories/FloweringPlantsMobile.webp',
    'Foliage Plants': '/subcategories/FoliagePlantsMobile.webp',
    'Hanging Plants': '/subcategories/HangingPlantsMobile.webp',
    'Air Plants': '/subcategories/AirPlantsMobile.webp',
    'Cactus': '/subcategories/CactusMobile.webp',
    'Herbs': '/subcategories/MedicinalandHerbPlantsMobile.webp',
    'Vegetables': '/subcategories/VegetableSeedsMobile.webp',
    'Herbs & Microgreens': '/subcategories/MicrogreenandHerbsMobile.webp',
    'Bonsai': '/subcategories/BonsaiMobile.webp',
    'Aquatic Plants': '/subcategories/AquaticPlantsMobile.webp'
  };
  return imageMap[name] || '/subcategories/IndoorPlantsDesktop.webp';
};

const allSubcategories = [
  { name: 'Indoor Plants', tagline: 'Transform your space with lush greenery' },
  { name: 'Succulents', tagline: 'Low-maintenance beauty at its finest' },
  { name: 'Flowering Plants', tagline: 'Bloom your way to happiness' },
  { name: 'Foliage Plants', tagline: 'Bring layers of color indoors' },
  { name: 'Hanging Plants', tagline: 'Elevate your décor vertically' },
  { name: 'Air Plants', tagline: 'Nature\'s air-purifying wonders' },
  { name: 'Cactus', tagline: 'Desert elegance meets modern living' },
  { name: 'Herbs', tagline: 'Fresh herbs at your fingertips' },
  { name: 'Vegetables', tagline: 'Homegrown goodness starts here' },
  { name: 'Herbs & Microgreens', tagline: 'The best seeds online for health' },
  { name: 'Bonsai', tagline: 'Miniature trees, maximum beauty' },
  { name: 'Aquatic Plants', tagline: 'Create your underwater oasis' }
];

const slugify = (str) =>
  str
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');

export default function ShopByCategory() {
  const gridRef = useRef(null);
  useEffect(() => observeOnce(gridRef.current), []);

  return (
    <section className="shop-by-category">
      <div className="category-container">
        <div className="category-header">
          <AnimatedText text="Curated Collections" className="cursive-subtitle" />
          <AnimatedText as="h2" text="Shop by Category" className="category-title" delay={0.1} stagger={0.05} />
          <p className="category-description">Explore our hand-picked selections for every space.</p>
        </div>

        <div className="bento-grid" ref={gridRef}>
          {allSubcategories.map((cat, index) => (
            <Link
              key={cat.name}
              href={`/category/${slugify(cat.name)}`}
              className="bento-item"
              style={{ '--i': index }}
            >
              <Image
                src={getImageForSubcategory(cat.name)}
                alt=""
                fill
                showLoader={false}
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="bento-media"
                imgClassName="category-image"
                style={{ position: 'absolute', inset: 0, display: 'block' }}
              />
              <div className="bento-content">
                <h3>{cat.name}</h3>
                {cat.tagline && <p className="bento-tagline">{cat.tagline}</p>}
              </div>
              <span className="bento-arrow" aria-hidden="true">
                <ArrowUpRight size={18} />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
