'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Sprout, Droplets, TreePine, Heart, ShoppingBag, Leaf, Users } from 'lucide-react';
import Breadcrumbs from '@/components/general/Breadcrumbs';
import '@/styles/pages.scss';

export default function JoinGreenMovementPage() {
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const milestones = [
    { icon: <Droplets size={32} />, value: '500+ L', label: 'Rainwater Harvested' },
    { icon: <Leaf size={32} />, value: '10 kg', label: 'Organic Compost Created' },
    { icon: <TreePine size={32} />, value: '1,000+', label: 'Trees Planted' }
  ];

  return (
    <div className="page-container">
      {/* Hero Banner */}
      {/* Hero Banner */}
      <div className="hero-banner">
        <picture>
          <source 
            media="(max-width: 768px)" 
            srcSet="/OurStoryMobile.png" 
          />
          <Image
            src="/OurStoryDesktop.png"
            alt="Join the Green Movement - Vriksh Valley"
            fill
            priority
            className="hero-image"
            style={{ objectFit: 'cover' }}
          />
        </picture>
        <div className="hero-overlay">
          <h1>Join the Green Movement</h1>
          <p>Together, We Turn Concrete Dreams into Leafy Sanctuaries</p>
        </div>
      </div>

      <Breadcrumbs items={[{ label: 'Join the Green Movement' }]} />
      
      <div className="page-content">
        {/* Origin Story */}
        <motion.section 
          className="content-section origin-story"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeInUp}
        >
          <div className="section-container">
          <div className="section-icon">
            <Sprout size={48} />
          </div>
          <h2>Our Story</h2>
          <div className="story-content">
            <p>
              In the heart of the city's concrete sprawl, Vriksh Valley's founder never stopped hearing 
              the quiet call of nature. Growing up in Kolkata yet spending formative years in the rolling 
              green hills of Ranchi, she dreamed of bridging the gap between urban life and the natural world.
            </p>
            <p>
              Years of wanderlust and learning – from late-night plant science study sessions to road trips 
              across India learning from farmers and gardeners – finally sprouted into action. In October 2025, 
              that dream took root as <strong>Vriksh Valley</strong>: a garden centre reimagined for everyone, 
              everywhere in India.
            </p>
            <p>
              Our origin story is simple and heartfelt – born of nostalgia for soil under fingernails and the 
              belief that <em>"nature belongs to everyone"</em>. Vriksh Valley exists so that no plant-lover 
              feels disconnected. Every customer here becomes a caretaker of something living and growing, 
              planting the seeds of a greener life.
            </p>
          </div>
        </div>
      </motion.section>

      {/* Sustainability Commitment */}
      <motion.section 
        className="content-section sustainability"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeInUp}
        transition={{ delay: 0.2 }}
      >
        <div className="section-container">
          <div className="section-icon">
            <TreePine size={48} />
          </div>
          <h2>Sustainable Gardening Commitment</h2>
          <div className="story-content">
            <p>
              Our commitment to sustainable gardening is woven through every part of our work. From day one 
              we've put our earth-friendly values into practice. In our nursery and beyond, we harvest rainwater, 
              recycle nutrients, and support new forests.
            </p>
            <p>
              Each plant we nurture contributes to a cleaner, greener future. By reducing waste and capturing 
              water, we put eco-friendly gardening into action – reflecting our belief that nurturing plants 
              can literally grow the planet we all share.
            </p>
          </div>

          {/* Milestones */}
          <div className="milestones-grid">
            {milestones.map((milestone, index) => (
              <motion.div
                key={index}
                className="milestone-card"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="milestone-icon">{milestone.icon}</div>
                <h3>{milestone.value}</h3>
                <p>{milestone.label}</p>
              </motion.div>
            ))}
          </div>

          <p className="milestone-message">
            These milestones are a gentle reminder that every plant brought home from Vriksh Valley is part 
            of a movement to <strong>"bring the green back"</strong>, one garden at a time.
          </p>
        </div>
      </motion.section>

      {/* Plant Care Excellence */}
      <motion.section 
        className="content-section plant-care"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeInUp}
        transition={{ delay: 0.2 }}
      >
        <div className="section-container">
          <div className="section-icon">
            <Heart size={48} />
          </div>
          <h2>Every Plant Has a Story</h2>
          <div className="story-content">
            <p>
              Behind every plant is a story and a caregiver – and we treat both with the utmost care. Each 
              plant is handpicked and tended before it leaves our nursery. We choose only the healthiest, 
              happiest plants (because we've been in the shoes of frustrated plant parents).
            </p>
            <p>
              With your plant comes our guidance: detailed plant care tutorials and guides on watering, light, 
              potting, and seasonal tips. We believe <em>"every plant comes with knowledge, not just a price tag"</em> 
              – so you'll receive step-by-step care instructions tailored to that green friend.
            </p>
            <p>
              Whether it's an indoor plant to purify your home, a flowering gift to cheer a friend, or a rare 
              exotic to inspire you, we nurture it first, and then share our know-how. This hands-on approach 
              ensures your new plant has the best chance to flourish, turning plant care into a joyful, 
              stress-free experience.
            </p>
          </div>
        </div>
      </motion.section>

      {/* Community & People */}
      <motion.section 
        className="content-section community"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeInUp}
        transition={{ delay: 0.2 }}
      >
        <div className="section-container">
          <div className="section-icon">
            <Users size={48} />
          </div>
          <h2>Powered by People</h2>
          <div className="story-content">
            <p>
              Most of all, Vriksh Valley is powered by people. Our customer care is warm and personal, not 
              automated. We speak your language of love for green living and treat every gardener like family.
            </p>
            <p>
              Whether you call with a question about your Monstera's watering or ask for advice on a new 
              succulent, you'll reach a friendly voice who knows your name and your plants. We take time to 
              learn about your space and goals – matching plants to your home and lifestyle, not just selling 
              off a shelf.
            </p>
            <p>
              When you bloom with a thriving plant, we celebrate that victory as our own. It's this human 
              touch – the genuine smiles, phone calls, and follow-ups – that makes indoor gardening feel 
              nurturing rather than intimidating.
            </p>
          </div>
        </div>
      </motion.section>

      {/* Call to Action Section */}
      <motion.section 
        className="cta-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeInUp}
        transition={{ delay: 0.2 }}
      >
        <div className="cta-container">
          <div className="cta-icon">🌱</div>
          <h2>Let's Grow Together</h2>
          <p className="cta-text">
            Join us in growing greener homes. Together, we turn concrete dreams into leafy sanctuaries. 
            Become part of Vriksh Valley's community of plant lovers who care – for each other, and for 
            the planet.
          </p>
          <p className="cta-subtext">
            Embrace a green living lifestyle with our eco-minded gardening support: with every order, 
            you're not just buying a plant, you're investing in a healthier, more beautiful world. 
            Let's grow together and make every corner of India a little bit more green.
          </p>
          <p className="cta-final">
            <strong>Join Vriksh Valley's Green Movement today – and help the earth blossom in your own home!</strong>
          </p>
          
          <div className="cta-buttons">
            <Link href="/products" className="shop-now-btn">
              <ShoppingBag size={20} />
              Shop Now
            </Link>
            <Link href="/contact-us" className="contact-btn">
              Get in Touch
            </Link>
          </div>
        </div>
      </motion.section>
      </div>
    </div>
  );
}
