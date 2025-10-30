'use client';
import Breadcrumbs from '@/components/general/Breadcrumbs';
import { Mail, Phone, MapPin, MessageCircle } from 'lucide-react';
import '@/styles/pages.scss';

export default function ContactUs() {
  return (
    <div className="page-container">
      <Breadcrumbs items={[{ label: 'Contact Us' }]} />
      
      <div className="page-content">
        <div className="page-header">
          <h1>Get in Touch</h1>
          <p>We'd love to hear from you. Reach out to us anytime!</p>
        </div>

        <div className="content-section">
          <h2>Contact Information</h2>
          <p>
            Have questions about our plants, need care advice, or want to know more about our services? 
            Our team is here to help you every step of the way.
          </p>

          <div className="contact-grid">
            <div className="contact-card">
              <div className="icon-wrapper">
                <Phone size={28} />
              </div>
              <h3>Call Us</h3>
              <p><a href="tel:+91 92047 45612">+91 92047 45612</a></p>
              <p>Mon-Sat: 9 AM - 7 PM</p>
            </div>

            <div className="contact-card">
              <div className="icon-wrapper">
                <Mail size={28} />
              </div>
              <h3>Email Us</h3>
              <p><a href="mailto:support@vrikshvalley.com">support@vrikshvalley.com</a></p>
              <p>We'll respond within 24 hours</p>
            </div>

            <div className="contact-card">
              <div className="icon-wrapper">
                <MessageCircle size={28} />
              </div>
              <h3>WhatsApp</h3>
              <p><a href="https://wa.me/+919204745612" target="_blank">+91 92047 45612</a></p>
              <p>Quick responses guaranteed</p>
            </div>

            <div className="contact-card">
              <div className="icon-wrapper">
                <MapPin size={28} />
              </div>
              <h3>Visit Us</h3>
              <p>Vriksh Valley Store</p>
              <p>Dungra, Ranchi, Jharkhand</p>
            </div>
          </div>
        </div>

        <div className="content-section">
          <h2>Business Hours</h2>
          <ul>
            <li><strong>Monday - Saturday:</strong> 9:00 AM - 7:00 PM</li>
            <li><strong>Sunday:</strong> 10:00 AM - 5:00 PM</li>
            <li><strong>Public Holidays:</strong> Closed</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
