'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { getProfile, createProfile, addAddress } from '@/lib/services/userService';
import TheLoader from '@/components/general/TheLoader';
import AddressCollectionModal from '@/components/profile/AddressCollectionModal';

export default function AuthCallback() {
  const router = useRouter();
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const handleAuth = async () => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          // Ensure profile exists in database
          const userId = user.uid;
          const userEmail = user.email;
          
          // Check if profile exists
          const { data: existingProfile } = await getProfile(userId);

          // Create profile if it doesn't exist
          if (!existingProfile) {
            await createProfile({
              id: userId,
              email: userEmail,
              name: user.displayName || '',
              avatar_url: user.photoURL || '',
              address: []
            });
            
            // Show address collection modal for new users
            setCurrentUser(user);
            setShowAddressModal(true);
          } else {
            // Check if user has address
            if (!existingProfile.address || existingProfile.address.length === 0) {
              setCurrentUser(user);
              setShowAddressModal(true);
            } else {
              // User has address, redirect to profile
              router.push('/profile');
            }
          }
        } else {
          router.push('/auth/signin'); // redirect to login on error
        }
        unsubscribe();
      });
    };
    handleAuth();
  }, [router]);

  const handleAddressComplete = async (addressData) => {
    if (currentUser) {
      await addAddress(currentUser.uid, addressData);
      setShowAddressModal(false);
      router.push('/profile');
    }
  };

  const handleSkip = () => {
    setShowAddressModal(false);
    router.push('/profile');
  };

  if (showAddressModal && currentUser) {
    return (
      <AddressCollectionModal
        user={currentUser}
        onComplete={handleAddressComplete}
        onSkip={handleSkip}
      />
    );
  }

  return (
    <TheLoader fullscreen />
  );
}
