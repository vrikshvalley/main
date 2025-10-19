'use client';
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Loader from '@/components/general/Loader';
import Image from 'next/image';
import '@/styles/profile.scss';

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const router = useRouter();
  
  // Form states
  const [nameForm, setNameForm] = useState('');
  const [addressForm, setAddressForm] = useState({ line1: '', line2: '', locality: '', pincode: '' });
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [showUpdateName, setShowUpdateName] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [toast, setToast] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);

  // Toast notification helper
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const getUserAndProfile = async () => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        router.push('/auth/login');
        return;
      }
      setUser(userData.user);

      // Fetch profile from database
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userData.user.id)
        .single();

      if (data) {
        // Profile exists
        setProfile(data);
        setLoading(false);
      } else {
        // Profile doesn't exist, create new one
        
        // Get name from Google/OAuth metadata if available
        const oauthName = userData.user.user_metadata?.full_name || 
                          userData.user.user_metadata?.name || 
                          null;
        
        const newProfileData = {
          id: userData.user.id,
          email: userData.user.email,
          name: oauthName,  // Will be null for email login
          address: []
        };

        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert([newProfileData])
          .select();

        if (!insertError && newProfile && newProfile.length > 0) {
          setProfile(newProfile[0]);
        } else {
          // Fallback if insert fails
          setProfile(newProfileData);
        }
        setLoading(false);
      }
    };
    getUserAndProfile();
  }, [router]);

  const handleUpdateName = async (e) => {
  e.preventDefault();
  if (!nameForm.trim()) {
    showToast('Please enter a valid name', 'error');
    return;
  }

  // First, update the profile
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ name: nameForm.trim() })
    .eq('id', user.id);

  if (updateError) {
    console.error('Update error:', updateError);
    showToast('Error updating name', 'error');
    return;
  }

  // Update local state immediately
  setProfile({ ...profile, name: nameForm.trim() });
  setShowUpdateName(false);
  setCurrentStep(3);
  showToast('Name updated successfully!', 'success');

  // Optionally refresh from DB in background (no error if fails)
  supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
    .then(({ data }) => {
      if (data) setProfile(data);
    });
};

  const handleAddAddress = async (e) => {
  e.preventDefault();
  const newAddress = {
    id: Date.now(),
    line1: addressForm.line1.trim(),
    line2: addressForm.line2.trim(),
    locality: addressForm.locality.trim(),
    pincode: addressForm.pincode.trim()
  };

  const updatedAddresses = [...(profile.address || []), newAddress];
  
  // Update the profile
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ address: updatedAddresses })
    .eq('id', user.id);

  if (updateError) {
    console.error('Add address error:', updateError);
    showToast('Error adding address', 'error');
    return;
  }

  // Update local state immediately
  setProfile({ ...profile, address: updatedAddresses });
  setAddressForm({ line1: '', line2: '', locality: '', pincode: '' });
  setShowAddAddress(false);
  showToast('Address added successfully!', 'success');
};

  const handleUpdateAddress = async (e) => {
  e.preventDefault();
  const updatedAddresses = profile.address.map(addr => 
    addr.id === editingAddress.id ? { ...addr, ...addressForm } : addr
  );

  // Update the profile
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ address: updatedAddresses })
    .eq('id', user.id);

  if (updateError) {
    console.error('Update address error:', updateError);
    showToast('Error updating address', 'error');
    return;
  }

  // Update local state immediately
  setProfile({ ...profile, address: updatedAddresses });
  setEditingAddress(null);
  setAddressForm({ line1: '', line2: '', locality: '', pincode: '' });
  showToast('Address updated successfully!', 'success');
};

 const handleDeleteAddress = async (addressId) => {
  if (!confirm('Delete this address?')) return;
  
  const updatedAddresses = profile.address.filter(addr => addr.id !== addressId);
  
  // Update the profile
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ address: updatedAddresses })
    .eq('id', user.id);

  if (updateError) {
    console.error('Delete address error:', updateError);
    showToast('Error deleting address', 'error');
    return;
  }

  // Update local state immediately
  setProfile({ ...profile, address: updatedAddresses });
  showToast('Address deleted successfully!', 'success');
};

  

  const handleDeactivateAccount = async () => {
    if (!confirm('Are you sure you want to deactivate your account?')) return;
    
    const confirmation = prompt('Type "DELETE" to confirm account deletion:');
    if (confirmation !== 'DELETE') {
      showToast('Deactivation cancelled', 'error');
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', user.id);

    if (error) {
      showToast('Error deactivating account', 'error');
    } else {
      await supabase.auth.signOut();
      router.push('/');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  const openEditAddress = (address) => {
    setEditingAddress(address);
    setAddressForm({
      line1: address.line1,
      line2: address.line2,
      locality: address.locality,
      pincode: address.pincode
    });
  };

  if (loading) return <Loader />;

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
        <div className="profileGrid">
          {/* Sidebar */}
          <div className="sidebar">
            <div className="profileCard">
              <div className="avatar">{getInitials(profile.name)}</div>
              <h2 className="userName">{profile.name}</h2>
              <p className="userEmail">{profile.email}</p>
              
              <div className="actionButtons">
                <button className="btn secondary" onClick={() => {
                  setNameForm(profile.name);
                  setShowUpdateName(true);
                }}>
                  Update Name
                </button>
                <button className="btn primary" onClick={handleLogout}>
                  Logout
                </button>
                <button className="btn danger" onClick={handleDeactivateAccount}>
                  Deactivate Account
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="mainContent">
            {/* Addresses Section */}
            <div className="section">
              <div className="sectionHeader">
                <h3>📍 My Addresses</h3>
                <button className="addBtn" onClick={() => setShowAddAddress(true)}>
                  + Add Address
                </button>
              </div>

              <div className="addressGrid">
                {profile.address && profile.address.length > 0 ? (
                  profile.address.map((address) => (
                    <div className="addressCard" key={address.id}>
                      <button className="deleteBtn" onClick={() => handleDeleteAddress(address.id)}>
                        ×
                      </button>
                      <div className="addressInfo">
                        <p><strong>Address:</strong> {address.line1}</p>
                        {address.line2 && <p>{address.line2}</p>}
                        <p><strong>Locality:</strong> {address.locality}</p>
                        <p><strong>Pincode:</strong> {address.pincode}</p>
                      </div>
                      <button className="editBtn" onClick={() => openEditAddress(address)}>
                        Edit Address
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="noAddresses">No addresses added yet. Add your first address to get started!</p>
                )}
              </div>
            </div>
          </div>
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

      {/* Add Address Modal */}
      {showAddAddress && (
        <div className="modal" onClick={() => setShowAddAddress(false)}>
          <div className="modalContent" onClick={(e) => e.stopPropagation()}>
            <h3>Add New Address</h3>
            <form className="form" onSubmit={handleAddAddress}>
              <div className="formGroup">
                <label htmlFor="line1">Address Line 1 *</label>
                <input
                  id="line1"
                  type="text"
                  placeholder="House No., Street Name"
                  value={addressForm.line1}
                  onChange={(e) => setAddressForm({...addressForm, line1: e.target.value})}
                  required
                />
              </div>
              <div className="formGroup">
                <label htmlFor="line2">Address Line 2</label>
                <input
                  id="line2"
                  type="text"
                  placeholder="Apartment, Building (Optional)"
                  value={addressForm.line2}
                  onChange={(e) => setAddressForm({...addressForm, line2: e.target.value})}
                />
              </div>
              <div className="formGroup">
                <label htmlFor="locality">Locality/Area *</label>
                <input
                  id="locality"
                  type="text"
                  placeholder="Locality or Area"
                  value={addressForm.locality}
                  onChange={(e) => setAddressForm({...addressForm, locality: e.target.value})}
                  required
                />
              </div>
              <div className="formGroup">
                <label htmlFor="pincode">Pincode *</label>
                <input
                  id="pincode"
                  type="text"
                  placeholder="6-digit pincode"
                  value={addressForm.pincode}
                  onChange={(e) => setAddressForm({...addressForm, pincode: e.target.value})}
                  required
                  pattern="[0-9]{6}"
                  maxLength={6}
                />
              </div>
              <div className="buttonGroup">
                <button type="button" className="cancel" onClick={() => setShowAddAddress(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit">Add Address</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Address Modal */}
      {editingAddress && (
        <div className="modal" onClick={() => setEditingAddress(null)}>
          <div className="modalContent" onClick={(e) => e.stopPropagation()}>
            <h3>Edit Address</h3>
            <form className="form" onSubmit={handleUpdateAddress}>
              <div className="formGroup">
                <label htmlFor="editLine1">Address Line 1 *</label>
                <input
                  id="editLine1"
                  type="text"
                  placeholder="House No., Street Name"
                  value={addressForm.line1}
                  onChange={(e) => setAddressForm({...addressForm, line1: e.target.value})}
                  required
                />
              </div>
              <div className="formGroup">
                <label htmlFor="editLine2">Address Line 2</label>
                <input
                  id="editLine2"
                  type="text"
                  placeholder="Apartment, Building (Optional)"
                  value={addressForm.line2}
                  onChange={(e) => setAddressForm({...addressForm, line2: e.target.value})}
                />
              </div>
              <div className="formGroup">
                <label htmlFor="editLocality">Locality/Area *</label>
                <input
                  id="editLocality"
                  type="text"
                  placeholder="Locality or Area"
                  value={addressForm.locality}
                  onChange={(e) => setAddressForm({...addressForm, locality: e.target.value})}
                  required
                />
              </div>
              <div className="formGroup">
                <label htmlFor="editPincode">Pincode *</label>
                <input
                  id="editPincode"
                  type="text"
                  placeholder="6-digit pincode"
                  value={addressForm.pincode}
                  onChange={(e) => setAddressForm({...addressForm, pincode: e.target.value})}
                  required
                  pattern="[0-9]{6}"
                  maxLength={6}
                />
              </div>
              <div className="buttonGroup">
                <button type="button" className="cancel" onClick={() => setEditingAddress(null)}>
                  Cancel
                </button>
                <button type="submit" className="submit">Update Address</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
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
};

export default ProfilePage;