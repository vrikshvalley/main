"use client";

import { useCart } from "@/lib/CartContext";
import CartModal from "@/components/cart/CartModal";

export default function GlobalCartModal() {
  const { isCartOpen, closeCart } = useCart();

  return <CartModal isOpen={isCartOpen} onClose={closeCart} />;
}
