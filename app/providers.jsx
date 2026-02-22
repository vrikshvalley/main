'use client';

import { Provider } from 'react-redux';
import { store } from '../lib/store';
import { AuthProvider } from '../lib/AuthContext';
import { CartProvider } from '../lib/CartContext';
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
          <SmoothScroll>
            {children}
          </SmoothScroll>
        </CartProvider>
      </AuthProvider>
    </Provider>
  );
}
