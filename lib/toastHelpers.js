// Toast Utility Helper
import { toast } from "react-toastify";

/**
 * Show a success toast notification
 * @param {string} message - The message to display
 * @param {object} options - Optional toast configuration
 */
export const showSuccessToast = (message, options = {}) => {
  toast.success(message, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    ...options,
  });
};

/**
 * Show an error toast notification
 * @param {string} message - The message to display
 * @param {object} options - Optional toast configuration
 */
export const showErrorToast = (message, options = {}) => {
  toast.error(message, {
    position: "top-right",
    autoClose: 4000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    ...options,
  });
};

/**
 * Show a warning toast notification
 * @param {string} message - The message to display
 * @param {object} options - Optional toast configuration
 */
export const showWarningToast = (message, options = {}) => {
  toast.warning(message, {
    position: "top-right",
    autoClose: 3500,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    ...options,
  });
};

/**
 * Show an info toast notification
 * @param {string} message - The message to display
 * @param {object} options - Optional toast configuration
 */
export const showInfoToast = (message, options = {}) => {
  toast.info(message, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    ...options,
  });
};

/**
 * Show a promise-based toast (loading -> success/error)
 * @param {Promise} promise - The promise to track
 * @param {object} messages - Messages for pending, success, and error states
 * @param {object} options - Optional toast configuration
 */
export const showPromiseToast = (promise, messages, options = {}) => {
  return toast.promise(
    promise,
    {
      pending: messages.pending || "Processing...",
      success: messages.success || "Success!",
      error: messages.error || "Something went wrong!",
    },
    {
      position: "top-right",
      ...options,
    }
  );
};
