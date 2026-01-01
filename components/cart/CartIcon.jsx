'use client';

import { useSelector } from 'react-redux';
import { selectCount } from '@/lib/slices/cartSlice';
import Image from '@/components/general/ImgWithLoader';

export default function CartIcon({ onCartClick }) {
  const count = useSelector(selectCount);

  return (
    <div className='cart-icon' onClick={onCartClick}>
      <div className="icon-wrapper">
        <Image src="/cart.png" alt="Cart" width={24} height={24} />
        {count > 0 && <span className="cart-count">{count}</span>}
      </div>
      <div className="cart-link">Cart</div>
    </div>
  );
}
