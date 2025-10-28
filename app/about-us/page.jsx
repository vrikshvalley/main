'use client';
import Breadcrumbs from '@/components/general/Breadcrumbs';
import '@/styles/pages.scss';

export default function AboutUs() {
  return (
    <div className="page-container">
      <Breadcrumbs items={[{ label: 'About Us' }]} />
      
      <div className="page-content">
        <div className="page-header">
          <h1>About Vriksh Valley</h1>
          <p>Your trusted partner in bringing nature closer to you</p>
        </div>

        <div className="content-section">
          <h2>Our Mission</h2>
          <p>
            At Vriksh Valley, we believe in the transformative power of plants. Our mission is to make 
            it easy for everyone to bring the beauty and benefits of nature into their homes, offices, 
            and lives. We're passionate about creating greener spaces and healthier environments, 
            one plant at a time.
          </p>

          <h3>What We Do</h3>
          <p>
            We curate a premium selection of indoor and outdoor plants, carefully chosen for their 
            quality, health, and ability to thrive in various environments. From air-purifying 
            houseplants to stunning succulents, from fragrant herbs to majestic bonsai, we offer 
            a diverse range to suit every preference and space.
          </p>

          <h3>Our Values</h3>
          <ul>
            <li><strong>Quality First:</strong> Every plant is handpicked and nurtured with care</li>
            <li><strong>Sustainability:</strong> We practice eco-friendly growing methods and packaging</li>
            <li><strong>Customer Care:</strong> Expert guidance and support for your plant journey</li>
            <li><strong>Community:</strong> Building a community of plant lovers and nature enthusiasts</li>
          </ul>

          <h3>Why Choose Us?</h3>
          <p>
            With years of experience in horticulture and a genuine love for plants, our team ensures 
            that every plant reaches you in perfect condition. We provide detailed care instructions, 
            personalized recommendations, and ongoing support to help your plants flourish.
          </p>
        </div>
      </div>
    </div>
  );
}
