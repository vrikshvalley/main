'use client';
import Breadcrumbs from '@/components/general/Breadcrumbs';
import '@/styles/pages.scss';

export default function ShippingPolicies() {
  return (
    <div className="page-container">
      <Breadcrumbs items={[{ label: 'Shipping Policies' }]} />
      
      <div className="page-content">
        <div className="page-header">
          <h1>Shipping Policies</h1>
          <p>Everything you need to know about our shipping process</p>
        </div>

        <div className="content-section">
          <h2>Shipping Coverage</h2>
          <p>
            We ship across India to most pin codes. During checkout, you can verify if we deliver 
            to your location.
            Products will be delivered within 7-10 business days.
          </p>

          <h3>Delivery Timeline</h3>
          <ul>
            <li><strong>Metro Cities:</strong> 3-4 business days</li>
            <li><strong>State Capitals:</strong> 4-5 business days</li>
            <li><strong>Other Cities:</strong> 5-7 business days</li>
            <li><strong>Remote Areas:</strong> 7-10 business days</li>
          </ul>

          <h3>Shipping Charges</h3>
          <p>
            <strong>FREE SHIPPING</strong> on all orders! No minimum order value required.
          </p>

          <h3>Order Processing</h3>
          <ul>
            <li>Orders are processed within 24 hours of payment confirmation</li>
            <li>Orders placed on weekends/holidays are processed on the next business day</li>
            <li>You'll receive a confirmation email once your order is shipped</li>
            <li>Tracking information will be shared via email and SMS</li>
          </ul>

          <h3>Packaging</h3>
          <p>
            We use specialized packaging to ensure your plants arrive in perfect condition:
          </p>
          <ul>
            <li>Sturdy corrugated boxes with ventilation</li>
            <li>Secure plant holders to prevent movement</li>
            <li>Moisture retention materials</li>
            <li>Eco-friendly and recyclable materials</li>
          </ul>

          <h3>Delivery Process</h3>
          <ul>
            <li>Our delivery partners will call before delivery</li>
            <li>Please ensure someone is available to receive the order</li>
            <li>Inspect the package before accepting delivery</li>
            <li>Report any visible damage immediately</li>
          </ul>

          <h3>Non-Delivery Scenarios</h3>
          <p>If delivery is not possible due to:</p>
          <ul>
            <li>Incorrect address provided</li>
            <li>No one available to receive</li>
            <li>Refused delivery</li>
          </ul>
          <p>
            The package will be returned to us. Return shipping charges may apply for redelivery.
          </p>

          <h3>Weather Conditions</h3>
          <p>
            During extreme weather conditions (heavy rain, heatwave, etc.), we may delay shipment 
            to ensure plant health. You'll be notified of any such delays.
          </p>
        </div>
      </div>
    </div>
  );
}
