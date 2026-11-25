'use client';

import { useEffect, useRef } from 'react';

const SCRIPT_ID = 'instagram-embed-js';

/**
 * Official Instagram post embed, loaded lazily: Instagram's script is only
 * fetched when the post is about to scroll into view, so it never slows the
 * first load. Until then (or if the script is blocked) a plain link shows.
 */
export default function InstagramEmbed({ url, caption = 'View this post on Instagram' }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const process = () => window.instgrm?.Embeds?.process();

    const load = () => {
      if (window.instgrm) return process();
      if (document.getElementById(SCRIPT_ID)) return;
      const s = document.createElement('script');
      s.id = SCRIPT_ID;
      s.src = 'https://www.instagram.com/embed.js';
      s.async = true;
      s.onload = process;
      document.body.appendChild(s);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          load();
          io.disconnect();
        }
      },
      { rootMargin: '600px 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [url]);

  return (
    <div className="ig-embed" ref={ref}>
      <blockquote className="instagram-media" data-instgrm-permalink={url} data-instgrm-version="14" data-instgrm-captioned>
        <a href={url} target="_blank" rel="noopener noreferrer">
          {caption}
        </a>
      </blockquote>
    </div>
  );
}
