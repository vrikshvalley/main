'use client';

import { useEffect, useRef } from 'react';
import { observeOnce } from '@/lib/inView';
import '@/styles/animatedText.scss';

const MAX_SPLIT_WORDS = 10;

/**
 * Text that fades up once when it scrolls into view.
 *
 * Short text (headings) is split into words that stagger in; long text
 * (paragraphs) animates as one block, so a paragraph never turns into
 * hundreds of animated nodes. Pure CSS transitions (opacity + transform),
 * triggered once by a shared IntersectionObserver.
 *
 * `viewport` is accepted for backwards compatibility and ignored.
 */
export default function AnimatedText({
  text,
  as: Tag = 'p',
  className = '',
  delay = 0,
  stagger = 0.06,
  duration = 0.7,
  viewport,
}) {
  const ref = useRef(null);
  const words = String(text).split(' ');
  const split = words.length <= MAX_SPLIT_WORDS;

  useEffect(() => observeOnce(ref.current), []);

  return (
    <Tag
      ref={ref}
      className={`animated-text ${split ? 'is-split' : 'is-block'} ${className}`}
      style={{ '--at-delay': `${delay}s`, '--at-stagger': `${stagger}s`, '--at-duration': `${duration}s` }}
    >
      {split
        ? words.map((word, index) => (
            <span className="word" style={{ '--i': index }} key={`${word}-${index}`}>
              {word}
              {index < words.length - 1 ? ' ' : ''}
            </span>
          ))
        : text}
    </Tag>
  );
}
