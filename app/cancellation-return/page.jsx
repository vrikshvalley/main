'use client';
import Breadcrumbs from '@/components/general/Breadcrumbs';
import '@/styles/pages.scss';

export default function CancellationReturn() {
  return (
    <div className="page-container">
      <Breadcrumbs items={[{ label: 'Cancellation & Return Policy' }]} />
      
      <div className="page-content">
        <div className="page-header">
          <h1>Cancellation & Return Policy</h1>
          <p>Your satisfaction is our priority</p>
        </div>

        <div className="content-section">
          <h2>Cancellation Policy</h2>
          
          <h3>Before Dispatch</h3>
          <p>
            You may cancel your order at any time before it has been dispatched. To cancel, contact our 
            customer support team immediately. Full refund will be processed within 5-7 business days.
          </p>

          <h3>After Dispatch</h3>
          <p>
            Once an order has been dispatched, it cannot be cancelled. However, you may refuse delivery 
            and contact us for a return.
          </p>

          <h2>Return Policy</h2>

          <h3>Eligibility for Returns</h3>
          <ul>
            <li>Plants received in damaged or unhealthy condition</li>
            <li>Wrong plant delivered</li>
            <li>Plants not matching the description</li>
          </ul>

          <h3>Return Process</h3>
          <ol>
            <li>Contact us within <strong>24 hours</strong> of delivery</li>
            <li>Provide photos of the plant showing the issue</li>
            <li>Our team will review and approve the return</li>
            <li>We'll arrange pickup or provide return instructions</li>
          </ol>

          <h3>Non-Returnable Items</h3>
          <ul>
            <li>Plants damaged due to improper care after delivery</li>
            <li>Plants returned after 24 hours without prior approval</li>
            <li>Accessories and pots (unless damaged)</li>
          </ul>

          <h2>Refund Policy</h2>
          
          <h3>Refund Timeline</h3>
          <p>
            Approved refunds will be processed within 7-10 business days of receiving the returned product. 
            The refund will be credited to your original payment method.
          </p>

          <h3>Replacement Option</h3>
          <p>
            Instead of a refund, you may choose to receive a replacement plant of the same or equivalent 
            value, subject to availability.
          </p>

          <h2>Important Notes</h2>
          <ul>
            <li>Inspect plants immediately upon delivery</li>
            <li>Take photos/videos during unboxing</li>
            <li>Keep packaging materials for potential returns</li>
            <li>Contact us immediately for any issues</li>
          </ul>

          <h2>Contact for Returns</h2>
          <p>
            Email: returns@vrikshvalley.com<br />
            Phone: +91 12345 67890<br />
            WhatsApp: +91 12345 67890
          </p>
        </div>
      </div>
    </div>
  );
}
