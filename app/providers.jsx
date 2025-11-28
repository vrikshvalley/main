'use client';

import { Provider } from 'react-redux';
import { store } from '../lib/store';
import { AuthProvider } from '../lib/AuthContext';
import { CartProvider } from '../lib/CartContext';

export default function Providers({ children }) {
  return (
    <Provider store={store}>
      <AuthProvider>
        <CartProvider>
          {children}
        </CartProvider>
      </AuthProvider>
    </Provider>
  );
}
