'use client';
import Image from 'next/image';
import Breadcrumbs from '@/components/general/Breadcrumbs';
import '@/styles/pages.scss';

export default function PrivacyPolicy() {
  return (
    <div className="page-container">
      {/* Hero Banner */}
      <div className="hero-banner">
        <picture>
          <source 
            media="(max-width: 768px)" 
            srcSet="/PrivacyPoliciesMobile.png" 
          />
          <Image
            src="/PrivacyPoliciesDesktop.png"
            alt="Privacy Policy - Vriksh Valley"
            fill
            priority
            className="hero-image"
            style={{ objectFit: 'cover' }}
          />
        </picture>
        <div className="hero-overlay">
          <h1>Privacy Policy</h1>
          <p>Your privacy grows with our care</p>
        </div>
      </div>

      <Breadcrumbs items={[{ label: 'Privacy Policy' }]} />
      
      <div className="page-content">
        <div className="page-header">
          <h1>Privacy Policy – <b>Vriksh Valley Garden</b></h1>
          <p>Your privacy grows with our care - secure, transparent, and rooted in trust</p>
        </div>

        <div className="content-section">
          <p>
            Vriksh Valley values your trust and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you visit our website or make a purchase.
          </p>

          <h2>Information We Collect</h2>
          <p>
            We collect personal details such as your name, email address, phone number, billing or shipping address, and payment information when you place an order or register on our site. We may also collect non-personal information like browser type, device details, and site usage statistics to enhance your browsing experience.
          </p>

          <h2>How We Use Your Information</h2>
          <p>
            Your information helps us to process orders, deliver products, and provide personalized customer support. We may also use it to send updates, offers, and plant care tips - only if you opt in. We do not sell, rent, or trade your data to third parties.
          </p>

          <h2>Cookies and Tracking</h2>
          <p>
            We use cookies to improve website functionality and provide you with a smooth shopping experience. Cookies help remember your preferences and optimize product recommendations. You can choose to disable cookies in your browser settings.
          </p>

          <h2>Data Protection</h2>
          <p>
            All transactions are processed through secure payment gateways with encryption technology. We employ advanced security measures to prevent unauthorized access, alteration, or disclosure of your personal information.
          </p>

          <h2>Third-Party Links</h2>
          <p>
            Our website may include links to third-party sites for your convenience. Vriksh Valley is not responsible for the content or privacy practices of these external sites. We encourage you to review their policies before interacting with them.
          </p>

          <h2>Your Rights</h2>
          <p>
            You have the right to access, correct, or delete your personal information at any time. To do so, please contact us at the email provided. You can also unsubscribe from marketing communications through the provided links in our emails.
          </p>

          <h2>Policy Updates</h2>
          <p>
            We may update this Privacy Policy periodically. Changes will be posted on this page, and continued use of our site will signify acceptance of the revised terms.
          </p>

          <h2>Data Retention</h2>
          <p>
            We retain your personal information only for as long as necessary to fulfill the purposes for which it was collected. This includes legal, accounting, or reporting requirements. For example, order transaction data may be retained to comply with taxation or regulatory obligations. When information is no longer required, it is securely deleted or anonymized in accordance with applicable data protection laws.
          </p>

          <h2>Children's Privacy</h2>
          <p>
            Vriksh Valley does not knowingly collect personal information from individuals under the age of 18. Our website and services are intended for adult users who can make purchases online. If we become aware that a minor has provided us with personal data, we will promptly delete it. We strongly encourage parents and guardians to supervise children's online activities and ensure safe browsing.
          </p>

          <h2>Marketing and Communication Preferences</h2>
          <p>
            We love sharing tips about plant care, sustainability, and special offers, but only with your permission. When you sign up for our newsletters or create an account, you can choose the types of communications you would like to receive. You may update your preferences or unsubscribe at any time through your account settings or by clicking "Unsubscribe" in any of our emails. We respect your inbox as much as we respect nature.
          </p>

          <h2>Contact Us</h2>
          <p>
            For privacy-related queries or to exercise your data rights, contact us at:<br />
            <strong>Phone:</strong> +91 92047 45612<br />
            <strong>Email:</strong> vrikshvalley@gmail.com
          </p>
        </div>
      </div>
    </div>
  );
}
