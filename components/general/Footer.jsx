'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  siFacebook, 
  siInstagram, 
  siX, 
  siYoutube,
  siPinterest,
  siThreads,
} from 'simple-icons';
import '@/styles/footer.scss';

export default function Footer() {
  const fadeUpVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        <motion.div 
          className="footer-section"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUpVariants}
          transition={{ duration: 0.6 }}
        >
          <h3>About</h3>
          <ul>
            <li><Link href="/about-us">About Us</Link></li>
            <li><Link href="/our-story">Our Story</Link></li>
            <li><Link href="/terms-of-services">Terms of Services</Link></li>
            <li><Link href="/contact-us">Contact Us</Link></li>
            <li><Link href="/cancellation-refund">Cancellation & Refund Policy</Link></li>
          </ul>
        </motion.div>

        <motion.div 
          className="footer-section"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUpVariants}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <h3>Customer Care</h3>
          <ul>
            <li><Link href="/track-order">Track Order</Link></li>
            <li><Link href="/faqs">FAQs</Link></li>
            <li><Link href="/shipping-policies">Shipping Policies</Link></li>
            <li><Link href="/terms-conditions">Terms and Conditions</Link></li>
          </ul>
        </motion.div>

        <motion.div 
          className="footer-section"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUpVariants}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h3>Get in Touch</h3>
          <ul>
            <li><a href="tel:+919204745612">Call: +91 92047 45612</a></li>
            <li><a href="mailto:vrikshvalley@gmail.com">Email: vrikshvalley@gmail.com</a></li>
            <li><a href="https://wa.me/919204745612" target="_blank">WhatsApp: +91 92047 45612</a></li>
          </ul>
        </motion.div>

        <motion.div 
          className="footer-section newsletter"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUpVariants}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h3>Sign up for Newsletter</h3>
          <form>
            <input type="email" placeholder="Enter your email" />
            <button type="submit">Subscribe</button>
          </form>
          <div className="social-icons">
            <a href="http://www.facebook.com/people/Vriksh-Valley/61569081213347/" aria-label="Facebook">
              <svg role="img" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d={siFacebook.path} />
              </svg>
            </a>
            <a href="http://www.instagram.com/vrikshvalley/" aria-label="Instagram">
              <svg role="img" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d={siInstagram.path} />
              </svg>
            </a>
            <a href="http://x.com/VrikshValley" aria-label="X (Twitter)">
              <svg role="img" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d={siX.path} />
              </svg>
            </a>
            <a href="https://youtube.com/@vrikshvalley?si=Bb5SIkCKUsj7u7s8" aria-label="YouTube">
              <svg role="img" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d={siYoutube.path} />
              </svg>
            </a>
            <a href="https://in.pinterest.com/vrikshvalley/" aria-label="Pinterest">
              <svg role="img" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d={siPinterest.path} />
              </svg>
            </a>
            <a href="https://www.threads.com/@vrikshvalley" aria-label="Threads">
              <svg role="img" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d={siThreads.path} />
              </svg>
            </a>
          </div>
        </motion.div>
      </div>

      <motion.div 
        className="footer-bottom"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeUpVariants}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <p>© {new Date().getFullYear()} Vriksh Valley. All rights reserved.</p>
      </motion.div>
    </footer>
  );
}
