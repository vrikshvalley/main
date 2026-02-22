"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { useDispatch } from 'react-redux';
import { addItem } from '@/lib/slices/cartSlice';
import { showSuccessToast, showErrorToast } from '@/lib/toastHelpers';
import Image from '@/components/general/ImgWithLoader';
import Button from '@/components/general/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useSplitType } from '@/lib/hooks/useSplitType';
import '@/styles/plantDoctor.scss';

const PLANT_DOCTOR_PRODUCT = {
  id: "plant-doctor",
  name: "Plant Doctor - Expert Consultation",
  category: "Plant Care",
  description: "Book a 30-minute expert plant consultation. Get personalized diagnosis, care plan and recommendations from our certified plant experts. Perfect for troubleshooting plant issues, understanding plant care requirements, and getting expert guidance on plant selection.",
  price: 49,
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

// Helper function to get next 7 days
const getNext7Days = () => {
  const days = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    days.push(date);
  }
  return days;
};

const formatDateDisplay = (date, index) => {
  if (index === 0) return 'Today';
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
};

const formatDateForStorage = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function PlantDoctor() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, loading: authLoading } = useAuth();
  const razorpayWindowRef = useRef(null);
  const heroTitleRef = useSplitType('.hero-section h1', { delay: 0.1, stagger: 0.05, duration: 0.7 });

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [expandDescription, setExpandDescription] = useState(false);
  const [openFAQ, setOpenFAQ] = useState(null);

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
      {/* Enhanced Hero Section with Alternating Image & Content */}
      <motion.div
        className="hero-section"
        ref={heroTitleRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* First Block: Content Left, Image Right */}
        <div className="hero-block">
          <motion.div
            className="hero-text-content"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="hero-eyebrow">Expert Plant Care Solutions</span>
            <h1>Meet Dr. Vriksh</h1>
            <p className="hero-subtitle">
              Where Plant Survival Becomes Plant Thriving
            </p>
            <p className="hero-description">
              Your plants deserve expert care. Whether your favorite plant is struggling to survive or you're unsure how to nurture your new green companion, our network of certified horticulturists is here to rescue them and ensure they flourish.
            </p>
            <ul className="hero-benefits">
              <li>✓ Real personalized solutions vs. generic YouTube tips</li>
              <li>✓ 30-minute expert diagnosis and care planning</li>
              <li>✓ Long-term plant survival guarantee approach</li>
              <li>✓ Certified horticulturists with years of experience</li>
            </ul>
            <motion.button
              className="cta-btn primary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() =>
                document
                  .querySelector(".booking-section")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Book Your Consultation Now
            </motion.button>
          </motion.div>

          <motion.div
            className="hero-image"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            whileHover={{ scale: 1.03 }}
          >
            <picture>
              <source
                media="(max-width: 768px)"
                srcSet="/PlantDoctorMobile.png"
              />
              <Image
                src="/PlantDoctorDesktop.png"
                alt="Dr. Vriksh - Plant Doctor Expert"
                width={500}
                height={500}
                priority
                className="hero-img"
              />
            </picture>
          </motion.div>
        </div>
      </motion.div>

      {/* Why Choose Dr. Vriksh - 2 Column Grid */}
      <motion.div
        className="why-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, margin: "-100px" }}
      >
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2>Why Choose Dr. Vriksh?</h2>
          <p>Discover what sets our service apart from the rest</p>
        </motion.div>

        <motion.div
          className="features-grid-2col"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-50px" }}
        >
          {serviceFeatures.map((feature, index) => (
            <motion.div
              key={index}
              className="feature-card-2col"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -8, boxShadow: "0 12px 30px rgba(0,0,0,0.12)" }}
            >
              <div className="feature-number">{index + 1}</div>
              <div className="feature-icon-2col">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Image Section 1 - Between Features and How It Works */}
      <motion.div
        className="image-showcase-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, margin: "-100px" }}
      >
        <div className="showcase-content">
          <motion.div
            className="showcase-image"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <picture>
              <source media="(max-width: 768px)" srcSet="/PlantDoctorMobile/(1).png" />
              <Image
                src="/PlantDoctorDesktop/(1).png"
                alt="Expert plant diagnosis in action"
                width={600}
                height={400}
                priority={false}
              />
            </picture>
          </motion.div>
        </div>
      </motion.div>

      {/* How It Works - 2 Column Layout */}
      <motion.div
        className="how-it-works-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, margin: "-100px" }}
      >
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2>How It Works</h2>
          <p>Simple steps to plant wellness</p>
        </motion.div>

        <motion.div
          className="steps-2col-grid"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-50px" }}
        >
          {consultationSteps.map((item, index) => (
            <motion.div
              key={index}
              className="step-card-2col"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ 
                y: -5,
                boxShadow: "0 8px 24px rgba(41, 128, 102, 0.15)" 
              }}
            >
              <motion.div
                className="step-number-circle"
                whileHover={{ scale: 1.2, rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                {item.step}
              </motion.div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Image Section 2 - Between How It Works and Booking */}
      <motion.div
        className="image-showcase-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, margin: "-100px" }}
      >
        <div className="showcase-content">
          <motion.div
            className="showcase-image"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <picture>
              <source media="(max-width: 768px)" srcSet="/PlantDoctorMobile/(2).png" />
              <Image
                src="/PlantDoctorDesktop/(2).png"
                alt="Plant care consultation process"
                width={600}
                height={400}
                priority={false}
              />
            </picture>
          </motion.div>
        </div>
      </motion.div>

      {/* Booking Section */}
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
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-50px" }}
        >
          <motion.div className="form-group" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.1 }}>
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

          <motion.div className="form-group" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.15 }}>
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

          <motion.div className="form-group" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <label htmlFor="phone">Phone (optional)</label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Mobile number"
            />
          </motion.div>

          {/* Date Selection - Buttons */}
          <motion.div className="form-group" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.25 }}>
            <label>Preferred Date</label>
            <div className="date-buttons-grid">
              {getNext7Days().map((d, index) => (
                <motion.button
                  key={index}
                  type="button"
                  className={`date-btn ${date === formatDateForStorage(d) ? 'active' : ''}`}
                  onClick={() => setDate(formatDateForStorage(d))}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="date-label">{formatDateDisplay(d, index)}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Time Selection - Buttons */}
          <motion.div className="form-group" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <label>Preferred Time</label>
            <div className="time-buttons-grid">
              {['12:00', '15:00', '17:00'].map((t) => {
                const displayTime = t === '12:00' ? '12 PM' : t === '15:00' ? '3 PM' : '5 PM';
                return (
                  <motion.button
                    key={t}
                    type="button"
                    className={`time-btn ${time === t ? 'active' : ''}`}
                    onClick={() => setTime(t)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {displayTime}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            className="form-submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button type="submit" variant="primary" size="lg" disabled={loading}>
              {loading ? "Processing..." : `Confirm & Pay ₹${PRICE}`}
            </Button>
            <p className="submit-note">Secure payment via Razorpay</p>
          </motion.div>
        </motion.form>
      </motion.div>

      {/* Image Section 3 - Before Conclusion */}
      <motion.div
        className="image-showcase-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, margin: "-100px" }}
      >
        <div className="showcase-content">
          <motion.div
            className="showcase-image"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <picture>
              <source media="(max-width: 768px)" srcSet="/PlantDoctorMobile/(3).png" />
              <Image
                src="/PlantDoctorDesktop/(3).png"
                alt="Healthy plants after consultation"
                width={600}
                height={400}
                priority={false}
              />
            </picture>
          </motion.div>
        </div>
      </motion.div>

      {/* Conclusion Section */}
      <motion.div
        className="conclusion-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, margin: "-100px" }}
      >
        <div className="conclusion-content">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Transform Your Plants' Journey
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="conclusion-intro"
          >
            Every plant has a story. Many come to us stressed, struggling, and on the brink. 
            With our expert guidance, they transform into thriving, vibrant companions that bring 
            joy and life to your space.
          </motion.p>

          <motion.div
            className="conclusion-stats"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="stat-item">
              <h3>5000+</h3>
              <p>Successful Consultations</p>
            </div>
            <div className="stat-item">
              <h3>98%</h3>
              <p>Client Satisfaction</p>
            </div>
            <div className="stat-item">
              <h3>100%</h3>
              <p>Plant Recovery Rate</p>
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="conclusion-closing"
          >
            Don't let another plant suffer. Your green companion deserves the best care. 
            Connect with Dr. Vriksh today and witness the transformation.
          </motion.p>

          <motion.button
            className="cta-btn primary large"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            onClick={() =>
              document
                .querySelector(".booking-section")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Start Your Plant's Recovery Journey
          </motion.button>
        </div>
      </motion.div>

      {/* Image Section 4 - Final Inspirational Section */}
      <motion.div
        className="image-showcase-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, margin: "-100px" }}
      >
        <div className="showcase-content">
          <motion.div
            className="showcase-image"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <picture>
              <source media="(max-width: 768px)" srcSet="/PlantDoctorMobile/(4).png" />
              <Image
                src="/PlantDoctorDesktop/(4).png"
                alt="Success stories from plant doctor consultations"
                width={600}
                height={400}
                priority={false}
              />
            </picture>
          </motion.div>
        </div>
      </motion.div>
      {/* FAQ Section - Meet Dr. Vriksh */}
      <motion.div
        className="faq-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, margin: "-100px" }}
      >
        <div className="faq-content">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2>Frequently Asked Questions</h2>
            <p>Everything you need to know about Dr. Vriksh</p>
          </motion.div>

          <div className="faqs-grid">
            {[
              {
                id: 1,
                question: "Meet Dr. Vriksh. Where Plant Survival Becomes Plant Thriving.",
                answer: "Your plant is wilting. You're scrolling through Google at 11 PM. You've already tried everything you found on YouTube. This is where most plant parents give up. Dr. Vriksh doesn't let them. We're a network of certified horticulturists who believe every plant—and every plant parent—deserves expert care. Not generic tips. Not one-size-fits-all solutions. Real expertise. Real answers. Real transformation. Through 30-minute video consultations, we diagnose what's actually wrong, create personalized care plans, and guide you toward long-term success. Because your plant didn't choose to struggle. And neither should you."
              },
              {
                id: 2,
                question: "How long does a consultation take?",
                answer: "Each Dr. Vriksh consultation is a dedicated 30-minute video call with a certified horticulturist. This gives us enough time to understand your plant's condition, ask detailed questions about your growing environment, provide a thorough diagnosis, and create a personalized care action plan. You'll also receive a follow-up guide via email with all the recommendations discussed."
              },
              {
                id: 3,
                question: "Can Dr. Vriksh help with multiple plants?",
                answer: "Absolutely! If you have 2-3 plants with similar or different issues, we can cover all of them in your 30-minute consultation. We'll prioritize based on urgency and ensure each plant gets the expert attention it needs. For larger plant collections (5+), we recommend booking multiple sessions or asking about our Plant Parent Packages."
              },
              {
                id: 4,
                question: "What if my plant doesn't recover after following the advice?",
                answer: "We stand behind our expertise with a Plant Recovery Confidence approach. If you follow our recommendations diligently for 30 days and don't see improvement, we offer a follow-up consultation at 50% off to reassess and adjust the care plan. We're committed to your plant's long-term health, not just a one-time fix."
              },
              {
                id: 5,
                question: "How do I prepare for my consultation?",
                answer: "Before your call, gather a few clear photos of your plant (front, back, and any affected areas), note the current watering schedule, light conditions, and temperature of your space. Have the plant name (if known) ready. This information helps our expert provide the most accurate diagnosis. Don't worry if you don't know all the details—our horticulturist will guide you through the diagnosis process!"
              },
              {
                id: 6,
                question: "Can I reschedule or get a refund?",
                answer: "Yes! You can reschedule your consultation up to 24 hours before your booked slot at no extra cost. If you need to cancel, we offer a full refund within 48 hours of booking, or you can convert it to a credit for a future consultation. We understand life happens—flexibility is built into our service."
              }
            ].map((faq) => (
              <motion.div
                key={faq.id}
                className={`faq-item ${openFAQ === faq.id ? 'active' : ''}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: faq.id * 0.1 }}
              >
                <button
                  className="faq-question"
                  onClick={() => setOpenFAQ(openFAQ === faq.id ? null : faq.id)}
                  aria-expanded={openFAQ === faq.id}
                >
                  <span className="question-number">{String(faq.id).padStart(2, '0')}</span>
                  <span className="question-text">{faq.question}</span>
                  <ChevronDown 
                    className={`chevron ${openFAQ === faq.id ? 'rotated' : ''}`}
                    size={20}
                  />
                </button>

                <AnimatePresence>
                  {openFAQ === faq.id && (
                    <motion.div
                      className="faq-answer"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <div className="answer-content">
                        <p>{faq.answer}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
