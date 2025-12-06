'use client';

import { motion } from 'framer-motion';
import { Camera } from 'lucide-react';
import Image from 'next/image';
import '@/styles/gallery.scss';

export default function Gallery() {
  const galleryImages = [
    { id: 1, src: '/heroSlider/Untitled-1.png', alt: 'Premium Plant Collection' },
    { id: 2, src: '/heroSlider/Untitled-2.png', alt: 'Indoor Green Paradise' },
    { id: 3, src: '/heroSlider/Untitled-3.png', alt: 'Outdoor Garden Dreams' },
    { id: 4, src: '/heroSlider/Untitled-4.png', alt: 'Nature\'s Beauty' },
    { id: 5, src: '/heroSlider/Untitled-5.png', alt: 'Green Living' },
    { id: 6, src: '/loginSlider/Untitled-1.png', alt: 'Premium Plants - Handpicked for your space' },
    { id: 7, src: '/loginSlider/Untitled-2.png', alt: 'Indoor Paradise - Bring nature inside' },
    { id: 8, src: '/loginSlider/Untitled-3.png', alt: 'Garden Dreams - Create your own oasis' },
    { id: 9, src: '/loginSlider/Untitled-4.png', alt: 'Green Living - Embrace sustainability' },
    { id: 10, src: '/loginSlider/Untitled-5.png', alt: 'Plant Paradise - Your green journey starts here' },
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
