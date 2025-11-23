'use client';
import Breadcrumbs from '@/components/general/Breadcrumbs';
import '@/styles/pages.scss';

export default function TermsConditions() {
  return (
    <div className="page-container">
      <Breadcrumbs items={[{ label: 'Terms and Conditions' }]} />
      
      <div className="page-content">
        <div className="page-header">
          <h1>Terms and Conditions – Vriksh Valley</h1>
          <p>Please read carefully before using our services</p>
        </div>

        <div className="content-section">
          <p>
            We welcome you to Vriksh Valley. Accessing or purchasing from our website indicates that you agree to the following Terms and Conditions. Please read them carefully before using our services.
          </p>

          <h2>General</h2>
          <p>
            Vriksh Valley ("we", "us", "our") operates this website to provide plant products, gardening tools, and related accessories. Using our products indicates that you agree to comply with and be bound by these terms. We reserve the right to update or modify these terms at any time without prior notice.
          </p>

          <h2>Product Availability</h2>
          <p>
            All products listed are subject to availability. Plants are living entities and may vary slightly in size, color, or appearance from images shown. We make every effort to maintain accurate product descriptions and stock levels. But we cannot guarantee availability at all times.
          </p>

          <h2>Pricing and Payment</h2>
          <p>
            All prices are listed in INR and inclusive of applicable taxes unless otherwise stated. Payments can be made securely through approved online payment gateways. Orders are confirmed only upon successful transaction.
          </p>

          <h2>Shipping and Delivery</h2>
          <p>
            We aim to dispatch all orders promptly. However, delivery times may vary depending on location, weather, or courier constraints. Customers will be informed of any significant delay. Plants are carefully packaged to ensure they arrive healthy and intact.
          </p>

          <h2>Returns and Replacements</h2>
          <p>
            Due to the perishable nature of plants, returns are accepted only in cases of transit damage or incorrect delivery. Customers must report such issues within 48 hours of receiving the product with photographic proof. Replacement or store credit will be offered at our discretion.
          </p>

          <h2>Intellectual Property</h2>
          <p>
            All content on the Vriksh Valley website, including images, logos, and text, is our property and protected by applicable copyright laws. Unauthorized use is strictly prohibited.
          </p>

          <h2>Liability</h2>
          <p>
            Vriksh Valley shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products or website. Users are responsible for ensuring plants are suitable for their specific environment.
          </p>

          <h2>Governing Law</h2>
          <p>
            The laws of India govern these Terms and Conditions. Any dispute will be subject to the jurisdiction of the courts in Ranchi.
          </p>

          <h2>Order Cancellations</h2>
          <p>
            Customers can request order cancellations before dispatch by contacting our support team. Once the order has been shipped, it cannot be canceled. In case of failed delivery attempts or incorrect address entries, additional delivery charges may apply. Vriksh Valley reserves the right to cancel any order due to unforeseen circumstances such as product unavailability, fraudulent activity, or payment irregularities. Refunds, if applicable, will be processed within 7-10 working days.
          </p>

          <h2>User Responsibility</h2>
          <p>
            Using our website indicates that you agree to provide accurate and complete information during registration, checkout, and communication. You must not use the website for unlawful or fraudulent purposes. Any misuse, data tampering, or attempt to disrupt website functionality will lead to immediate account termination. Users are also responsible for maintaining the confidentiality of their account credentials and notifying us immediately in case of unauthorized use.
          </p>

          <p className="agreement-notice">
            Using Vriksh Valley indicates that you acknowledge having read, understood, and agreed to these Terms and Conditions.
          </p>
        </div>
      </div>
    </div>
  );
}
