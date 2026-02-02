'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion';
import { Droplets, Leaf, TreeDeciduous } from 'lucide-react';
import '@/styles/impactCounter.scss';

function Counter({ value }) {
  const ref = useRef(null);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 80,
    stiffness: 60,
    restDelta: 0.001
  });
  const isInView = useInView(ref, { once: false, margin: "-50px" });
  const [displayValue, setDisplayValue] = useState(0);
  const [randomOffset] = useState(() => Math.floor(Math.random() * 9) + 1);
  const targetValue = value + randomOffset;

  useEffect(() => {
    if (isInView) {
      motionValue.set(targetValue);
    } else {
      motionValue.set(0);
    }
  }, [motionValue, isInView, targetValue]);

  useEffect(() => {
    const unsubscribe = springValue.on("change", (latest) => {
      setDisplayValue(Math.floor(latest));
    });
    
    return () => unsubscribe();
  }, [springValue]);

  return <span ref={ref}>{displayValue.toLocaleString()}</span>;
}

export default function ImpactCounter({ variant = 'default', showHeader = true }) {
  const isCompact = variant === 'compact';
  const showImpactHeader = showHeader && variant !== 'hero';

  return (
    <section className={`impact-counter impact-${variant}`}>
      <div className="counter-container">
        {showHeader && variant === 'hero' && (
          <motion.div 
            className="section-header"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="section-title">Our Impact</h1>
          </motion.div>
        )}
        {showImpactHeader && (
          <motion.div 
            className="section-header"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="section-title">Our Environmental Impact</h1>
            <p className="section-subtitle">
              Together, we're making a difference for our planet
            </p>
          </motion.div>
        )}

        {isCompact ? (
          <motion.div
            className="compact-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.6 }}
          >
            <div className="compact-item">
              <div className="icon-wrapper water">
                <Droplets size={28} />
              </div>
              <div className="counter-value">
                <Counter value={500} />
                <span className="unit">L</span>
              </div>
              <span className="label">Water Saved</span>
            </div>
            <div className="compact-item">
              <div className="icon-wrapper organic">
                <Leaf size={28} />
              </div>
              <div className="counter-value">
                <Counter value={10} />
                <span className="unit">kg</span>
              </div>
              <span className="label">Organic Waste</span>
            </div>
            <div className="compact-item">
              <div className="icon-wrapper trees">
                <TreeDeciduous size={28} />
              </div>
              <div className="counter-value">
                <Counter value={1000} />
                <span className="unit">+</span>
              </div>
              <span className="label">Trees Planted</span>
            </div>
          </motion.div>
        ) : (
          <div className="counters-grid">
            <motion.div 
              className="counter-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="icon-wrapper water">
                <Droplets size={40} />
              </div>
              <div className="counter-content">
                <div className="counter-value">
                  <Counter value={500} />
                  <span className="unit">L</span>
                </div>
                <h3>Water Saved</h3>
                <p>Through sustainable practices</p>
              </div>
            </motion.div>

            <motion.div 
              className="counter-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="icon-wrapper organic">
                <Leaf size={40} />
              </div>
              <div className="counter-content">
                <div className="counter-value">
                  <Counter value={10} />
                  <span className="unit">kg</span>
                </div>
                <h3>Organic Waste Composted</h3>
                <p>Turning waste into nutrients</p>
              </div>
            </motion.div>

            <motion.div 
              className="counter-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="icon-wrapper trees">
                <TreeDeciduous size={40} />
              </div>
              <div className="counter-content">
                <div className="counter-value">
                  <Counter value={1000} />
                  <span className="unit">+</span>
                </div>
                <h3>New Trees Planted</h3>
                <p>Growing a greener future</p>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </section>
  );
}
