"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  Search,
  ClipboardList,
  Lightbulb,
  Sprout,
  CalendarDays,
  Camera,
  Video,
  HeartPulse,
  Check,
  Clock,
  IndianRupee,
  CreditCard,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { ONLINE_PAYMENTS_ENABLED } from "@/lib/commerce";
import { startPayment, openRazorpay, verifyPayment, loadRazorpay } from "@/lib/payments/razorpayCheckout";
import WhatsAppGlyph from "@/components/general/WhatsAppGlyph";
import { SERVICE_PRICES } from "@/lib/servicePrices";
import { SLOT_TIMES, bookingDays, openSlots } from "@/lib/payments/slots";
import { showErrorToast, showSuccessToast } from "@/lib/toastHelpers";
import "@/styles/plantDoctor.scss";

const PRICE = SERVICE_PRICES["plant-doctor"];
const MINUTES = 15; // matches the client's Dr. Vriksh creatives ("₹49 for 15 mins")
const WHATSAPP_NUMBER = "919204745612";

// Client-provided copy
const FEATURES = [
  { icon: Search, title: "Expert Diagnosis", text: "Our certified horticulturists identify plant issues quickly and accurately" },
  { icon: ClipboardList, title: "Personalized Care Plan", text: "Receive a customized care routine tailored to your specific plants and environment" },
  { icon: Lightbulb, title: "Practical Solutions", text: "Get actionable recommendations you can implement immediately for plant recovery" },
  { icon: Sprout, title: "Ongoing Support", text: "Follow-up guidance ensures your plants thrive long-term" },
];

const STEPS = [
  { icon: CalendarDays, title: "Book Your Slot", text: "Choose a convenient date and time for your video consultation" },
  { icon: Camera, title: "Share Plant Details", text: "Describe your plant's symptoms and growing conditions to our expert" },
  { icon: Video, title: "Get Expert Advice", text: "Receive personalized diagnosis and an actionable care plan in real-time" },
  { icon: HeartPulse, title: "Implement & Thrive", text: "Follow the recommendations and watch your plants come back to life" },
];

// Client-provided figures
const STATS = [
  { value: "100+", label: "Successful Consultations" },
  { value: "98%", label: "Client Satisfaction" },
  { value: "100%", label: "Plant Recovery Rate" },
];

const BENEFITS = [
  "Real personalized solutions vs. generic YouTube tips",
  `${MINUTES}-minute expert diagnosis and care planning`,
  "Long-term plant survival guarantee approach",
  "Certified horticulturists with years of experience",
];

const COVERS = ["Plant health diagnosis", "Personalised care plans", "Plant selection for your space", "Troubleshooting issues", "Growth strategies"];



const FAQS = [
  {
    q: "Meet Dr. Vriksh. Where Plant Survival Becomes Plant Thriving.",
    a: "Your plant is wilting. You're scrolling through Google at 11 PM. You've already tried everything you found on YouTube. This is where most plant parents give up. Dr. Vriksh doesn't let them. We're a network of certified horticulturists who believe every plant—and every plant parent—deserves expert care. Not generic tips. Not one-size-fits-all solutions. Real expertise. Real answers. Real transformation. Through 15-minute video consultations, we diagnose what's actually wrong, create personalized care plans, and guide you toward long-term success. Because your plant didn't choose to struggle. And neither should you.",
  },
  {
    q: "How long does a consultation take?",
    a: "Each Dr. Vriksh consultation is a dedicated 15-minute video call with a certified horticulturist. This gives us enough time to understand your plant's condition, ask detailed questions about your growing environment, provide a thorough diagnosis, and create a personalized care action plan. You'll also receive a follow-up guide via email with all the recommendations discussed.",
  },
  {
    q: "Can Dr. Vriksh help with multiple plants?",
    a: "Absolutely! If you have 2-3 plants with similar or different issues, we can cover all of them in your 15-minute consultation. We'll prioritize based on urgency and ensure each plant gets the expert attention it needs. For larger plant collections (5+), we recommend booking multiple sessions or asking about our Plant Parent Packages.",
  },
  {
    q: "What if my plant doesn't recover after following the advice?",
    a: "We stand behind our expertise with a Plant Recovery Confidence approach. If you follow our recommendations diligently for 30 days and don't see improvement, we offer a follow-up consultation at 50% off to reassess and adjust the care plan. We're committed to your plant's long-term health, not just a one-time fix.",
  },
  {
    q: "How do I prepare for my consultation?",
    a: "Before your call, gather a few clear photos of your plant (front, back, and any affected areas), note the current watering schedule, light conditions, and temperature of your space. Have the plant name (if known) ready. This information helps our expert provide the most accurate diagnosis. Don't worry if you don't know all the details—our horticulturist will guide you through the diagnosis process!",
  },
  {
    q: "Can I reschedule or get a refund?",
    a: "Yes! You can reschedule your consultation up to 24 hours before your booked slot at no extra cost. If you need to cancel, we offer a full refund within 48 hours of booking, or you can convert it to a credit for a future consultation. We understand life happens—flexibility is built into our service.",
  },
];

