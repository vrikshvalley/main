'use client';

import Link from 'next/link';
import Image from 'next/image';
import "@/styles/topbar.scss";
import  {showWarningToast} from '@/lib/toastHelpers';

export default function TopBar() {

  const handleClick = () => {
    showWarningToast("This feature is coming soon!");
  };

  return (
    <div className="topbar">
      <div className="topbar-container">
        
        <div className="topbar-logo">
          <Image src="/white-logo.png" alt="Logo" width={30} height={30} />
        </div>
        <nav className="topbar-links">
          <Link href="/blog">Blog</Link>
          <span className="separator">|</span>
          <Link onClick={handleClick} href="#">Consulting</Link>
          <span className="separator">|</span>
          <Link onClick={handleClick} href="#">Offers</Link>
          <span className="separator">|</span>
          <Link href="#testimonials">Testimonials</Link>
          <span className="separator">|</span>
          <Link href="#faqs">FAQ</Link>
          <span className="separator">|</span>
          <Link 
            href="https://wa.me/919876543210?text=Hi,%20I'm%20interested%20in%20corporate%20bulk%20orders"
            target="_blank"
            rel="noopener noreferrer"
            className="corporate-link"
          >
            Corporate Orders 🌿
          </Link>
        </nav>
      </div>
    </div>
  );
}
