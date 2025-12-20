'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, ShoppingCart, Plus } from 'lucide-react';
import '@/styles/adminNavbar.scss';

export default function AdminNavbar() {
  const pathname = usePathname();

  const navItems = [
    { href: '/admin/profile', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/profile/orders', label: 'Orders', icon: ShoppingCart },
    { href: '/admin/profile/products', label: 'Products', icon: Package },
    { href: '/admin/profile/create-product', label: 'Add Product', icon: Plus }
  ];

  return (
    <nav className="admin-navbar">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        
        return (
          <Link 
            key={item.href}
            href={item.href} 
            className={`nav-item ${isActive ? 'active' : ''}`}
          >
            <Icon size={20} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}