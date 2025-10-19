'use client';

import { useDispatch } from 'react-redux';
import { addItem, addItemAsync } from '@/lib/slices/cartSlice';
import { supabase } from '@/lib/supabaseClient';
import { useState, useEffect } from 'react';

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
    if (user) {
      // User is logged in - save to Supabase
      dispatch(addItemAsync({ item: { ...product, qty }, userId: user.id }));
    } else {
      // Guest user - save to localStorage via reducer
      dispatch(addItem({ ...product, qty }));
    }
  };

  return (
    <button className="btn" onClick={handleAddToCart}>
      Add to cart
    </button>
  );
}
