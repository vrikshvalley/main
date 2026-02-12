'use client';

import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import '@/styles/scrollProgress.scss';

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });
  
  const flowerOpacity = useTransform(scrollYProgress, [0.85, 1], [0, 1]);
  const flowerScale = useTransform(scrollYProgress, [0.85, 1], [0, 1.2]);
  const rotate = useTransform(scrollYProgress, [0.9, 1], [0, 360]);

  return (
    <div className="growing-stem-container">
       <div className="seed-top" title="Start" />
       <motion.div 
         className="stem-fill"
         style={{ scaleY }}
       />
       <motion.div 
          className="flower-bottom"
          style={{ opacity: flowerOpacity, scale: flowerScale, rotate }}
       >
         🌸
       </motion.div>
    </div>
  );
}