'use client';

import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import '@/styles/ourLocation.scss';

export default function OurLocation() {
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
            Visit Our Garden
          </h2>
          <p className="section-subtitle">
            Come experience nature's beauty at our location
          </p>
        </motion.div>

        <div className="location-content">
          <motion.div 
            className="map-container"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="map-wrapper">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d4620.0099134865895!2d85.27531209515716!3d23.210153466211683!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMjPCsDEyJzM3LjAiTiA4NcKwMTYnMjYuNyJF!5e0!3m2!1sen!2sin!4v1761420045037!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0, borderRadius: '16px' }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Vriksh Valley Location"
              ></iframe>
              <a 
                href="https://maps.app.goo.gl/qZk8sckjVWRJtr8Q8"
                target="_blank"
                rel="noopener noreferrer"
                className="map-overlay-link"
              >
                <span>Open in Google Maps</span>
              </a>
            </div>
          </motion.div>

          <motion.div 
            className="contact-info"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="info-card">
              <div className="card-icon">
                <MapPin />
              </div>
              <div className="card-content">
                <h3>Address</h3>
                <p>Vriksh Valley Nursery<br />Dungra, Ranchi<br />Jharkhand, India</p>
              </div>
            </div>

            <div className="info-card">
              <div className="card-icon">
                <Clock />
              </div>
              <div className="card-content">
                <h3>Opening Hours</h3>
                <p>Monday - Saturday<br />9:00 AM - 7:00 PM<br />Sunday: 10:00 AM - 6:00 PM</p>
              </div>
            </div>

            <div className="info-card">
              <div className="card-icon">
                <Phone />
              </div>
              <div className="card-content">
                <h3>Phone</h3>
                <p><a href="tel:+919876543210">+91 98765 43210</a></p>
              </div>
            </div>

            <div className="info-card">
              <div className="card-icon">
                <Mail />
              </div>
              <div className="card-content">
                <h3>Email</h3>
                <p><a href="mailto:contact@vrikshvalley.com">contact@vrikshvalley.com</a></p>
              </div>
            </div>

            <div className="visit-message">
              <div className="message-icon">🌿</div>
              <p>Visit us to explore our wide collection of plants and get expert gardening advice!</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
