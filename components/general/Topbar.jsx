'use client';

import Link from 'next/link';
import Image from 'next/image';
import "@/styles/topbar.scss";
import  {showWarningToast} from '@/lib/toastHelpers';

export default function Topbar() {

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
          <Link onClick={handleClick} href="#" className="hide-on-mobile">Consulting</Link>
          <span className="separator hide-on-mobile">|</span>
          <Link onClick={handleClick} href="#">Offers</Link>
          <span className="separator hide-on-mobile">|</span>
          <Link href="#testimonials" className="hide-on-mobile">Testimonials</Link>
          <span className="separator hide-on-mobile">|</span>
          <Link href="#faqs" className="hide-on-mobile">FAQ</Link>
          <span className="separator">|</span>
          <Link 
            href="https://wa.me/919204745612?text=Hi,%20I'm%20USER%20and%20I'm%20interested%20in%20corporate%20bulk%20orders"
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
