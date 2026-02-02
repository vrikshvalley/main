'use client';
import { useState, useEffect } from 'react';
import { motion, useMotionValue, animate } from 'framer-motion';
import useMeasure from 'react-use-measure';
import AnimatedText from '@/components/general/AnimatedText';
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
      <motion.div
        className="why-choose-header"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.2 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="cursive-subtitle">Why Vriksh Valley</p>
        <AnimatedText
          as="h2"
          text="Why Choose Us"
          className="why-choose-title"
          delay={0.1}
          stagger={0.05}
        />
        <AnimatedText
          as="p"
          text="Small details that make a big difference for your green space"
          className="why-choose-subtitle"
          delay={0.2}
          stagger={0.02}
        />
      </motion.div>

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
