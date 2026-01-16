"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { useDispatch } from "react-redux";
import { addItem } from "@/lib/slices/cartSlice";
import { showSuccessToast, showErrorToast } from "@/lib/toastHelpers";
import Image from "@/components/general/ImgWithLoader";
import { motion } from "framer-motion";
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

const serviceFeatures = [
  {
    icon: "🔍",
    title: "Expert Diagnosis",
    description: "Our certified horticulturists identify plant issues quickly and accurately",
  },
  {
    icon: "📋",
    title: "Personalized Care Plan",
    description: "Receive a customized care routine tailored to your specific plants and environment",
  },
  {
    icon: "💡",
    title: "Practical Solutions",
    description: "Get actionable recommendations you can implement immediately for plant recovery",
  },
  {
    icon: "🌱",
    title: "Ongoing Support",
    description: "Follow-up guidance ensures your plants thrive long-term",
  },
];

const consultationSteps = [
  {
    step: "1",
    title: "Book Your Slot",
    description: "Choose a convenient date and time for your video consultation",
  },
  {
    step: "2",
    title: "Share Plant Details",
    description: "Describe your plant's symptoms and growing conditions to our expert",
  },
  {
    step: "3",
    title: "Get Expert Advice",
    description: "Receive personalized diagnosis and an actionable care plan in real-time",
  },
  {
    step: "4",
    title: "Implement & Thrive",
    description: "Follow the recommendations and watch your plants come back to life",
  },
];

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
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const slideInVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const handleAddToCart = () => {
    dispatch(
      addItem({
        id: PLANT_DOCTOR_PRODUCT.id,
        name: PLANT_DOCTOR_PRODUCT.name,
        price: PRICE,
        image: PLANT_DOCTOR_PRODUCT.images[0],
        quantity: quantity,
      })
    );
    showSuccessToast(`${PLANT_DOCTOR_PRODUCT.name} added to cart! 🌿`);
  };

  const handleBuyNow = () => {
    dispatch(
      addItem({
        id: PLANT_DOCTOR_PRODUCT.id,
        name: PLANT_DOCTOR_PRODUCT.name,
        price: PRICE,
        image: PLANT_DOCTOR_PRODUCT.images[0],
        quantity: quantity,
      })
    );

    if (user) {
      showSuccessToast("Redirecting to checkout... 🛒");
      setTimeout(() => {
        router.push("/checkout");
      }, 500);
    } else {
      showSuccessToast("Please sign in to checkout 🔐");
      setTimeout(() => {
        router.push("/auth/signin?redirect=/checkout");
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
      showErrorToast(
        "Please provide your email so we can send confirmation"
      );
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
      if (!orderData.orderId)
        throw new Error("Failed to create payment order");

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

            showSuccessToast(
              "Appointment booked successfully! Check your email for confirmation."
            );
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
      {/* Hero Section */}
      <motion.div
        className="hero-section"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="hero-content">
          <motion.div
            className="hero-text"
            variants={slideInVariants}
            initial="hidden"
            animate="visible"
          >
            <span className="hero-eyebrow">Expert Plant Care Solutions</span>
            <h1>Meet Dr. Vriksh</h1>
            <p className="hero-subtitle">
              Where Plant Survival Becomes Plant Thriving
            </p>
            <p className="hero-description">
              Your plants deserve expert care. Whether your favorite plant is struggling to survive or you're unsure how to nurture your new green companion, our network of certified horticulturists is here to rescue them and ensure they flourish.
            </p>
            <motion.div
              className="hero-cta-group"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.button
                className="cta-btn primary"
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() =>
                  document
                    .querySelector(".booking-section")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Book Your Consultation
              </motion.button>
            </motion.div>
          </motion.div>

          <motion.div
            className="hero-image"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <picture>
              <source
                media="(max-width: 768px)"
                srcSet="/PlantDoctorMobile.png"
              />
              <Image
                src="/PlantDoctorDesktop.png"
                alt="Plant Doctor - Expert Consultation"
                width={500}
                height={500}
                priority
                className="hero-img"
              />
            </picture>
          </motion.div>
        </div>
      </motion.div>

      {/* Why Choose Dr. Vriksh Section */}
      <motion.div
        className="why-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, margin: "-100px" }}
      >
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          Why Choose Dr. Vriksh?
        </motion.h2>

        <motion.div
          className="features-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {serviceFeatures.map((feature, index) => (
            <motion.div
              key={index}
              className="feature-card"
              variants={itemVariants}
              whileHover={{ y: -8, boxShadow: "0 12px 30px rgba(0,0,0,0.1)" }}
            >
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* How It Works Section */}
      <motion.div
        className="how-it-works"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, margin: "-100px" }}
      >
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          How It Works
        </motion.h2>

        <motion.div
          className="steps-container"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {consultationSteps.map((item, index) => (
            <motion.div key={index} className="step" variants={itemVariants}>
              <motion.div
                className="step-number"
                whileHover={{ scale: 1.2, rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                {item.step}
              </motion.div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              {index < consultationSteps.length - 1 && (
                <div className="step-arrow">→</div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Service Details Section */}
      <motion.div
        className="service-details-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, margin: "-100px" }}
      >
        <div className="details-grid">
          <motion.div
            className="detail-item"
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="detail-icon">⏱️</div>
            <h3>30-Minute Consultation</h3>
            <p>In-depth expert analysis and personalized recommendations</p>
          </motion.div>

          <motion.div
            className="detail-item"
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="detail-icon">📹</div>
            <h3>Video Call Format</h3>
            <p>Convenient online consultation from the comfort of your home</p>
          </motion.div>

          <motion.div
            className="detail-item"
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="detail-icon">📋</div>
            <h3>Care Plan Included</h3>
            <p>Written care guide with specific instructions for your plants</p>
          </motion.div>

          <motion.div
            className="detail-item"
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="detail-icon">✅</div>
            <h3>Expert Certified</h3>
            <p>Consultations from certified horticulturists with years of experience</p>
          </motion.div>
        </div>
      </motion.div>

      {/* Booking Form Section */}
      <motion.div
        className="booking-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, margin: "-100px" }}
      >
        <motion.div
          className="booking-header"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2>Schedule Your Consultation</h2>
          <p>
            Ready to give your plants the expert care they deserve? Book your
            appointment now!
          </p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          className="booking-form"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div className="form-group" variants={itemVariants}>
            <label htmlFor="name">Your Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              required
            />
          </motion.div>

          <motion.div className="form-group" variants={itemVariants}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </motion.div>

          <motion.div className="form-group" variants={itemVariants}>
            <label htmlFor="phone">Phone (optional)</label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Mobile number"
            />
          </motion.div>

          <motion.div className="form-row" variants={itemVariants}>
            <div className="form-group">
              <label htmlFor="date">Preferred Date</label>
              <input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="time">Preferred Time</label>
              <input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </div>
          </motion.div>

          <motion.div
            className="form-submit"
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? "Processing..." : `Confirm & Pay ₹${PRICE}`}
            </button>
            <p className="submit-note">Secure payment via Razorpay</p>
          </motion.div>
        </motion.form>
      </motion.div>

      {/* Trust Section */}
      <motion.div
        className="trust-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, margin: "-100px" }}
      >
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          Trusted by Plant Parents Everywhere
        </motion.h2>
        <div className="trust-content">
          <p>
            Over 5,000+ successful consultations | 98% client satisfaction rate |
            Expert network spanning diverse plant specialties
          </p>
        </div>
      </motion.div>
    </section>
  );
}
