'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Breadcrumbs from '@/components/general/Breadcrumbs';
import { setStickyHeaderData } from '@/lib/stickyHeaderStore';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import '@/styles/plantFAQs.scss';
import '@/styles/pages.scss';

const faqs = [
  {
    id: 1,
    question: "How do I track my order?",
    answer: "Once your order is shipped, you'll receive a tracking number via email and SMS. You can use this to track your order on our Track Order page or directly on the courier's website."
  },
  {
    id: 2,
    question: "What is your delivery timeframe?",
    answer: "Delivery typically takes 3-7 business days depending on your location. Metro cities receive orders within 3-4 days, while remote areas may take up to 7 days."
  },
  {
    id: 3,
    question: "Do you offer free delivery?",
    answer: "Yes! We offer free delivery on all orders. No minimum order value required."
  },
  {
    id: 4,
    question: "What if my plant arrives damaged?",
    answer: "We take great care in packaging, but if your plant arrives damaged, please contact us within 24 hours with photos. We'll arrange a replacement or full refund immediately."
  },
  {
    id: 5,
    question: "Can I cancel my order?",
    answer: "Yes, you can cancel your order before it's dispatched. Once dispatched, you cannot cancel but you can refuse delivery and contact us for a return."
  },
  {
    id: 6,
    question: "Do you provide care instructions?",
    answer: "Absolutely! Each plant comes with detailed care instructions including watering schedule, sunlight requirements, and maintenance tips."
  },
  {
    id: 7,
    question: "What payment methods do you accept?",
    answer: "We accept all major credit/debit cards, UPI, net banking, and digital wallets. Payment is processed securely through our payment gateway."
  },
  {
    id: 8,
    question: "Do you offer plant consultation services?",
    answer: "Yes! Our experts are available via phone, email, and WhatsApp to help you choose the right plants and provide ongoing care advice."
  },
  {
    id: 9,
    question: "Are your plants pet-friendly?",
    answer: "We have a special collection of pet-safe plants. Each product page indicates if a plant is toxic to pets. Contact us for personalized recommendations."
  },
  {
    id: 10,
    question: "Do you offer bulk orders for offices/events?",
    answer: "Yes! We offer special pricing for bulk orders. Contact our sales team at bulk@vrikshvalley.com for customized quotes and arrangements."
  }
];

export default function FAQs() {
  const [openFAQ, setOpenFAQ] = useState(null);

  const toggleFAQ = (id) => {
    setOpenFAQ(openFAQ === id ? null : id);
  };

  return (
    <div className="page-container">      
      {/* Hero Banner */}
      <div className="hero-banner faqs-hero">
        <picture>
          <source media="(max-width: 768px)" srcSet="/FAQsMobile.png" />
          <Image
            src="/FAQsDesktop.png"
            alt="FAQs - Vriksh Valley"
            fill
            priority
            style={{ objectFit: 'cover' }}
          />
        </picture>
        <div className="hero-overlay">
          <h1>Frequently Asked Questions</h1>
          <p>Find answers to common questions</p>
        </div>
      </div>

      <Breadcrumbs items={[{ label: 'FAQs' }]} />
      
      <section className="plant-faqs">
        <div className="faqs-container">
          <motion.div 
            className="section-header"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="section-title">Frequently Asked Questions</h2>
            <p className="section-subtitle">
              Find answers to common questions about our products and services
            </p>
          </motion.div>

          <div className="faqs-grid">
            {faqs.map((faq, index) => (
              <motion.div
                key={faq.id}
                className={`faq-item ${openFAQ === faq.id ? 'active' : ''}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <button
                  className="faq-question"
                  onClick={() => toggleFAQ(faq.id)}
                  aria-expanded={openFAQ === faq.id}
                >
                  <span className="question-number">{String(index + 1).padStart(2, '0')}</span>
                  <span className="question-text">{faq.question}</span>
                  <ChevronDown 
                    className={`chevron ${openFAQ === faq.id ? 'rotated' : ''}`}
                    size={20}
                  />
                </button>

                <AnimatePresence>
                  {openFAQ === faq.id && (
                    <motion.div
                      className="faq-answer"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <div className="answer-content">
                        <p>{faq.answer}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          <motion.div 
            className="faqs-footer"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <p>Still have questions? <a href="/contact-us">Contact our plant experts</a></p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
