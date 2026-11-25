'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from '@/components/general/ImgWithLoader';
import { auth } from '@/lib/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import "@/styles/profileIcon.scss";

export default function ProfileIcon() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  // The whole icon + label is one link, so the picture is clickable too.
  return (
    <Link
      href={user ? '/profile' : '/auth/signin'}
      className="profile-icon nav-action"
      aria-label={user ? 'Your profile' : 'Log in'}
    >
      <span className="icon-wrapper">
        <Image
          src={user ? "/icons/profile.webp" : "/icons/login.webp"}
          alt=""
          width={24}
          height={24}
          showLoader={false}
        />
      </span>
      <span className="profile-text nav-action-label">{user ? 'Profile' : 'Login'}</span>
    </Link>
  );
}
