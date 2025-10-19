import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './slices/cartSlice';

export const makeStore = () => configureStore({
  reducer: {
    cart: cartReducer,
  },
});

export const store = makeStore();

// Infer types are NOT needed (no TS). Export helpers if needed later.
