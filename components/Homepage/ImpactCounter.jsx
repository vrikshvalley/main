'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion';
import { Droplets, Leaf, TreeDeciduous } from 'lucide-react';
import '@/styles/impactCounter.scss';

function Counter({ value, duration = 2 }) {
  const ref = useRef(null);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 80,
    stiffness: 60,
    restDelta: 0.001
  });
  const isInView = useInView(ref, { once: false, margin: "-50px" });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    } else {
      motionValue.set(0);
    }
  }, [motionValue, isInView, value]);

  useEffect(() => {
    const unsubscribe = springValue.on("change", (latest) => {
      setDisplayValue(Math.floor(latest));
    });
    
    return () => unsubscribe();
  }, [springValue]);

  return <span ref={ref}>{displayValue.toLocaleString()}</span>;
}

export default function ImpactCounter() {
  return (
    <section className="impact-counter">
      <div className="counter-container">
        <motion.div 
          className="section-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-title">Our Environmental Impact</h2>
          <p className="section-subtitle">
            Together, we're making a difference for our planet
          </p>
        </motion.div>

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
      </div>
    </section>
  );
}
