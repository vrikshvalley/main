'use client';
import Breadcrumbs from '@/components/general/Breadcrumbs';
import '@/styles/pages.scss';

export default function Products() {
  return (
    <div className="page-container">
      <Breadcrumbs items={[{ label: 'Products' }]} />
      
      <div className="page-content">
        <div className="page-header">
          <h1>Our Products</h1>
          <p>Explore our complete collection of premium plants</p>
        </div>

        <div className="content-section">
          <h2>Coming Soon</h2>
          <p>
            We're currently working on our products listing page. Check back soon to browse our 
            complete collection of indoor plants, outdoor gardens, succulents, herbs, and more!
          </p>
          <p>
            In the meantime, feel free to contact us for product inquiries or visit our store 
            location to see our plants in person.
          </p>
        </div>
      </div>
    </div>
  );
}
