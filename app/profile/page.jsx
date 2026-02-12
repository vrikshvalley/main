"use client";
import React, { useEffect, useState } from 'react';
import { auth } from '@/lib/firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import TheLoader from '@/components/general/TheLoader';
import Button from '@/components/general/Button';
import ConfirmModal from '@/components/general/ConfirmModal';
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
import { useConfirmModal } from '@/lib/hooks/useConfirmModal';

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const router = useRouter();
  
  // Confirmation modal hook
  const confirmModal = useConfirmModal();
  
  // UI states
  const [nameForm, setNameForm] = useState('');
  const [editingAddress, setEditingAddress] = useState(null);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [showUpdateName, setShowUpdateName] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [pendingAddressId, setPendingAddressId] = useState(null);

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
    
    return () => unsubscribe();
  }, [router]);

  const handleUpdateName = async (e) => {
    e?.preventDefault?.();
    if (!nameForm.trim()) return toastError('Please enter a valid name');
    const res = await userService.updateProfile(user.uid, { name: nameForm.trim() });
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
    const res = await userService.addAddress(user.uid, newAddress);
    if (res.error) {
      toastError('Error adding address');
      return res;
    }
    // Firebase returns updated profile data
    const updatedProfile = res.data?.[0] || { ...profile, address: [...(profile.address||[]), newAddress] };
    setProfile(updatedProfile);
    toastSuccess('Address added successfully!');
    return res;
  };

  const handleUpdateAddress = async (updatedAddress) => {
    const res = await userService.updateAddress(user.uid, updatedAddress);
    if (res.error) {
      toastError('Error updating address');
      return res;
    }
    const updatedProfile = res.data?.[0] || profile;
    setProfile(updatedProfile);
    setEditingAddress(null);
    toastSuccess('Address updated successfully!');
    return res;
  };

  const handleDeleteAddress = async (addressId) => {
    setPendingAddressId(addressId);
    confirmModal.open({
      type: 'warning',
      title: 'Delete Address',
      message: 'Are you sure you want to delete this address? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Keep it',
      onConfirm: async () => {
        const res = await userService.deleteAddress(user.uid, addressId);
        if (res.error) {
          toastError('Error deleting address');
          return;
        }
        const updatedProfile = res.data?.[0] || profile;
        setProfile(updatedProfile);
        toastSuccess('Address deleted successfully');
        setPendingAddressId(null);
      },
      onCancel: () => {
        setPendingAddressId(null);
      },
    });
  };

  

  const handleDeactivateAccount = async () => {
    confirmModal.open({
      type: 'danger',
      title: 'Deactivate Account',
      message: 'This will permanently delete your account and all associated data. This action cannot be undone.',
      confirmText: 'Deactivate',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          const res = await userService.deleteProfile(user.uid);
          
          if (res.error) {
            toastError('Error deactivating account');
            return;
          }

          await signOut(auth);
          router.push('/');
          toastSuccess('Account deleted successfully');
        } catch (error) {
          console.error('Error:', error);
          toastError('Error deactivating account');
        }
      },
    });
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
          <Image src="/big-logo.png" alt="Vriksh Valley" width={60} height={60} className="logo" />
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
              <Button type="submit" variant="primary" size="lg" fullWidth>
                Complete Profile Setup
              </Button>
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
        <Image src="/big-logo.png" alt="Vriksh Valley" width={60} height={60} className="logo" />
        <div className="brandInfo">
          <h1>Vriksh Valley</h1>
          <p>Pure. Organic. Natural.</p>
        </div>
      </div>

      <div className="container">
        <div className="profileGrid">
          <aside className="sidebar">
            <ProfileOverview profile={profile} onEdit={() => { setNameForm(profile.name); setShowUpdateName(true); }} />
            <SecuritySettings onLogout={handleLogout} />
          </aside>

          <main className="mainContent">
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
                <Button type="button" variant="ghost" size="md" onClick={() => setShowUpdateName(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="md">Update</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        type={confirmModal.modalProps.type}
        title={confirmModal.modalProps.title}
        message={confirmModal.modalProps.message}
        confirmText={confirmModal.modalProps.confirmText}
        cancelText={confirmModal.modalProps.cancelText}
        loading={confirmModal.modalProps.loading}
        onConfirm={confirmModal.confirm}
        onCancel={confirmModal.cancel}
        showIcon={confirmModal.modalProps.showIcon}
      />
    </div>
  );
};

export default ProfilePage;