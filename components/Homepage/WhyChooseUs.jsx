'use client';

import { useEffect, useRef } from 'react';
import { Sprout, Package, HeartHandshake, Sparkles, Recycle, Leaf } from 'lucide-react';
import AnimatedText from '@/components/general/AnimatedText';
import { observeOnce } from '@/lib/inView';
import '@/styles/whyChooseUs.scss';

const ITEMS = [
  { icon: Sprout, title: 'Healthy, thriving plants', text: 'Grown responsibly and checked before they leave us.' },
  { icon: Package, title: 'Eco-friendly packaging', text: 'Compostable boxes and minimal plastic.' },
  { icon: HeartHandshake, title: 'Expert guidance', text: 'Real help for every plant parent, before and after you buy.' },
  { icon: Sparkles, title: 'Thoughtfully curated', text: 'Products chosen to bring a little green calm home.' },
  { icon: Recycle, title: 'Sustainable materials', text: 'Planters and accessories that are kind to the planet.' },
  { icon: Leaf, title: 'Rooted in tradition', text: 'Traditional wisdom meets modern sustainability.' },
];

export default function WhyChooseUs() {
  const gridRef = useRef(null);
  useEffect(() => observeOnce(gridRef.current), []);

  return (
    <section className="why-choose-us">
      <div className="why-choose-header">
        <p className="cursive-subtitle">Why Vriksh Valley</p>
        <AnimatedText as="h2" text="Why Choose Us" className="why-choose-title" delay={0.1} stagger={0.05} />
        <AnimatedText
          as="p"
          text="Small details that make a big difference for your green space"
          className="why-choose-subtitle"
          delay={0.2}
        />
      </div>

      <ul className="why-grid" ref={gridRef}>
        {ITEMS.map(({ icon: Icon, title, text }, i) => (
          <li className="why-card" key={title} style={{ '--i': i }}>
            <span className="why-icon" aria-hidden="true">
              <Icon size={26} strokeWidth={1.8} />
            </span>
            <h3>{title}</h3>
            <p>{text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
