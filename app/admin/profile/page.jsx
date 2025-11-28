'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';

export default function Profile() {
  const { user } = useAuth();

  return (
    <div>
      <div className="admin-profile">
        <h2>Welcome, {user?.email || 'Admin'}</h2>
        {user && (
          <div className="admin-info">
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>User ID:</strong> {user.uid}</p>
          </div>
        )}
      </div>
    </div>
  );
}