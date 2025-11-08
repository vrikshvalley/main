"use client";
import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { showSuccessToast, showErrorToast } from '@/lib/toastHelpers';

export default function SecuritySettings({ onLogout }) {
  const [twoFA, setTwoFA] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleToggle2FA = () => {
    setTwoFA(prev => !prev);
    showSuccessToast(`Two-factor ${!twoFA ? 'enabled' : 'disabled'} (demo)`);
  };

  const handlePasswordReset = async () => {
    setResetting(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail((await supabase.auth.getUser()).data.user.email);
      if (error) throw error;
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
