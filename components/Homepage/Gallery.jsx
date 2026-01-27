'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from '@/components/general/ImgWithLoader';
import '@/styles/gallery.scss';

export default function Gallery() {
  const galleryImages = [
    { id: 1, src: '/heroSlider/(1).webp', alt: 'Premium Plant Collection' },
    { id: 2, src: '/heroSlider/(2).webp', alt: 'Indoor Green Paradise' },
    { id: 3, src: '/heroSlider/(3).webp', alt: 'Outdoor Garden Dreams' },
    { id: 4, src: '/heroSlider/(4).webp', alt: 'Nature\'s Beauty' },
    { id: 5, src: '/heroSlider/(5).webp', alt: 'Green Living' },
    { id: 6, src: '/loginSlider/(1).webp', alt: 'Premium Plants - Handpicked for your space' },
    { id: 7, src: '/loginSlider/(2).webp', alt: 'Indoor Paradise - Bring nature inside' },
    { id: 8, src: '/loginSlider/(3).webp', alt: 'Garden Dreams - Create your own oasis' },
    { id: 9, src: '/loginSlider/(4).webp', alt: 'Green Living - Embrace sustainability' },
    { id: 10, src: '/loginSlider/(5).webp', alt: 'Plant Paradise - Your green journey starts here' },
  ];

  const [activeImage, setActiveImage] = useState(null);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setActiveImage(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <motion.section 
      className="gallery"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="gallery-container">
        <motion.div 
          className="section-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2, margin: "0px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <h1 style={{ fontSize: "3rem", fontWeight: "700" }} className="section-title">Our Gallery</h1>
          <p className="section-subtitle">
            Explore the beauty of nature through our collection
          </p>
        </motion.div>

        <div className="gallery-grid">
          {galleryImages.map((image, index) => (
            <motion.div
              key={image.id}
              className="gallery-item"
              role="button"
              tabIndex={0}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2, margin: "0px" }}
              transition={{ 
                duration: 0.4, 
                delay: index * 0.05,
                ease: "easeOut"
              }}
              onClick={() => setActiveImage(image)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setActiveImage(image);
                }
              }}
            >
              <div className="image-wrapper">
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={600}
                  height={450}
                  className="gallery-image"
                  loading="lazy"
                  quality={85}
                  sizes="(max-width: 640px) 100vw, (max-width: 992px) 50vw, 33vw"
                />
                <div className="image-overlay">
                  <p>{image.alt}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {activeImage && (
          <motion.div
            className="gallery-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setActiveImage(null)}
          >
            <motion.div
              className="gallery-modal__content"
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="gallery-modal__close"
                aria-label="Close gallery modal"
                onClick={() => setActiveImage(null)}
              >
                ×
              </button>
              <div className="gallery-modal__image-wrapper">
                <Image
                  src={activeImage.src}
                  alt={activeImage.alt}
                  width={1200}
                  height={900}
                  className="gallery-modal__image"
                  loading="eager"
                  quality={90}
                  sizes="(max-width: 768px) 100vw, 80vw"
                />
              </div>
              <p className="gallery-modal__caption">{activeImage.alt}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
