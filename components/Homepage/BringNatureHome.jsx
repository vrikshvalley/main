import Image from 'next/image';
import Link from 'next/link';
import AnimatedText from '@/components/general/AnimatedText';
import '@/styles/bringNatureHome.scss';

/**
 * "Bring Nature Home": story block. Server component; the only motion is the
 * CSS scroll-linked fade (.scroll-fade) and AnimatedText's one-time reveal.
 */
export default function BringNatureHome() {
  return (
    <section className="bring-nature-home">
      <div className="content-container">
        <div className="content-wrapper scroll-fade">
          <p className="cursive-subtitle left">Garden Living</p>
          <h2>
            Bring nature home, <span className="highlight">one leaf at a time</span>
          </h2>
          <AnimatedText
            as="p"
            className="lead"
            text="We don't just deliver plants. We bring the essence of nature into your life. Each plant is handpicked, nurtured with care and packed with the freshness of earth."
            delay={0.1}
          />
          <AnimatedText
            as="p"
            text="From lush greens to vibrant blooms, let nature breathe life into your space. Every leaf tells a story, and yours is just beginning."
            delay={0.2}
          />
          <ul className="nature-points">
            <li>Handpicked</li>
            <li>Nurtured with care</li>
            <li>Packed fresh</li>
          </ul>
          <Link href="/products" className="nature-cta">
            Start your green story
          </Link>
        </div>

        <figure className="image-card scroll-fade">
          <div className="image-arch">
            <Image
              src="/sections/bringNature.webp"
              alt="Potted plants arranged in a bright corner of a home"
              fill
              sizes="(max-width: 768px) 90vw, 480px"
              className="nature-image"
            />
          </div>
          <figcaption className="nature-quote">
            “Nature is not a place to visit. It is home.”
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
