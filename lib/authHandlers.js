import { supabase } from "./supabaseClient";

export const handleGoogleLogin = async () => {
  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${window.location.origin}/auth/callback` },
  });
};

export const handleEmailAuth = async (e) => {
  e.preventDefault();
  const email = e.target.email.value;

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) {
    console.error("Email auth error:", error);
    alert("Error: " + error.message);
    return { success: false, error };
  }

  // Return success - don't show alert, let the component handle it
  return { success: true };
};
