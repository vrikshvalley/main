import {
  signInWithPopup,
  GoogleAuthProvider,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
} from "firebase/auth";
import { auth } from "./firebaseConfig";
import { showErrorToast } from "./toastHelpers";
import { safeRedirect } from "./safeRedirect";

const googleProvider = new GoogleAuthProvider();

export const handleGoogleLogin = async (rawRedirectUrl) => {
  const redirectUrl = rawRedirectUrl ? safeRedirect(rawRedirectUrl, null) : null;
  try {
    // Store redirect URL if provided
    if (redirectUrl) {
      window.localStorage.setItem("authRedirect", redirectUrl);
    }

    const result = await signInWithPopup(auth, googleProvider);

    // Redirect to callback page with the redirect URL
    const redirect = redirectUrl || window.localStorage.getItem("authRedirect");
    if (redirect) {
      window.location.href = `/auth/callback?redirect=${encodeURIComponent(
        redirect
      )}`;
    } else {
      window.location.href = "/auth/callback";
    }

    return { success: true, user: result.user };
  } catch (error) {
    console.error("Google login error:", error);
    return { success: false, error };
  }
};

export const handleEmailAuth = async (e, rawRedirectUrl) => {
  e.preventDefault();
  const redirectUrl = rawRedirectUrl ? safeRedirect(rawRedirectUrl, null) : null;
  const email = e.target.email.value;

  // Store redirect URL if provided
  if (redirectUrl) {
    window.localStorage.setItem("authRedirect", redirectUrl);
  }

  const redirect = redirectUrl || window.localStorage.getItem("authRedirect");
  const callbackUrl = redirect
    ? `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(
        redirect
      )}`
    : `${window.location.origin}/auth/callback`;

  const actionCodeSettings = {
    url: callbackUrl,
    handleCodeInApp: true,
  };

  try {
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    // Save the email locally to complete sign-in after redirect
    window.localStorage.setItem("emailForSignIn", email);
    return { success: true };
  } catch (error) {
    console.error("Email auth error:", error);
    showErrorToast("We could not send the link. Please check the email address and try again.");
    return { success: false, error };
  }
};

let pendingEmailSignIn = null;

/** Finishes an email-link sign-in. Calling it twice (React strict mode) reuses the first attempt: a link works only once. */
export const completeEmailSignIn = () => {
  if (!pendingEmailSignIn) {
    pendingEmailSignIn = runEmailSignIn().finally(() => {
      setTimeout(() => {
        pendingEmailSignIn = null;
      }, 5000);
    });
  }
  return pendingEmailSignIn;
};

const runEmailSignIn = async () => {
  if (isSignInWithEmailLink(auth, window.location.href)) {
    let email = window.localStorage.getItem("emailForSignIn");

    // Opened on a different device/browser than the one that requested the link
    if (!email) {
      email = window.prompt("Please confirm your email to finish signing in");
    }
    if (!email) {
      return { success: false, error: new Error("Email is required to finish signing in") };
    }

    try {
      const result = await signInWithEmailLink(
        auth,
        email,
        window.location.href
      );
      window.localStorage.removeItem("emailForSignIn");
      return { success: true, user: result.user };
    } catch (error) {
      console.error("Email sign-in completion error:", error);
      showErrorToast("That sign-in link has expired or was already used. Please request a new one.");
      return { success: false, error };
    }
  }
  return { success: false, error: new Error("Not a valid sign-in link") };
};
