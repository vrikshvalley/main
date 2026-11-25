import Image from 'next/image';
import { Quote } from 'lucide-react';
import AnimatedText from '@/components/general/AnimatedText';
import { TESTIMONIALS as testimonialsData } from '@/lib/testimonials';
import '@/styles/testimonials.scss';


/**
 * Customer testimonials. Server component with one markup for every screen:
 * CSS-column masonry on desktop, a native scroll-snap carousel on phones.
 * No JS measuring, no resize listeners, no client-side layout swap.
 */
export default function Testimonials() {
  return (
    <section className="testimonials-section">
      <p className="cursive-subtitle">Community Love</p>
      <AnimatedText as="h2" text="What Our Customers Say" className="testimonials-title" delay={0.1} stagger={0.05} />
      <AnimatedText
        as="p"
        text="Don't just take our word for it. See what our plant-lover community has to say."
        className="testimonials-subtitle"
        delay={0.2}
      />

      <ul className="testimonials-track" aria-label="Customer testimonials">
        {testimonialsData.map((t) => (
          <li key={t.id} className="testimonial-card scroll-fade">
            <Quote className="quote-mark" size={28} aria-hidden="true" />
            <p className="testimonial-text">{t.text}</p>
            <div className="card-header">
              <Image src={t.avatar} alt="" width={44} height={44} sizes="44px" className="avatar" />
              <div className="user-info">
                <h3>{t.name}</h3>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <p className="testimonials-hint" aria-hidden="true">Swipe for more</p>
    </section>
  );
}
