/**
 * Address Collection Modal
 * 
 * Sleek step-by-step UI for collecting user address after login
 * Shows minimal step-menu with progress indicator
 */

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/general/Button';
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
                    <select
                      id="state"
                      value={formData.state}
                      onChange={(e) => handleChange('state', e.target.value)}
                      className={errors.state ? 'error' : ''}
                    >
                      <option value="">Select State</option>
                      <option value="Andhra Pradesh">Andhra Pradesh</option>
                      <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                      <option value="Assam">Assam</option>
                      <option value="Bihar">Bihar</option>
                      <option value="Chhattisgarh">Chhattisgarh</option>
                      <option value="Goa">Goa</option>
                      <option value="Gujarat">Gujarat</option>
                      <option value="Haryana">Haryana</option>
                      <option value="Himachal Pradesh">Himachal Pradesh</option>
                      <option value="Jharkhand">Jharkhand</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Kerala">Kerala</option>
                      <option value="Madhya Pradesh">Madhya Pradesh</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Manipur">Manipur</option>
                      <option value="Meghalaya">Meghalaya</option>
                      <option value="Mizoram">Mizoram</option>
                      <option value="Nagaland">Nagaland</option>
                      <option value="Odisha">Odisha</option>
                      <option value="Punjab">Punjab</option>
                      <option value="Rajasthan">Rajasthan</option>
                      <option value="Sikkim">Sikkim</option>
                      <option value="Tamil Nadu">Tamil Nadu</option>
                      <option value="Telangana">Telangana</option>
                      <option value="Tripura">Tripura</option>
                      <option value="Uttar Pradesh">Uttar Pradesh</option>
                      <option value="Uttarakhand">Uttarakhand</option>
                      <option value="West Bengal">West Bengal</option>
                      <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
                      <option value="Chandigarh">Chandigarh</option>
                      <option value="Dadra and Nagar Haveli and Daman and Diu">Dadra and Nagar Haveli and Daman and Diu</option>
                      <option value="Delhi">Delhi</option>
                      <option value="Jammu and Kashmir">Jammu and Kashmir</option>
                      <option value="Ladakh">Ladakh</option>
                      <option value="Lakshadweep">Lakshadweep</option>
                      <option value="Puducherry">Puducherry</option>
                    </select>
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
              <Button variant="secondary" size="md" onClick={handleBack}>
                Back
              </Button>
            )}
            
            <div className="footer-right">
              {step === 1 && (
                <Button variant="ghost" size="md" onClick={onSkip}>
                  Skip for now
                </Button>
              )}
              
              <Button variant="primary" size="md" onClick={handleNext}>
                {step === totalSteps ? 'Save Address' : 'Next'}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
