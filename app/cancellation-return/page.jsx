'use client';
import Breadcrumbs from '@/components/general/Breadcrumbs';
import '@/styles/pages.scss';

export default function CancellationReturn() {
  return (
    <div className="page-container">
      <Breadcrumbs items={[{ label: 'Cancellation & Return Policy' }]} />
      
      <div className="page-content">
        <div className="page-header">
          <h1>Cancellation and Refund Policy – Vriksh Valley</h1>
          <p>Clear and transparent policies for your peace of mind</p>
        </div>

        <div className="content-section">
          <h2>Refund Eligibility</h2>
          <p>
            Refunds are eligible for all Vriksh Valley live plants, planters, tools, and accessories if requested within <strong>7 days of delivery</strong>.
          </p>

          <h2>Refund Process</h2>
          <p>
            Refunds are issued via reversal to the original payment method. Once approved, the refund will be processed within 7-10 working days.
          </p>

          <h2>Replacement Policy</h2>
          <p>
            Replacements are provided only if you share an <strong>unboxing video</strong> showing the item's damage or defect. This helps us verify the condition of the product at the time of delivery and process your request promptly.
          </p>

          <h2>Important Guidelines</h2>
          <ul>
            <li>Inspect your order immediately upon delivery</li>
            <li>Record an unboxing video for high-value or fragile items</li>
            <li>Report any damage or defect within 48 hours of delivery</li>
            <li>Contact our support team with photographic or video evidence</li>
          </ul>

          <h2>Non-Refundable Items</h2>
          <p>
            The following items are not eligible for refund or replacement:
          </p>
          <ul>
            <li>Plants damaged due to improper care after delivery</li>
            <li>Products not reported within the stipulated timeframe</li>
            <li>Items without proper documentation (photos/videos)</li>
          </ul>

          <h2>Order Cancellation</h2>
          <p>
            You can cancel your order before it has been dispatched by contacting our customer support team. Once the order is shipped, cancellation is not possible. However, you may initiate a return as per our return policy.
          </p>

          <h2>Contact for Cancellations and Returns</h2>
          <p>
            For all cancellation and return queries, reach us at:<br />
            <strong>Phone:</strong> +91 92047 45612<br />
            <strong>Email:</strong> vrikshvalley@gmail.com<br />
            Our team is available to assist you with your concerns.
          </p>
        </div>
      </div>
    </div>
  );
}
