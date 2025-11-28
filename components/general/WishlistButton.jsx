'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import { auth } from '@/lib/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import * as userService from '@/lib/services/userService';
import { showSuccessToast, showErrorToast } from '@/lib/toastHelpers';

const WishlistButton = ({ product, className = '' }) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setLoading(false);
        setUser(null);
        return;
      }
      setUser(currentUser);
      const { data: wishlist } = await userService.getWishlist(currentUser.uid);
      setIsWishlisted(wishlist?.some(item => item.id === product.id));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [product.id]);

  const handleWishlistToggle = async () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    setLoading(true);
    try {
      const { error } = await userService.toggleWishlistItem(user.uid, {
        id: product.id,
        name: product.name || product.title,
        price: product.price,
        image: product.images?.[0] || product.image
      });

      if (error) throw error;
      
      setIsWishlisted(!isWishlisted);
      showSuccessToast(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist 🌱');
    } catch (err) {
      console.error('Wishlist error:', err);
      showErrorToast('Could not update wishlist');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleWishlistToggle}
      className={`wishlist-button ${className} ${isWishlisted ? 'active' : ''}`}
      disabled={loading}
      aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart className="heart-icon" fill={isWishlisted ? 'currentColor' : 'none'} />
    </button>
  );
};

export default WishlistButton;