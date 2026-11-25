'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, ArrowRight } from 'lucide-react';

/**
 * Searchable, grouped FAQ list. Each answer is a native <details>, so it is
 * keyboard- and screen-reader-friendly and never re-animates while scrolling.
 */
export default function FaqExplorer({ groups }) {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState('all');

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return groups
      .filter((g) => active === 'all' || g.id === active)
      .map((g) => ({
        ...g,
        items: q ? g.items.filter((f) => `${f.q} ${f.a}`.toLowerCase().includes(q)) : g.items,
      }))
      .filter((g) => g.items.length > 0);
  }, [groups, query, active]);

  return (
    <div className="fq-explorer">
      <div className="fq-tools">
        <label className="fq-search">
          <Search size={18} aria-hidden="true" />
          <input
            type="search"
            placeholder="Search questions, e.g. delivery"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search FAQs"
          />
        </label>
        <div className="fq-chips" role="tablist" aria-label="FAQ topics">
          {[{ id: 'all', title: 'All' }, ...groups].map((g) => (
            <button
              key={g.id}
              type="button"
              role="tab"
              aria-selected={active === g.id}
              className={active === g.id ? 'is-active' : ''}
              onClick={() => setActive(g.id)}
            >
              {g.title}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="fq-empty">
          No answers match “{query}”. Ask us directly on{' '}
          <a href="https://wa.me/919204745612" target="_blank" rel="noopener noreferrer">WhatsApp</a>.
        </p>
      ) : (
        visible.map((g) => (
          <section key={g.id} className="fq-group" aria-labelledby={`fq-${g.id}`}>
            <h2 id={`fq-${g.id}`}>{g.title}</h2>
            {g.items.map((f) => (
              <details key={f.q} className="fq-item">
                <summary>
                  <span>{f.q}</span>
                  <span className="fq-icon" aria-hidden="true" />
                </summary>
                <div className="fq-answer">
                  <p>{f.a}</p>
                  {f.link && (
                    <Link
                      href={f.link.href}
                      className="fq-link"
                      {...(f.link.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    >
                      {f.link.label} <ArrowRight size={15} aria-hidden="true" />
                    </Link>
                  )}
                </div>
              </details>
            ))}
          </section>
        ))
      )}
    </div>
  );
}
