'use client';

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
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { auth } from '@/lib/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  loadCartFromLocalStorage,
  mergeAndSyncCart 
} from '@/lib/cartUtils';
import TheLoader from '@/components/general/TheLoader';
import "@/styles/cartModal.scss";

export default function CartModal({ isOpen, onClose }) {
  const [user, setUser] = useState(null);
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

  // Allow background to scroll while modal is open (no body scroll lock)
  // If you ever want to lock scroll again, re-enable the code below.
  // useEffect(() => {
  //   if (!isOpen) {
  //     document.documentElement.style.overflow = '';
  //     document.body.style.overflow = '';
  //     return;
  //   }
  //   const prevHtmlOverflow = document.documentElement.style.overflow;
  //   const prevBodyOverflow = document.body.style.overflow;
  //   document.documentElement.style.overflow = 'hidden';
  //   document.body.style.overflow = 'hidden';
  //   return () => {
  //     document.documentElement.style.overflow = prevHtmlOverflow;
  //     document.body.style.overflow = prevBodyOverflow;
  //   };
  // }, [isOpen]);

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

  const handleWhatsAppOrder = () => {
    const phoneNumber = '919204745612';
    let message = 'Hi! 👋 I would like to order:\n\n';
    items.forEach(item => {
      message += `🌱 ${item.name} - Qty: ${item.qty} - ₹${(item.price * item.qty).toFixed(2)}\n`;
    });
    message += `\n💰 Total: ₹${subtotal.toFixed(2)}`;
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop (visual only; allows background scroll) */}
      <div className="cart-overlay" />
      
      {/* Modal Container - centered with pointer-events-none */}
      <div className="cart-modal-wrapper">
        <div className="cart-modal" onClick={(e) => e.stopPropagation()}>
          <div className="cart-header">
            <h2><ShoppingBag size={22} style={{ verticalAlign: 'middle', marginRight: '8px' }} /> Your Cart ({count} {count === 1 ? 'item' : 'items'})</h2>
            <button className="close-btn" onClick={onClose}>
              <X size={20} /> 
            </button>
          </div>

          {isLoading ? (
            <TheLoader />
          ) : items.length === 0 ? (
            <div className="empty">
              <div className="empty-icon"><ShoppingBag size={48} /></div>
              <p>Your cart is empty</p>
              <p className="empty-subtitle">Add some plants to get started! 🌿</p>
            </div>
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
                        <h4 className="item-name">🌱 {item.name}</h4>
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
                  <span>💰 Subtotal:</span>
                  <span className="amount">₹{subtotal.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="cart-footer">
                <button 
                  className="view-cart-btn"
                  onClick={() => {
                    onClose();
                    window.location.href = '/cart';
                  }}
                >
                  <span> View Full Cart</span>
                </button>

                <button 
                  className="checkout-btn"
                >
                  <span>Proceed to Checkout</span>
                  
                </button>
                
                <button 
                  className="whatsapp-order-btn"
                  onClick={handleWhatsAppOrder}
                >
                  <svg 
                    role="img" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    fill="currentColor"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  <span>Order on WhatsApp</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
