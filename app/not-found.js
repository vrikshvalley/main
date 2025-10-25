"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Home, ArrowLeft, Search } from "lucide-react";
import "@/styles/notFound.scss";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="not-found-container">
      <div className="garden-background">
        {/* Decorative garden elements */}
        <div className="plant plant-1">🌱</div>
        <div className="plant plant-2">🌿</div>
        <div className="plant plant-3">🍃</div>
        <div className="plant plant-4">🌾</div>
        <div className="plant plant-5">🌻</div>
        <div className="plant plant-6">🌺</div>
        <div className="construction-sign">
          <div className="sign-post"></div>
          <div className="sign-board">
            <span className="sign-icon">🚧</span>
            <span className="sign-text">Garden Under Construction</span>
          </div>
        </div>
      </div>

      <motion.div
        className="content"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="error-code">
          <span className="four">4</span>
          <span className="zero">
            <div className="flower">🌸</div>
          </span>
          <span className="four">4</span>
        </div>

        <h1 className="title">Oops! This Garden Path Doesn't Exist</h1>

        <p className="message">
          It seems you've wandered into an uncharted part of our garden. This
          section is still being cultivated and isn't ready yet.
        </p>

        <div className="illustration">
          <div className="gardener">👨‍🌾</div>
          <div className="tools">
            <span>🪴</span>
            <span>🌱</span>
            <span>⚒️</span>
          </div>
        </div>

        <p className="sub-message">
          While we prepare this space, feel free to explore our thriving
          gardens!
        </p>

        <div className="action-buttons">
          <motion.button
            className="btn-primary"
            onClick={() => router.push("/")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Home size={20} />
            <span>Back to Home Garden</span>
          </motion.button>

          <motion.button
            className="btn-secondary"
            onClick={() => router.back()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft size={20} />
            <span>Go Back</span>
          </motion.button>
        </div>

        <div className="helpful-links">
          <p>Popular destinations in our garden:</p>
          <div className="links">
            <a href="/">🏡 Home</a>
            <a href="/about">🌿 About Us</a>
            <a href="/#products">🌺 Shop Plants</a>
          </div>
        </div>
      </motion.div>

      {/* Floating leaves animation */}
      <div className="floating-leaves">
        <div className="leaf leaf-1">🍂</div>
        <div className="leaf leaf-2">🍃</div>
        <div className="leaf leaf-3">🍂</div>
        <div className="leaf leaf-4">🍃</div>
      </div>
    </div>
  );
}
