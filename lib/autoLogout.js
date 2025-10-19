import { supabase } from "./supabaseClient";

// Auto-logout timeout duration (in milliseconds)
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const WARNING_TIMEOUT = 25 * 60 * 1000; // 25 minutes (5 min warning)

let inactivityTimer = null;
let warningTimer = null;
let warningCallback = null;

/**
 * Reset the inactivity timer
 * Call this on user activity (mouse move, clicks, key presses)
 */
const resetInactivityTimer = () => {
  // Clear existing timers
  if (inactivityTimer) clearTimeout(inactivityTimer);
  if (warningTimer) clearTimeout(warningTimer);

  // Set warning timer (5 minutes before logout)
  warningTimer = setTimeout(() => {
    if (warningCallback) {
      warningCallback();
    }
  }, WARNING_TIMEOUT);

  // Set logout timer
  inactivityTimer = setTimeout(async () => {
    await handleAutoLogout();
  }, INACTIVITY_TIMEOUT);
};

/**
 * Handle automatic logout
 */
const handleAutoLogout = async () => {
  try {
    // Sign out from Supabase
    await supabase.auth.signOut();

    // Clear local storage cart (optional - you might want to keep it)
    // localStorage.removeItem('vriksh_cart');

    // Show notification
    if (typeof window !== "undefined") {
      alert("You have been logged out due to inactivity.");
      window.location.href = "/auth/login";
    }
  } catch (error) {
    console.error("Auto-logout error:", error);
  }
};

/**
 * Start monitoring user activity for auto-logout
 * @param {Function} onWarning - Callback function when warning triggers
 */
export const startAutoLogoutMonitoring = (onWarning = null) => {
  if (typeof window === "undefined") return;

  warningCallback = onWarning;

  // Events that indicate user activity
  const activityEvents = [
    "mousedown",
    "mousemove",
    "keypress",
    "scroll",
    "touchstart",
    "click",
  ];

  // Add event listeners
  activityEvents.forEach((event) => {
    document.addEventListener(event, resetInactivityTimer, true);
  });

  // Start the initial timer
  resetInactivityTimer();
};

/**
 * Stop monitoring user activity
 */
export const stopAutoLogoutMonitoring = () => {
  if (typeof window === "undefined") return;

  // Clear timers
  if (inactivityTimer) clearTimeout(inactivityTimer);
  if (warningTimer) clearTimeout(warningTimer);

  // Remove event listeners
  const activityEvents = [
    "mousedown",
    "mousemove",
    "keypress",
    "scroll",
    "touchstart",
    "click",
  ];

  activityEvents.forEach((event) => {
    document.removeEventListener(event, resetInactivityTimer, true);
  });
};

/**
 * Manually logout user
 */
export const manualLogout = async () => {
  stopAutoLogoutMonitoring();
  await supabase.auth.signOut();

  if (typeof window !== "undefined") {
    window.location.href = "/auth/login";
  }
};

/**
 * Check if user session is still valid
 */
export const checkSessionValidity = async () => {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session) {
    await handleAutoLogout();
    return false;
  }

  return true;
};

/**
 * Get remaining time before auto-logout (in seconds)
 */
export const getRemainingTime = () => {
  // This is a simplified version - you might want to track actual time
  return Math.floor(INACTIVITY_TIMEOUT / 1000);
};
