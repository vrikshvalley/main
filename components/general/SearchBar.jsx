'use client';

import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

export default function SearchBar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef(null);

  // Close search on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Toggle search
  const toggleSearch = () => {
    setSearchOpen(prev => !prev);
  };

  return (
    <>
      {/* Search icon (always visible) */}
      <button
        className="search-icon-button"
        onClick={toggleSearch}
      >
        <div className="icon-wrapper">
          {searchOpen ? (
            <X size={22} />
          ) : (
            <Image 
              src="/search-icon.png" 
              alt="Search" 
              width={22} 
              height={22}
            />
          )}
        </div>
        <span className="search-text">Search</span>
      </button>

      {/* Expanded search bar */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div 
            ref={searchRef} 
            className="expanded-search-bar"
            initial={{ opacity: 0, scale: 0.9, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <div className="search-icon">
              <Image 
                src="/search-icon.png" 
                alt="Search" 
                width={18} 
                height={18}
              />
            </div>
            <input 
              type="text" 
              placeholder="Search plants..." 
              autoFocus 
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
