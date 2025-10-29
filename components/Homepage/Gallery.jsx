'use client';

import { motion } from 'framer-motion';
import { Camera } from 'lucide-react';
import Image from 'next/image';
import '@/styles/gallery.scss';

export default function Gallery() {
  const galleryImages = [
    { id: 1, src: '/hero1.jpg', alt: 'Indoor Plants Collection' },
    { id: 2, src: '/hero2.jpg', alt: 'Outdoor Garden Setup' },
    { id: 3, src: '/hero3.jpg', alt: 'Plant Care Workshop' },
    { id: 4, src: '/indoor.jpg', alt: 'Snake Plant Display' },
    { id: 5, src: '/outdoor.jpg', alt: 'Garden Landscape' },
    { id: 6, src: '/flowering.jpg', alt: 'Flowering Plants' },
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
          <h2 className="section-title">Our Gallery</h2>
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
