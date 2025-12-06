'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { auth } from '@/lib/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import "@/styles/profileIcon.scss";

export default function ProfileIcon() {
  const [user, setUser] = useState(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
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
          alt={user ? "Profile" : "Sign in"}
          width={24}
          height={24}
        />
      </div>
      <div className="profile-text">
        {user ? (
          <>
            <Link href="/profile" className="profile-link">
              Profile
            </Link>
          </>
        ) : (
          <Link href="/auth/signin" className="auth-link">Sign in</Link>
        )}
      </div>
    </div>
  );
}
