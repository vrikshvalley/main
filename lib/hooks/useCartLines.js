'use client';

import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '@/lib/AuthContext';
import {
  addItem,
  decrementItem,
  removeItem,
  selectCartReady,
  selectCount,
  selectItemsArray,
  selectSubtotal,
} from '@/lib/slices/cartSlice';

export const ORDER_WHATSAPP_NUMBER = '919204745612';

const money = (n) => `₹${Math.round(Number(n) || 0).toLocaleString('en-IN')}`;
export const formatINR = money;

const unitPrice = (item) => (typeof item.price === 'number' ? item.price : Number(item.price) || 0);
const qtyOf = (item) => item.qty ?? item.quantity ?? 1;

/**
 * Everything the cart drawer, cart page and checkout share: the lines, quantity
 * actions, totals, savings from offers, and the WhatsApp order link (the
 * backup way to order while direct payment is rolling out).
 *
 * Loading and saving the cart (guest → localStorage, signed-in → Firestore,
 * merge on sign-in) is done once, globally, by components/cart/CartSync.jsx.
 */
export function useCartLines() {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const items = useSelector(selectItemsArray);
  const count = useSelector(selectCount);
  const subtotal = useSelector(selectSubtotal);
  const isLoading = !useSelector(selectCartReady);

  const increment = (item) => dispatch(addItem({ ...item, qty: 1, quantity: 1 }));
  const decrement = (item) => dispatch(decrementItem(item.key || item.id));
  const remove = (item) => dispatch(removeItem(item.key || item.id));

  // Savings only count when the line carries a real regular price (set when an offer applied).
  const savings = useMemo(
    () =>
      items.reduce((sum, item) => {
        const regular = Number(item.regularPrice);
        const paid = unitPrice(item);
        return regular > paid ? sum + (regular - paid) * qtyOf(item) : sum;
      }, 0),
    [items]
  );

  const whatsappUrl = useMemo(() => {
    const lines = ['Hi! I would like to order:', ''];
    items.forEach((item) => {
      const extra = [item.variant, item.size, item.color].filter(Boolean).join(' | ');
      lines.push(`• ${item.name}${extra ? ` (${extra})` : ''} × ${qtyOf(item)} = ${money(unitPrice(item) * qtyOf(item))}`);
    });
    lines.push('', `Subtotal: ${money(subtotal)}`, 'Shipping: FREE', `Total: ${money(subtotal)}`);
    if (savings > 0) lines.push(`(Offer savings: ${money(savings)})`);
    return `https://wa.me/${ORDER_WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`;
  }, [items, subtotal, savings]);

  return { user, isLoading, items, count, subtotal, savings, increment, decrement, remove, whatsappUrl, unitPrice, qtyOf };
}
