"use client";
import React, { useEffect, useState } from 'react';
import { auth } from '@/lib/firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import TheLoader from '@/components/general/TheLoader';
import Image from 'next/image';
import '@/styles/profile.scss';
import '@/styles/profileComponents.scss';

import ProfileOverview from '@/components/profile/ProfileOverview';
import Addresses from '@/components/profile/Addresses';
import OrderHistory from '@/components/profile/OrderHistory';
import Payments from '@/components/profile/Payments';
import Wishlist from '@/components/profile/Wishlist';
import SecuritySettings from '@/components/profile/SecuritySettings';

import * as userService from '@/lib/services/userService';
import { showSuccessToast, showErrorToast } from '@/lib/toastHelpers';

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const router = useRouter();
  
  // UI states
  const [nameForm, setNameForm] = useState('');
  const [editingAddress, setEditingAddress] = useState(null);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [showUpdateName, setShowUpdateName] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // local helper uses centralized toast helpers
  const toastSuccess = (msg) => showSuccessToast(msg);
  const toastError = (msg) => showErrorToast(msg);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push('/auth/signin');
        return;
      }
      setUser(currentUser);

      // Fetch profile via service
      const { data, error } = await userService.getProfile(currentUser.uid);
      if (error) {
        // try creating minimal profile
        const oauthName = currentUser.displayName || null;
        const newProfileData = { id: currentUser.uid, email: currentUser.email, name: oauthName, address: [] };
        const created = await userService.createProfile(newProfileData);
        if (!created.error) setProfile(created.data?.[0] || newProfileData);
        else setProfile(newProfileData);
      } else {
        setProfile(data);
      }
      setLoading(false);
    });
    getUserAndProfile();
  }, [router]);

  const handleUpdateName = async (e) => {
    e?.preventDefault?.();
    if (!nameForm.trim()) return toastError('Please enter a valid name');
    const res = await userService.updateProfile(user.id, { name: nameForm.trim() });
    if (res.error) return toastError('Error updating name');
    // update local state using returned record if present
    const updated = res.data?.[0] || { ...profile, name: nameForm.trim() };
    setProfile(updated);
    setShowUpdateName(false);
    setCurrentStep(3);
    toastSuccess('Name updated successfully!');
  };

  const handleAddAddress = async (newAddress) => {
    // newAddress expected to contain id, line1, locality, pincode etc.
    const res = await userService.addAddress(user.id, newAddress);
    if (res.error) {
      toastError('Error adding address');
      return res;
    }
    // Firebase returns updated profile data
    const updatedProfile = res.data?.[0] || { ...profile, address: [...(profile.address||[]), newAddress] };
    setProfile(updatedProfile);
    return res;
  };

  const handleUpdateAddress = async (updatedAddress) => {
    const res = await userService.updateAddress(user.id, updatedAddress);
    if (res.error) {
      toastError('Error updating address');
      return res;
    }
    const updatedProfile = res.data?.[0] || profile;
    setProfile(updatedProfile);
    setEditingAddress(null);
    return res;
  };

 const handleDeleteAddress = async (addressId) => {
    if (!confirm('Delete this address?')) return;
    const res = await userService.deleteAddress(user.id, addressId);
    if (res.error) return toastError('Error deleting address');
    const updatedProfile = res.data?.[0] || profile;
    setProfile(updatedProfile);
    toastSuccess('Address deleted');
 };

  

  const handleDeactivateAccount = async () => {
    if (!confirm('Are you sure you want to deactivate your account?')) return;
    
    const confirmation = prompt('Type "DELETE" to confirm account deletion:');
    if (confirmation !== 'DELETE') {
      showErrorToast('Deactivation cancelled');
      return;
    }

    try {
      // Delete user profile from Firebase
      const res = await userService.deleteProfile(user.id);
      
      if (res.error) {
        showErrorToast('Error deactivating account');
      } else {
        await signOut(auth);
        router.push('/');
        showSuccessToast('Account deleted successfully');
      }
    } catch (error) {
      console.error('Error:', error);
      showErrorToast('Error deactivating account');
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/auth/signin');
  };

  const openEditAddress = (address) => {
    setEditingAddress(address);
    // child component will handle editing form
  };

  if (loading) return <TheLoader fullscreen />;

  // Initial setup stepper if name is missing
  if (!profile?.name) {
    return (
      <div className="profilePage">
        <div className="brandHeader">
          <Image src="/logo.png" alt="Vriksh Valley" width={60} height={60} className="logo" />
          <div className="brandInfo">
            <h1>Vriksh Valley</h1>
            <p>Pure. Organic. Natural.</p>
          </div>
        </div>

        <div className="container">
          <div className="setupStepper">
            <div className="stepperHeader">
              <h2>Welcome to Vriksh Valley!</h2>
              <p>Let's set up your profile to get started</p>
            </div>

            <div className="steps">
              <div className="step">
                <div className={`stepNumber ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
                  {currentStep > 1 ? '' : '1'}
                </div>
                <span className={`stepLabel ${currentStep === 1 ? 'active' : ''}`}>Login</span>
              </div>
              <div className="step">
                <div className={`stepNumber ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
                  {currentStep > 2 ? '' : '2'}
                </div>
                <span className={`stepLabel ${currentStep === 2 ? 'active' : ''}`}>Enter Name</span>
              </div>
              <div className="step">
                <div className={`stepNumber ${currentStep >= 3 ? 'active' : ''}`}>
                  3
                </div>
                <span className={`stepLabel ${currentStep === 3 ? 'active' : ''}`}>Complete</span>
              </div>
            </div>

            <form className="stepperForm" onSubmit={handleUpdateName}>
              <div className="formGroup">
                <label htmlFor="name">What should we call you?</label>
                <input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={nameForm}
                  onChange={(e) => {
                    setNameForm(e.target.value);
                    setCurrentStep(2);
                  }}
                  required
                  minLength={2}
                />
              </div>
              <button type="submit" className="submitBtn">
                Complete Profile Setup
              </button>
            </form>
          </div>
        </div>

        {toast && (
          <div className={`toast ${toast.type}`}>
            <div className="toastContent">
              <span className="toastIcon">{toast.type === 'success' ? '✓' : '✕'}</span>
              <span className="toastMessage">{toast.message}</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Get user initials for avatar
  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="profilePage">
      <div className="brandHeader">
        <Image src="/logo.png" alt="Vriksh Valley" width={60} height={60} className="logo" />
        <div className="brandInfo">
          <h1>Vriksh Valley</h1>
          <p>Pure. Organic. Natural.</p>
        </div>
      </div>

      <div className="container">
        <div className="profile-grid">
          <aside>
            <ProfileOverview profile={profile} onEdit={() => { setNameForm(profile.name); setShowUpdateName(true); }} />
            <SecuritySettings onLogout={handleLogout} />
          </aside>

          <main>
            <OrderHistory userId={user?.id} />
            <Addresses addresses={profile?.address || []}
                       onAdd={handleAddAddress}
                       onEdit={openEditAddress}
                       onDelete={handleDeleteAddress} />

            <Payments payments={profile?.payments || []} onSetDefault={(id) => { /* implement if needed */ }} />

            <Wishlist items={profile?.wishlist || []} onRemove={async (id) => { await userService.removeWishlistItem(user.id, id); const refreshed = await userService.getProfile(user.id); if (!refreshed.error) setProfile(refreshed.data); }} onAddToCart={(item) => { /* wire to cart */ }} />
          </main>
        </div>
      </div>

      {/* Update Name Modal */}
      {showUpdateName && (
        <div className="modal" onClick={() => setShowUpdateName(false)}>
          <div className="modalContent" onClick={(e) => e.stopPropagation()}>
            <h3>Update Your Name</h3>
            <form className="form" onSubmit={handleUpdateName}>
              <div className="formGroup">
                <label htmlFor="updateName">Full Name</label>
                <input
                  id="updateName"
                  type="text"
                  value={nameForm}
                  onChange={(e) => setNameForm(e.target.value)}
                  required
                  minLength={2}
                />
              </div>
              <div className="buttonGroup">
                <button type="button" className="cancel" onClick={() => setShowUpdateName(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit">Update</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;