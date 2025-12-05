'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Clock, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  searchProducts, 
  getSearchSuggestions, 
  getPopularSearches,
  saveSearchHistory,
  getSearchHistory 
} from '@/lib/searchService';

export default function SearchBar() {
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [popularSearches, setPopularSearches] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef(null);

  // Load search history and popular searches on mount
  useEffect(() => {
    setSearchHistory(getSearchHistory());
    setPopularSearches(getPopularSearches());
  }, []);

  // Close search on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get suggestions as user types
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      const fetchSuggestions = async () => {
        setIsLoading(true);
        try {
          const results = await getSearchSuggestions(searchQuery, 5);
          setSuggestions(results);
          setShowSuggestions(true);
        } catch (error) {
          console.error('Error fetching suggestions:', error);
          setSuggestions([]);
        } finally {
          setIsLoading(false);
        }
      };
      
      // Debounce search
      const timer = setTimeout(fetchSuggestions, 300);
      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      setIsLoading(false);
    }
  }, [searchQuery]);

  // Toggle search
  const toggleSearch = () => {
    setSearchOpen(prev => !prev);
    if (!searchOpen) {
      setShowSuggestions(false);
    }
  };

  // Handle search submission
  const handleSearch = (query = searchQuery) => {
    if (!query || query.trim().length === 0) return;

    const searchTerm = query.trim();
    
    // Save to history
    saveSearchHistory(searchTerm);
    
    // Navigate to search results page
    router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
    
    // Close search
    setSearchOpen(false);
    setSearchQuery('');
    setShowSuggestions(false);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    handleSearch(suggestion);
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
            <div className="search-input-wrapper">
              <div className="search-icon">
                {isLoading ? (
                  <div className="search-spinner" />
                ) : (
                  <Image 
                    src="/search-icon.png" 
                    alt="Search" 
                    width={18} 
                    height={18}
                  />
                )}
              </div>
              <input 
                type="text" 
                placeholder="Search plants, seeds, pots..." 
                autoFocus 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
                onFocus={() => setShowSuggestions(true)}
              />
            </div>

            {/* Search Suggestions Dropdown */}
            {showSuggestions && (
              <motion.div 
                className="search-suggestions"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                {/* Loading state */}
                {isLoading && (
                  <div className="suggestions-loading">
                    <div className="search-spinner-large" />
                    <span>Searching...</span>
                  </div>
                )}

                {/* Show suggestions when typing */}
                {!isLoading && suggestions.length > 0 && (
                  <div className="suggestions-section">
                    <div className="section-title">Suggestions</div>
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        className="suggestion-item"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        <Image 
                          src="/search-icon.png" 
                          alt="" 
                          width={14} 
                          height={14}
                        />
                        <span>{suggestion}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* No results message */}
                {!isLoading && searchQuery.length >= 2 && suggestions.length === 0 && (
                  <div className="no-results">
                    <p>No suggestions found for "{searchQuery}"</p>
                    <button 
                      className="search-anyway"
                      onClick={() => handleSearch()}
                    >
                      Search anyway
                    </button>
                  </div>
                )}

                {/* Show history when not typing */}
                {!isLoading && searchQuery.length === 0 && searchHistory.length > 0 && (
                  <div className="suggestions-section">
                    <div className="section-title">
                      <Clock size={14} />
                      Recent Searches
                    </div>
                    {searchHistory.slice(0, 5).map((query, index) => (
                      <button
                        key={index}
                        className="suggestion-item"
                        onClick={() => handleSuggestionClick(query)}
                      >
                        <Clock size={14} />
                        <span>{query}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Popular searches */}
                {!isLoading && searchQuery.length === 0 && (
                  <div className="suggestions-section">
                    <div className="section-title">
                      <TrendingUp size={14} />
                      Popular Searches
                    </div>
                    {popularSearches.slice(0, 5).map((search, index) => (
                      <button
                        key={index}
                        className="suggestion-item popular"
                        onClick={() => handleSuggestionClick(search)}
                      >
                        <TrendingUp size={14} />
                        <span>{search}</span>
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
