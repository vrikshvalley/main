import { Instagram, Sprout, HandHeart, Recycle } from 'lucide-react';
import AnimatedText from '@/components/general/AnimatedText';
import InstagramEmbed from '@/components/Homepage/InstagramEmbed';
import '@/styles/aboutUs.scss';

const INSTAGRAM_POST = 'https://www.instagram.com/p/DRE4NyXk31s/';
const INSTAGRAM_PROFILE = 'https://www.instagram.com/vrikshvalley';

/**
 * About Us: story on the left, the latest Instagram post floating in a card on
 * the right over organic shapes. Server component; motion is the CSS
 * scroll-linked fade only. No fixed heights, so nothing can overflow.
 */
export default function About() {
  return (
    <section className="vv-about">
      <div className="vv-about__shapes" aria-hidden="true">
        <span className="vv-about__blob vv-about__blob--a" />
        <span className="vv-about__blob vv-about__blob--b" />
        <span className="vv-about__panel" />
      </div>

      <div className="vv-about__inner">
        <div className="vv-about__story scroll-fade">
          <p className="cursive-subtitle left">Our Roots</p>
          <AnimatedText as="h2" text="Grown with care, rooted in nature" className="vv-about__title" delay={0.1} stagger={0.05} />

          <p className="vv-about__lead">
            Vriksh Valley began with a simple thought: what if plants were not just decor, but daily
            companions that bring calm, balance and joy into every home, balcony and workspace?
          </p>
          <p>
            Today we are a community that celebrates growth in every form. From lush indoor plants and
            air purifiers to flowering varieties and garden essentials, every plant is handpicked, nurtured
            in our nursery and delivered with the same love we would give our own.
          </p>

          <ul className="vv-about__values">
            <li>
              <Sprout size={20} aria-hidden="true" />
              <span><strong>Nursery-grown</strong> and checked before it leaves us</span>
            </li>
            <li>
              <Recycle size={20} aria-hidden="true" />
              <span><strong>Eco-first</strong> packaging and sustainable planters</span>
            </li>
            <li>
              <HandHeart size={20} aria-hidden="true" />
              <span><strong>Real help</strong> long after your plant arrives</span>
            </li>
          </ul>

          <a className="vv-about__follow" href={INSTAGRAM_PROFILE} target="_blank" rel="noopener noreferrer">
            <Instagram size={18} aria-hidden="true" />
            Follow @vrikshvalley
          </a>
        </div>

        <div className="vv-about__post scroll-fade">
          <div className="vv-about__card">
            <InstagramEmbed url={INSTAGRAM_POST} caption="See this post on Instagram" />
          </div>
        </div>
      </div>
    </section>
  );
}
