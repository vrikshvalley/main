'use client';
import Breadcrumbs from '@/components/general/Breadcrumbs';
import '@/styles/pages.scss';

export default function TermsConditions() {
  return (
    <div className="page-container">
      <Breadcrumbs items={[{ label: 'Terms and Conditions' }]} />
      
      <div className="page-content">
        <div className="page-header">
          <h1>Terms and Conditions</h1>
          <p>Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="content-section">
          <h2>Agreement to Terms</h2>
          <p>
            These Terms and Conditions constitute a legally binding agreement between you and Vriksh Valley 
            regarding your use of our website and services.
          </p>

          <h3>1. Definitions</h3>
          <ul>
            <li><strong>"Website"</strong> refers to Vriksh Valley's online platform</li>
            <li><strong>"Services"</strong> refers to all products and services offered</li>
            <li><strong>"User"</strong> refers to anyone accessing our website</li>
            <li><strong>"Products"</strong> refers to plants and related items</li>
          </ul>

          <h3>2. Eligibility</h3>
          <p>
            You must be at least 18 years old to make purchases. By using our services, you represent 
            that you meet this requirement.
          </p>

          <h3>3. Account Registration</h3>
          <ul>
            <li>You may need to create an account to access certain features</li>
            <li>Provide accurate and complete information</li>
            <li>Maintain the security of your account credentials</li>
            <li>Notify us immediately of unauthorized access</li>
          </ul>

          <h3>4. Orders and Purchases</h3>
          <ul>
            <li>All orders are subject to acceptance and availability</li>
            <li>We reserve the right to refuse or cancel orders</li>
            <li>Prices are subject to change without notice</li>
            <li>Payment must be completed before dispatch</li>
          </ul>

          <h3>5. Product Descriptions</h3>
          <p>
            We strive for accuracy in product descriptions and images. As plants are living organisms, 
            actual products may vary slightly. We guarantee quality and health.
          </p>

          <h3>6. Intellectual Property</h3>
          <p>
            All content on our website, including images, text, logos, and designs, is owned by 
            Vriksh Valley and protected by copyright laws.
          </p>

          <h3>7. User Conduct</h3>
          <p>You agree not to:</p>
          <ul>
            <li>Use the website for unlawful purposes</li>
            <li>Violate any applicable laws or regulations</li>
            <li>Infringe on intellectual property rights</li>
            <li>Transmit harmful code or malware</li>
            <li>Impersonate others or provide false information</li>
          </ul>

          <h3>8. Privacy</h3>
          <p>
            Your use of our services is also governed by our Privacy Policy. We collect and use 
            information as described in that policy.
          </p>

          <h3>9. Disclaimers</h3>
          <ul>
            <li>Services are provided "as is" without warranties</li>
            <li>We don't guarantee uninterrupted or error-free service</li>
            <li>Plant care results may vary based on individual circumstances</li>
          </ul>

          <h3>10. Limitation of Liability</h3>
          <p>
            Vriksh Valley shall not be liable for indirect, incidental, or consequential damages 
            arising from use of our products or services.
          </p>

          <h3>11. Indemnification</h3>
          <p>
            You agree to indemnify and hold Vriksh Valley harmless from claims arising from your 
            violation of these terms or misuse of services.
          </p>

          <h3>12. Modifications</h3>
          <p>
            We reserve the right to modify these terms at any time. Changes will be effective 
            immediately upon posting. Continued use constitutes acceptance.
          </p>

          <h3>13. Governing Law</h3>
          <p>
            These terms are governed by the laws of India. Disputes shall be subject to the 
            exclusive jurisdiction of courts in [Your City].
          </p>

          <h3>14. Contact Information</h3>
          <p>
            For questions about these terms:<br />
            Email: legal@vrikshvalley.com<br />
            Phone: +91 12345 67890
          </p>
        </div>
      </div>
    </div>
  );
}
