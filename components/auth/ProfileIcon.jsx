'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';
import "@/styles/profileIcon.scss";

export default function ProfileIcon() {
  const [user, setUser] = useState(null);
  const [isHovered, setIsHovered] = useState(false);

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
    <div 
      className="profile-icon"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="icon-wrapper">
        <Image 
          src={user ? "/profile.png" : "/login.png"}
          alt={user ? "Profile" : "Login"}
          width={24}
          height={24}
        />
      </div>
      <div className="profile-text">
        {user ? (
          <>
            <Link href="/profile" className="profile-link">
              {isHovered ? "Profile" : "Your garden."}
            </Link>
          </>
        ) : (
          <Link href="/auth/login-signup" className="auth-link">Login/Signup</Link>
        )}
      </div>
    </div>
  );
}
