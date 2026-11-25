import Image from 'next/image';
import Link from 'next/link';
import { Star, Quote, Leaf } from 'lucide-react';
import WhatsAppGlyph from '@/components/general/WhatsAppGlyph';
import { TESTIMONIALS } from '@/lib/testimonials';
import '@/styles/testimonialsPage.scss';

// Client-provided figures
const STATS = [
  { value: '500+', label: 'Happy Customers' },
  { value: '4.9', label: 'Average Rating', stars: 4.9 },
  { value: '98%', label: 'Satisfaction Rate' },
];

const STORY_LINK = `https://wa.me/919204745612?text=${encodeURIComponent("Hi! I'd like to share how my plant from Vriksh Valley is doing.")}`;

function Stars({ value, size = 16 }) {
  return (
    <span className="tp-stars" role="img" aria-label={`${value} out of 5 stars`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Star key={i} size={size} fill={i < Math.round(value) ? 'currentColor' : 'none'} aria-hidden="true" />
      ))}
    </span>
  );
}

/**
 * Testimonials: a hero with the client-provided stats,
 * one featured quote, then every review in a calm masonry wall.
 * Server component; the only motion is the shared CSS reveal.
 */
export default function TestimonialsPage() {
  const [featured, ...rest] = TESTIMONIALS;

  return (
    <main className="tp">
      <section className="tp-hero">
        <div className="tp-hero__glow" aria-hidden="true" />
        <p className="tp-eyebrow">Community love</p>
        <h1>
          What Our <span>Customers Say</span>
        </h1>
        <p className="tp-hero__lead">Real stories from real plant lovers who trust Vriksh Valley</p>

        <ul className="tp-stats">
          {STATS.map((s) => (
            <li key={s.label}>
              <strong>{s.value}</strong>
              {s.stars && <Stars value={s.stars} size={14} />}
              <span>{s.label}</span>
            </li>
          ))}
        </ul>
      </section>

      <p className="tp-intro reveal">
        <Quote size={28} aria-hidden="true" />
        Don&apos;t just take our word for it—see what our plant lover community has to say. Every review represents a
        home transformed, a plant thriving, and a customer delighted.
      </p>

      {featured && (
        <figure className="tp-featured reveal">
          <Quote className="tp-featured__mark" size={56} aria-hidden="true" />
          <blockquote>{featured.text}</blockquote>
          <figcaption>
            <Image src={featured.avatar} alt="" width={56} height={56} className="tp-avatar" />
            <span>
              <strong>{featured.name}</strong>
              <Stars value={featured.rating} size={14} />
            </span>
          </figcaption>
        </figure>
      )}

      <ul className="tp-wall" aria-label="All customer reviews">
        {rest.map((t, i) => (
          <li key={t.id} className={`tp-card reveal${i % 5 === 1 ? ' tp-card--tint' : ''}`}>
            <Stars value={t.rating} size={15} />
            <p>{t.text}</p>
            <div className="tp-card__who">
              <Image src={t.avatar} alt="" width={42} height={42} className="tp-avatar" />
              <strong>{t.name}</strong>
            </div>
          </li>
        ))}
      </ul>

      <section className="tp-cta reveal">
        <Leaf size={28} aria-hidden="true" />
        <h2>Join Our Happy Plant Family!</h2>
        <p>Experience the Vriksh Valley difference for yourself</p>
        <div className="tp-cta__actions">
          <Link href="/products" className="tp-btn tp-btn--light">
            Shop Now
          </Link>
          <a href={STORY_LINK} target="_blank" rel="noopener noreferrer" className="tp-btn tp-btn--ghost">
            <WhatsAppGlyph size={18} /> Share your story
          </a>
        </div>
      </section>
    </main>
  );
}
