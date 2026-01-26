"use client";
import React from 'react';
import Image from '@/components/general/ImgWithLoader';
import Button from '@/components/general/Button';
import { showSuccessToast } from '@/lib/toastHelpers';

export default function ProfileOverview({ profile, onEdit }) {
  const initials = (profile?.name || '?').split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2);

  return (
    <section className="profile-overview card" aria-labelledby="profile-overview-title">
      <div className="overview-top">
        <div className="avatar" aria-hidden>
          {profile?.avatarUrl ? (
            <Image src={profile.avatarUrl} alt={`${profile.name} avatar`} width={72} height={72} />
          ) : (
            <div className="initials">{initials}</div>
          )}
        </div>

        <div className="meta">
          <h2 id="profile-overview-title">{profile?.name || 'Your Name'}</h2>
          <p className="muted">{profile?.email}</p>
          {profile?.phone && <p className="muted">{profile.phone}</p>}
        </div>
      </div>

      <div className="overview-actions">
        <Button variant="primary" size="md" onClick={() => onEdit?.()}>Edit Profile</Button>
        <Button variant="secondary" size="md" onClick={() => showSuccessToast('Profile saved locally (demo)')}>
          Save Profile
        </Button>
      </div>
    </section>
  );
}
