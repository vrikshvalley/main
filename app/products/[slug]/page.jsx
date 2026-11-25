import { cache } from 'react';
import { jsonLd as toJsonLd } from "@/lib/jsonLd";
import { notFound } from 'next/navigation';
import { getProductBySlug, getRelatedProducts } from '@/lib/productHelpers';
import ProductPage from '@/components/products/ProductPage';
import ProductDetails from '@/components/products/ProductDetails';
import RelatedProducts from '@/components/products/RelatedProducts';
import Ads from '@/components/general/Ads';
import WhyChooseUs from '@/components/products/WhyChooseUs';
import { priceWithOffer } from '@/lib/offers';
import { getReviewSummary } from '@/lib/reviews';

// Re-fetch product data at most every 30 seconds so stock stays fresh.
export const revalidate = 30;

const SITE = 'https://vrikshvalley.com';

// One Firestore read per request, shared by generateMetadata and the page.
const loadProduct = cache(async (slug) => {
  const product = await getProductBySlug(slug);
  // Firestore data must be plain JSON before it is handed to client components.
  return product ? JSON.parse(JSON.stringify(product)) : null;
});

const firstImage = (p) => {
  const img = p?.images?.[0];
  return typeof img === 'string' ? img : img?.src || img?.url || null;
};

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await loadProduct(slug);
  if (!product) return { title: 'Product not found' };

  const description = String(product.knowAboutProduct || product.description || `Buy ${product.name} online from Vriksh Valley.`)
    .replace(/\s+/g, ' ')
    .slice(0, 158);
  const image = firstImage(product);

  return {
    title: product.name,
    description,
    alternates: { canonical: `/products/${slug}` },
    openGraph: {
      type: 'website',
      title: `${product.name} | Vriksh Valley`,
      description,
      url: `${SITE}/products/${slug}`,
      images: image ? [{ url: image, alt: product.name }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} | Vriksh Valley`,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ProductDetailPage({ params }) {
  const { slug } = await params;
  const product = await loadProduct(slug);
  if (!product) notFound();

  const related = JSON.parse(
    JSON.stringify(await getRelatedProducts(product.category, product.id, 8).catch(() => []))
  );

  const stock = Number(product.stock ?? product.quantity ?? 0);
  const { price: salePrice, offer } = priceWithOffer(product);
  const summary = getReviewSummary(slug);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.knowAboutProduct || product.description || undefined,
    image: (product.images || []).map((i) => (typeof i === 'string' ? i : i?.src || i?.url)).filter(Boolean),
    category: product.category,
    brand: { '@type': 'Brand', name: 'Vriksh Valley' },
    url: `${SITE}/products/${slug}`,
    ...(product.priceOnCustomization
      ? {}
      : {
          offers: {
            '@type': 'Offer',
            priceCurrency: 'INR',
            price: salePrice || undefined,
            ...(offer ? { priceValidUntil: offer.endsAt.slice(0, 10) } : {}),
            availability: stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            url: `${SITE}/products/${slug}`,
          },
        }),
    ...(summary
      ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: summary.average, reviewCount: summary.count, bestRating: 5 } }
      : {}),
  };

  return (
    <div className="pdp-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: toJsonLd(jsonLd) }} />

      <ProductPage product={product} />
      <ProductDetails product={product} />

      <RelatedProducts category={product.category} currentProductId={product.id} products={related} />

      <div className="ads-banner">
        <Ads items={['Bring nature home, one leaf at a time']} bgColor="dark" textColor="light" speed={15} />
      </div>
      <WhyChooseUs />
    </div>
  );
}
