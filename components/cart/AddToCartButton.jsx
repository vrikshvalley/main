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
      // Ensure price is a number (for products with variants, use base price)
      const productPrice = typeof product.price === 'number' ? product.price : (product.variants?.[0]?.price || 0);
      
      // Create cart item with only necessary fields
      const cartItem = {
        id: product.id,
        name: product.name,
        price: productPrice,
        image: product.images?.[0],
        qty: qty,
      };
      
      if (user) {
        // User is logged in - save to Firebase
        dispatch(addItemAsync({ item: cartItem, userId: user.uid }));
        showSuccessToast(`${product.name} added to cart! 🌱`);
      } else {
        // Guest user - save to localStorage via reducer
        dispatch(addItem(cartItem));
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
