'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import '@/styles/knowYourPlants.scss';

const guides = [
  {
    id: 1,
    title: 'Light Guide',
    icon: '☀️',
    content: [
      {
        type: 'Full Sun',
        description: '6+ hours of direct sunlight daily',
        examples: 'Succulents, Cacti, Most flowering plants'
      },
      {
        type: 'Partial Sun/Shade',
        description: '3-6 hours of direct sunlight',
        examples: 'Ferns, Peace Lily, Snake Plant'
      },
      {
        type: 'Shade',
        description: 'Less than 3 hours of indirect light',
        examples: 'Pothos, ZZ Plant, Cast Iron Plant'
      }
    ]
  },
  {
    id: 2,
    title: 'Water Guide',
    icon: '💧',
    content: [
      {
        type: 'High Water',
        description: 'Keep soil consistently moist',
        examples: 'Ferns, Calathea, Peace Lily'
      },
      {
        type: 'Moderate Water',
        description: 'Water when top inch of soil is dry',
        examples: 'Pothos, Philodendron, Spider Plant'
      },
      {
        type: 'Low Water',
        description: 'Water when soil is mostly dry',
        examples: 'Succulents, Snake Plant, ZZ Plant'
      }
    ]
  },
  {
    id: 3,
    title: 'Temperature Guide',
    icon: '🌡️',
    content: [
      {
        type: 'Warm (24-30°C)',
        description: 'Tropical plants thrive in warmth',
        examples: 'Monstera, Rubber Plant, Croton'
      },
      {
        type: 'Moderate (18-24°C)',
        description: 'Most houseplants prefer this range',
        examples: 'Pothos, Peace Lily, Spider Plant'
      },
      {
        type: 'Cool (12-18°C)',
        description: 'Some plants prefer cooler temps',
        examples: 'English Ivy, Cyclamen, Christmas Cactus'
      }
    ]
  },
  {
    id: 4,
    title: 'Soil Guide',
    icon: '🌱',
    content: [
      {
        type: 'Well-Draining',
        description: 'Fast-draining mix for succulents',
        examples: 'Cacti, Succulents, Aloe'
      },
      {
        type: 'Standard Potting',
        description: 'All-purpose potting soil',
        examples: 'Most houseplants, Herbs'
      },
      {
        type: 'Moisture-Retaining',
        description: 'Mix that holds water longer',
        examples: 'Ferns, Tropical plants'
      }
    ]
  }
];

export default function KnowYourPlants() {
  const [openGuide, setOpenGuide] = useState(null);

  const toggleGuide = (id) => {
    setOpenGuide(openGuide === id ? null : id);
  };

  return (
    <section className="know-your-plants">
      <div className="section-header">
        <h2>Know Your Plants 🌿</h2>
        <p>Essential care guides to help your plants thrive</p>
      </div>

      <div className="guides-container">
        {guides.map((guide) => (
          <motion.div
            key={guide.id}
            className={`guide-card ${openGuide === guide.id ? 'active' : ''}`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.5, delay: guide.id * 0.1 }}
          >
            <div
              className="guide-header"
              onClick={() => toggleGuide(guide.id)}
            >
              <div className="guide-title">
                <span className="icon">{guide.icon}</span>
                <h3>{guide.title}</h3>
              </div>
              <motion.div
                className="chevron"
                animate={{ rotate: openGuide === guide.id ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown size={24} />
              </motion.div>
            </div>

            <AnimatePresence>
              {openGuide === guide.id && (
                <motion.div
                  className="guide-content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                  <div className="content-inner">
                    {guide.content.map((item, index) => (
                      <div key={index} className="care-item">
                        <h4>{item.type}</h4>
                        <p className="description">{item.description}</p>
                        <p className="examples">
                          <strong>Examples:</strong> {item.examples}
                        </p>
                        {/* Placeholder for image */}
                        <div className="image-placeholder">
                          Image coming soon 🖼️
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
