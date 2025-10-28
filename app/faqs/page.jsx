'use client';
import { useState } from 'react';
import Breadcrumbs from '@/components/general/Breadcrumbs';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import '@/styles/pages.scss';
import '@/styles/plantFAQs.scss';

const faqs = [
  {
    question: "How do I track my order?",
    answer: "Once your order is shipped, you'll receive a tracking number via email and SMS. You can use this to track your order on our Track Order page or directly on the courier's website."
  },
  {
    question: "What is your delivery timeframe?",
    answer: "Delivery typically takes 3-7 business days depending on your location. Metro cities receive orders within 3-4 days, while remote areas may take up to 7 days."
  },
  {
    question: "Do you offer free delivery?",
    answer: "Yes! We offer free delivery on all orders. No minimum order value required."
  },
  {
    question: "What if my plant arrives damaged?",
    answer: "We take great care in packaging, but if your plant arrives damaged, please contact us within 24 hours with photos. We'll arrange a replacement or full refund immediately."
  },
  {
    question: "Can I cancel my order?",
    answer: "Yes, you can cancel your order before it's dispatched. Once dispatched, you cannot cancel but you can refuse delivery and contact us for a return."
  },
  {
    question: "Do you provide care instructions?",
    answer: "Absolutely! Each plant comes with detailed care instructions including watering schedule, sunlight requirements, and maintenance tips."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit/debit cards, UPI, net banking, and digital wallets. Payment is processed securely through our payment gateway."
  },
  {
    question: "Do you offer plant consultation services?",
    answer: "Yes! Our experts are available via phone, email, and WhatsApp to help you choose the right plants and provide ongoing care advice."
  },
  {
    question: "Are your plants pet-friendly?",
    answer: "We have a special collection of pet-safe plants. Each product page indicates if a plant is toxic to pets. Contact us for personalized recommendations."
  },
  {
    question: "Do you offer bulk orders for offices/events?",
    answer: "Yes! We offer special pricing for bulk orders. Contact our sales team at bulk@vrikshvalley.com for customized quotes and arrangements."
  }
];

export default function FAQs() {
  const [openFAQ, setOpenFAQ] = useState(null);

  return (
    <div className="page-container">
      <Breadcrumbs items={[{ label: 'FAQs' }]} />
      
      <div className="page-content">
        <div className="page-header">
          <h1>Frequently Asked Questions</h1>
          <p>Find answers to common questions about our products and services</p>
        </div>

        <div className="content-section">
          <div className="faqs-container">
            {faqs.map((faq, index) => (
              <div key={index} className="faq-item">
                <button
                  className={`faq-question ${openFAQ === index ? 'active' : ''}`}
                  onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                >
                  <span>{faq.question}</span>
                  <motion.div
                    animate={{ rotate: openFAQ === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown size={20} />
                  </motion.div>
                </button>
                
                <AnimatePresence>
                  {openFAQ === index && (
                    <motion.div
                      className="faq-answer"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <p>{faq.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

        <div className="content-section">
          <h2>Still Have Questions?</h2>
          <p>
            If you couldn't find the answer you're looking for, feel free to reach out to our 
            customer support team. We're here to help!
          </p>
          <ul>
            <li>Email: support@vrikshvalley.com</li>
            <li>Phone: +91 12345 67890</li>
            <li>WhatsApp: +91 12345 67890</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
