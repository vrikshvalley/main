'use client';
import Breadcrumbs from '@/components/general/Breadcrumbs';
import '@/styles/pages.scss';

export default function AboutUs() {
  return (
    <div className="page-container">
      <Breadcrumbs items={[{ label: 'About Us' }]} />
      
      <div className="page-content">
        <div className="page-header">
          <h1>About Us – Vriksh Valley</h1>
          <p>Where nature meets nurture</p>
        </div>

        <div className="content-section">
          <p>
            We believe that every home, balcony, and workspace deserves a touch of green. It is not just for beauty. It is also for balance and well-being, along with harmony. Our journey began with a simple thought. What if plants were not just decor? What if they were daily companions that inspire mindfulness and joy?
          </p>

          <p>
            We are more than an online plant destination at Vriksh Valley. We are a community that celebrates growth in every form. We extend from lush indoor plants to air purifiers to flowering varieties and garden essentials. We bring the best of nature to your doorstep. Each plant is handpicked and nurtured with care. They are delivered with the same love we would give our own.
          </p>

          <h2>Our Mission</h2>
          <p>
            It is to reconnect people with the natural world by making plant care accessible and sustainable, as well as rewarding. We want to see every urban home turn into a mini ecosystem where plants thrive and the air purifies, along with life slowing down to the gentle rhythm of growth.
          </p>

          <h2>Our Promise</h2>
          <ul>
            <li><strong>Healthy and thriving plants</strong> – Every plant is grown responsibly and checked for quality before dispatch.</li>
            <li><strong>Environmentally friendly Packaging</strong> – We use minimal plastic and sustainable materials that are kind to the planet.</li>
            <li><strong>Guidance and support</strong> – You may be a first-time plant parent or a seasoned gardener. Our expert tips and guides help you care for your greens with confidence.</li>
          </ul>

          <h2>Why Choose Us?</h2>
          <p>
            It is because Vriksh Valley does not just sell plants. We nurture experiences. Each product is thoughtfully curated to help you create a sanctuary of green calm. Our services begin from soil mixes to decorative pots to seasonal plants and seeds. We ensure every detail aligns with the rhythm of nature.
          </p>
          <p>
            We take pride in blending traditional plant wisdom with modern sustainability. Our educational initiatives inspire people to make mindful choices that are eco-positive.
          </p>

          <h2>Beyond Greenery – A Way of Living</h2>
          <p>
            Plant care is more than watering schedules and sunlight charts for us. It is a ritual of mindfulness. Every leaf and every bud with every bloom tells a story of patience and progress. That is why our community thrives on sharing. It involves plant parenting tips to creative ways to design your indoor garden.
          </p>
          <p>
            We envision a world where every space has a living reminder of hope and growth. That world is already taking root through Vriksh Valley.
          </p>

          <h2>Join the Green Movement</h2>
          <p>
            The green journey does not end with one plant. It begins there. Choosing Vriksh Valley helps you join a movement that values sustainability, along with self-care and connections with the earth. We can together turn cities into living ecosystems and homes into lush sanctuaries.
          </p>

          <h2>Our Story of Growth</h2>
          <p>
            What started as a small passion project has blossomed into a thriving green community. The idea of Vriksh Valley sprouted from the dare to make urban spaces more breathable and meaningful. Our roots are deepening. Every sapling we deliver varies in this story of growth and gratitude.
          </p>
          <p>
            Join the Vriksh Valley family. Let us grow happiness, one leaf at a time.
          </p>

          <h2>Contact Us</h2>
          <p>
            For all your queries and assistance, reach us at <strong>+91 92047 45612</strong> or drop an email to <strong>vrikshvalley@gmail.com</strong>. Our support team is available for any help you need. We are always ready to help you with your plant journey.
          </p>
        </div>
      </div>
    </div>
  );
}
