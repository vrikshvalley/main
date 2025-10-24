'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import '@/styles/linkHub.scss';

const socialLinks = [
  {
    id: 1,
    name: 'Instagram',
    icon: '📸',
    url: 'https://instagram.com/vrikshvalley',
    color: '#E4405F'
  },
  {
    id: 2,
    name: 'Facebook',
    icon: '👥',
    url: 'https://facebook.com/vrikshvalley',
    color: '#1877F2'
  },
  {
    id: 3,
    name: 'WhatsApp',
    icon: '💬',
    url: 'https://wa.me/yourphonenumber',
    color: '#25D366'
  },
  {
    id: 4,
    name: 'YouTube',
    icon: '🎥',
    url: 'https://youtube.com/@vrikshvalley',
    color: '#FF0000'
  },
  {
    id: 5,
    name: 'Twitter/X',
    icon: '🐦',
    url: 'https://twitter.com/vrikshvalley',
    color: '#1DA1F2'
  },
  {
    id: 6,
    name: 'Pinterest',
    icon: '📌',
    url: 'https://pinterest.com/vrikshvalley',
    color: '#E60023'
  },
  {
    id: 7,
    name: 'Shop Now',
    icon: '🌿',
    url: '/',
    color: '#073b22',
    featured: true
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

const logoVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

export default function LinkHub() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="link-hub">
      {/* Animated background */}
      <div className="background-animation">
        <div className="leaf leaf-1">🌿</div>
        <div className="leaf leaf-2">🍃</div>
        <div className="leaf leaf-3">🌱</div>
        <div className="leaf leaf-4">🌿</div>
        <div className="leaf leaf-5">🍃</div>
      </div>

      <motion.div
        className="link-hub-container"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Logo */}
        <motion.div className="logo-section" variants={logoVariants}>
          <div className="logo-wrapper">
            <Image
              src="/big-logo.png"
              alt="Vriksh Valley"
              width={250}
              height={80}
              priority
            />
          </div>
          <p className="tagline">Your Green Companion 🌱</p>
        </motion.div>

        {/* Links Grid */}
        <motion.div className="links-grid" variants={containerVariants}>
          {socialLinks.map((link) => (
            <motion.div key={link.id} variants={itemVariants}>
              <Link
                href={link.url}
                target={link.featured ? '_self' : '_blank'}
                rel={link.featured ? '' : 'noopener noreferrer'}
                className={`link-card ${link.featured ? 'featured' : ''}`}
                style={{ '--hover-color': link.color }}
              >
                <span className="link-icon">{link.icon}</span>
                <span className="link-name">{link.name}</span>
                <span className="link-arrow">→</span>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Footer */}
        <motion.footer className="link-hub-footer" variants={itemVariants}>
          <p className="footer-text">
            © {currentYear} Vriksh Valley. All rights reserved.
          </p>
          <p className="footer-subtext">
            Bringing nature closer to you, one plant at a time 🌿
          </p>
        </motion.footer>
      </motion.div>
    </div>
  );
}
