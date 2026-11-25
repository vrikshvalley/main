import Image from 'next/image';
import { MapPin, Phone, Clock, Mail, Navigation } from 'lucide-react';
import '@/styles/ourLocation.scss';

const MAPS_URL = 'https://maps.app.goo.gl/qZk8sckjVWRJtr8Q8';

/**
 * Store location. Server component: every detail is visible without hover,
 * phone/email are real links, and the photo goes through next/image.
 */
export default function OurLocation() {
  return (
    <section className="our-location">
      <div className="location-container">
        <div className="location-header">
          <p className="cursive-subtitle">Come Say Hello</p>
          <h2 className="location-title">Visit our nursery</h2>
          <p className="location-subtitle">
            Walk the rows, meet the plants in person and get advice from the people who grow them.
          </p>
        </div>

        <div className="store-card scroll-fade">
          <a
            href={MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="store-photo"
            aria-label="Open Vriksh Valley Garden in Google Maps"
          >
            <Image
              src="/sections/storefront.webp"
              alt="The Vriksh Valley Garden storefront"
              fill
              sizes="(max-width: 860px) 100vw, 560px"
              className="store-image"
            />
            <span className="photo-badge">
              <MapPin size={16} aria-hidden="true" /> Dungra, Ranchi
            </span>
          </a>

          <div className="store-info">
            <h3>Vriksh Valley Garden</h3>

            <ul className="store-details">
              <li>
                <span className="detail-icon"><MapPin size={20} aria-hidden="true" /></span>
                <div>
                  <h4>Address</h4>
                  <p>Vriksh Valley Garden, Dungra<br />Ranchi, Jharkhand, India</p>
                </div>
              </li>
              <li>
                <span className="detail-icon"><Clock size={20} aria-hidden="true" /></span>
                <div>
                  <h4>Opening hours</h4>
                  <p>Mon to Sat: 9:00 AM to 7:00 PM<br />Sunday: 10:00 AM to 6:00 PM</p>
                </div>
              </li>
              <li>
                <span className="detail-icon"><Phone size={20} aria-hidden="true" /></span>
                <div>
                  <h4>Call</h4>
                  <p><a href="tel:+919204745612">+91 92047 45612</a></p>
                </div>
              </li>
              <li>
                <span className="detail-icon"><Mail size={20} aria-hidden="true" /></span>
                <div>
                  <h4>Email</h4>
                  <p><a href="mailto:contact@vrikshvalley.com">contact@vrikshvalley.com</a></p>
                </div>
              </li>
            </ul>

            <div className="store-actions">
              <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="store-btn store-btn--primary">
                <Navigation size={18} aria-hidden="true" /> Get directions
              </a>
              <a href="tel:+919204745612" className="store-btn store-btn--ghost">
                <Phone size={18} aria-hidden="true" /> Call us
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
