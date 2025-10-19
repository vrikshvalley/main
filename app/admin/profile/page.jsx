'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';


export default function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  return (
    <div>
      
      <div className="admin-profile">
        <h2>Welcome, {user?.email}</h2>
      </div>
    </div>
  );
}