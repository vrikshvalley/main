'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { formatINR } from '@/lib/hooks/useCartLines';

/**
 * One cart line, shared by the drawer and the cart page.
 * `size` is "compact" (drawer) or "roomy" (page).
 */
export default function CartLine({ item, qty, unit, onIncrement, onDecrement, onRemove, onNavigate, size = 'compact' }) {
  const regular = Number(item.regularPrice);
  const hasOffer = regular > unit;
  const details = [item.variant, item.size, item.color].filter(Boolean).join(' · ');
  const href = item.slug ? `/products/${item.slug}` : null;

  const name = href ? (
    <Link href={href} className="vv-line__name" onClick={onNavigate}>
      {item.name}
    </Link>
  ) : (
    <span className="vv-line__name">{item.name}</span>
  );

  return (
    <li className={`vv-line vv-line--${size}`}>
      <div className="vv-line__media">
        {item.image ? (
          <Image src={item.image} alt="" fill sizes={size === 'roomy' ? '140px' : '84px'} />
        ) : (
          <span className="vv-line__placeholder" aria-hidden="true">🌿</span>
        )}
        {hasOffer && item.offerBadge && <span className="vv-line__badge">{item.offerBadge}</span>}
      </div>

      <div className="vv-line__body">
        {name}
        {details && <p className="vv-line__details">{details}</p>}
        <p className="vv-line__unit">
          <span>{formatINR(unit)}</span>
          {hasOffer && <s>{formatINR(regular)}</s>}
          <small> each</small>
        </p>

        <div className="vv-line__controls">
          <div className="vv-stepper" role="group" aria-label={`Quantity of ${item.name}`}>
            <button type="button" onClick={onDecrement} aria-label={qty <= 1 ? `Remove ${item.name}` : 'Decrease quantity'}>
              {qty <= 1 ? <Trash2 size={14} /> : <Minus size={14} />}
            </button>
            <output aria-live="polite">{qty}</output>
            <button type="button" onClick={onIncrement} aria-label="Increase quantity">
              <Plus size={14} />
            </button>
          </div>
          <button type="button" className="vv-line__remove" onClick={onRemove}>
            Remove
          </button>
        </div>
      </div>

      <p className="vv-line__total">{formatINR(unit * qty)}</p>
    </li>
  );
}
