'use client';
import Image from 'next/image';
import Breadcrumbs from '@/components/general/Breadcrumbs';
import '@/styles/pages.scss';

export default function TermsOfServices() {
  return (
    <div className="page-container">
      {/* Hero Banner */}
      <div className="hero-banner terms-services-hero">
        <picture>
          <source media="(max-width: 768px)" srcSet="/TermsofServiceMobile.png" />
          <Image
            src="/TermsofServiceDesktop.png"
            alt="Terms of Services - Vriksh Valley"
            fill
            priority
            style={{ objectFit: 'cover' }}
          />
        </picture>
        <div className="hero-overlay">
          <h1>Terms of Services</h1>
          <p>Please read these terms carefully</p>
        </div>
      </div>

      <Breadcrumbs items={[{ label: 'Terms of Services' }]} />
      
      <div className="page-content">
        <div className="page-header">
          <h2>Terms of Services</h2>
        </div>

        <div className="content-section">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using Vriksh Valley's website and services, you accept and agree to be bound by 
            the terms and provision of this agreement.
          </p>

          <h3>2. Use of Services</h3>
          <p>
            Our services are available for your personal, non-commercial use. You agree to use our services 
            only for lawful purposes and in accordance with these terms.
          </p>

          <h3>3. Product Information</h3>
          <p>
            We strive to provide accurate product descriptions and images. However, as plants are living 
            organisms, actual products may vary slightly from images shown. We guarantee the health and 
            quality of all plants delivered.
          </p>

          <h3>4. Pricing and Payment</h3>
          <ul>
            <li>All prices are listed in Indian Rupees (INR)</li>
            <li>Prices are subject to change without notice</li>
            <li>Payment must be received before delivery</li>
            <li>We accept various payment methods including cards, UPI, and online banking</li>
          </ul>

          <h3>5. Delivery</h3>
          <p>
            Delivery times are estimates and may vary based on location and availability. We will notify 
            you of any significant delays.
          </p>

          <h3>6. User Responsibilities</h3>
          <ul>
            <li>Provide accurate delivery information</li>
            <li>Inspect plants upon delivery</li>
            <li>Follow care instructions provided</li>
            <li>Report any issues within 24 hours of delivery</li>
          </ul>

          <h3>7. Limitation of Liability</h3>
          <p>
            Vriksh Valley shall not be liable for any indirect, incidental, or consequential damages arising 
            from the use of our products or services.
          </p>

          <h3>8. Changes to Terms</h3>
          <p>
            We reserve the right to modify these terms at any time. Continued use of our services constitutes 
            acceptance of modified terms.
          </p>

          <h3>9. Contact</h3>
          <p>
            For questions about these terms, please contact us at support@vrikshvalley.com
          </p>
        </div>
      </div>
    </div>
  );
}
