'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';
import '@/styles/plantFAQs.scss';

export default function PlantFAQs() {
  const [openFAQ, setOpenFAQ] = useState(null);

  const faqs = [
    {
      id: 1,
      question: "How often should I water my indoor plants?",
      answer: "The watering frequency depends on the plant type, pot size, and environmental conditions. Generally, most indoor plants need watering once a week. Check the top 2 inches of soil - if it's dry, it's time to water. Overwatering is more harmful than underwatering, so always err on the side of caution."
    },
    {
      id: 2,
      question: "What are the best plants for beginners?",
      answer: "Snake plants, pothos, ZZ plants, and spider plants are excellent choices for beginners. They're low-maintenance, forgiving of occasional neglect, and can thrive in various light conditions. These plants are also great air purifiers and add a beautiful green touch to any space."
    },
    {
      id: 3,
      question: "How do I know if my plant is getting enough light?",
      answer: "Signs of insufficient light include slow growth, pale leaves, and leggy stems. If your plant is getting too much light, you'll notice brown, crispy leaf edges or bleached spots. Most houseplants prefer bright, indirect light. Place them near windows with sheer curtains for optimal lighting."
    },
    {
      id: 4,
      question: "Why are my plant's leaves turning yellow?",
      answer: "Yellow leaves can indicate several issues: overwatering (most common), underwatering, nutrient deficiency, or natural aging. Check the soil moisture, ensure proper drainage, and consider the plant's age. Lower leaves naturally yellow and drop as plants grow. Adjust your care routine accordingly."
    },
    {
      id: 5,
      question: "Do I need to fertilize my plants?",
      answer: "Yes, fertilizing helps plants grow healthy and vibrant. During the growing season (spring and summer), feed most plants every 2-4 weeks with a balanced liquid fertilizer diluted to half strength. In fall and winter, reduce or stop fertilizing as plant growth slows down."
    },
    {
      id: 6,
      question: "How can I increase humidity for my tropical plants?",
      answer: "Tropical plants thrive in humid environments. Increase humidity by grouping plants together, using a pebble tray with water, misting regularly, or using a humidifier. Bathrooms and kitchens naturally have higher humidity and can be ideal spots for humidity-loving plants."
    },
    {
      id: 7,
      question: "When should I repot my plant?",
      answer: "Repot when roots are growing out of drainage holes, the plant is top-heavy and tipping over, or growth has slowed significantly. Spring is the best time for repotting. Choose a pot 2-3 inches larger in diameter, use fresh potting soil, and water thoroughly after repotting."
    },
    {
      id: 8,
      question: "How do I deal with common plant pests?",
      answer: "Common pests include spider mites, mealybugs, and aphids. Inspect plants regularly, isolate affected plants, and treat with insecticidal soap or neem oil. Wipe leaves with a damp cloth, increase air circulation, and avoid overwatering. Prevention through good plant hygiene is key."
    }
  ];

  const toggleFAQ = (id) => {
    setOpenFAQ(openFAQ === id ? null : id);
  };

  return (
    <section className="plant-faqs">
      <div className="faqs-container">
        <motion.div 
          className="section-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <HelpCircle className="header-icon" />
          <h2 className="section-title">Plant Care FAQs</h2>
          <p className="section-subtitle">
            Find answers to the most common questions about plant care
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
          <p>Still have questions? <a href="/contact">Contact our plant experts</a></p>
        </motion.div>
      </div>
    </section>
  );
}
