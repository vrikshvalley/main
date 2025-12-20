'use client';
import Link from 'next/link';
import { Leaf } from 'lucide-react';
import '@/styles/ads.scss';

export default function Ads({ items = [], bgColor = 'primary', speed = 30, textColor, renderLinks = true }) {
  // First item is always "Bring nature home..." - don't make it a link
  const firstItem = items[0];
  const categoryItems = items.slice(1); // Rest are category links

  // Duplicate items for seamless loop
  const duplicatedCategories = categoryItems.length === 0
    ? []
    : [...categoryItems, ...categoryItems, ...categoryItems, ...categoryItems];

  return (
    <div className={`ads-banner bg-${bgColor} text-${textColor}`}>
      <div 
        className="ads-marquee"
        style={{ '--speed': `${speed}s` }}
      >
        <div className="ads-content">
          {/* First item - not a link */}
          {firstItem && (
            <>
              <div className="ads-item">
                <span className="ads-text">{firstItem}</span>
                <Leaf size={16} className="ads-separator" />
              </div>
              <div className="ads-item">
                <span className="ads-text">{firstItem}</span>
                <Leaf size={16} className="ads-separator" />
              </div>
              <div className="ads-item">
                <span className="ads-text">{firstItem}</span>
                <Leaf size={16} className="ads-separator" />
              </div>
              <div className="ads-item">
                <span className="ads-text">{firstItem}</span>
                <Leaf size={16} className="ads-separator" />
              </div>
            </>
          )}
          
          {/* Category items - links or plain text depending on prop */}
          {duplicatedCategories.map((item, index) => {
            const path = `/products/category/${item.toLowerCase().replace(/\s+/g, '-')}`;
            if (renderLinks) {
              return (
                <Link
                  key={index}
                  href={path}
                  className="ads-item ads-link"
                >
                  <span className="ads-text">{item}</span>
                  <Leaf size={16} className="ads-separator" />
                </Link>
              );
            }

            return (
              <div key={index} className="ads-item">
                <span className="ads-text">{item}</span>
                <Leaf size={16} className="ads-separator" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
