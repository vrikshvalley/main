'use client';
import Breadcrumbs from '@/components/general/Breadcrumbs';
import '@/styles/pages.scss';

export default function OurStory() {
  return (
    <div className="page-container">
      <Breadcrumbs items={[{ label: 'Our Story' }]} />
      
      <div className="page-content">
        <div className="page-header">
          <h1>Our Story</h1>
          <p>From a small garden to a thriving green community</p>
        </div>

        <div className="content-section">
          <h2>How It All Began</h2>
          <p>
            Vriksh Valley started with a simple idea: everyone deserves to have a piece of nature 
            in their life. What began as a small garden nursery in 2015 has grown into a passionate 
            community of plant lovers dedicated to spreading greenery across homes and hearts.
          </p>

          <h3>The Journey</h3>
          <p>
            Our founder, inspired by childhood memories of lush gardens and the calming presence of 
            plants, started with just 50 varieties. Today, we offer over 500+ different plants, 
            each carefully selected and nurtured with love.
          </p>

          <h3>Growing Together</h3>
          <p>
            Over the years, we've helped thousands of customers create their own green sanctuaries. 
            From beginners receiving their first succulent to experienced gardeners expanding their 
            collections, we've been there for every step of the journey.
          </p>

          <h3>Our Impact</h3>
          <ul>
            <li>500+ litres of water saved through sustainable practices</li>
            <li>100kg+ of organic waste composted and recycled</li>
            <li>1000+ trees planted across urban spaces</li>
            <li>10,000+ happy plant parents in our community</li>
          </ul>

          <h3>Looking Forward</h3>
          <p>
            As we continue to grow, our commitment remains the same: to bring nature closer to you, 
            one plant at a time. We're constantly expanding our collection, improving our services, 
            and finding new ways to make plant parenting easier and more rewarding.
          </p>
        </div>
      </div>
    </div>
  );
}
