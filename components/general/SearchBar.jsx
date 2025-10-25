'use client';

import { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SearchBar() {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
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
      <motion.div 
        className={`search-box desktop-only ${isFocused ? 'focused' : ''}`}
        initial={{ opacity: 0, width: 0 }}
        animate={{ opacity: 1, width: 'auto' }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <div className="search-icon">
          <Search size={18} />
        </div>
        <input 
          type="text" 
          placeholder="Search plants..." 
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </motion.div>

      {/* Mobile search icon */}
      <button
        className="mobile-search-icon mobile-only"
        onClick={toggleMobileSearch}
      >
        <Search size={22} />
      </button>

      {/* Mobile search bar (slides down) */}
      <AnimatePresence>
        {mobileSearchOpen && (
          <motion.div 
            ref={searchRef} 
            className="mobile-search-bar"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="search-icon">
              <Search size={18} />
            </div>
            <input type="text" placeholder="Search plants..." autoFocus />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
