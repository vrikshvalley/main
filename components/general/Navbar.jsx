'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { selectCount } from '@/lib/slices/cartSlice';
import { Menu, X, ChevronDown, ChevronRight } from 'lucide-react';
import Image from '@/components/general/ImgWithLoader';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import ProfileIcon from '@/components/auth/ProfileIcon';
import CartIcon from '@/components/cart/CartIcon';
import SearchBar from '@/components/general/SearchBar';
import { getCategories } from '@/lib/services/productService';
import { useCart } from '@/lib/CartContext';
import "@/styles/navbar.scss";

export default function Navbar() {
  const { openCart } = useCart();
  const count = useSelector(selectCount);
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [expandedMobileCategory, setExpandedMobileCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  
  // Check if we're on products/category/subcategory page to hide navbar search
  const isProductsPage = pathname === '/products' || pathname?.startsWith('/products/') || pathname?.startsWith('/category/');

  useEffect(() => {
    async function fetchCategories() {
      try {
        const { data: fetchedCategories } = await getCategories();
        
        // Define the desired order to match CategoryCircles
        const categoryOrder = ['Plants', 'Seeds', 'Planters', 'Plant Care', 'Decor', 'Accessories'];
        
        // Sort categories based on the defined order (case-insensitive)
        const sortedCategories = (fetchedCategories || []).sort((a, b) => {
          const indexA = categoryOrder.findIndex(c => c.toLowerCase() === (a.name || '').toLowerCase());
          const indexB = categoryOrder.findIndex(c => c.toLowerCase() === (b.name || '').toLowerCase());
          // If not found in order array, put at end
          if (indexA === -1) return 1;
          if (indexB === -1) return -1;
          return indexA - indexB;
        });
        
        setCategories(sortedCategories);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    }
    fetchCategories();
  }, []);

  const dropdownVariants = {
    hidden: { 
      opacity: 0, 
      y: -10,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.2,
        ease: [0.22, 1, 0.36, 1]
      }
    },
    exit: {
      opacity: 0,
      y: -10,
      scale: 0.95,
      transition: {
        duration: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.03,
        duration: 0.2
      }
    })
  };

  const toggleMobileCategory = (slug) => {
    setExpandedMobileCategory(expandedMobileCategory === slug ? null : slug);
  };

  const handleMobileCategoryPress = (category) => {
    const hasSubs = category.subcategories && category.subcategories.length > 0 && category.slug !== 'accessories';
    if (!hasSubs) {
      setMenuOpen(false);
      router.push(`/category/${category.slug}`);
      return;
    }

    if (expandedMobileCategory !== category.slug) {
      setExpandedMobileCategory(category.slug);
    } else {
      setMenuOpen(false);
      router.push(`/category/${category.slug}`);
    }
  };

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
            <div 
              key={category.slug}
              className="category-item"
              onMouseEnter={() => setHoveredCategory(category.slug)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              <Link href={`/category/${category.slug}`} className="category-link">
                {category.name}
              </Link>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {hoveredCategory === category.slug && category.subcategories && category.subcategories.length > 0 && category.slug !== 'accessories' && (
                  <motion.div
                    className="dropdown-menu"
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <div className="dropdown-content">
                      {category.subcategories.map((subcategory, index) => (
                        <motion.div
                          key={subcategory.slug}
                          custom={index}
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                        >
                          <Link 
                            href={`/category/${category.slug}/${subcategory.slug}`}
                            className="dropdown-item"
                          >
                            {subcategory.name}
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </nav>

        {/* Right: Search + Cart + Profile */}
        <div className="nav-actions">
          {!isProductsPage && <SearchBar />}
          
          <CartIcon onCartClick={openCart} />
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

      {/* Mobile dropdown rendered into document.body to avoid stacking context issues */}
      {menuOpen && (typeof document !== 'undefined' ? createPortal(
        <div className="mobile-menu" role="dialog" aria-modal="true">
          {categories.map((category) => (
            <div key={category.slug} className="mobile-category">
              <div className="mobile-category-header">
                {category.subcategories && category.subcategories.length > 0 && category.slug !== 'accessories' ? (
                  <div className="mobile-category-with-subs">
                    {expandedMobileCategory === category.slug ? (
                      <Link
                        href={`/category/${category.slug}`}
                        className="mobile-category-link-active"
                        onClick={() => setMenuOpen(false)}
                      >
                        <span>{category.name}</span>
                      </Link>
                    ) : (
                      <button
                        type="button"
                        className="mobile-category-text"
                        onClick={() => handleMobileCategoryPress(category)}
                      >
                        {category.name}
                      </button>
                    )}
                    <button
                      className="mobile-category-toggle"
                      onClick={() => toggleMobileCategory(category.slug)}
                      aria-label={`Toggle ${category.name} subcategories`}
                    >
                      <ChevronRight 
                        size={18} 
                        className={expandedMobileCategory === category.slug ? 'rotated' : ''}
                      />
                    </button>
                  </div>
                ) : (
                  <Link 
                    href={`/category/${category.slug}`}
                    onClick={() => setMenuOpen(false)}
                  >
                    {category.name}
                  </Link>
                )}
              </div>

              {/* Mobile Subcategories */}
              <AnimatePresence>
                {expandedMobileCategory === category.slug && category.subcategories && category.slug !== 'accessories' && (
                  <motion.div
                    className="mobile-subcategories"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {category.subcategories.map((subcategory) => (
                      <Link
                        key={subcategory.slug}
                        href={`/category/${category.slug}/${subcategory.slug}`}
                        className="mobile-subcategory-item"
                        onClick={() => setMenuOpen(false)}
                      >
                        {subcategory.name}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>,
        document.body
      ) : null)}
    </div>
  );
}
