"use client";
import React, { useState } from 'react';
import Button from '@/components/general/Button';
import { useAuth } from '@/lib/AuthContext';
import { auth } from '@/lib/firebaseConfig';
import { sendPasswordResetEmail } from 'firebase/auth';
import { showSuccessToast, showErrorToast } from '@/lib/toastHelpers';

export default function SecuritySettings({ onLogout }) {
  const { user } = useAuth();
  const [resetting, setResetting] = useState(false);

  const handlePasswordReset = async () => {
    if (!user?.email) {
      showErrorToast('No email found for this account');
      return;
    }

    setResetting(true);
    try {
      await sendPasswordResetEmail(auth, user.email);
      showSuccessToast('Password reset email sent');
    } catch (err) {
      console.error(err);
      showErrorToast('Could not send reset email');
    } finally {
      setResetting(false);
    }
  };

  return (
    <section className="security card">
      <h3>Security & Account</h3>

      <div className="security-row">
        <div>
          <label>Password</label>
          <p className="muted">Reset via email</p>
        </div>
        <div>
          <Button variant="secondary" size="sm" onClick={handlePasswordReset} disabled={resetting}>{resetting ? 'Sending...' : 'Reset Password'}</Button>
        </div>
      </div>

      <div className="security-row">
        <div>
          <label>Logout</label>
          <p className="muted">Sign out of this device</p>
        </div>
        <div>
          <Button variant="danger" size="md" onClick={onLogout}>Logout</Button>
        </div>
      </div>
    </section>
  );
}
