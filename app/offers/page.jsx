import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import ProductListCard from '@/components/products/ProductListCard';
import OfferCountdown from '@/components/general/OfferCountdown';
import { getProducts } from '@/lib/services/productService';
import { getActiveOffers, offerMatchesProduct, getOfferForProduct } from '@/lib/offers';
import '@/styles/products.scss';
import '@/styles/offers.scss';

// Prices and offer windows stay fresh without a database read per visit.
export const revalidate = 300;

const PER_OFFER = 8;

/**
 * Offers page. Every offer, countdown and discounted price here comes from
 * lib/offers.js, the same source the product pages, cart and checkout use.
 */
export default async function OffersPage() {
  const offers = getActiveOffers();

  let catalogue = [];
  if (offers.length) {
    const { data } = await getProducts({ pageSize: 1000, sortBy: 'featured' });
    catalogue = JSON.parse(JSON.stringify(data || []));
  }

  // A product appears under the offer that actually applies to it (its best one),
  // so the same plant is not listed twice at two different prices.
  const sections = offers
    .map((offer) => {
      const products = catalogue.filter(
        (p) => offerMatchesProduct(offer, p) && getOfferForProduct(p)?.id === offer.id && Number(p.stock ?? p.quantity ?? 0) > 0
      );
      return { offer, products: products.slice(0, PER_OFFER), total: products.length };
    })
    .filter((s) => s.total > 0);

  const best = offers.reduce((m, o) => Math.max(m, o.discountPercent), 0);

  return (
    <div className="offers-page">
      <header className="offers-hero">
        <p className="offers-eyebrow">Limited-time offers</p>
        <h1>
          Save up to <span>{best}%</span> on plants, planters and seeds
        </h1>
        <p className="offers-sub">
          Offer prices apply automatically on the product page, in your cart and when you order on WhatsApp.
        </p>
        <OfferCountdown variant="banner" />
      </header>

      {sections.length > 0 ? (
        <>
          <nav className="offers-jump" aria-label="Jump to an offer">
            {sections.map(({ offer, total }) => (
              <a key={offer.id} href={`#${offer.id}`} className="offers-chip">
                <strong>{offer.badge}</strong>
                {offer.title}
                <span>{total}</span>
              </a>
            ))}
          </nav>

          {sections.map(({ offer, products, total }) => (
            <section key={offer.id} id={offer.id} className="offer-block" aria-labelledby={`${offer.id}-title`}>
              <div className="offer-block-head">
                <div>
                  <span className="offer-block-badge">{offer.badge}</span>
                  <h2 id={`${offer.id}-title`}>{offer.title}</h2>
                  <p>{offer.tagline}</p>
                </div>
                <OfferCountdown variant="card" offerId={offer.id} label="Offer" />
              </div>

              <div className="offer-grid">
                {products.map((product) => (
                  <ProductListCard key={product.id} product={product} viewMode="grid" />
                ))}
              </div>

              {total > products.length && (
                <Link
                  className="offer-more"
                  href={
                    offer.match?.category
                      ? `/category/${offer.match.category.toLowerCase().replace(/\s+/g, '-')}`
                      : offer.match?.featured
                        ? '/products?filter=featured'
                        : '/premium-collection'
                  }
                >
                  See all {total} products in this offer <ArrowRight size={18} aria-hidden="true" />
                </Link>
              )}
            </section>
          ))}
        </>
      ) : (
        <div className="offers-empty">
          <h2>New offers are on their way</h2>
          <p>There are no offers running right now. Browse the full collection in the meantime.</p>
          <Link href="/products" className="offer-more">
            Shop all plants <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      )}
    </div>
  );
}
