'use client';

import { Shield, Truck, Headset } from 'lucide-react';
import { motion } from 'framer-motion';
import '@/styles/products.scss';

const features = [
  {
    icon: Shield,
    title: 'Quality Guaranteed',
    description: 'All our plants are carefully inspected and come with a health guarantee',
  },
  {
    icon: Truck,
    title: 'Fast Delivery',
    description: 'Safe and secure delivery to your doorstep within 3-5 business days',
  },
  {
    icon: Headset,
    title: 'Expert Support',
    description: '24/7 plant care support from our team of expert horticulturists',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export default function WhyChooseUs() {
  return (
    <section className="why-choose-us">
      <div className="why-choose-container">
        <motion.div
          className="why-section-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2>Why Choose Vriksh Valley</h2>
          <p>Experience the best in plant care and service</p>
        </motion.div>

        <motion.div
          className="features-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div key={index} className="feature-card" variants={cardVariants}>
                <div className="feature-icon">
                  <Icon size={32} />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
