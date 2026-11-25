'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Droplets, Leaf, TreeDeciduous } from 'lucide-react';
import { Counter } from '@/components/Homepage/ImpactCounter';
import Vine from '@/components/Homepage/Vine';
import { HERO_PLANTS, HERO_WHATSAPP_NUMBER } from '@/lib/heroPlants';
import '@/styles/heroSlider.scss';

/**
 * "Living Shelf" hero: a vine garland, a giant wordmark and a wooden shelf of
 * real, shoppable plants. All motion is CSS (compositor-only transforms), so
 * the hero adds no per-frame JavaScript.
 */

function PlantCard({ plant }) {
  const orderText = `Hi, I'd like to order the ${plant.name}: https://vrikshvalley.com/products/${plant.slug}`;
  return (
    <div className="plantCard" role="group" aria-label={`${plant.name} details`}>
      <strong>{plant.name}</strong>
      <ul>
        {plant.chips.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ul>
      <div className="plantCardActions">
        <Link href={`/products/${plant.slug}`} className="plantCardLink">
          View plant
        </Link>
        <a
          className="plantCardCta"
          href={`https://wa.me/${HERO_WHATSAPP_NUMBER}?text=${encodeURIComponent(orderText)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Order on WhatsApp
        </a>
      </div>
    </div>
  );
}

function Plant({ plant, index, open, setOpen, priority, sizes }) {
  const isOpen = open === plant.slug;

  // Touch screens have no hover: first tap opens the card, second tap follows the link.
  const handleClick = (e) => {
    if (window.matchMedia('(hover: none)').matches && !isOpen) {
      e.preventDefault();
      setOpen(plant.slug);
    }
  };

  return (
    <div
      className={`vvPlant vvPlant--${plant.placement} vvPlant--${plant.slug}${isOpen ? ' isOpen' : ''}`}
      style={{
        '--sway-delay': `${-index * 1.3}s`,
        '--sway-duration': `${6 + (index % 3)}s`,
        ...(plant.potBaseRatio ? { '--pot-base': plant.potBaseRatio, '--aspect': plant.height / plant.width } : {}),
      }}
      onMouseEnter={() => setOpen(plant.slug)}
      onMouseLeave={() => setOpen(null)}
      onFocus={() => setOpen(plant.slug)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOpen(null);
      }}
    >
      <div className="vvPlantSway">
        <Link href={`/products/${plant.slug}`} className="vvPlantLink" onClick={handleClick} aria-label={`${plant.name}, view plant`}>
          <Image
            src={plant.image}
            alt={plant.name}
            width={plant.width}
            height={plant.height}
            sizes={sizes}
            priority={priority}
            quality={85}
            className="vvPlantImg"
          />
        </Link>
      </div>
      <PlantCard plant={plant} />
    </div>
  );
}

export default function LivingShelfHero() {
  const [open, setOpen] = useState(null);

  const hanging = HERO_PLANTS.find((p) => p.placement === 'hanging');
  const edge = HERO_PLANTS.find((p) => p.placement === 'edge');
  const shelf = HERO_PLANTS.filter((p) => p.placement === 'shelf');

  return (
    <div className="heroContainer vvHero">
      <Vine name="garland" className="vvGarland" />

      {hanging && (
        <Plant plant={hanging} index={0} open={open} setOpen={setOpen} sizes="(max-width: 640px) 90px, 150px" />
      )}

      <div className="vvStage">
        <div className="vvIntro">
          <div className="vvFade" style={{ '--d': '0.05s' }}>
            <Link href="/where-nature-meets-nurture" className="badge badge-clickable">
              🌿 Where Nature Meets Nurture
            </Link>
          </div>
          <h1 className="heroTitle vvFade" style={{ '--d': '0.15s' }}>
            Plants that make a <span className="heroAccent">home breathe.</span>
          </h1>
        </div>

        <div className="vvScene">
          <div className="vvWordmark" aria-hidden="true">
            <span>VRIKSH</span>
            <span>VALLEY</span>
          </div>

          <div className="vvShelf">
            <div className="vvShelfPlants">
              {shelf.map((plant, i) => (
                <Plant
                  key={plant.slug}
                  plant={plant}
                  index={i + 2}
                  open={open}
                  setOpen={setOpen}
                  priority
                  sizes="(max-width: 640px) 25vw, 200px"
                />
              ))}
            </div>
            <div className="vvPlank" />
            {edge && (
              <Plant
                plant={edge}
                index={1}
                open={open}
                setOpen={setOpen}
                priority
                sizes="(max-width: 640px) 24vw, 210px"
              />
            )}
            <Vine name="shelfLeft" className="vvShelfVine vvShelfVine--left" />
            <Vine name="shelfRight" className="vvShelfVine vvShelfVine--right" />
          </div>
        </div>

        <div className="vvOutro">
          <p className="heroSubtitle vvFade" style={{ '--d': '0.3s' }}>
            Handpicked greens and artisanal planters, delivered with care. Hover a plant to meet it,
            then order over WhatsApp.
          </p>
          <div className="ctaButtons vvFade" style={{ '--d': '0.4s' }}>
            <Link href="/products" className="ctaButton breathe">Shop plants</Link>
            <Link href="/plant-doctor" className="ctaButtonSecondary">Find your plant</Link>
          </div>
          <aside className="vvImpact vvFade" style={{ '--d': '0.45s' }} id="impact" aria-label="Our impact">
            <p className="vvImpactTitle">Our impact</p>
            <ul>
              <li>
                <span className="vvImpactIcon"><Droplets size={20} aria-hidden="true" /></span>
                <span className="vvImpactValue"><Counter value={500} /><small>L</small></span>
                <span className="vvImpactLabel">water saved</span>
              </li>
              <li>
                <span className="vvImpactIcon"><Leaf size={20} aria-hidden="true" /></span>
                <span className="vvImpactValue"><Counter value={10} /><small>kg</small></span>
                <span className="vvImpactLabel">waste composted</span>
              </li>
              <li>
                <span className="vvImpactIcon"><TreeDeciduous size={20} aria-hidden="true" /></span>
                <span className="vvImpactValue"><Counter value={1000} /><small>+</small></span>
                <span className="vvImpactLabel">trees planted</span>
              </li>
            </ul>
          </aside>
          <div className="features vvFade" style={{ '--d': '0.5s' }}>
            <div className="feature">Healthy Plants</div>
            <div className="feature">Eco Packaging</div>
            <div className="feature">Expert Support</div>
          </div>
        </div>
      </div>

    </div>
  );
}
