'use client';

import { useSelector } from 'react-redux';
import { selectCount } from '@/lib/slices/cartSlice';
import Image from '@/components/general/ImgWithLoader';

export default function CartIcon({ onCartClick }) {
  const count = useSelector(selectCount);

  return (
    <button
      type="button"
      className="cart-icon nav-action"
      onClick={onCartClick}
      aria-label={count > 0 ? `Cart, ${count} item${count === 1 ? '' : 's'}` : 'Cart'}
    >
      <span className="icon-wrapper">
        <Image src="/icons/cart.webp" alt="" width={24} height={24} showLoader={false} />
        {/* keyed by count so the badge "pops" every time an item is added */}
        {count > 0 && (
          <span key={count} className="cart-count" aria-hidden="true">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </span>
      <span className="cart-link nav-action-label">Cart</span>
    </button>
  );
}
