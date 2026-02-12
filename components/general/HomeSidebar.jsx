'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Home, 
  Grid3x3, 
  Star, 
  Heart, 
  TrendingUp, 
  MessageCircle, 
  HelpCircle, 
  MapPin, 
  ImageIcon, 
  Info,
  Users,
  BookOpen
} from 'lucide-react';
import '@/styles/homeSidebar.scss';

export default function HomeSidebar() {
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState('hero');
  const [hoveredSection, setHoveredSection] = useState(null);
  const sectionRefs = useRef({});
  // Keep sidebar fixed by default

  const sections = [
    { id: 'hero', label: 'Home', icon: Home },
    { id: 'categories', label: 'Categories', icon: Grid3x3 },
    { id: 'featured', label: 'Featured', icon: Star },
    { id: 'new-arrivals', label: 'New Arrivals', icon: TrendingUp },
    { id: 'why-choose', label: 'Why Us', icon: Heart },
    { id: 'impact', label: 'Impact', icon: TrendingUp },
    { id: 'testimonials', label: 'Reviews', icon: MessageCircle },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'faqs', label: 'FAQs', icon: HelpCircle },
    { id: 'location', label: 'Location', icon: MapPin },
    { id: 'blogs', label: 'Blogs', icon: BookOpen },
    { id: 'about', label: 'About', icon: Info },
  ];
  
  // Only show on homepage
  const isHomePage = pathname === '/';

  useEffect(() => {
    if (!isHomePage) return;
    
    // Store references to all sections
    sections.forEach(section => {
      if (!section.divider) {
        const element = document.getElementById(section.id);
        if (element) {
          sectionRefs.current[section.id] = element;
        }
      }
    });

    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 3;

      for (const section of sections) {
        if (!section.divider) {
          const element = sectionRefs.current[section.id];
          if (element) {
            const { offsetTop, offsetHeight } = element;
            if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
              setActiveSection(section.id);
              break;
            }
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    // Keep sidebar fixed; only track active section on scroll
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isHomePage]);

  const scrollToSection = (id) => {
    const element = sectionRefs.current[id];
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  if (!isHomePage) return null;

  const sidebar = (
    <aside className={`home-sidebar fixed`}>
      <nav className="sidebar-nav">
            {sections.map((section, idx) => {
              if (section.divider) {
                return (
                  <div key={`divider-${idx}`} className="sidebar-divider" />
                );
              }
              
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  className={`sidebar-item ${activeSection === section.id ? 'active' : ''}`}
                  onClick={() => scrollToSection(section.id)}
                  onMouseEnter={() => setHoveredSection(section.id)}
                  onMouseLeave={() => setHoveredSection(null)}
                  aria-label={section.label}
                >
                  <Icon size={20} />
                  {hoveredSection === section.id && (
                    <span className="sidebar-tooltip">{section.label}</span>
                  )}
                  {activeSection === section.id && (
                    <motion.div
                      className="active-indicator"
                      layoutId="activeSection"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </nav>
    </aside>
  );

  // Render into document.body to avoid containment by transformed ancestors
  if (typeof document !== 'undefined') {
    return createPortal(sidebar, document.body);
  }

  return sidebar;
}
