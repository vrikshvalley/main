'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { X, Expand } from 'lucide-react';
import AnimatedText from '@/components/general/AnimatedText';
import '@/styles/gallery.scss';

const ROW_A = [
  { id: 1, src: '/heroSlider/(1).webp', alt: 'Premium plant collection' },
  { id: 2, src: '/heroSlider/(2).webp', alt: 'Indoor green paradise' },
  { id: 3, src: '/heroSlider/(3).webp', alt: 'Outdoor garden dreams' },
  { id: 4, src: '/heroSlider/(4).webp', alt: "Nature's beauty" },
  { id: 5, src: '/heroSlider/(5).webp', alt: 'Green living' },
];

const ROW_B = [
  { id: 6, src: '/loginSlider/(1).webp', alt: 'Handpicked plants for your space' },
  { id: 7, src: '/loginSlider/(2).webp', alt: 'Bringing nature inside' },
  { id: 8, src: '/loginSlider/(3).webp', alt: 'Creating your own oasis' },
  { id: 9, src: '/loginSlider/(5).webp', alt: 'Your green journey starts here' },
];

/**
 * Gallery as two slow, endless photo rows drifting in opposite directions.
 * Pure CSS transform animation (pauses on hover / focus); each photo opens in a
 * native <dialog> lightbox. With reduced motion it becomes a swipeable row.
 */
function Row({ images, reverse, onOpen }) {
  // Two copies make the loop seamless; the second copy is hidden from assistive tech.
  return (
    <div className={`vv-reel ${reverse ? 'is-reverse' : ''}`}>
      <ul className="vv-reel__track">
        {[...images, ...images].map((image, i) => {
          const clone = i >= images.length;
          return (
            <li key={`${image.id}-${i}`} className="vv-reel__item" aria-hidden={clone || undefined}>
              <button
                type="button"
                className="vv-reel__button"
                onClick={() => onOpen(image)}
                tabIndex={clone ? -1 : 0}
                aria-label={`View larger: ${image.alt}`}
              >
                <Image src={image.src} alt={clone ? '' : image.alt} fill quality={70} sizes="(max-width: 768px) 60vw, 340px" />
                <span className="vv-reel__caption">
                  <Expand size={14} aria-hidden="true" /> {image.alt}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function Gallery() {
  const dialogRef = useRef(null);
  const [active, setActive] = useState(null);

  const open = (image) => {
    setActive(image);
    dialogRef.current?.showModal();
  };
  const close = () => dialogRef.current?.close();

  return (
    <section className="vv-gallery">
      <header className="vv-gallery__header">
        <p className="cursive-subtitle">Moments in Green</p>
        <AnimatedText as="h2" text="Our Gallery" className="vv-gallery__title" delay={0.1} stagger={0.05} />
        <p className="vv-gallery__subtitle">A look around the nursery and the homes our plants have settled into.</p>
      </header>

      <div className="vv-gallery__reels">
        <Row images={ROW_A} onOpen={open} />
        <Row images={ROW_B} reverse onOpen={open} />
      </div>

      <dialog
        ref={dialogRef}
        className="vv-gallery__dialog"
        onClose={() => setActive(null)}
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
        aria-label={active ? active.alt : 'Gallery image'}
      >
        {active && (
          <figure className="vv-gallery__figure">
            <button type="button" className="vv-gallery__close" onClick={close} aria-label="Close">
              <X size={20} />
            </button>
            <div className="vv-gallery__full">
              <Image src={active.src} alt={active.alt} fill quality={85} sizes="(max-width: 768px) 100vw, 80vw" />
            </div>
            <figcaption>{active.alt}</figcaption>
          </figure>
        )}
      </dialog>
    </section>
  );
}
