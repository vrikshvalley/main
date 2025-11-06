'use client';

import { useDispatch } from 'react-redux';
import { addItem, addItemAsync } from '@/lib/slices/cartSlice';
import { supabase } from '@/lib/supabaseClient';
import { useState, useEffect } from 'react';
import { showSuccessToast, showErrorToast } from '@/lib/toastHelpers';

export default function AddToCartButton({ product, qty = 1 }) {
  const dispatch = useDispatch();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get current user
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const handleAddToCart = () => {
    try {
      if (user) {
        // User is logged in - save to Supabase
        dispatch(addItemAsync({ item: { ...product, qty }, userId: user.id }));
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
