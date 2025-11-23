'use client';
import { useState, useEffect } from 'react';
import { motion, useMotionValue, animate } from 'framer-motion';
import useMeasure from 'react-use-measure';
import '@/styles/whyChooseUs.scss';

const FAST_DURATION = 25;
const SLOW_DURATION = 75;

export default function WhyChooseUs() {
  const [duration, setDuration] = useState(FAST_DURATION);
  const [mustFinish, setMustFinish] = useState(false);
  const [rerender, setRerender] = useState(false);
  
  const [ref, { width }] = useMeasure();
  const xTranslation = useMotionValue(0);

  const items = [
    { emoji: '🌱', text: 'Healthy and Thriving Plants - Grown Responsibly' },
    { emoji: '📦', text: 'Environment Friendly Packaging - Minimal Plastic' },
    { emoji: '👨‍🌾', text: 'Expert Guidance & Support for Plant Parents' },
    { emoji: '✨', text: 'Thoughtfully Curated Products for Green Calm' },
    { emoji: '♻️', text: 'Sustainable Materials Kind to the Planet' },
    { emoji: '🌿', text: 'Traditional Wisdom Meets Modern Sustainability' },
  ];

  useEffect(() => {
    let controls;
    const gap = 32; // 2rem = 32px
    let finalPosition = -width / 2 - gap;

    if (mustFinish) {
      const currentPosition = xTranslation.get();
      const progressRatio = Math.abs(currentPosition / finalPosition);
      
      controls = animate(xTranslation, [currentPosition, finalPosition], {
        ease: "linear",
        duration: duration * (1 - progressRatio),
        onComplete: () => {
          setMustFinish(false);
          setRerender(!rerender);
        },
      });
    } else {
      controls = animate(xTranslation, [0, finalPosition], {
        ease: "linear",
        duration: duration,
        repeat: Infinity,
        repeatType: "loop",
        repeatDelay: 0,
      });
    }

    return () => controls?.stop();
  }, [xTranslation, width, duration, mustFinish, rerender]);

  return (
    <section className="why-choose-us">
      <div className="scroll-container">
        <motion.div 
          className="scroll-content"
          ref={ref}
          style={{ x: xTranslation }}
          onHoverStart={() => {
            setMustFinish(true);
            setDuration(SLOW_DURATION);
          }}
          onHoverEnd={() => {
            setMustFinish(true);
            setDuration(FAST_DURATION);
          }}
        >
          {/* Render items 4 times for large screens */}
          {[...items, ...items, ...items, ...items].map((item, idx) => (
            <div className="why-item" key={idx}>
              <span className="emoji">{item.emoji}</span>
              <p>{item.text}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
