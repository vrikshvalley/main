import Link from 'next/link';
import Image from 'next/image';
import "@/styles/topbar.scss";

export default function TopBar() {
  return (
    <div className="topbar">
      <div className="topbar-container">
        <div className="topbar-logo">
          <Image src="/logo.png" alt="Logo" width={30} height={30} />
        </div>
        <nav className="topbar-links">
          <Link href="/blog">Blog </Link>
          |
          <Link href="/consulting">Consulting </Link>
          |
          <Link href="/offers">Offers</Link>
        </nav>
      </div>
    </div>
  );
}
