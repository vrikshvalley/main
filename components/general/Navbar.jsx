'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { selectCount } from '@/lib/slices/cartSlice';
import { Menu, X } from 'lucide-react';
import Image from 'next/image';
import ProfileIcon from '@/components/auth/ProfileIcon';
import CartIcon from '@/components/cart/CartIcon';
import SearchBar from '@/components/general/SearchBar';
import { categories } from '@/lib/sampleProducts';
import "@/styles/navbar.scss";

export default function Navbar({ onCartClick }) {
  const count = useSelector(selectCount);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="navbar">
      <div className="nav-container">
        {/* Left: Logo */}
        <div className="nav-logo">
          <Link href="/">
            <Image src="/big-logo.png" alt="Logo" width={204} height={42} />
          </Link>
        </div>

        {/* Center: Categories (desktop) */}
        <nav className="nav-categories desktop-only">
          {categories.map((category) => (
            <Link key={category.slug} href={`/category/${category.slug}`}>
              {category.name}
            </Link>
          ))}
        </nav>

        {/* Right: Search + Cart + Profile */}
        <div className="nav-actions">
          <SearchBar />
          
          <CartIcon onCartClick={onCartClick} />
          <ProfileIcon />

          {/* Hamburger (mobile) */}
          <button
            className="hamburger mobile-only"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="mobile-menu">
          {categories.map((category) => (
            <Link key={category.slug} href={`/category/${category.slug}`}>
              {category.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
