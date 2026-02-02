'use client';

import { motion } from 'framer-motion';
import '@/styles/animatedText.scss';

export default function AnimatedText({
  text,
  as = 'p',
  className = '',
  delay = 0,
  stagger = 0.04,
  duration = 0.5,
  viewport = { once: false, amount: 0.2 }
}) {
  const words = String(text).split(' ');
  const MotionTag = motion[as] || motion.p;

  const container = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay,
        staggerChildren: stagger
      }
    }
  };

  const child = {
    hidden: { opacity: 0, y: 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration, ease: [0.22, 1, 0.36, 1] }
    }
  };

  return (
    <MotionTag
      className={`animated-text ${className}`}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
    >
      {words.map((word, index) => (
        <motion.span className="word" variants={child} key={`${word}-${index}`}>
          {word}
          {index < words.length - 1 ? '\u00A0' : ''}
        </motion.span>
      ))}
    </MotionTag>
  );
}
