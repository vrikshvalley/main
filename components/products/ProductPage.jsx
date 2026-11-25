'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useDispatch } from 'react-redux';
import {
  Droplets, Sun, Thermometer, CloudDrizzle, Sprout, PawPrint, AlertTriangle,
  Minus, Plus, ShoppingBag, PackageCheck, Leaf, HeartHandshake, ChevronRight, Star,
} from 'lucide-react';
import { addItem } from '@/lib/slices/cartSlice';
import { showSuccessToast } from '@/lib/toastHelpers';
import { careHighlights } from '@/lib/productCare';
import { priceWithOffer } from '@/lib/offers';
import { getReviewSummary } from '@/lib/reviews';
import WishlistButton from '@/components/general/WishlistButton';
import OfferCountdown from '@/components/general/OfferCountdown';
import '@/styles/pdp.scss';
import '@/styles/wishlistButton.scss';

const WHATSAPP_NUMBER = '919204745612';
const LOW_STOCK_THRESHOLD = 10;

const FACT_ICONS = {
  light: Sun,
  water: Droplets,
  temperature: Thermometer,
  humidity: CloudDrizzle,
  care: Sprout,
  pet: PawPrint,
  petWarn: AlertTriangle,
};

const imgSrc = (img) => (typeof img === 'string' ? img : img?.src || img?.url || '');

// A variant/size/colour picker is only worth showing when there is a real choice.
const isPlaceholderLabel = (label) => !label || /^(option|default)$/i.test(String(label).trim());

