'use client';

import Modal from 'react-modal';
import { useSelector, useDispatch } from 'react-redux';
import { 
  selectItemsArray, 
  selectCount, 
  selectItemsMap, 
  selectSubtotal,
  addItem,
  decrementItem,
  removeItem, 
  removeItemAsync,
  updateItemAsync,
  loadCart, 
  setCart,
  loadUserCart 
} from '@/lib/slices/cartSlice';
import { useState, useEffect } from 'react';
import { X, Plus, Minus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { supabase } from '../../lib/supabaseClient';
import { 
  loadCartFromLocalStorage,
  mergeAndSyncCart 
} from '@/lib/cartUtils';
import "@/styles/cartModal.scss";

Modal.setAppElement('body'); // accessibility

export default function Cart() {
  const [user, setUser] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const items = useSelector(selectItemsArray);
  const itemsMap = useSelector(selectItemsMap);
  const count = useSelector(selectCount);
  const subtotal = useSelector(selectSubtotal);
  const dispatch = useDispatch();

  // Load cart on mount
  useEffect(() => {
    const initializeCart = async () => {
      const { data } = await supabase.auth.getUser();
      const currentUser = data.user;
      setUser(currentUser);

      if (currentUser) {
        // User is logged in - load from Supabase
        const guestCart = loadCartFromLocalStorage();

        if (Object.keys(guestCart).length > 0) {
          // Merge guest cart with user cart
          const mergedCart = await mergeAndSyncCart(currentUser.id, guestCart);
          dispatch(setCart(mergedCart));
        } else {
          // Just load user cart
          dispatch(loadUserCart(currentUser.id));
        }
      } else {
        // Guest user - load from localStorage
        const guestCart = loadCartFromLocalStorage();
        dispatch(loadCart(guestCart));
      }
      
      setIsLoading(false);
    };

    initializeCart();
  }, [dispatch]);

  // Listen for auth state changes
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser && _event === 'SIGNED_IN') {
        // User just logged in - merge carts
        const guestCart = loadCartFromLocalStorage();
        
        if (Object.keys(guestCart).length > 0) {
          const mergedCart = await mergeAndSyncCart(currentUser.id, guestCart);
          dispatch(setCart(mergedCart));
        } else {
          dispatch(loadUserCart(currentUser.id));
        }
      } else if (!currentUser && _event === 'SIGNED_OUT') {
        // User logged out - cart already in localStorage from reducers
        const localCart = loadCartFromLocalStorage();
        dispatch(loadCart(localCart));
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [dispatch]);

  const handleIncrement = (item) => {
    if (user) {
      // User is logged in - update in Supabase
      dispatch(updateItemAsync({ 
        productId: item.id, 
        quantity: item.qty + 1, 
        userId: user.id 
      }));
    } else {
      // Guest user - update in localStorage via reducer
      dispatch(addItem({ ...item, qty: 1 }));
    }
  };

  const handleDecrement = (item) => {
    if (user) {
      // User is logged in - update in Supabase
      const newQty = item.qty - 1;
      if (newQty <= 0) {
        dispatch(removeItemAsync({ productId: item.id, userId: user.id }));
      } else {
        dispatch(updateItemAsync({ 
          productId: item.id, 
          quantity: newQty, 
          userId: user.id 
        }));
      }
    } else {
      // Guest user - update in localStorage via reducer
      dispatch(decrementItem(item.id));
    }
  };

  const handleRemoveItem = (productId) => {
    if (user) {
      // User is logged in - remove from Supabase
      dispatch(removeItemAsync({ productId, userId: user.id }));
    } else {
      // Guest user - remove from localStorage via reducer
      dispatch(removeItem(productId));
    }
  };

  return (
    <>
      <div className='cart-icon' onClick={() => setCartOpen(true)}>
        <div className="icon-wrapper">
          <Image src="/cart.png" alt="Cart" width={24} height={24} />
          {count > 0 && <span className="cart-count">{count}</span>}
        </div>
        <div className="cart-link">Cart</div>
      </div>
      
      <Modal
        isOpen={cartOpen}
        onRequestClose={() => setCartOpen(false)}
        overlayClassName="cart-overlay"
        className="cart-modal"
        closeTimeoutMS={200}
      >
        <div className="cart-header">
          <h2>Your Cart ({count} {count === 1 ? 'item' : 'items'})</h2>
          <button className="close-btn" onClick={() => setCartOpen(false)}>
            <X size={20} /> 
          </button>
        </div>

        {items.length === 0 ? (
          <p className="empty">Your cart is empty</p>
        ) : (
          <>
            <ul className="cart-items">
              {items.map((item) => (
                <li key={item.id} className="cart-item">
                  <div className="item-details">
                    {item.image && (
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="item-image" 
                      />
                    )}
                    <div className="item-info">
                      <h4 className="item-name">{item.name}</h4>
                      <p className="item-price">₹{item.price}</p>
                    </div>
                  </div>
                  
                  <div className="item-controls">
                    <div className="quantity-controls">
                      <button 
                        className="qty-btn"
                        onClick={() => handleDecrement(item)}
                        aria-label="Decrease quantity"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="quantity">{item.qty}</span>
                      <button 
                        className="qty-btn"
                        onClick={() => handleIncrement(item)}
                        aria-label="Increase quantity"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    
                    <button
                      className="remove-btn"
                      onClick={() => handleRemoveItem(item.id)}
                      aria-label="Remove item"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  
                  <div className="item-total">
                    ₹{(item.price * item.qty).toFixed(2)}
                  </div>
                </li>
              ))}
            </ul>
            
            <div className="cart-summary">
              <div className="subtotal">
                <span>Subtotal:</span>
                <span className="amount">₹{subtotal.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="cart-footer">
              {!user && (
                <p className="login-prompt">Please log in to proceed to checkout</p>
              )}
              <button 
                className="checkout-btn"
                disabled={!user}
                onClick={() => {
                  if (user) {
                    // Navigate to checkout
                    window.location.href = '/checkout';
                  }
                }}
              >
                {user ? 'Proceed to Checkout' : 'Login to Checkout'}
              </button>
            </div>
          </>
        )}
      </Modal>
    </>
  );
}