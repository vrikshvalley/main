'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { 
  siInstagram, 
  siFacebook, 
  siWhatsapp, 
  siYoutube, 
  siX, 
  siPinterest 
} from 'simple-icons';
import { Sparkles } from 'lucide-react';
import '@/styles/linkHub.scss';

const socialLinks = [
  {
    id: 1,
    name: 'Instagram',
    iconPath: siInstagram.path,
    url: 'http://www.instagram.com/vrikshvalley/',
    color: `#${siInstagram.hex}`
  },
  {
    id: 2,
    name: 'Facebook',
    iconPath: siFacebook.path,
    url: 'http://www.facebook.com/people/Vriksh-Valley/61569081213347/',
    color: `#${siFacebook.hex}`
  },
  {
    id: 3,
    name: 'WhatsApp',
    iconPath: siWhatsapp.path,
    url: 'https://wa.me/+919204745612',
    color: `#${siWhatsapp.hex}`
  },
  {
    id: 4,
    name: 'YouTube',
    iconPath: siYoutube.path,
    url: 'https://youtube.com/@vrikshvalley?si=Bb5SIkCKUsj7u7s8',
    color: `#${siYoutube.hex}`
  },
  {
    id: 5,
    name: 'X',
    iconPath: siX.path,
    url: 'http://x.com/VrikshValley',
    color: `#${siX.hex}`
  },
  {
    id: 6,
    name: 'Pinterest',
    iconPath: siPinterest.path,
    url: 'https://in.pinterest.com/vrikshvalley/',
    color: `#${siPinterest.hex}`
  },
  {
    id: 7,
    name: 'Shop Now',
    icon: Sparkles,
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
          {socialLinks.map((link) => {
            return (
              <motion.div key={link.id} variants={itemVariants}>
                <Link
                  href={link.url}
                  target={link.featured ? '_self' : '_blank'}
                  rel={link.featured ? '' : 'noopener noreferrer'}
                  className={`link-card ${link.featured ? 'featured' : ''}`}
                  style={{ '--hover-color': link.color }}
                >
                  <span className="link-icon">
                    {link.featured ? (
                      <link.icon size={24} strokeWidth={2} />
                    ) : (
                      <svg role="img" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                        <path d={link.iconPath} />
                      </svg>
                    )}
                  </span>
                  <span className="link-name">{link.name}</span>
                  <span className="link-arrow">→</span>
                </Link>
              </motion.div>
            );
          })}
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
