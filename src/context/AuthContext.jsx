// src/context/AuthContext.jsx
import { useEffect, useState } from "react";
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, googleProvider, db } from "../lib/firebaseClient";
import { AuthContext } from "./authContext";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const isNEUEmail = (email) => email?.endsWith("@neu.edu.ph");

  // Helper: upsert user document
  const upsertUser = async (firebaseUser) => {
    const email = firebaseUser.email.toLowerCase();
    const userRef = doc(db, "users", email);
    const profileData = {
      displayName: firebaseUser.displayName || "",
      photoURL: firebaseUser.photoURL || "",
      uid: firebaseUser.uid,
      lastLogin: new Date(),
    };

    try {
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          email,
          role: "user",
          isBlocked: false,
          createdAt: new Date(),
          ...profileData,
        });
        return "user";
      } else {
        // Update profile, keep existing role
        await setDoc(userRef, profileData, { merge: true });
        return userSnap.data().role || "user";
      }
    } catch (err) {
      console.error("Firestore upsert error:", err);
      return "user";
    }
  };

  // Core sign-in function: try popup first, fallback to redirect
  const signInWithGoogle = async () => {
    setAuthError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await handleUserAfterAuth(result.user);
    } catch (err) {
      console.error("Popup sign-in error:", err);
      // If popup fails (e.g., blocked), fallback to redirect
      if (err.code === "auth/popup-blocked" || err.code === "auth/cancelled-popup-request") {
        try {
          await signInWithRedirect(auth, googleProvider);
        } catch (redirectErr) {
          setAuthError("Redirect sign-in failed. Please check your browser settings.");
        }
      } else {
        setAuthError("Sign-in failed: " + err.message);
      }
    }
  };

  // Process user after authentication
  const handleUserAfterAuth = async (firebaseUser) => {
    if (!firebaseUser) {
      setUser(null);
      setRole(null);
      return;
    }

    const email = firebaseUser.email;
    if (!isNEUEmail(email)) {
      await signOut(auth);
      setAuthError("Only @neu.edu.ph accounts are allowed.");
      setUser(null);
      setRole(null);
      return;
    }

    // Check if blocked
    const lowerEmail = email.toLowerCase();
    try {
      const userDoc = await getDoc(doc(db, "users", lowerEmail));
      if (userDoc.exists() && userDoc.data().isBlocked === true) {
        await signOut(auth);
        setAuthError("Your account has been blocked. Contact an administrator.");
        setUser(null);
        setRole(null);
        return;
      }
    } catch (err) {
      console.error("Block check error:", err);
    }

    // Create/update user doc and get role
    const userRole = await upsertUser(firebaseUser);
    setUser(firebaseUser);
    setRole(userRole);
    console.log("✅ User signed in:", lowerEmail, "Role:", userRole);
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setRole(null);
  };

  // Effect to handle redirect result (if the user was redirected from Google)
  useEffect(() => {
    let isMounted = true;

    const handleRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result && isMounted) {
          await handleUserAfterAuth(result.user);
        }
      } catch (err) {
        console.error("Redirect result error:", err);
        if (isMounted) setAuthError("Sign-in failed after redirect.");
      } finally {
        if (isMounted) setAuthLoading(false);
      }
    };

    handleRedirect();

    // Listen for auth state changes (for page refresh)
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("onAuthStateChanged triggered, user:", firebaseUser?.email);
      if (!isMounted) return;
      try {
        await handleUserAfterAuth(firebaseUser);
      } catch (err) {
        console.error("onAuthStateChanged error:", err);
      } finally {
        if (isMounted) setAuthLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []); // empty dependency array – runs once on mount

  return (
    <AuthContext.Provider
      value={{ user, role, authLoading, authError, signInWithGoogle, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;