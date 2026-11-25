import Link from 'next/link';
import { jsonLd as toJsonLd } from "@/lib/jsonLd";
import { Stethoscope, Truck } from 'lucide-react';
import FaqExplorer from '@/components/faqs/FaqExplorer';
import WhatsAppGlyph from '@/components/general/WhatsAppGlyph';
import { FAQ_GROUPS, ALL_FAQS } from '@/lib/faqs';
import '@/styles/faqsPage.scss';

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: ALL_FAQS.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
};

export default function FAQs() {
  return (
    <main className="fq">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: toJsonLd(faqJsonLd) }} />

      <header className="fq-hero">
        <div className="fq-hero__glow" aria-hidden="true" />
        <p className="fq-eyebrow">Find answers to common questions</p>
        <h1>
          Frequently Asked <span>Questions</span>
        </h1>
        <p>Find answers to common questions about our products and services</p>
      </header>

      <div className="fq-layout">
        <FaqExplorer groups={FAQ_GROUPS} />

        <aside className="fq-aside" aria-label="More help">
          <div className="fq-help">
            <h2>Still have questions?</h2>
            <p>
              <Link href="/contact-us">Contact our plant experts</Link>
            </p>
            <a className="fq-btn fq-btn--stone" href="https://wa.me/919204745612" target="_blank" rel="noopener noreferrer">
              <WhatsAppGlyph size={18} /> Chat on WhatsApp
            </a>
          </div>
          <Link href="/plant-doctor" className="fq-tile">
            <Stethoscope size={22} aria-hidden="true" />
            <span>
              <strong>Plant Doctor</strong>
              <small>Something wrong with a plant? Get expert help.</small>
            </span>
          </Link>
          <Link href="/track-order" className="fq-tile">
            <Truck size={22} aria-hidden="true" />
            <span>
              <strong>Track an order</strong>
              <small>Follow your plant on its way to you.</small>
            </span>
          </Link>
        </aside>
      </div>
    </main>
  );
}
