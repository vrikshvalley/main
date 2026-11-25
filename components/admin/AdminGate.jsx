"use client";

import { useState } from "react";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { auth } from "@/lib/firebaseConfig";
import { useAuth } from "@/lib/AuthContext";

/** Staff sign-in. The server decides who is staff; this only collects the login. */
export default function AdminGate({ children }) {
  const { user, loading } = useAuth();
  const [error, setError] = useState("");

  const signIn = async () => {
    setError("");
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (e) {
      if (e.code !== "auth/popup-closed-by-user") setError("Sign-in failed. Check that this domain is an authorised domain in Firebase.");
    }
  };

  if (loading) return <p className="adm-center">Loading…</p>;

  if (!user) {
    return (
      <main className="adm-login">
        <div className="adm-card">
          <h1>Vriksh Valley · Admin</h1>
          <p>Sign in with a staff Google account.</p>
          <button className="adm-btn adm-btn--primary" onClick={signIn}>Sign in with Google</button>
          {error && <p className="adm-error">{error}</p>}
        </div>
      </main>
    );
  }

  return (
    <>
      <header className="adm-bar">
        <a href="/admin" className="adm-brand">Vriksh Valley <span>Admin</span></a>
        <span className="adm-bar__user">{user.email}</span>
        <button className="adm-btn" onClick={() => signOut(auth)}>Sign out</button>
      </header>
      <main className="adm-main">{children}</main>
    </>
  );
}
