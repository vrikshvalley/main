/**
 * Address Collection Modal
 * 
 * Sleek step-by-step UI for collecting user address after login
 * Shows minimal step-menu with progress indicator
 */

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '@/styles/addressCollectionModal.scss';

export default function AddressCollectionModal({ user, onComplete, onSkip }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: user?.displayName || '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    pincode: '',
    address_type: 'home'
  });
  const [errors, setErrors] = useState({});

  const totalSteps = 3;

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateStep = (currentStep) => {
    const newErrors = {};

    if (currentStep === 1) {
      if (!formData.name.trim()) {
        newErrors.name = 'Name is required';
      }
      if (!formData.phone.trim()) {
        newErrors.phone = 'Phone number is required';
      } else if (!/^[6-9]\d{9}$/.test(formData.phone)) {
        newErrors.phone = 'Enter valid 10-digit phone number';
      }
    }

    if (currentStep === 2) {
      if (!formData.address_line1.trim()) {
        newErrors.address_line1 = 'Address is required';
      }
      if (!formData.city.trim()) {
        newErrors.city = 'City is required';
      }
      if (!formData.state.trim()) {
        newErrors.state = 'State is required';
      }
      if (!formData.pincode.trim()) {
        newErrors.pincode = 'Pincode is required';
      } else if (!/^\d{6}$/.test(formData.pincode)) {
        newErrors.pincode = 'Enter valid 6-digit pincode';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      if (step < totalSteps) {
        setStep(step + 1);
      } else {
        handleComplete();
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = async () => {
    const addressData = {
      id: `addr_${Date.now()}`,
      ...formData,
      is_default: true,
      created_at: new Date().toISOString()
    };
    
    await onComplete(addressData);
  };

  return (
    <div className="address-modal-overlay">
      <motion.div
        className="address-modal"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="modal-header">
          <h2>Complete Your Profile</h2>
          <p>Add your delivery address to start shopping</p>
          
          {/* Progress Indicator */}
          <div className="progress-bar">
            <div className="progress-steps">
              {[1, 2, 3].map(s => (
                <div key={s} className={`step ${step >= s ? 'active' : ''} ${step > s ? 'completed' : ''}`}>
                  <div className="step-circle">
                    {step > s ? '✓' : s}
                  </div>
                  <span className="step-label">
                    {s === 1 ? 'Personal' : s === 2 ? 'Address' : 'Type'}
                  </span>
                </div>
              ))}
            </div>
            <div className="progress-line">
              <motion.div
                className="progress-fill"
                initial={{ width: '0%' }}
                animate={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </div>

        {/* Form Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            className="modal-content"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {step === 1 && (
              <div className="form-step">
                <h3>Personal Information</h3>
                
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="Enter your full name"
                    className={errors.name ? 'error' : ''}
                  />
                  {errors.name && <span className="error-text">{errors.name}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number *</label>
                  <input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value.replace(/\D/g, ''))}
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    className={errors.phone ? 'error' : ''}
                  />
                  {errors.phone && <span className="error-text">{errors.phone}</span>}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="form-step">
                <h3>Delivery Address</h3>
                
                <div className="form-group">
                  <label htmlFor="address_line1">Address Line 1 *</label>
                  <input
                    id="address_line1"
                    type="text"
                    value={formData.address_line1}
                    onChange={(e) => handleChange('address_line1', e.target.value)}
                    placeholder="House No., Building Name"
                    className={errors.address_line1 ? 'error' : ''}
                  />
                  {errors.address_line1 && <span className="error-text">{errors.address_line1}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="address_line2">Address Line 2 (Optional)</label>
                  <input
                    id="address_line2"
                    type="text"
                    value={formData.address_line2}
                    onChange={(e) => handleChange('address_line2', e.target.value)}
                    placeholder="Road name, Area, Colony"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="city">City *</label>
                    <input
                      id="city"
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleChange('city', e.target.value)}
                      placeholder="City"
                      className={errors.city ? 'error' : ''}
                    />
                    {errors.city && <span className="error-text">{errors.city}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="state">State *</label>
                    <input
                      id="state"
                      type="text"
                      value={formData.state}
                      onChange={(e) => handleChange('state', e.target.value)}
                      placeholder="State"
                      className={errors.state ? 'error' : ''}
                    />
                    {errors.state && <span className="error-text">{errors.state}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="pincode">Pincode *</label>
                  <input
                    id="pincode"
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => handleChange('pincode', e.target.value.replace(/\D/g, ''))}
                    placeholder="6-digit pincode"
                    maxLength={6}
                    className={errors.pincode ? 'error' : ''}
                  />
                  {errors.pincode && <span className="error-text">{errors.pincode}</span>}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="form-step">
                <h3>Address Type</h3>
                <p className="step-description">Help us deliver faster by selecting address type</p>
                
                <div className="address-type-options">
                  <button
                    type="button"
                    className={`type-option ${formData.address_type === 'home' ? 'selected' : ''}`}
                    onClick={() => handleChange('address_type', 'home')}
                  >
                    <span className="icon">🏠</span>
                    <span className="label">Home</span>
                    <span className="description">Mon-Sat delivery</span>
                  </button>

                  <button
                    type="button"
                    className={`type-option ${formData.address_type === 'work' ? 'selected' : ''}`}
                    onClick={() => handleChange('address_type', 'work')}
                  >
                    <span className="icon">💼</span>
                    <span className="label">Work</span>
                    <span className="description">Mon-Sat delivery</span>
                  </button>

                  <button
                    type="button"
                    className={`type-option ${formData.address_type === 'other' ? 'selected' : ''}`}
                    onClick={() => handleChange('address_type', 'other')}
                  >
                    <span className="icon">📍</span>
                    <span className="label">Other</span>
                    <span className="description">Custom location</span>
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Footer Actions */}
        <div className="modal-footer">
          <div className="footer-actions">
            {step > 1 && (
              <button className="btn-secondary" onClick={handleBack}>
                Back
              </button>
            )}
            
            <div className="footer-right">
              {step === 1 && (
                <button className="btn-text" onClick={onSkip}>
                  Skip for now
                </button>
              )}
              
              <button className="btn-primary" onClick={handleNext}>
                {step === totalSteps ? 'Save Address' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
