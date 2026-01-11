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
import { X, Plus, Minus, Trash2, MessageCircle } from 'lucide-react';
import Image from '@/components/general/ImgWithLoader';
import { auth } from '@/lib/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
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

  // Load cart on mount and listen for auth state changes
  useEffect(() => {
    let isInitialLoad = true;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (isInitialLoad) {
        // Initial load
        if (currentUser) {
          // User is logged in - load from Firebase
          const guestCart = loadCartFromLocalStorage();

          if (Object.keys(guestCart).length > 0) {
            // Merge guest cart with user cart
            const mergedCart = await mergeAndSyncCart(currentUser.uid, guestCart);
            dispatch(setCart(mergedCart));
          } else {
            // Just load user cart
            dispatch(loadUserCart(currentUser.uid));
          }
        } else {
          // Guest user - load from localStorage
          const guestCart = loadCartFromLocalStorage();
          dispatch(loadCart(guestCart));
        }
        setIsLoading(false);
        isInitialLoad = false;
      } else {
        // Auth state changed after initial load
        if (currentUser) {
          // User just logged in - merge carts
          const guestCart = loadCartFromLocalStorage();
          
          if (Object.keys(guestCart).length > 0) {
            const mergedCart = await mergeAndSyncCart(currentUser.uid, guestCart);
            dispatch(setCart(mergedCart));
          } else {
            dispatch(loadUserCart(currentUser.uid));
          }
        } else {
          // User logged out - cart already in localStorage from reducers
          const localCart = loadCartFromLocalStorage();
          dispatch(loadCart(localCart));
        }
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  const handleIncrement = (item) => {
    if (user) {
      // User is logged in - update in Firebase
      dispatch(updateItemAsync({ 
        productId: item.id, 
        quantity: item.qty + 1, 
        userId: user.uid 
      }));
    } else {
      // Guest user - update in localStorage via reducer
      dispatch(addItem({ ...item, qty: 1 }));
    }
  };

  const handleDecrement = (item) => {
    if (user) {
      // User is logged in - update in Firebase
      const newQty = item.qty - 1;
      if (newQty <= 0) {
        dispatch(removeItemAsync({ productId: item.id, userId: user.uid }));
      } else {
        dispatch(updateItemAsync({ 
          productId: item.id, 
          quantity: newQty, 
          userId: user.uid 
        }));
      }
    } else {
      // Guest user - update in localStorage via reducer
      dispatch(decrementItem(item.id));
    }
  };

  const handleRemoveItem = (productId) => {
    if (user) {
      // User is logged in - remove from Firebase
      dispatch(removeItemAsync({ productId, userId: user.uid }));
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
        style={{
          overlay: {
            position: 'fixed',
            inset: 0,
            zIndex: 9999
          },
          content: {
            position: 'fixed',
            right: 0,
            top: 0,
            bottom: 0,
            left: 'auto'
          }
        }}
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
                      {item.variant && (
                        <p className="item-variant">Variant: {item.variant}</p>
                      )}
                      {item.size && (
                        <p className="item-variant">Size: {item.size}</p>
                      )}
                      {item.color && (
                        <p className="item-variant">Color: {item.color}</p>
                      )}
                      <p className="item-price">₹{typeof item.price === 'number' ? item.price : 0}</p>
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
                disabled
                title="Coming Soon"
              >
                <span>Proceed to Checkout</span>
                <span className="coming-soon-badge">Coming Soon</span>
              </button>
              
              <button 
                className="whatsapp-order-btn"
                onClick={() => {
                  const phoneNumber = '919204745612';
                  let message = 'Hi! I would like to order:\n\n';
                  items.forEach(item => {
                    const variantInfo = [item.variant, item.size, item.color]
                      .filter(Boolean)
                      .join(' | ');
                    message += `${item.name}${variantInfo ? ` (${variantInfo})` : ''} - Qty: ${item.qty} - ₹${(item.price * item.qty).toFixed(2)}\n`;
                  });
                  message += `\nTotal: ₹${subtotal.toFixed(2)}`;
                  const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
                  window.open(url, '_blank', 'noopener,noreferrer');
                }}
              >
                <MessageCircle size={20} />
                <span>Order on WhatsApp</span>
              </button>
            </div>
          </>
        )}
      </Modal>
    </>
  );
}