'use client';

import { Shield, Truck, Headset } from 'lucide-react';
import { motion } from 'framer-motion';
import '@/styles/products.scss';

const features = [
  {
    icon: Shield,
    title: 'Handpicked and Thriving Plants',
    description: 'Every plant is carefully selected and nurtured to ensure it arrives healthy and ready to flourish',
  },
  {
    icon: Truck,
    title: 'Bespoke Plant Décor Solutions',
    description: 'Customized plant arrangements and décor solutions tailored to your unique space and style',
  },
  {
    icon: Headset,
    title: 'Sustainable and Recyclable Packaging',
    description: 'Eco-friendly packaging that protects your plants while caring for our planet',
  },
  {
    icon: Shield,
    title: 'Expert Guidance and Personalized Care',
    description: 'Professional plant care advice and ongoing support to help your green companions thrive',
  },
  {
    icon: Truck,
    title: 'More than Just Plants - A Green Lifestyle',
    description: 'Join our community in embracing sustainable living and creating greener, healthier spaces',
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
    <section className="why-choose-us-products">
      <div className="why-choose-us-products-container">
        <motion.div
          className="why-choose-us-products-header"
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
