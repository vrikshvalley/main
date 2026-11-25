'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import AnimatedText from '@/components/general/AnimatedText';
import '@/styles/plantFAQs.scss';

export default function PlantFAQs() {
  const [openFAQs, setOpenFAQs] = useState([]);

  const faqs = [
  {
    "id": 1,
    "question": "Which plants are best for beginners?",
    "answer": "Great beginner-friendly plants include Snake Plant, Money Plant (Pothos), ZZ Plant, Aloe Vera, Spider Plant and Areca Palm. They require very little care and adapt well to most conditions."
  },
  {
    "id": 2,
    "question": "How often should I water my plants?",
    "answer": "Most indoor plants need watering once or twice a week. It depends on the temperature and pot drainage. Follow the finger test. Water only when the top 1 to 2 inches of soil feel dry."
  },
  {
    "id": 3,
    "question": "What type of soil is best for indoor plants?",
    "answer": "Use a well-draining soil mix. The ideal mix involves 50% hardened soil with 25% cocopeat and 25% perlite or coarse sand."
  },
  {
    "id": 4,
    "question": "How much sunlight do indoor plants need?",
    "answer": "Most indoor plants prefer bright and indirect sunlight. Low-light-tolerant plants are the Snake plant and the ZZ plant. The sun-loving plants include Cactus and Jade, along with Succulents."
  },
  {
    "id": 5,
    "question": "Why are my plant’s leaves turning yellow?",
    "answer": "Common reasons can include overwatering or poor lighting. It can even be because of nutrient deficiency or poor drainage, as well as natural aging."
  },
  {
    "id": 6,
    "question": "What should I do if my plant has pests?",
    "answer": "Common pests include mealybugs, aphids, and spider mites. The solutions involve spraying neem oil mixed with water or wiping off pests with a soft cloth. You can also remove infected leaves or keep the plants in a well-ventilated area."
  },
  {
    "id": 7,
    "question": "How often should I fertilize my plants?",
    "answer": "Fertilize indoor plants every 3 to 4 weeks during the growing season. The growing season is from spring to early autumn. Use liquid or organic fertilizers like compost tea or seaweed extract."
  },
  {
    "id": 8,
    "question": "Can I grow herbs at home? Which ones are the easiest?",
    "answer": "Yes. You can grow herbs at home even in small spaces like balconies, kitchens, windows, or indoor shelves with good light. Some of the easiest herbs to grow include basil, coriander, rosemary, thyme, parsley, tulsi, and curry leaves."
  },
  {
    "id": 9,
    "question": "Why is my plant not growing well?",
    "answer": "The possible causes can be insufficient light, lack of nutrients, root-bound plants, compacted soil, or an incorrect pot size."
  },
  {
    "id": 10,
    "question": "How do I repot a plant correctly?",
    "answer": "First gently remove the plant from its pot. Shake off the old soil. Place it in a slightly larger pot, add fresh soil mix, and water lightly. Repot every 12 to 18 months."
  }
];

  const toggleFAQ = (id) => {
    setOpenFAQs((prev) => {
      if (prev.includes(id)) return prev.filter((i) => i !== id);
      return [...prev, id];
    });
  };

  return (
    <section className="plant-faqs">
      <div className="faqs-container">
        <div className="section-header">
          <p className="cursive-subtitle">Quick Answers</p>
          <AnimatedText
            as="h2"
            text="Plant Care FAQs"
            className="section-title"
            delay={0.1}
            stagger={0.05}
          />
          <AnimatedText
            as="p"
            text="Find answers to the most common questions about plant care"
            className="section-subtitle"
            delay={0.2}
          />
        </div>

        <div className="faqs-grid">
          {faqs.map((faq, index) => {
            const isOpen = openFAQs.includes(faq.id);
            const answerId = `faq-answer-${faq.id}`;
            return (
              <div key={faq.id} className={`faq-item ${isOpen ? 'active' : ''}`}>
                <button
                  className="faq-question"
                  onClick={() => toggleFAQ(faq.id)}
                  aria-expanded={isOpen}
                  aria-controls={answerId}
                >
                  <span className="question-number">{String(index + 1).padStart(2, '0')}</span>
                  <span className="question-text">{faq.question}</span>
                  <ChevronDown className={`chevron ${isOpen ? 'rotated' : ''}`} size={20} aria-hidden="true" />
                </button>

                {/* Always rendered; the grid-row trick animates height in CSS without measuring */}
                <div className="faq-answer" id={answerId} role="region" aria-hidden={!isOpen}>
                  <div className="answer-inner">
                    <div className="answer-content">
                      <p>{faq.answer}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="faqs-footer">
          <p>
            Still have questions? <Link href="/contact-us">Contact our plant experts</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
