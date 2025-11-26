"use client";
import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { auth } from '@/lib/firebaseConfig';
import { sendPasswordResetEmail } from 'firebase/auth';
import { showSuccessToast, showErrorToast } from '@/lib/toastHelpers';

export default function SecuritySettings({ onLogout }) {
  const { user } = useAuth();
  const [twoFA, setTwoFA] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleToggle2FA = () => {
    setTwoFA(prev => !prev);
    showSuccessToast(`Two-factor ${!twoFA ? 'enabled' : 'disabled'} (demo)`);
  };

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
          <label>Two-factor authentication</label>
          <p className="muted">Add an extra layer of security (demo)</p>
        </div>
        <div>
          <button className="btn small" onClick={handleToggle2FA}>{twoFA ? 'Disable' : 'Enable'}</button>
        </div>
      </div>

      <div className="security-row">
        <div>
          <label>Password</label>
          <p className="muted">Reset via email</p>
        </div>
        <div>
          <button className="btn small" onClick={handlePasswordReset} disabled={resetting}>{resetting ? 'Sending...' : 'Reset Password'}</button>
        </div>
      </div>

      <div className="security-row">
        <div>
          <label>Logout</label>
          <p className="muted">Sign out of this device</p>
        </div>
        <div>
          <button className="btn danger" onClick={onLogout}>Logout</button>
        </div>
      </div>
    </section>
  );
}
