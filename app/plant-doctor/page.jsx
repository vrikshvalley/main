"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { useDispatch } from "react-redux";
import { addItem } from "@/lib/slices/cartSlice";
import { showSuccessToast, showErrorToast } from "@/lib/toastHelpers";
import Image from "@/components/general/ImgWithLoader";
import "@/styles/plantDoctor.scss";

const PLANT_DOCTOR_PRODUCT = {
  id: "plant-doctor",
  name: "Plant Doctor - Expert Consultation",
  category: "Plant Care",
  description: "Book a 30-minute expert plant consultation. Get personalized diagnosis, care plan and recommendations from our certified plant experts. Perfect for troubleshooting plant issues, understanding plant care requirements, and getting expert guidance on plant selection.",
  price: 499,
  images: ["/PlantDoctorDesktop.png"],
  stock: 1000,
};

export default function PlantDoctor() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, loading: authLoading } = useAuth();
  const razorpayWindowRef = useRef(null);

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [expandDescription, setExpandDescription] = useState(false);

  const PRICE = PLANT_DOCTOR_PRODUCT.price;

  useEffect(() => {
    if (!authLoading && user) {
      setName(user.displayName || "");
      setEmail(user.email || "");
    }
  }, [user, authLoading]);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleAddToCart = () => {
    dispatch(addItem({
      id: PLANT_DOCTOR_PRODUCT.id,
      name: PLANT_DOCTOR_PRODUCT.name,
      price: PRICE,
      image: PLANT_DOCTOR_PRODUCT.images[0],
      quantity: quantity,
    }));
    showSuccessToast(`${PLANT_DOCTOR_PRODUCT.name} added to cart! 🌿`);
  };

  const handleBuyNow = () => {
    // Add item to cart first
    dispatch(addItem({
      id: PLANT_DOCTOR_PRODUCT.id,
      name: PLANT_DOCTOR_PRODUCT.name,
      price: PRICE,
      image: PLANT_DOCTOR_PRODUCT.images[0],
      quantity: quantity,
    }));
    
    // Redirect based on auth status
    if (user) {
      showSuccessToast('Redirecting to checkout... 🛒');
      setTimeout(() => {
        router.push('/checkout');
      }, 500);
    } else {
      showSuccessToast('Please sign in to checkout 🔐');
      setTimeout(() => {
        router.push('/auth/signin?redirect=/checkout');
      }, 500);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!date || !time) {
      showErrorToast("Please select date and time for the meeting");
      return;
    }

    if (!email) {
      showErrorToast("Please provide your email so we can send confirmation");
      return;
    }

    setLoading(true);

    try {
      // Create Razorpay order
      const orderRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: PRICE,
          receipt: `PLANTDOC-${Date.now()}`,
          customerName: name || "",
          customerEmail: email,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderData.orderId) throw new Error("Failed to create payment order");

      // Open Razorpay checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: PRICE * 100,
        currency: "INR",
        name: "Vriksh Valley",
        description: "Plant Doctor - 30 min Consultation",
        order_id: orderData.orderId,
        prefill: {
          name: name || "",
          email: email,
          contact: phone || "",
        },
        handler: async (response) => {
          try {
            const bookRes = await fetch("/api/plant-doctor/book", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                customerName: name || "",
                customerEmail: email,
                customerPhone: phone || "",
                appointmentDate: date,
                appointmentTime: time,
                amount: PRICE,
                paymentMethod: "razorpay",
                razorpayOrderId: orderData.orderId,
                razorpayPaymentId: response.razorpay_payment_id,
              }),
            });

            const bookData = await bookRes.json();
            if (!bookRes.ok) throw new Error(bookData.message);

            showSuccessToast("Appointment booked successfully! Check your email for confirmation.");
            setTimeout(() => {
              router.push("/orders");
            }, 1500);
          } catch (err) {
            console.error(err);
            showErrorToast(err.message || "Failed to complete booking");
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            showErrorToast("Payment cancelled");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      razorpayWindowRef.current = rzp;
      rzp.open();
    } catch (err) {
      console.error(err);
      showErrorToast(err.message || "Failed to initiate payment");
      setLoading(false);
    }
  };

  return (
    <section className="plant-doctor-page">
      <div className="product-page">
        {/* Left: Image */}
        <div className="product-gallery">
          <Image
            src={PLANT_DOCTOR_PRODUCT.images[0]}
            alt={PLANT_DOCTOR_PRODUCT.name}
            width={600}
            height={600}
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            srcSet="/PlantDoctorMobile.png 768w, /PlantDoctorDesktop.png 1200w"
          />
        </div>

        {/* Right: Details */}
        <div className="product-details">
          <div className="category-badge">{PLANT_DOCTOR_PRODUCT.category}</div>
          <h1>{PLANT_DOCTOR_PRODUCT.name}</h1>
          
          <div className="description-wrapper">
            <p className={`description ${expandDescription ? 'expanded' : 'collapsed'}`}>
              {PLANT_DOCTOR_PRODUCT.description}
            </p>
            {PLANT_DOCTOR_PRODUCT.description && PLANT_DOCTOR_PRODUCT.description.length > 120 && (
              <button 
                className="read-more-btn"
                onClick={() => setExpandDescription(!expandDescription)}
              >
                {expandDescription ? 'Read Less' : 'Read More'}
              </button>
            )}
          </div>

          <div className="price-section">
            <p className="price">₹{PRICE}</p>
            <p className="price-duration">30-minute consultation</p>
          </div>

          <div className="stock-info in-stock">
            <span className="stock-badge">Available</span>
          </div>

          {/* Quantity */}
          <div className="option-group">
            <label>Quantity:</label>
            <div className="quantity-controls">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
              <input type="number" value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} />
              <button onClick={() => setQuantity(quantity + 1)}>+</button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="actions">
            <button 
              className="add-to-cart" 
              onClick={handleAddToCart}
            >
              Add to Cart
            </button>
            <button 
              className="buy-now"
              onClick={handleBuyNow}
            >
              Buy Now
            </button>
          </div>

          {/* Features */}
          <div className="product-meta">
            <div className="meta-item">
              <span className="meta-label">Duration:</span>
              <span className="meta-value">30 minutes</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Delivery:</span>
              <span className="meta-value">Online Video Call</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Includes:</span>
              <span className="meta-value">Diagnosis, Care Plan & Recommendations</span>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Form Section */}
      <div className="booking-section">
        <h2>Schedule Your Consultation</h2>
        <p>Fill in the details below to book your appointment</p>
        
        <form onSubmit={handleSubmit} className="booking-form">
          <label>
            Your Name
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
          </label>

          <label>
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
          </label>

          <label>
            Phone (optional)
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Mobile number" />
          </label>

          <label>
            Preferred Date
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </label>

          <label>
            Preferred Time
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
          </label>

          <div className="actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Processing..." : `Pay & Book (₹${PRICE})`}
            </button>
          </div>
        </form>
      </div>

      {/* Booking Form Section */}
      <div className="booking-section">
        <h2>Schedule Your Consultation</h2>
        <p>Fill in the details below to book your appointment</p>
        
        <form onSubmit={handleSubmit} className="booking-form">
          <label>
            Your Name
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
          </label>

          <label>
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
          </label>

          <label>
            Phone (optional)
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Mobile number" />
          </label>

          <label>
            Preferred Date
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </label>

          <label>
            Preferred Time
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
          </label>

          <div className="actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Processing..." : `Pay & Book (₹${PRICE})`}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
