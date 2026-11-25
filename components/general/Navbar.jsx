'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { selectCount } from '@/lib/slices/cartSlice';
import { X, ChevronDown, ChevronRight } from 'lucide-react';
import Image from '@/components/general/ImgWithLoader';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import ProfileIcon from '@/components/auth/ProfileIcon';
import CartIcon from '@/components/cart/CartIcon';
import SearchBar from '@/components/general/SearchBar';
import { getCategories, getProducts } from '@/lib/services/productService';
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
  const [menuTop, setMenuTop] = useState(60);
  // Accessories has no subcategories: its menu lists the products themselves,
  // fetched the first time the menu is opened.
  const [accessoryItems, setAccessoryItems] = useState(null);

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

  

  // Add/remove class to body when menu opens/closes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (menuOpen) {
        document.body.classList.add('mobile-menu-open');
        // Open the menu right under the header, whatever its height at this width
        requestAnimationFrame(() => {
          const nav = document.querySelector('.navbar');
          if (nav) setMenuTop(Math.max(0, Math.round(nav.getBoundingClientRect().bottom)));
        });
      } else {
        document.body.classList.remove('mobile-menu-open');
      }
    }
    return () => {
      if (typeof document !== 'undefined') {
        document.body.classList.remove('mobile-menu-open');
      }
    };
  }, [menuOpen]);

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

  const loadAccessories = () => {
    if (accessoryItems) return;
    setAccessoryItems([]);
    getProducts({ category: 'Accessories', pageSize: 5 })
      .then(({ data }) => setAccessoryItems((data || []).slice(0, 5)))
      .catch(() => setAccessoryItems([]));
  };

  const hasMenu = (category) => category.slug === 'accessories' || (category.subcategories?.length > 0);

  const menuItemsFor = (category) =>
    category.slug === 'accessories'
      ? (accessoryItems || []).map((p) => ({ slug: p.slug, name: p.name, href: `/products/${p.slug}` }))
      : (category.subcategories || []).map((sc) => ({ slug: sc.slug, name: sc.name, href: `/category/${category.slug}/${sc.slug}` }));

  const toggleMobileCategory = (slug) => {
    if (slug === 'accessories') loadAccessories();
    setExpandedMobileCategory(expandedMobileCategory === slug ? null : slug);
  };

  const isCategoryActive = (slug) => pathname === `/category/${slug}`;
  const isSubcategoryActive = (categorySlug, subcategorySlug) => pathname === `/category/${categorySlug}/${subcategorySlug}`;

  const handleAnchorClick = (e, hash) => {
    setMenuOpen(false);
    if (pathname === '/') {
      e.preventDefault();
      requestAnimationFrame(() => {
        const target = document.getElementById(hash);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          window.history.replaceState(null, '', `/#${hash}`);
        }
      });
    }
  };

  const handleMobileCategoryPress = (category) => {
    const hasSubs = hasMenu(category);
    if (category.slug === 'accessories') loadAccessories();
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
            <Image src="/big-logo.webp" alt="Logo" width={204} height={40} style={{ width: 'auto', height: 'auto' }} />
          </Link>
        </div>

        {/* Center: Categories (desktop) */}
        <nav className="nav-categories desktop-only">
          {categories.map((category) => (
            <div 
              key={category.slug}
              className="category-item"
              onMouseEnter={() => {
                if (category.slug === 'accessories') loadAccessories();
                setHoveredCategory(category.slug);
              }}
              onMouseLeave={() => setHoveredCategory(null)}
            >
                <Link
                  href={`/category/${category.slug}`}
                  className={`category-link${isCategoryActive(category.slug) ? ' is-active' : ''}`}
                >
                {category.name}
              </Link>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {hoveredCategory === category.slug && menuItemsFor(category).length > 0 && (
                  <motion.div
                    className="dropdown-menu"
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <div className="dropdown-content">
                      {menuItemsFor(category).map((item, index) => (
                        <motion.div
                          key={item.slug}
                          custom={index}
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                        >
                          <Link
                            href={item.href}
                            className={`dropdown-item${pathname === item.href ? ' is-active' : ''}`}
                          >
                            {item.name}
                          </Link>
                        </motion.div>
                      ))}
                      {category.slug === 'accessories' && (
                        <Link href="/category/accessories" className="dropdown-item dropdown-item--all">
                          View all accessories
                        </Link>
                      )}
                      {/* Add Plant Doctor under Plant Care */}
                      {category.slug === 'plant-care' && (
                        <motion.div
                          key="plant-doctor"
                          custom={category.subcategories.length}
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                        >
                          <Link 
                            href="/plant-doctor"
                            className="dropdown-item"
                          >
                            Dr. Vriksh - Plant Doctor
                          </Link>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </nav>

        {/* Right: Search + Cart + Profile */}
        <div className="nav-actions">
          <SearchBar />
          
          <CartIcon onCartClick={openCart} />
          <ProfileIcon />

          {/* Hamburger (mobile) */}
          <button
            className="hamburger mobile-only"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? (
              <X size={24} />
            ) : (
              <img src="/icons/hamMenu.webp" alt="Menu" width={24} height={24} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown rendered into document.body to avoid stacking context issues */}
      {menuOpen && (typeof document !== 'undefined' ? createPortal(
        <div
          className="mobile-menu"
          data-lenis-prevent
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          style={{ top: menuTop, height: `calc(100dvh - ${menuTop}px)` }}
        >
          {/* Home Navigation Section */}
          <div className="mobile-nav-section">
            <h3 className="mobile-nav-title">Navigation</h3>
            <Link 
              href="/#hero" 
              className="mobile-nav-item" 
              onClick={(e) => handleAnchorClick(e, 'hero')}
            >
              Home
            </Link>
            <Link 
              href="/#featured" 
              className="mobile-nav-item" 
              onClick={(e) => handleAnchorClick(e, 'featured')}
            >
              Featured
            </Link>
            <Link 
              href="/#new-arrivals" 
              className="mobile-nav-item" 
              onClick={(e) => handleAnchorClick(e, 'new-arrivals')}
            >
              New Arrivals
            </Link>
            <Link 
              href="/#why-choose" 
              className="mobile-nav-item" 
              onClick={(e) => handleAnchorClick(e, 'why-choose')}
            >
              Why Us
            </Link>
            <Link 
              href="/#testimonials" 
              className="mobile-nav-item" 
              onClick={(e) => handleAnchorClick(e, 'testimonials')}
            >
              Reviews
            </Link>
            <Link 
              href="/#team" 
              className="mobile-nav-item" 
              onClick={(e) => handleAnchorClick(e, 'team')}
            >
              Team
            </Link>
            {/* On phones these live here instead of the top bar */}
            <Link href="/blogs" className="mobile-nav-item" onClick={() => setMenuOpen(false)}>
              Blog
            </Link>
            <Link href="/faqs" className="mobile-nav-item" onClick={() => setMenuOpen(false)}>
              FAQs
            </Link>
            <a
              href="https://wa.me/919204745612?text=I%20am%20interested%20in%20bulk%20orders"
              target="_blank"
              rel="noopener noreferrer"
              className="mobile-nav-item"
              onClick={() => setMenuOpen(false)}
            >
              Corporate orders
            </a>
          </div>

          {/* Categories Section */}
          <div className="mobile-categories-section">
            <h3 className="mobile-nav-title">Categories</h3>
          {categories.map((category) => (
            <div key={category.slug} className="mobile-category">
              <div className="mobile-category-header">
                {hasMenu(category) ? (
                  <div className="mobile-category-with-subs">
                      {expandedMobileCategory === category.slug ? (
                      <Link
                        href={`/category/${category.slug}`}
                        className={`mobile-category-link-active${isCategoryActive(category.slug) ? ' is-active' : ''}`}
                        onClick={() => setMenuOpen(false)}
                      >
                        <span>{category.name}</span>
                      </Link>
                    ) : (
                      <button
                        type="button"
                        className={`mobile-category-text${isCategoryActive(category.slug) ? ' is-active' : ''}`}
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
                    className={`mobile-category-link${isCategoryActive(category.slug) ? ' is-active' : ''}`}
                    onClick={() => setMenuOpen(false)}
                  >
                    {category.name}
                  </Link>
                )}
              </div>

              {/* Mobile Subcategories */}
              <AnimatePresence>
                {expandedMobileCategory === category.slug && hasMenu(category) && (
                  <motion.div
                    className="mobile-subcategories"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {menuItemsFor(category).map((item) => (
                      <Link
                        key={item.slug}
                        href={item.href}
                        className={`mobile-subcategory-item${pathname === item.href ? ' is-active' : ''}`}
                        onClick={() => setMenuOpen(false)}
                      >
                        {item.name}
                      </Link>
                    ))}
                    {/* Add Plant Doctor under Plant Care mobile menu */}
                    {category.slug === 'plant-care' && (
                      <Link
                        href="/plant-doctor"
                        className="mobile-subcategory-item"
                        onClick={() => setMenuOpen(false)}
                      >
                        Plant Doctor
                      </Link>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
          </div>
        </div>,
        document.body
      ) : null)}
    </div>
  );
}
