'use client';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import '@/styles/breadcrumbs.scss';

export default function Breadcrumbs({ items }) {
  // Filter out items with label "Home" to avoid duplicates
  const filteredItems = items.filter(item => item.label?.toLowerCase() !== 'home');
  
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <ol className="breadcrumbs-list">
        <li className="breadcrumb-item">
          <Link href="/">
            <Home size={16} />
            <span>Home</span>
          </Link>
        </li>
        {filteredItems.map((item, index) => (
          <li key={index} className="breadcrumb-item">
            <ChevronRight size={16} className="separator" />
            {item.href ? (
              <Link href={item.href}>{item.label}</Link>
            ) : (
              <span className="current">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
