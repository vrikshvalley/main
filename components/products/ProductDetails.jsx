import Image from 'next/image';
import { Droplets, Sun, Thermometer, CloudDrizzle, Shovel, Scissors, Sprout, Leaf, Star } from 'lucide-react';
import { parseCareDetails } from '@/lib/productCare';
import { getReviews, getReviewSummary } from '@/lib/reviews';
import '@/styles/pdp.scss';

const CARE_ICONS = {
  water: Droplets,
  light: Sun,
  temperature: Thermometer,
  humidity: CloudDrizzle,
  soil: Shovel,
  pruning: Scissors,
  feeding: Sprout,
};

/**
 * Everything below the buy box: about, care guide, what's in the box, specs
 * and (for plants) the light guide. Server component, no tabs, so all of it is
 * readable and indexable without clicks.
 */
export default function ProductDetails({ product }) {
  if (!product) return null;

  const care = parseCareDetails(product.additionalDetails);
  const box = (product.whatsInTheBox || '').split(/[,|]/).map((s) => s.trim()).filter(Boolean);
  const subcats = (product.subcategories || []).filter((s) => s && s !== '-');
  const isPlant = String(product.category || '').toLowerCase() === 'plants';
  const reviews = getReviews(product.slug);
  const summary = getReviewSummary(product.slug);

  // The short blurb is often the first sentence of the long description: avoid repeating it.
  const blurb = (product.knowAboutProduct || '').trim();
  const longDesc = (product.description || '').trim();
  const aboutParagraphs = longDesc && blurb && longDesc.startsWith(blurb.slice(0, 60))
    ? [longDesc]
    : [blurb, longDesc].filter(Boolean);

  const specs = [
    ['Category', product.category],
    ['Type', subcats.join(', ')],
    ['Pot size', (product.sizes || []).filter(Boolean).join(', ') || product.size],
    ['Colour', product.color],
    ['Maintenance', product.maintenanceLevel],
    ['Pets', product.petFriendly],
  ].filter(([, v]) => v);

  return (
    <section className="pdp-details" aria-labelledby="pdp-details-title">
      <h2 id="pdp-details-title" className="pdp-details-title">
        Getting to know your {product.name}
      </h2>

      <div className="pdp-details-grid">
        <div className="pdp-card pdp-card--about">
          <h3>About this {isPlant ? 'plant' : 'product'}</h3>
          {aboutParagraphs.map((text) => (
            <p key={text.slice(0, 24)}>{text}</p>
          ))}

          {specs.length > 0 && (
            <dl className="pdp-specs">
              {specs.map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          )}

          {box.length > 0 && (
            <>
              <h4>What&apos;s in the box</h4>
              <ul className="pdp-box">
                {box.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </>
          )}
        </div>

        {care.length > 0 && (
          <div className="pdp-card pdp-card--care">
            <h3>Care guide</h3>
            <ul className="pdp-care">
              {care.map((row, i) => {
                const Icon = CARE_ICONS[row.key] || Leaf;
                return (
                  <li key={i}>
                    <span className="pdp-care-icon"><Icon size={18} aria-hidden="true" /></span>
                    <div>
                      {row.label && <strong>{row.label}</strong>}
                      <span>{row.value}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      {summary && (
        <div className="pdp-reviews" id="reviews">
          <div className="pdp-reviews-head">
            <h3>What customers say</h3>
            <p className="pdp-reviews-score">
              <strong>{summary.average.toFixed(1)}</strong>
              <span className="pdp-stars" aria-hidden="true">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star key={n} size={18} fill={n <= Math.round(summary.average) ? 'currentColor' : 'none'} />
                ))}
              </span>
              <span>{summary.count} {summary.count === 1 ? 'review' : 'reviews'}</span>
            </p>
          </div>
          <ul className="pdp-review-list">
            {reviews.map((r, i) => (
              <li key={i} className="pdp-review">
                <span className="pdp-stars" aria-label={`${r.rating} out of 5`}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star key={n} size={15} fill={n <= r.rating ? 'currentColor' : 'none'} aria-hidden="true" />
                  ))}
                </span>
                {r.text && <p>{r.text}</p>}
                <footer>
                  <strong>{r.name}</strong>
                  {r.source && <span className="pdp-review-source">{r.source} customer</span>}
                  {r.date && <time dateTime={r.date}>{new Date(r.date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</time>}
                </footer>
              </li>
            ))}
          </ul>
        </div>
      )}

      {isPlant && (
        <figure className="pdp-light">
          <div className="pdp-light-img">
            <Image
              src="/sections/lightGuide.webp"
              alt="Illustrated room showing which plants suit direct, bright indirect, medium and low light"
              width={800}
              height={800}
              sizes="(max-width: 768px) 90vw, 420px"
            />
          </div>
          <figcaption>
            <h3>Find the right spot</h3>
            <p>
              Light is the biggest factor in how well a plant does. Match the light in your room to the
              plant&apos;s needs above: bright indirect light near a window, medium light a few steps back, low
              light in corners and hallways.
            </p>
          </figcaption>
        </figure>
      )}
    </section>
  );
}
