'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import TheLoader from '@/components/general/TheLoader';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (data.session) {
        // Ensure profile exists in database
        const userId = data.session.user.id;
        const userEmail = data.session.user.email;
        
        // Check if profile exists
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', userId)
          .single();

        // Create profile if it doesn't exist
        if (!existingProfile) {
          await supabase.from('profiles').insert([{
            id: userId,
            email: userEmail,
            address: []
          }]);
        }
        
        router.push('/profile'); // redirect after login
      } else if (error) {
        router.push('/auth/login-signup'); // redirect to login on error
      }
    };
    handleAuth();
  }, [router]);

  return (
    <TheLoader fullscreen />
  );
}
