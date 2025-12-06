'use client';

/**
 * Auth Callback Page
 * 
 * Handles post-authentication flow:
 * 1. Firebase Auth creates user in "users" collection (automatic)
 * 2. We create profile in "profiles" Firestore collection
 * 3. Check if user has address
 * 4. Show AddressCollectionModal if no address exists
 * 5. Redirect to intended page after completion
 * 
 * Profile Structure in Firestore:
 * profiles/{userId}:
 *   - id: string (matches Firebase Auth uid)
 *   - email: string
 *   - name: string
 *   - phone: string
 *   - avatar_url: string
 *   - address: array of address objects
 *   - createdAt: timestamp
 *   - updatedAt: timestamp
 */

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { auth } from '@/lib/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { getProfile, createProfile, addAddress } from '@/lib/services/userService';
import TheLoader from '@/components/general/TheLoader';
import AddressCollectionModal from '@/components/profile/AddressCollectionModal';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [redirectUrl, setRedirectUrl] = useState(null);

  useEffect(() => {
    // Get redirect URL from query params or localStorage
    const redirect = searchParams.get('redirect') || localStorage.getItem('authRedirect') || '/profile';
    setRedirectUrl(redirect);
    
    // Clear the stored redirect
    localStorage.removeItem('authRedirect');
  }, [searchParams]);

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
              // User has address, redirect to intended page
              router.push(redirectUrl || '/profile');
            }
          }
        } else {
          router.push('/auth/signin'); // redirect to login on error
        }
        unsubscribe();
      });
    };
    
    if (redirectUrl !== null) {
      handleAuth();
    }
  }, [router, redirectUrl]);

  const handleAddressComplete = async (addressData) => {
    if (currentUser) {
      // Extract phone and name from address data
      const { phone, name, ...addressOnly } = addressData;
      
      // Update profile with phone and name if provided
      if (phone || name) {
        const profileUpdates = {};
        if (name) profileUpdates.name = name;
        if (phone) profileUpdates.phone = phone;
        
        const { updateProfile } = await import('@/lib/services/userService');
        await updateProfile(currentUser.uid, profileUpdates);
      }
      
      // Add the address
      await addAddress(currentUser.uid, addressOnly);
      setShowAddressModal(false);
      router.push(redirectUrl || '/profile');
    }
  };

  const handleSkip = () => {
    setShowAddressModal(false);
    router.push(redirectUrl || '/profile');
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

export default function AuthCallback() {
  return (
    <Suspense fallback={<TheLoader fullscreen />}>
      <AuthCallbackContent />
    </Suspense>
  );
}
