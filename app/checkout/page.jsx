'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { useAuth } from '@/lib/AuthContext';
import * as userService from '@/lib/services/userService';
import * as orderService from '@/lib/services/orderService';
import { showSuccessToast, showErrorToast } from '@/lib/toastHelpers';
import { clearCart } from '@/lib/slices/cartSlice';
import TheLoader from '@/components/general/TheLoader';
import '@/styles/checkout.scss';
import Button from '@/components/general/Button';
import { auth } from '@/lib/firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { mergeAndSyncCart, loadCartFromLocalStorage } from '@/lib/cartUtils';
import { setCart } from '@/lib/slices/cartSlice';

const CheckoutPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, loading: authLoading } = useAuth();
  const cartItems = useSelector((state) => state.cart.items);

  const [step, setStep] = useState(1); // 1: Address, 2: Payment, 3: Confirmation
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [userId, setUserId] = useState(null); // Track userId for both authenticated and guest orders
  // Inline account creation for guest users
  const [createEmail, setCreateEmail] = useState('');
  const [createPhone, setCreatePhone] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [createConfirm, setCreateConfirm] = useState('');
  const [creatingAccount, setCreatingAccount] = useState(false);

  // Address step
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({
    line1: '',
    line2: '',
    locality: '',
    city: '',
    state: '',
    pincode: '',
  });

  // Shipping cost calculation
  const [shippingCost, setShippingCost] = useState(0);
  const [calculatingShipping, setCalculatingShipping] = useState(false);

  // Check authentication and load user data
  useEffect(() => {
    const initializeCheckout = async () => {
      if (authLoading) return;

      // Allow guests to start checkout; if not logged in we'll offer inline account creation
      if (!user) {
        setLoading(false);
        return;
      }

      // User is logged in - set userId
      setUserId(user.uid);

      if (Object.keys(cartItems).length === 0) {
        showErrorToast('Your cart is empty');
        router.push('/');
        return;
      }

      const { data: profileData } = await userService.getProfile(user.uid);
      if (profileData) {
        setProfile(profileData);
        if (profileData.address && profileData.address.length > 0) {
          const defaultAddress = profileData.address[0];
          setSelectedAddress(defaultAddress);
          // Calculate shipping cost for default address
          calculateShippingCost(defaultAddress);
        }
      }

      setLoading(false);
    };

    initializeCheckout();
  }, [user, authLoading, cartItems, router]);

  const handleCreateAccountAndProceed = async () => {
    if (!createEmail || !createPhone || !createPassword || !createConfirm) {
      showErrorToast('Please fill all account fields');
      return;
    }
    if (createPassword !== createConfirm) {
      showErrorToast('Passwords do not match');
      return;
    }

    setCreatingAccount(true);
    try {
      // Create Firebase Auth user
      const cred = await createUserWithEmailAndPassword(auth, createEmail, createPassword);
      const newUser = cred.user;

      // Build profile object (include address if selected)
      const profilePayload = {
        id: newUser.uid,
        email: createEmail,
        phone: createPhone,
        name: '',
        address: selectedAddress ? [selectedAddress] : [],
      };

      await userService.createProfile(profilePayload);

      // Merge guest cart with user cart and set into redux
      const guestCart = loadCartFromLocalStorage();
      const mergedCart = await mergeAndSyncCart(newUser.uid, guestCart);
      dispatch(setCart(mergedCart));

      // ✅ Set userId for the newly created account
      setUserId(newUser.uid);

      showSuccessToast('Account created — continuing to payment');
      // small delay to allow auth state propagation
      setTimeout(() => setStep(2), 400);
    } catch (err) {
      console.error('Create account error', err);
      showErrorToast(err.message || 'Could not create account');
    } finally {
      setCreatingAccount(false);
    }
  };

  // Check for payment callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const callbackOrderId = params.get('order_id');
    const paymentStatus = params.get('status');

    if (callbackOrderId && paymentStatus) {
      // Coming back from payment redirect
      if (paymentStatus === 'success') {
        handlePaymentCallback(callbackOrderId);
      } else {
        showErrorToast('Payment was not completed');
        setProcessing(false);
      }
    }
  }, []);

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!addressForm.line1 || !addressForm.locality || !/^[0-9]{6}$/.test(addressForm.pincode)) {
      showErrorToast('Please fill all required address fields');
      return;
    }

    // Validate pincode serviceability with Delhivery
    try {
      const serviceabilityResponse = await fetch('/api/shipping/check-pincode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pincode: addressForm.pincode }),
      });

      const serviceabilityData = await serviceabilityResponse.json();

      if (!serviceabilityData.success || !serviceabilityData.data?.delivery) {
        showErrorToast(`Delivery not available for pincode ${addressForm.pincode}`);
        return;
      }
    } catch (error) {
      console.error('Pincode validation error:', error);
      showErrorToast('Could not validate pincode. Please try again.');
      return;
    }

    const newAddress = {
      id: Date.now(),
      ...addressForm,
    };

    const res = await userService.addAddress(user.uid, newAddress);
    if (res.error) {
      showErrorToast('Could not add address');
      return;
    }

    const updatedProfile = res.data?.[0] || { ...profile, address: [...(profile.address || []), newAddress] };
    setProfile(updatedProfile);
    setSelectedAddress(newAddress);
    setShowAddAddress(false);
    setAddressForm({ line1: '', line2: '', locality: '', city: '', state: '', pincode: '' });
    showSuccessToast('Address added successfully');
    
    // Calculate shipping cost for the new address
    calculateShippingCost(newAddress);
  };

  const calculateShippingCost = async (address) => {
    if (!address || !address.pincode) return;
    
    setCalculatingShipping(true);
    try {
      // Calculate total weight from cart items (assume 0.5kg per item as placeholder)
      const totalWeight = cartItems.reduce((sum, item) => sum + (0.5 * item.quantity), 0.5);
      
      // Calculate total declared value from cart items
      const declaredValue = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      const costResponse = await fetch('/api/shipping/calculate-cost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originPin: process.env.NEXT_PUBLIC_SELLER_PINCODE || '110001', // Default to Delhi if not set
          destinationPin: address.pincode,
          weight: totalWeight,
          paymentMode: 'Prepaid',
          declaredValue: declaredValue,
        }),
      });

      const costData = await costResponse.json();

      if (costData.success && costData.data?.totalAmount) {
        setShippingCost(costData.data.totalAmount);
      } else {
        // Fallback: use fixed shipping cost if calculation fails
        setShippingCost(50); // Default ₹50 shipping
      }
    } catch (error) {
      console.error('Shipping cost calculation error:', error);
      setShippingCost(50); // Default ₹50 shipping on error
    } finally {
      setCalculatingShipping(false);
    }
  };

  const handleProceedToPayment = () => {
    if (!selectedAddress) {
      showErrorToast('Please select a delivery address');
      return;
    }
    setStep(2);
  };

  const handlePayment = async () => {
    setProcessing(true);

    try {
      // Calculate order totals with actual shipping cost
      const totals = orderService.calculateOrderTotals(cartItems, shippingCost, 0);
      const orderId = orderService.generateOrderId();
      
      // For guest orders without userId, we'll use 'guest_' prefix for reference
      const orderUserId = userId || `guest_${Math.random().toString(36).substr(2, 9)}`;

      // Store order context in localStorage before redirect
      const orderContext = {
        orderId,
        totals,
        cartItems,
        selectedAddress,
        profile: {
          name: profile.name || '',
          email: profile.email,
          phone: profile.phone,
        },
        userId: orderUserId,
        isGuestOrder: !userId, // Flag to identify guest orders
      };
      localStorage.setItem('pending_order', JSON.stringify(orderContext));

      // Create callback URL
      const callbackUrl = `${window.location.origin}/checkout?order_id=${orderId}&status=success`;

      // Create Razorpay order via API
      const orderResponse = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(totals.total * 100), // Convert rupees to paisa for Razorpay
          merchantOrderId: orderId,
          redirectUrl: callbackUrl,
          customerName: profile.name,
          customerEmail: profile.email,
        }),
      });

      const { redirectUrl, error } = await orderResponse.json();

      if (error || !redirectUrl) {
        throw new Error(error?.message || 'Failed to create payment order');
      }

      // Redirect to Razorpay payment page
      window.location.href = redirectUrl;
    } catch (error) {
      console.error('Payment error:', error);
      showErrorToast(error.message || 'Payment failed');
      setProcessing(false);
      localStorage.removeItem('pending_order');
    }
  };

  const handlePaymentCallback = async (callbackOrderId) => {
    setProcessing(true);

    try {
      // Retrieve order context from localStorage
      const orderContextStr = localStorage.getItem('pending_order');
      if (!orderContextStr) {
        throw new Error('Order context not found');
      }

      const orderContext = JSON.parse(orderContextStr);

      // Verify payment with Razorpay
      const verifyResponse = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchantOrderId: callbackOrderId,
        }),
      });

      const { success, transactionId, orderId, error } = await verifyResponse.json();

      if (!success) {
        throw new Error(error?.message || 'Payment verification failed');
      }

      // Create order in Firebase
      const orderPayload = {
        userId: orderContext.userId,
        orderId: callbackOrderId,
        status: 'confirmed',
        paymentStatus: 'paid',
        paymentMethod: 'razorpay',
        razorpayOrderId: callbackOrderId,
        razorpayPaymentId: orderId,
        razorpaySignature: transactionId,
        items: orderContext.cartItems.map((item) => ({
          product_id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        subtotal: orderContext.totals.subtotal,
        shippingCharges: orderContext.totals.shippingCharges,
        tax: orderContext.totals.tax,
        discount: orderContext.totals.discount,
        total: orderContext.totals.total,
        customerName: orderContext.profile.name,
        customerEmail: orderContext.profile.email,
        customerPhone: orderContext.profile.phone || '',
        shippingAddress: orderContext.selectedAddress,
        orderDate: new Date().toISOString(),
        paymentDate: new Date().toISOString(),
      };

      const { data: createdOrder, error: orderError } = await orderService.createOrder(orderPayload);

      if (orderError) {
        throw new Error('Failed to create order');
      }

      // Create Delhivery shipment
      const shipmentResponse = await fetch('/api/shipping/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: callbackOrderId,
          order: createdOrder,
        }),
      });

      const shipmentData = await shipmentResponse.json();
      
      if (!shipmentData.success) {
        console.error('Shipment creation failed:', shipmentData.error);
        showErrorToast('Shipment creation failed: ' + (shipmentData.error?.message || 'Unknown error'));
        // Continue order flow but mark for manual shipment creation
        // Note: Order is created but shipment may need manual intervention
      }

      // Send order confirmation email
      await fetch('/api/email/order-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order: createdOrder,
        }),
      });

      // Clear cart and localStorage
      dispatch(clearCart());
      localStorage.removeItem('pending_order');

      // Remove query params from URL
      window.history.replaceState({}, '', '/checkout');

      // Show success and move to confirmation
      setOrderData(createdOrder);
      setStep(3);
      showSuccessToast('Order placed successfully! 🎉');
    } catch (error) {
      console.error('Order creation error:', error);
      showErrorToast(error.message || 'Failed to create order');
      localStorage.removeItem('pending_order');
      // Redirect back to cart
      setTimeout(() => router.push('/cart'), 2000);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <TheLoader fullscreen />;

  const totals = orderService.calculateOrderTotals(cartItems, shippingCost, 0);

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        {/* Stepper */}
        <div className="checkout-stepper">
          <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
            <div className="step-number">{step > 1 ? '✓' : '1'}</div>
            <span>Address</span>
          </div>
          <div className={`step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
            <div className="step-number">{step > 2 ? '✓' : '2'}</div>
            <span>Payment</span>
          </div>
          <div className={`step ${step >= 3 ? 'active' : ''}`}>
            <div className="step-number">3</div>
            <span>Confirmation</span>
          </div>
        </div>

        {/* Step 1: Address Selection */}
        {step === 1 && (
          <div className="checkout-step">
            <h2>Select Delivery Address</h2>

            <div className="address-list">
              {profile?.address && profile.address.length > 0 ? (
                profile.address.map((addr) => (
                  <div
                    key={addr.id}
                    className={`address-card ${selectedAddress?.id === addr.id ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedAddress(addr);
                      calculateShippingCost(addr);
                    }}
                  >
                    <input type="radio" checked={selectedAddress?.id === addr.id} readOnly />
                    <div className="address-details">
                      <p className="address-line">{addr.line1}</p>
                      {addr.line2 && <p className="address-line">{addr.line2}</p>}
                      <p className="address-meta">
                        {addr.locality}, {addr.city}
                      </p>
                      <p className="address-meta">
                        {addr.state} - {addr.pincode}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-address">
                  <p>📍 No saved addresses. Please add a delivery address to proceed with checkout.</p>
                  {!user && <p style={{fontSize: '0.9rem', color: '#999', marginTop: '5px'}}>You can continue as guest or create an account after adding an address.</p>}
                </div>
              )}
            </div>

            <Button variant="primary" size="md" onClick={() => setShowAddAddress(true)}>
              + Add New Address
            </Button>

            {showAddAddress && (
              <form className="address-form" onSubmit={handleAddAddress}>
                <h3>Add New Address</h3>
                <input
                  type="text"
                  placeholder="Address Line 1 *"
                  value={addressForm.line1}
                  onChange={(e) => setAddressForm({ ...addressForm, line1: e.target.value })}
                  required
                />
                <input
                  type="text"
                  placeholder="Address Line 2 (Optional)"
                  value={addressForm.line2}
                  onChange={(e) => setAddressForm({ ...addressForm, line2: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Locality / Area *"
                  value={addressForm.locality}
                  onChange={(e) => setAddressForm({ ...addressForm, locality: e.target.value })}
                  required
                />
                <input
                  type="text"
                  placeholder="City *"
                  value={addressForm.city}
                  onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                  required
                />
                <input
                  type="text"
                  placeholder="State *"
                  value={addressForm.state}
                  onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                  required
                />
                <input
                  type="text"
                  placeholder="Pincode (6 digits) *"
                  value={addressForm.pincode}
                  maxLength={6}
                  onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value.replace(/[^0-9]/g, '') })}
                  required
                />
                <div className="form-buttons">
                  <Button type="button" variant="ghost" size="md" onClick={() => setShowAddAddress(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="md">
                    Save Address
                  </Button>
                </div>
              </form>
            )}

            {/* If guest, show inline account creation or continue-as-guest options */}
            <div className="inline-account-section">
              {!user ? (
                <>
                  <h3>🔐 Choose your checkout method</h3>
                  <p style={{fontSize: '0.95rem', color: '#666', marginBottom: '15px'}}>Create an account to save your address and order history, or continue as a guest.</p>
                  <div className="create-account-form">
                    <input type="email" placeholder="Email" value={createEmail} onChange={(e) => setCreateEmail(e.target.value)} />
                    <input type="tel" placeholder="Phone" value={createPhone} onChange={(e) => setCreatePhone(e.target.value)} />
                    <input type="password" placeholder="Password" value={createPassword} onChange={(e) => setCreatePassword(e.target.value)} />
                    <input type="password" placeholder="Confirm Password" value={createConfirm} onChange={(e) => setCreateConfirm(e.target.value)} />
                  </div>
                  <div className="step-actions">
                    <Button variant="primary" size="md" onClick={handleCreateAccountAndProceed} disabled={!selectedAddress || creatingAccount}>
                      {creatingAccount ? 'Creating account...' : '✓ Create Account & Continue'}
                    </Button>
                    <Button variant="ghost" size="md" onClick={() => { 
                      if (!selectedAddress) {
                        showErrorToast('Please select or add a delivery address');
                        return;
                      }
                      if (!createEmail || !createPhone) {
                        showErrorToast('Please enter email and phone number');
                        return;
                      }
                      // Create guest profile with address and contact details
                      setProfile({ 
                        name: '', 
                        email: createEmail, 
                        phone: createPhone,
                        address: [selectedAddress],
                        isGuest: true // Flag to identify guest orders
                      }); 
                      setStep(2); 
                    }} disabled={!selectedAddress || !createEmail || !createPhone}>
                      Guest checkout
                    </Button>
                  </div>
                </>
              ) : (
                <div className="step-actions">
                  <Button variant="primary" size="md" onClick={handleProceedToPayment} disabled={!selectedAddress}>
                    Proceed to Payment
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Payment */}
        {step === 2 && (
          <div className="checkout-step">
            <h2>Payment</h2>

            <div className="order-summary">
              <h3>Order Summary</h3>
              <div className="summary-items">
                {cartItems.map((item) => (
                  <div key={item.id} className="summary-item">
                    <img src={item.image} alt={item.name} />
                    <div className="item-details">
                      <p className="item-name">{item.name}</p>
                      <p className="item-qty">Qty: {item.quantity}</p>
                    </div>
                    <p className="item-price">₹{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="summary-totals">
                <div className="total-row">
                  <span>Subtotal</span>
                  <span>₹{totals.subtotal.toFixed(2)}</span>
                </div>
                <div className="total-row">
                  <span>Shipping</span>
                  <span>₹{totals.shippingCharges.toFixed(2)}</span>
                </div>
                <div className="total-row">
                  <span>Tax</span>
                  <span>₹{totals.tax.toFixed(2)}</span>
                </div>
                <div className="total-row grand-total">
                  <span>Total</span>
                  <span>₹{totals.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="delivery-address">
              <h3>Delivering To:</h3>
              <p>{selectedAddress?.line1}</p>
              {selectedAddress?.line2 && <p>{selectedAddress.line2}</p>}
              <p>
                {selectedAddress?.locality}, {selectedAddress?.city}
              </p>
              <p>
                {selectedAddress?.state} - {selectedAddress?.pincode}
              </p>
              <Button variant="ghost" size="sm" className="btn-change" onClick={() => setStep(1)}>
                Change Address
              </Button>
            </div>

            <div className="step-actions">
              <Button variant="ghost" size="md" className="btn-back" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button variant="primary" size="md" onClick={handlePayment} disabled={processing}>
                {processing ? 'Processing...' : `Pay ₹${totals.total.toFixed(2)}`}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && orderData && (
          <div className="checkout-step confirmation">
            <div className="success-icon">✓</div>
            <h2>Order Placed Successfully!</h2>
            <p className="order-id">Order ID: {orderData.order_id}</p>
            <p className="confirmation-message">Thank you for your order! We've sent a confirmation email to {profile.email}</p>

            <div className="order-actions">
              <Button variant="primary" size="md" onClick={() => router.push(`/orders/${orderData.order_id}`)}>
                View Order Details
              </Button>
              <Button variant="secondary" size="md" onClick={() => router.push('/products')}>
                Continue Shopping
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;