function Gallery({ images, name, product }) {
  const trackRef = useRef(null);
  const [active, setActive] = useState(0);

  // Track which slide is centred (native scroll-snap, no carousel library)
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        setActive(Math.round(track.scrollLeft / track.clientWidth));
      });
    };
    track.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      track.removeEventListener('scroll', onScroll);
    };
  }, []);

  const goTo = (i) => {
    const track = trackRef.current;
    if (track) track.scrollTo({ left: i * track.clientWidth, behavior: 'smooth' });
  };

  return (
    <div className="pdp-gallery">
      <div className="pdp-stage">
        <WishlistButton product={product} />
        <div className="pdp-track" ref={trackRef} tabIndex={0} aria-label={`${name} photos`}>
          {images.map((src, i) => (
            <div className="pdp-slide" key={i} aria-hidden={i !== active}>
              <Image
                src={src}
                alt={i === 0 ? name : `${name}, photo ${i + 1}`}
                fill
                sizes="(max-width: 900px) 100vw, 560px"
                quality={85}
                priority={i === 0}
              />
            </div>
          ))}
        </div>
        {images.length > 1 && (
          <div className="pdp-dots" aria-hidden="true">
            {images.map((_, i) => (
              <span key={i} className={i === active ? 'is-active' : ''} />
            ))}
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="pdp-thumbs" role="tablist" aria-label="Choose photo">
          {images.map((src, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={`Photo ${i + 1}`}
              className={`pdp-thumb ${i === active ? 'is-active' : ''}`}
              onClick={() => goTo(i)}
            >
              <Image src={src} alt="" fill sizes="80px" quality={60} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProductPage({ product, variant = 'page' }) {
  const dispatch = useDispatch();
  const ctaRef = useRef(null);
  const isQuickview = variant === 'quickview';

  const sizes = (product?.sizes || []).filter(Boolean);
  const colors = (product?.colors || []).filter(Boolean);
  const variants = (product?.variants || []).filter((v) => !/^default$/i.test(v.label || v.name || ''));

  const [selectedSize, setSelectedSize] = useState(sizes[0] || null);
  const [selectedColor, setSelectedColor] = useState(colors[0] || null);
  const [selectedVariant, setSelectedVariant] = useState(variants[0] || null);
  const [quantity, setQuantity] = useState(1);
  const [expanded, setExpanded] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);

  useEffect(() => {
    setSelectedSize(sizes[0] || null);
    setSelectedColor(colors[0] || null);
    setSelectedVariant(variants[0] || null);
    setQuantity(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id]);

  // Phones: show a sticky buy bar once the main buttons scroll out of view
  useEffect(() => {
    if (isQuickview || !ctaRef.current) return;
    const io = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      { threshold: 0 }
    );
    io.observe(ctaRef.current);
    return () => io.disconnect();
  }, [isQuickview]);

  // While the sticky bar is up, move the floating buttons out of its way
  useEffect(() => {
    if (isQuickview) return;
    document.body.classList.toggle('pdp-bar-open', showStickyBar);
    return () => document.body.classList.remove('pdp-bar-open');
  }, [showStickyBar, isQuickview]);

  if (!product) return null;

  const images = (product.images || []).map(imgSrc).filter(Boolean);
  if (images.length === 0) images.push('/logo.webp');

  const stock = Number(product.stock ?? product.quantity ?? 0);
  const inStock = stock > 0;
  const lowStock = inStock && stock < LOW_STOCK_THRESHOLD;
  const maxQty = inStock ? Math.min(50, Math.max(1, stock)) : 1;

  // Regular price for the chosen option, then the running offer (lib/offers.js) if any
  const regularPrice = Number(selectedVariant?.price ?? product.price ?? 0);
  const { price, offer } = priceWithOffer(product, regularPrice);
  const mrp = Number(product.mrp ?? product.compareAtPrice ?? product.originalPrice);
  const refPrice = offer ? regularPrice : mrp;
  const showRefPrice = Number.isFinite(refPrice) && refPrice > price;
  const saving = showRefPrice ? Math.round((1 - price / refPrice) * 100) : 0;
  const reviewSummary = getReviewSummary(product.slug);

  const facts = careHighlights(product);
  const description = product.knowAboutProduct || product.description || '';
  const boxItems = (product.whatsInTheBox || '').split(/[,|]/).map((s) => s.trim()).filter(Boolean);

  const showSizes = sizes.length > 1;
  const showColors = colors.length > 1;
  const showVariants = variants.length > 1 || (variants.length === 1 && !isPlaceholderLabel(variants[0].label || variants[0].name));
  const fixedSize = !showSizes && sizes[0];

  const optionSummary = [
    selectedSize && `Size: ${selectedSize}`,
    selectedColor && `Colour: ${selectedColor}`,
    selectedVariant && !isPlaceholderLabel(selectedVariant.label || selectedVariant.name) && `Option: ${selectedVariant.label || selectedVariant.name}`,
  ].filter(Boolean);

  const orderOnWhatsApp = () => {
    const link = typeof window !== 'undefined' ? `${window.location.origin}/products/${product.slug}` : '';
    const lines = [
      product.priceOnCustomization ? "Hi, I'd like a quote for:" : "Hi, I'd like to order:",
      '',
      `${product.name}`,
      ...optionSummary,
      `Quantity: ${quantity}`,
      product.priceOnCustomization ? null : `Price: ₹${price * quantity}${offer ? ` (${offer.title} offer, ${offer.discountPercent}% off)` : ''}`,
      link,
    ].filter((l) => l !== null);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener,noreferrer');
  };

  const addToCart = () => {
    dispatch(
      addItem({
        id: product.id,
        slug: product.slug || null,
        name: product.name,
        price,
        regularPrice: offer ? regularPrice : null,
        offerBadge: offer ? offer.badge : null,
        image: images[0],
        qty: quantity,
        quantity,
        color: selectedColor,
        size: selectedSize,
        variant: isPlaceholderLabel(selectedVariant?.label || selectedVariant?.name) ? null : selectedVariant?.label || selectedVariant?.name,
      })
    );
    showSuccessToast(`${product.name} added to your cart`);
  };

  return (
    <>
      <section className={`pdp ${isQuickview ? 'pdp--quickview' : ''}`}>
        {!isQuickview && (
          <nav className="pdp-crumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <ChevronRight size={14} aria-hidden="true" />
            <Link href="/products">Shop</Link>
            {product.category && (
              <>
                <ChevronRight size={14} aria-hidden="true" />
                <Link href={`/category/${String(product.category).toLowerCase().replace(/\s+/g, '-')}`}>{product.category}</Link>
              </>
            )}
            <ChevronRight size={14} aria-hidden="true" />
            <span aria-current="page">{product.name}</span>
          </nav>
        )}

        <div className="pdp-grid">
          <Gallery images={images} name={product.name} product={product} />

          <div className="pdp-info">
            <div className="pdp-badges">
              {product.category && <span className="pdp-badge">{product.category}</span>}
              {product.new_arrivals && <span className="pdp-badge pdp-badge--new">New arrival</span>}
              {product.featured && <span className="pdp-badge pdp-badge--hot">Featured pick</span>}
            </div>

            <h1 className="pdp-title">{product.name}</h1>

            {reviewSummary && (
              <a href="#reviews" className="pdp-rating" aria-label={`Rated ${reviewSummary.average} out of 5 from ${reviewSummary.count} reviews`}>
                <span className="pdp-stars" aria-hidden="true">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star key={n} size={16} fill={n <= Math.round(reviewSummary.average) ? 'currentColor' : 'none'} />
                  ))}
                </span>
                <strong>{reviewSummary.average.toFixed(1)}</strong>
                <span>({reviewSummary.count} {reviewSummary.count === 1 ? 'review' : 'reviews'})</span>
              </a>
            )}

            {product.priceOnCustomization ? (
              <div className="pdp-price-block">
                <p className="pdp-price pdp-price--custom">Price on request</p>
                <p className="pdp-price-note">Made to your space. Message us for a personalised quote.</p>
              </div>
            ) : (
              <div className="pdp-price-block">
                <p className="pdp-price">
                  ₹{price.toLocaleString('en-IN')}
                  {showRefPrice && <s className="pdp-mrp">₹{refPrice.toLocaleString('en-IN')}</s>}
                  {saving > 0 && <span className="pdp-save">{saving}% OFF</span>}
                </p>
              </div>
            )}

            <div className={`pdp-stock ${inStock ? 'is-in' : 'is-out'}`}>
              <span className="pdp-stock-dot" aria-hidden="true" />
              {inStock ? (lowStock ? `Only ${stock} left in stock` : 'In stock, ready to ship') : 'Out of stock'}
            </div>

            {description && (
              <div className="pdp-desc">
                <p className={expanded ? '' : 'is-clamped'}>{description}</p>
                {description.length > 180 && (
                  <button type="button" className="pdp-link-btn" onClick={() => setExpanded((v) => !v)}>
                    {expanded ? 'Show less' : 'Read more'}
                  </button>
                )}
              </div>
            )}

            {facts.length > 0 && (
              <ul className="pdp-facts" aria-label="Care at a glance">
                {facts.map(({ key, label, value }) => {
                  const Icon = FACT_ICONS[key] || Leaf;
                  return (
                    <li key={key} className={`pdp-fact pdp-fact--${key}`}>
                      <Icon size={20} aria-hidden="true" />
                      <span>
                        <small>{label}</small>
                        {value}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}

            {fixedSize && <p className="pdp-fixed-option">Comes in a <strong>{fixedSize}</strong></p>}

            {showSizes && (
              <fieldset className="pdp-option">
                <legend>Size</legend>
                <div className="pdp-chips">
                  {sizes.map((s) => (
                    <button key={s} type="button" aria-pressed={selectedSize === s} className={`pdp-chip ${selectedSize === s ? 'is-active' : ''}`} onClick={() => setSelectedSize(s)}>
                      {s}
                    </button>
                  ))}
                </div>
              </fieldset>
            )}

            {showColors && (
              <fieldset className="pdp-option">
                <legend>
                  Colour <span>{selectedColor}</span>
                </legend>
                <div className="pdp-chips">
                  {colors.map((c) => (
                    <button key={c} type="button" aria-pressed={selectedColor === c} className={`pdp-chip ${selectedColor === c ? 'is-active' : ''}`} onClick={() => setSelectedColor(c)}>
                      {c}
                    </button>
                  ))}
                </div>
              </fieldset>
            )}

            {showVariants && (
              <fieldset className="pdp-option">
                <legend>Option</legend>
                <div className="pdp-chips">
                  {variants.map((v) => {
                    const label = (v.label || v.name || '').trim();
                    const isActive = (selectedVariant?.id ?? selectedVariant?.label) === (v.id ?? v.label);
                    return (
                      <button key={v.id || label} type="button" aria-pressed={isActive} className={`pdp-chip ${isActive ? 'is-active' : ''}`} onClick={() => setSelectedVariant(v)}>
                        {isPlaceholderLabel(label) ? `₹${v.price}` : `${label} · ₹${v.price}`}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            )}

            {offer && <OfferCountdown variant="card" offerId={offer.id} />}

            <div className="pdp-buy" ref={ctaRef}>
              <div className="pdp-qty" role="group" aria-label="Quantity">
                <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="Decrease quantity" disabled={quantity <= 1}>
                  <Minus size={18} />
                </button>
                <output aria-live="polite">{quantity}</output>
                <button type="button" onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))} aria-label="Increase quantity" disabled={quantity >= maxQty}>
                  <Plus size={18} />
                </button>
              </div>

              <button type="button" className="pdp-cta pdp-cta--whatsapp breathe" onClick={orderOnWhatsApp} disabled={!inStock && !product.priceOnCustomization}>
                <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="currentColor">
                  <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.79-1.47-1.76-1.65-2.05-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.21 3.07.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35M12.05 21.79h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88a9.82 9.82 0 0 1 6.99 2.9 9.82 9.82 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.88 9.88" />
                </svg>
                {product.priceOnCustomization ? 'Get a quote on WhatsApp' : 'Order on WhatsApp'}
              </button>

              {!product.priceOnCustomization && (
                <button type="button" className="pdp-cta pdp-cta--cart" onClick={addToCart} disabled={!inStock}>
                  <ShoppingBag size={19} aria-hidden="true" />
                  Add to cart
                </button>
              )}
            </div>

            <ul className="pdp-trust">
              <li><Leaf size={18} aria-hidden="true" /> Handpicked and checked before dispatch</li>
              <li><PackageCheck size={18} aria-hidden="true" /> {boxItems.length ? `In the box: ${boxItems.join(', ')}` : 'Eco-friendly, plastic-light packaging'}</li>
              <li><HeartHandshake size={18} aria-hidden="true" /> Free plant-care help on WhatsApp after you buy</li>
            </ul>
          </div>
        </div>
      </section>

      {!isQuickview && !product.priceOnCustomization && (
        <div className={`pdp-sticky ${showStickyBar ? 'is-visible' : ''}`} aria-hidden={!showStickyBar}>
          <div className="pdp-sticky-info">
            <strong>{product.name}</strong>
            <span>₹{(price * quantity).toLocaleString('en-IN')}</span>
          </div>
          <button type="button" className="pdp-cta pdp-cta--whatsapp" onClick={orderOnWhatsApp} disabled={!inStock} tabIndex={showStickyBar ? 0 : -1}>
            Order on WhatsApp
          </button>
        </div>
      )}
    </>
  );
}
