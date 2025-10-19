'use client';
import Link from 'next/link';
import '@/styles/adminNavbar.scss';

export default function AdminNavbar() {
  return (
    <nav className="admin-navbar ">
      <Link href="/admin/profile">Profile</Link>
      <Link href="/admin/profile/orders">Orders</Link>
      <Link href="/admin/profile/products">Products</Link>
      <Link href="/admin/profile/create-product">Create Product</Link>
    </nav>
  );
}