'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { startAutoLogoutMonitoring, stopAutoLogoutMonitoring } from '@/lib/autoLogout';
import { AlertTriangle, X, Clock } from 'lucide-react';
import '@/styles/autoLogout.scss';

export default function AutoLogoutProvider({ children }) {
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(60); // 60 seconds countdown
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        // Start auto-logout monitoring with warning callback
        startAutoLogoutMonitoring(() => {
          setShowWarning(true);
          setCountdown(60); // Reset countdown when warning shows
        });
      } else {
        stopAutoLogoutMonitoring();
      }
    });

    return () => {
      unsubscribe();
      stopAutoLogoutMonitoring();
    };
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!showWarning) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          handleLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showWarning]);

  const handleStayLoggedIn = () => {
    setShowWarning(false);
    setCountdown(60);
    // Timer will be reset automatically by user interaction
    // You might want to manually reset the activity timer here
  };

  const handleLogout = async () => {
    await signOut(auth);
    setShowWarning(false);
    router.push('/auth/login-signup');
  };

  return (
    <>
      {children}
      
      {showWarning && (
        <>
          <div className="autoLogoutOverlay" onClick={handleStayLoggedIn} />
          <div className="warningModal">
            <button className="closeButton" onClick={handleStayLoggedIn}>
              <X />
            </button>

            <div className="warningIcon">
              <AlertTriangle />
            </div>

            <h3 className="warningTitle">Still there?</h3>

            <p className="warningMessage">
              You've been inactive for a while. For your security, you'll be automatically 
              logged out soon.
            </p>

            <div className="countdown">
              <Clock size={18} />
              <span>Auto-logout in</span>
              <span className="countdownNumber">{countdown}</span>
              <span>seconds</span>
            </div>

            <div className="buttonGroup">
              <button 
                className="modalButton stayButton" 
                onClick={handleStayLoggedIn}
              >
                I'm Here!
              </button>
              <button 
                className="modalButton logoutButton" 
                onClick={handleLogout}
              >
                Log Out Now
              </button>
            </div>

            <p className="securityTip">
              <strong>Security Tip:</strong> We automatically log you out after periods 
              of inactivity to protect your account.
            </p>
          </div>
        </>
      )}
    </>
  );
}