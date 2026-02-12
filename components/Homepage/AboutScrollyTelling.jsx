'use client';

import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { useRef } from 'react';

// Updated timeline per request; descriptions derived from tags/topics
const milestones = [
  { year: '2021', title: 'Hard Time with Tech', description: 'Struggled to get the tools and systems right — learning the ropes of e-commerce and operations.' },
  { year: '2022', title: 'First Seeds Planted', description: 'Small experiments and early orders planted the first seeds of the company.' },
  { year: '2023', title: 'A Vision Was Born', description: 'Clarified the mission and product focus — imagining how we could help more plant lovers.' },
  { year: '2025', title: 'Company Launched', description: 'We formally started operations and completed 100+ deliveries, gaining momentum.' },
  { year: '2026', title: 'Trying to Bloom', description: 'Growing carefully with the support of our customers — together we try to bloom.' }
];

export default function AboutScrollyTelling() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  // Smooth the progress for nicer animation
  const draw = useSpring(scrollYProgress, { stiffness: 80, damping: 24 });

  return (
    <section ref={containerRef} style={{ position: 'relative', padding: '5rem 1rem', overflow: 'hidden', backgroundColor: '#f9f9f9' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative' }}>
        <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '4rem', color: '#073b22' }}
        >
            Our Growth Journey
        </motion.h2>
        
        {/* Vertical connector: static light track + animated stroke that draws on scroll */}
        <div style={{ position: 'absolute', left: '50%', top: '150px', bottom: '0', width: '40px', transform: 'translateX(-50%)', pointerEvents: 'none' }}>
          <svg viewBox="0 0 4 1000" preserveAspectRatio="none" style={{ width: '4px', height: '100%', display: 'block', margin: '0 auto' }}>
            <path d="M2 0 L2 1000" stroke="#e0e0e0" strokeWidth="4" strokeLinecap="round" />
            <motion.path d="M2 0 L2 1000" stroke="#1c9e5b" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" style={{ pathLength: draw }} />
          </svg>
        </div>

        <div style={{ position: 'relative', zIndex: 10 }}>
          {milestones.map((item, index) => (
            <Milestone key={index} item={item} index={index} progress={scrollYProgress} total={milestones.length} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Milestone({ item, index, progress, total }) {
  const isEven = index % 2 === 0;
  // node trigger point along the progress (0..1)
  const nodeTrigger = total > 1 ? index / (total - 1) : 0;
  const activeRange = 0.06;
  const local = useTransform(progress, [Math.max(0, nodeTrigger - activeRange), Math.min(1, nodeTrigger + activeRange)], [0, 1]);
  const nodeScale = useSpring(useTransform(local, [0, 1], [0.75, 1.25]), { stiffness: 220, damping: 26 });

  return (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: '6rem', 
    flexDirection: isEven ? 'row' : 'row-reverse',
    position: 'relative'
  }}>
    {/* Content */}
    <motion.div 
      initial={{ opacity: 0, x: isEven ? -50 : 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6 }}
      style={{ 
        width: '40%', 
        padding: '2rem', 
        textAlign: isEven ? 'right' : 'left',
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
      }}
    >
      <span style={{ color: '#1c9e5b', fontWeight: 'bold', fontSize: '1.2rem', display: 'block', marginBottom: '0.5rem' }}>{item.year}</span>
      <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#073b22', marginBottom: '0.5rem' }}>{item.title}</h3>
      <p style={{ color: '#666', lineHeight: '1.6' }}>{item.description}</p>
    </motion.div>
        
    {/* Spacer */}
    <div style={{ width: '10%' }} />

    {/* Node/Flower */}
    <motion.div style={{ 
      position: 'absolute', left: '50%', top: '50%', 
      transform: 'translate(-50%, -50%)', 
      width: '20px', height: '20px', 
      background: '#fff', border: '4px solid #1c9e5b', 
      borderRadius: '50%', zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'center'
    }} animate={{ scale: nodeScale }} />
        
    {/* Empty side for balance */}
    <div style={{ width: '40%' }} />
  </div>
  );
}
