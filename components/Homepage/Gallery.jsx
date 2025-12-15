'use client';

import { motion } from 'framer-motion';
import { Camera } from 'lucide-react';
import Image from 'next/image';
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

  return (
    <section className="gallery">
      <div className="gallery-container">
        <motion.div 
          className="section-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <Camera className="header-icon" />
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
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ 
                duration: 0.4, 
                delay: index * 0.05,
                ease: "easeOut"
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
    </section>
  );
}
