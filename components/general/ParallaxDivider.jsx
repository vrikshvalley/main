'use client';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

export default function ParallaxDivider() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  
  const yBack = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const yFront = useTransform(scrollYProgress, [0, 1], [0, -40]);

  return (
    <div ref={ref} style={{ position: 'relative', height: '190px', marginTop: '0', marginBottom: '44px', overflow: 'hidden', pointerEvents: 'none', zIndex: 1 }}>
       {/* Background Bushes */}
       <motion.div style={{ y: yBack, position: 'absolute', bottom: '-6px', left: 0, width: '100%', opacity: 0.4 }} >
          <svg viewBox="0 0 1440 320" style={{ width: '100%', fill: '#073b22' }}>
              <path d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,261.3C960,256,1056,224,1152,197.3C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
       </motion.div>
       
       {/* Foreground Grass (Teal) */}
      <motion.div style={{ y: yFront, position: 'absolute', bottom: '-70px', left: 0, width: '100%' }}>
           <svg viewBox="0 0 1440 320" style={{ width: '100%', fill: '#1c9e5b' }}>
              <path d="M0,160L48,176C96,192,192,224,288,208C384,192,480,128,576,133.3C672,139,768,213,864,229.3C960,245,1056,203,1152,186.7C1248,171,1344,181,1392,186.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
           </svg>
       </motion.div>
    </div>
  )
}
