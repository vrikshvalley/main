'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { getProfile, createProfile } from '@/lib/services/userService';
import TheLoader from '@/components/general/TheLoader';

export default function AuthCallback() {
  const router = useRouter();

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
              full_name: user.displayName || '',
              avatar_url: user.photoURL || '',
              address: []
            });
          }
          
          router.push('/profile'); // redirect after login
        } else {
          router.push('/auth/login'); // redirect to login on error
        }
        unsubscribe();
      });
    };
    handleAuth();
  }, [router]);

  return (
    <TheLoader fullscreen />
  );
}
