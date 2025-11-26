'use client';

import { useDispatch } from 'react-redux';
import { addItem, addItemAsync } from '@/lib/slices/cartSlice';
import { auth } from '@/lib/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { useState, useEffect } from 'react';
import { showSuccessToast, showErrorToast } from '@/lib/toastHelpers';

export default function AddToCartButton({ product, qty = 1 }) {
  const dispatch = useDispatch();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const handleAddToCart = () => {
    try {
      if (user) {
        // User is logged in - save to Firebase
        dispatch(addItemAsync({ item: { ...product, qty }, userId: user.uid }));
        showSuccessToast(`${product.name} added to cart! 🌱`);
      } else {
        // Guest user - save to localStorage via reducer
        dispatch(addItem({ ...product, qty }));
        showSuccessToast(`${product.name} added to cart! 🌱`);
      }
    } catch (error) {
      showErrorToast('Failed to add item to cart. Please try again.');
      console.error('Error adding to cart:', error);
    }
  };

  return (
    <button className="btn" onClick={handleAddToCart}>
      Add to cart
    </button>
  );
}
