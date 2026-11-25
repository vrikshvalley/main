'use client';

import { Provider } from 'react-redux';
import { store } from '../lib/store';
import { AuthProvider } from '../lib/AuthContext';
import { CartProvider } from '../lib/CartContext';
import CartSync from '@/components/cart/CartSync';
import { useLenis } from '@/lib/hooks/useLenis';

function SmoothScroll({ children }) {
  useLenis();
  return children;
}

export default function Providers({ children }) {
  return (
    <Provider store={store}>
      <AuthProvider>
        <CartProvider>
          <CartSync />
          <SmoothScroll>
            {children}
          </SmoothScroll>
        </CartProvider>
      </AuthProvider>
    </Provider>
  );
}
