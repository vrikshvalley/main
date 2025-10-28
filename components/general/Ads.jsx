'use client';
import { Leaf } from 'lucide-react';
import '@/styles/ads.scss';

export default function Ads({ items = [], bgColor = 'primary', speed = 30 }) {
  // Duplicate items for seamless loop
  const duplicatedItems = [...items, ...items];

  return (
    <div className={`ads-banner bg-${bgColor}`}>
      <div 
        className="ads-marquee"
        style={{ '--speed': `${speed}s` }}
      >
        <div className="ads-content">
          {duplicatedItems.map((item, index) => (
            <div key={index} className="ads-item">
              <span className="ads-text">{item}</span>
              <Leaf size={16} className="ads-separator" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
