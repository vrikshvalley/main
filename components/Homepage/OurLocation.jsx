'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Clock, ExternalLink } from 'lucide-react';
import '@/styles/ourLocation.scss';

export default function OurLocation() {
  const [isHovered, setIsHovered] = useState(false);

  const openMaps = () => {
    window.open('https://maps.app.goo.gl/qZk8sckjVWRJtr8Q8', '_blank', 'noopener,noreferrer');
  };

  return (
    <section className="our-location">
      <div className="location-container">
        <motion.div 
          className="section-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-title">
            <MapPin className="title-icon" />
            Our Store Location
          </h2>
          <p className="section-subtitle">
            Visit our beautiful nursery and explore nature's finest collection
          </p>
        </motion.div>

        <motion.div 
          className="store-card"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
          onClick={openMaps}
        >
          <div className="store-image-container">
            <img 
              src="/storefront.png" 
              alt="Vriksh Valley Store" 
              className="store-image"
            />
            <div className={`image-overlay ${isHovered ? 'visible' : ''}`}>
              <div className="overlay-content">
                <div className="detail-item">
                  <MapPin size={24} />
                  <div>
                    <h4>Address</h4>
                    <p>Vriksh Valley Garden<br />Ranchi<br />Jharkhand, India</p>
                  </div>
                </div>
                <div className="detail-item">
                  <Clock size={24} />
                  <div>
                    <h4>Opening Hours</h4>
                    <p>Mon - Sat: 9:00 AM - 7:00 PM<br />Sunday: 10:00 AM - 6:00 PM</p>
                  </div>
                </div>
                <div className="detail-item">
                  <Phone size={24} />
                  <div>
                    <h4>Contact</h4>
                    <p>+91 92047 45612<br />contact@vrikshvalley.com</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="store-info">
            <h3>Vriksh Valley Garden</h3>
            <p className="location-text">
              <MapPin size={18} />
              Dungra, Ranchi, Jharkhand
            </p>
            <div className="click-hint">
              <ExternalLink size={16} />
              <span>Click to view on Google Maps</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
