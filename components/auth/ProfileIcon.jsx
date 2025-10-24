'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { CircleUserRound } from 'lucide-react';
import "@/styles/profileIcon.scss";

export default function ProfileIcon() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Fetch current user
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    getUser();

    // Listen for login/logout changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="profile-icon">
      <div className="icon-wrapper">
        <CircleUserRound size={24} />
      </div>
      <div className="profile-text">
        {user ? (
          <>
            <Link href="/profile" className="profile-link">Profile</Link>
          </>
        ) : (
          <Link href="/auth/login" className="auth-link">Login/Signup</Link>
        )}
      </div>
    </div>
  );
}
