import {
  signInWithPopup,
  GoogleAuthProvider,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
} from "firebase/auth";
import { auth } from "./firebaseConfig";

const googleProvider = new GoogleAuthProvider();

export const handleGoogleLogin = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { success: true, user: result.user };
  } catch (error) {
    console.error("Google login error:", error);
    return { success: false, error };
  }
};

export const handleEmailAuth = async (e) => {
  e.preventDefault();
  const email = e.target.email.value;

  const actionCodeSettings = {
    url: `${window.location.origin}/auth/callback`,
    handleCodeInApp: true,
  };

  try {
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    // Save the email locally to complete sign-in after redirect
    window.localStorage.setItem("emailForSignIn", email);
    return { success: true };
  } catch (error) {
    console.error("Email auth error:", error);
    alert("Error: " + error.message);
    return { success: false, error };
  }
};

export const completeEmailSignIn = async () => {
  if (isSignInWithEmailLink(auth, window.location.href)) {
    let email = window.localStorage.getItem("emailForSignIn");

    if (!email) {
      email = window.prompt("Please provide your email for confirmation");
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
      return { success: false, error };
    }
  }
  return { success: false, error: new Error("Not a valid sign-in link") };
};