const dayLabel = (key, opts) => new Date(`${key}T12:00:00+05:30`).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", ...opts });

/**
 * Plant Doctor: a bookable plant consultation.
 * With direct payment switched on (lib/commerce.js) the form takes payment via
 * Razorpay and books the slot; until then it sends the booking to WhatsApp,
 * the temporary backup while payments are finalised.
 */
export default function PlantDoctor() {
  const { user } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  // IST calendar days and the slots still open (re-checked every minute so a slot that
  // is about to start disappears instead of failing at payment).
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);
  // Slots someone else has booked or is paying for (one consultation per slot).
  const [taken, setTaken] = useState(() => new Set());
  useEffect(() => {
    let alive = true;
    const load = () =>
      fetch("/api/plant-doctor/slots", { cache: "no-store" })
        .then((r) => r.json())
        .then((d) => alive && setTaken(new Set(d.taken || [])))
        .catch(() => {});
    load();
    const id = setInterval(load, 60_000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);
  const days = useMemo(() => bookingDays(now).filter((d) => openSlots(d, now, taken).length > 0), [now, taken]);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [plant, setPlant] = useState("");
  const [problem, setProblem] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  useEffect(() => {
    if (user?.displayName) setName((n) => n || user.displayName);
    if (user?.email) setEmail((v) => v || user.email);
  }, [user]);

  // Warm up Razorpay Checkout only when direct payment is live
  useEffect(() => {
    if (ONLINE_PAYMENTS_ENABLED) loadRazorpay().catch(() => {});
  }, []);

  const slots = date ? openSlots(date, now, taken) : SLOT_TIMES;
  const selectedDay = days.includes(date) ? date : "";
  const selectedTime = slots.find((t) => t.value === time);

  // A slot that closed while the page was open is cleared.
  useEffect(() => {
    if (time && date && !openSlots(date, now, taken).some((t) => t.value === time)) setTime("");
    if (date && !days.includes(date)) setDate("");
  }, [now, date, time, days, taken]);

  const slotLabel = () => `${dayLabel(selectedDay, { weekday: "short", day: "numeric", month: "short" })}, ${selectedTime?.label || time}`;

  const bookOnWhatsApp = () => {
    const lines = [
      "Hi! I'd like to book a Dr. Vriksh plant consultation.",
      "",
      `Name: ${name.trim()}`,
      email.trim() && `Email: ${email.trim()}`,
      phone.trim() && `Phone: ${phone.trim()}`,
      `Preferred slot: ${slotLabel()}`,
      plant.trim() && `Plant: ${plant.trim()}`,
      problem.trim() && `What's happening: ${problem.trim()}`,
      "",
      `(${MINUTES}-min video consultation, ₹${PRICE})`,
    ].filter(Boolean);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`, "_blank", "noopener,noreferrer");
  };

  // Server prices the session, Razorpay takes payment, server verifies the
  // signature + real payment before the booking is confirmed (lib/server/orders.js).
  const payAndBook = async () => {
    setLoading(true);
    try {
      const start = await startPayment({
        service: "plant-doctor",
        email: email.trim(),
        contact: { name: name.trim(), phone: phone.trim() },
        appointment: { date, time, plant: plant.trim(), problem: problem.trim() },
      });
      const response = await openRazorpay(start, {
        description: `Plant Doctor - ${MINUTES} min Consultation`,
        prefill: { name: name.trim(), email: email.trim(), contact: phone.trim() },
      });
      await verifyPayment(start.orderId, response);
      showSuccessToast("Appointment booked successfully! Check your email for confirmation.");
      setTimeout(() => router.push(user ? `/orders/${start.orderId}` : "/"), 1500);
    } catch (err) {
      showErrorToast(err.message || "Failed to complete booking");
    } finally {
      setLoading(false);
    }
  };

  const book = (e) => {
    e.preventDefault();
    if (!date || !time) {
      showErrorToast("Please select date and time for the meeting");
      return;
    }
    if (name.trim().length < 2) {
      showErrorToast("Please enter your full name");
      return;
    }
    if (ONLINE_PAYMENTS_ENABLED) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        showErrorToast("Please provide a valid email so we can send confirmation");
        return;
      }
      if (phone.trim() && phone.replace(/\D/g, "").slice(-10).length !== 10) {
        showErrorToast("Please enter a valid 10-digit mobile number");
        return;
      }
      payAndBook();
    } else {
      bookOnWhatsApp();
    }
  };

  const scrollToBooking = () => document.getElementById("book")?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <main className="pd">
      {/* ---- Hero ---- */}
      <section className="pd-hero">
        <div className="pd-hero__glow" aria-hidden="true" />
        <div className="pd-hero__copy">
          <p className="pd-eyebrow">Expert Plant Care Solutions</p>
          <h1>
            Meet <span>Dr. Vriksh</span>
          </h1>
          <p className="pd-hero__sub">Where Plant Survival Becomes Plant Thriving</p>
          <p className="pd-hero__lead">
            Your plants deserve expert care. Whether your favorite plant is struggling to survive or you&apos;re unsure
            how to nurture your new green companion, our network of certified horticulturists is here to rescue them
            and ensure they flourish.
          </p>

          <ul className="pd-benefits">
            {BENEFITS.map((b) => (
              <li key={b}><Check size={16} aria-hidden="true" /> {b}</li>
            ))}
          </ul>

          <ul className="pd-facts">
            <li><IndianRupee size={16} aria-hidden="true" /> <strong>₹{PRICE}</strong> per session</li>
            <li><Clock size={16} aria-hidden="true" /> <strong>{MINUTES} min</strong> video call</li>
            <li><Video size={16} aria-hidden="true" /> <strong>Video</strong> consultation</li>
          </ul>

          <div className="pd-hero__actions">
            <button type="button" className="pd-btn pd-btn--stone breathe" onClick={scrollToBooking}>
              Book Your Consultation Now
            </button>
            <a
              className="pd-btn pd-btn--pebble"
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi! I have a question about my plant.")}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <WhatsAppGlyph size={18} /> Ask a quick question
            </a>
          </div>
        </div>

        <div className="pd-hero__art">
          <div className="pd-hero__frame">
            <Image
              src="/PlantDoctorDesktop/(1).webp"
              alt="A customer showing a yellowing leaf to the plant expert on a phone video call"
              fill
              priority
              sizes="(max-width: 900px) 90vw, 460px"
            />
          </div>
          <div className="pd-float pd-float--a" aria-hidden="true">
            <Check size={16} /> Diagnosis in one call
          </div>
          <div className="pd-float pd-float--b" aria-hidden="true">
            <Sprout size={16} /> Care plan you can follow
          </div>
        </div>
      </section>

      {/* ---- Why ---- */}
      <section className="pd-section">
        <header className="pd-head reveal">
          <p className="pd-eyebrow">Discover what sets our service apart from the rest</p>
          <h2>Why Choose Dr. Vriksh?</h2>
        </header>
        <ul className="pd-features">
          {FEATURES.map(({ icon: Icon, title, text }, i) => (
            <li key={title} className="pd-feature reveal" style={{ "--reveal-delay": `${i * 0.06}s` }}>
              <span className="pd-feature__icon"><Icon size={22} aria-hidden="true" /></span>
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* ---- What a session covers ---- */}
      <section className="pd-covers reveal">
        <div className="pd-covers__image">
          <Image src="/PlantDoctorDesktop/(3).webp" alt="" fill sizes="(max-width: 900px) 90vw, 520px" />
        </div>
        <div className="pd-covers__copy">
          <p className="pd-eyebrow">₹{PRICE} for {MINUTES} mins</p>
          <h2>What Dr. Vriksh covers in {MINUTES} mins</h2>
          <ul>
            {COVERS.map((c) => (
              <li key={c}><Check size={18} aria-hidden="true" /> {c}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---- How it works ---- */}
      <section className="pd-section">
        <header className="pd-head reveal">
          <p className="pd-eyebrow">Simple steps to plant wellness</p>
          <h2>How It Works</h2>
        </header>
        <ol className="pd-steps">
          {STEPS.map(({ icon: Icon, title, text }, i) => (
            <li key={title} className="pd-step reveal" style={{ "--reveal-delay": `${i * 0.08}s` }}>
              <span className="pd-step__num">{i + 1}</span>
              <Icon size={22} aria-hidden="true" className="pd-step__icon" />
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ---- Booking ---- */}
      <section className="pd-book" id="book" aria-labelledby="pd-book-title">
        <form className="pd-form" onSubmit={book}>
          <p className="pd-eyebrow">Book a slot</p>
          <h2 id="pd-book-title">Schedule Your Consultation</h2>
          <p className="pd-form__lead">Ready to give your plants the expert care they deserve? Book your appointment now!</p>

          <div className="pd-row">
            <label className="pd-field">
              <span>Your Name</span>
              <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="Full name" required />
            </label>
            <label className="pd-field">
              <span>Email{ONLINE_PAYMENTS_ENABLED ? "" : " (optional)"}</span>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                required={ONLINE_PAYMENTS_ENABLED}
              />
            </label>
          </div>

          <label className="pd-field">
            <span>Phone (optional)</span>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" autoComplete="tel" inputMode="tel" placeholder="Mobile number" />
          </label>

          <label className="pd-field">
            <span>Which plant? (optional)</span>
            <input value={plant} onChange={(e) => setPlant(e.target.value)} placeholder="e.g. Monstera, money plant" />
          </label>

          <label className="pd-field">
            <span>What is happening? (optional)</span>
            <textarea
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              rows={3}
              placeholder="Yellow leaves, drooping, pests, new plant advice…"
            />
          </label>

          <fieldset className="pd-choices">
            <legend>Preferred Date</legend>
            <div className="pd-chips">
              {days.map((key, i) => {
                return (
                  <button
                    key={key}
                    type="button"
                    className={date === key ? "is-active" : ""}
                    aria-pressed={date === key}
                    onClick={() => setDate(key)}
                  >
                    <small>{key === days[0] && key === bookingDays(now)[0] ? "Today" : dayLabel(key, { weekday: "short" })}</small>
                    <strong>{dayLabel(key, { day: "numeric" })}</strong>
                    <small>{dayLabel(key, { month: "short" })}</small>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="pd-choices">
            <legend>Preferred Time</legend>
            <div className="pd-chips pd-chips--time">
              {slots.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  className={time === t.value ? "is-active" : ""}
                  aria-pressed={time === t.value}
                  onClick={() => setTime(t.value)}
                >
                  <strong>{t.label}</strong>
                </button>
              ))}
            </div>
          </fieldset>
        </form>

        <aside className="pd-ticket" aria-label="Booking summary">
          <p className="pd-eyebrow">Your session</p>
          <h3>Dr. Vriksh consultation</h3>
          <dl>
            <div><dt>Length</dt><dd>{MINUTES}-min video call</dd></div>
            <div>
              <dt>Slot</dt>
              <dd>
                {selectedDay
                  ? `${dayLabel(selectedDay, { weekday: "short", day: "numeric", month: "short" })}${selectedTime ? `, ${selectedTime.label}` : ""}`
                  : "Pick a day"}
              </dd>
            </div>
            <div className="pd-ticket__price"><dt>Price</dt><dd>₹{PRICE}</dd></div>
          </dl>
          {ONLINE_PAYMENTS_ENABLED ? (
            <>
              <button type="button" className="pd-btn pd-btn--pay" onClick={book} disabled={loading}>
                <CreditCard size={18} aria-hidden="true" /> {loading ? "Processing..." : `Confirm & Pay ₹${PRICE}`}
              </button>
              <p className="pd-ticket__note">Secure payment via Razorpay</p>
            </>
          ) : (
            <>
              <button type="button" className="pd-btn pd-btn--wa" onClick={book}>
                <WhatsAppGlyph size={18} /> Book on WhatsApp
              </button>
              <p className="pd-ticket__note">
                Direct payment is coming soon. For now we confirm your slot and payment on WhatsApp.
              </p>
            </>
          )}
        </aside>
      </section>

      {/* ---- FAQ ---- */}
      <section className="pd-section pd-faq">
        <header className="pd-head reveal">
          <p className="pd-eyebrow">Everything you need to know about Dr. Vriksh</p>
          <h2>Frequently Asked Questions</h2>
        </header>
        <div className="pd-faq__list">
          {FAQS.map((f) => (
            <details key={f.q} className="pd-faq__item">
              <summary>
                {f.q}
                <span className="pd-faq__icon" aria-hidden="true" />
              </summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ---- Conclusion (client copy) ---- */}
      <section className="pd-close reveal">
        <h2>Transform Your Plants&apos; Journey</h2>
        <p>
          Every plant has a story. Many come to us stressed, struggling, and on the brink. With our expert guidance,
          they transform into thriving, vibrant companions that bring joy and life to your space.
        </p>
        <ul className="pd-stats">
          {STATS.map((st) => (
            <li key={st.label}>
              <strong>{st.value}</strong>
              <span>{st.label}</span>
            </li>
          ))}
        </ul>
        <p>
          Don&apos;t let another plant suffer. Your green companion deserves the best care. Connect with Dr. Vriksh
          today and witness the transformation.
        </p>
        <button type="button" className="pd-btn pd-btn--stone" onClick={scrollToBooking}>
          Start Your Plant&apos;s Recovery Journey
        </button>
      </section>
    </main>
  );
}
