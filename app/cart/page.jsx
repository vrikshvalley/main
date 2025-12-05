"use client";

import { useSelector, useDispatch } from "react-redux";
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
  loadUserCart,
} from "@/lib/slices/cartSlice";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Minus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react";
import { auth } from "@/lib/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import {
  loadCartFromLocalStorage,
  mergeAndSyncCart,
} from "@/lib/cartUtils";
import TheLoader from "@/components/general/TheLoader";
import Navbar from "@/components/general/Navbar";
import Topbar from "@/components/general/Topbar";
import Footer from "@/components/general/Footer";
import Link from "next/link";
import Image from "next/image";
import "@/styles/cartPage.scss";

export default function CartPage() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const items = useSelector(selectItemsArray);
  const itemsMap = useSelector(selectItemsMap);
  const count = useSelector(selectCount);
  const subtotal = useSelector(selectSubtotal);
  const dispatch = useDispatch();
  const router = useRouter();

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
            const mergedCart = await mergeAndSyncCart(
              currentUser.uid,
              guestCart
            );
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
            const mergedCart = await mergeAndSyncCart(
              currentUser.uid,
              guestCart
            );
            dispatch(setCart(mergedCart));
          } else {
            dispatch(loadUserCart(currentUser.uid));
          }
        } else {
          // User logged out - cart already in localStorage from reducers
          const guestCart = loadCartFromLocalStorage();
          dispatch(loadCart(guestCart));
        }
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  const handleIncrement = (product) => {
    if (user) {
      dispatch(updateItemAsync({ userId: user.uid, product, increment: true }));
    } else {
      dispatch(addItem(product));
    }
  };

  const handleDecrement = (productId) => {
    const product = itemsMap[productId];
    if (user) {
      dispatch(
        updateItemAsync({ userId: user.uid, product, increment: false })
      );
    } else {
      dispatch(decrementItem(productId));
    }
  };

  const handleRemove = (productId) => {
    if (user) {
      dispatch(removeItemAsync({ userId: user.uid, productId }));
    } else {
      dispatch(removeItem(productId));
    }
  };

  const handleCheckout = () => {
    if (!user) {
      router.push("/auth/signin?redirect=/checkout");
    } else {
      router.push("/checkout");
    }
  };

  if (isLoading) {
    return <TheLoader fullscreen />;
  }

  return (
    <>
      <Topbar />
      <Navbar />
      <div className="cart-page">
        <div className="cart-page-container">
          {/* Header */}
          <div className="cart-header">
            <button className="back-button" onClick={() => router.back()}>
              <ArrowLeft size={20} />
              Continue Shopping
            </button>
            <h1 className="cart-title">
              <ShoppingBag size={32} />
              Your Cart
            </h1>
            <p className="cart-count">{count} {count === 1 ? "item" : "items"}</p>
          </div>

          {items.length === 0 ? (
            <div className="empty-cart">
              <ShoppingBag size={80} />
              <h2>Your cart is empty</h2>
              <p>Looks like you haven't added anything to your cart yet.</p>
              <Link href="/" className="shop-now-btn">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="cart-content">
              {/* Cart Items */}
              <div className="cart-items-section">
                {items.map((item) => (
                  <div key={item.id} className="cart-item-card">
                    <div className="item-image">
                      <Image
                        src={item.image || "/placeholder.jpg"}
                        alt={item.name}
                        width={120}
                        height={120}
                        style={{ objectFit: "cover" }}
                      />
                    </div>

                    <div className="item-details">
                      <h3 className="item-name">{item.name}</h3>
                      {item.size && (
                        <p className="item-size">Size: {item.size}</p>
                      )}
                      <p className="item-price">₹{item.price}</p>
                    </div>

                    <div className="item-actions">
                      <div className="quantity-controls">
                        <button
                          className="qty-btn"
                          onClick={() => handleDecrement(item.id)}
                          aria-label="Decrease quantity"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="quantity">{item.quantity}</span>
                        <button
                          className="qty-btn"
                          onClick={() => handleIncrement(item)}
                          aria-label="Increase quantity"
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      <div className="item-total">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </div>

                      <button
                        className="remove-btn"
                        onClick={() => handleRemove(item.id)}
                        aria-label="Remove item"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="order-summary">
                <h2>Order Summary</h2>

                <div className="summary-row">
                  <span>Subtotal ({count} items)</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>

                <div className="summary-row">
                  <span>Shipping</span>
                  <span className="free-badge">FREE</span>
                </div>

                <div className="summary-row">
                  <span>Tax</span>
                  <span>Calculated at checkout</span>
                </div>

                <div className="summary-divider"></div>

                <div className="summary-row total">
                  <span>Total</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>

                <button className="checkout-btn" onClick={handleCheckout}>
                  Proceed to Checkout
                </button>

                {!user && (
                  <p className="login-prompt">
                    Have an account?{" "}
                    <Link href="/auth/signin?redirect=/checkout">
                      Sign in
                    </Link>{" "}
                    for faster checkout
                  </p>
                )}

                <div className="benefits">
                  <div className="benefit">
                    <span className="icon">🚚</span>
                    <span>Free Delivery</span>
                  </div>
                  <div className="benefit">
                    <span className="icon">🔒</span>
                    <span>Secure Payment</span>
                  </div>
                  <div className="benefit">
                    <span className="icon">🌱</span>
                    <span>Quality Assured</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
