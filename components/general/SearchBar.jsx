'use client';

import { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';

export default function SearchBar() {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const searchRef = useRef(null);

  // Close mobile search on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setMobileSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Toggle mobile search (fixes the issue where it doesn't close on 2nd click)
  const toggleMobileSearch = () => {
    setMobileSearchOpen(prev => !prev);
  };

  return (
    <>
      {/* Desktop search */}
      <div className="search-box desktop-only">
        <input type="text" placeholder="Search..." />
        <div className="search-icon">
          <img src="/search-icon.png" alt="Search" width={20} height={30} />
        </div>
      </div>

      {/* Mobile search icon */}
      <button
        className="mobile-search-icon mobile-only"
        onClick={toggleMobileSearch}
      >
        <Search size={25} />
      </button>

      {/* Mobile search bar (slides down) */}
      {mobileSearchOpen && (
        <div ref={searchRef} className="mobile-search-bar">
          <input type="text" placeholder="Search..." autoFocus />
        </div>
      )}
    </>
  );
}
